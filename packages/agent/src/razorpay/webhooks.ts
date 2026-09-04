import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { razorpayWebhookSecret } from './client';

const prisma = new PrismaClient();
import { determineRecoveryStrategy } from '../strategy/selector';
import { executeRecovery } from '../executor/runner';

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const payload = req.body;

  // 1. Verify Signature
  if (razorpayWebhookSecret) {
    const bodyString = (req as any).rawBody || JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', razorpayWebhookSecret)
      .update(bodyString)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature mismatch. Potential spoofing attempt.');
      console.error(`Received signature: ${signature}`);
      console.error(`Expected signature: ${expectedSignature}`);
      console.error(`Has rawBody: ${!!(req as any).rawBody}`);
      // For local dev/hackathon with mock secrets, we might want to bypass blocking,
      // but in production, we MUST return 400.
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
  await executeRecovery(action, payment);
}
