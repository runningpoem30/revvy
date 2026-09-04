import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { razorpayWebhookSecret } from './client';

const prisma = new PrismaClient();
import { determineRecoveryStrategy } from '../strategy/selector';
import { executeRecovery } from '../executor/runner';

import Razorpay from 'razorpay';

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const payload = req.body;

  // 1. Strict Signature Verification (Hackathon Requirement)
  if (razorpayWebhookSecret) {
    if (!signature || !(req as any).rawBody) {
      console.error('Webhook signature mismatch. Potential spoofing attempt: Missing signature or rawBody.');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayWebhookSecret)
      .update((req as any).rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature mismatch. Potential spoofing attempt: Signature mismatch.');
      return res.status(400).json({ error: 'Invalid signature' });
    }
  }

  const event = payload.event;
  console.log(`📥 Received Webhook Event: ${event}`);

  try {
    switch (event) {
      case 'payment.failed':
        await processPaymentFailed(payload.payload.payment.entity);
        break;
      // We can add order.paid, subscription.pending, etc. later
      default:
        console.log(`ℹ️ Unhandled event type: ${event}`);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function processPaymentFailed(paymentEntity: any) {
  console.log(`💥 Processing real payment failure for payment ${paymentEntity.id}`);
  
  // Ensure the Order exists in the database to prevent foreign key constraints from failing
  if (paymentEntity.order_id) {
    await prisma.order.upsert({
      where: { id: paymentEntity.order_id },
      update: {},
      create: {
        id: paymentEntity.order_id,
        amount: paymentEntity.amount,
        currency: paymentEntity.currency,
        status: 'unknown_from_webhook',
      }
    });
  }

  // Save or update the payment in our DB
  const payment = await prisma.payment.upsert({
    where: { id: paymentEntity.id },
    update: {
      status: 'failed',
      errorCode: paymentEntity.error_code,
      errorReason: paymentEntity.error_reason,
      errorDescription: paymentEntity.error_description,
    },
    create: {
      id: paymentEntity.id,
      orderId: paymentEntity.order_id,
      amount: paymentEntity.amount,
      currency: paymentEntity.currency,
      status: 'failed',
      method: paymentEntity.method,
      errorCode: paymentEntity.error_code,
      errorReason: paymentEntity.error_reason,
      errorDescription: paymentEntity.error_description,
      email: paymentEntity.email,
      contact: paymentEntity.contact,
    }
  });

  console.log(`Logged payment failure ${paymentEntity.id} to database`);

  // Step 12: Trigger the AI brain to determine a strategy, and then execute it.
  const action = await determineRecoveryStrategy(payment);
  if (action && action.status === 'pending') {
    await executeRecovery(action, payment);
  } else if (action) {
    console.log(`⏭️ Strategy already ${action.status}. Skipping duplicate execution.`);
  }
}
