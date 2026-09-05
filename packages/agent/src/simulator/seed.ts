import { PrismaClient } from '@prisma/client';
import { razorpay } from '../razorpay/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Realistic test scenarios that judges want to see
const scenarios = [
  {
    amount: 15000,
    email: 'karan.sharma@example.com',
    contact: '+919876543210',
    method: 'card',
    errorCode: 'BAD_REQUEST_ERROR',
    errorReason: 'insufficient_funds',
    errorDesc: 'The payment was declined due to insufficient funds.'
  },
  {
    amount: 5000,
    email: 'priya.patel@example.com',
    contact: '+919988776655',
    method: 'upi',
    errorCode: 'GATEWAY_ERROR',
    errorReason: 'payment_failed',
    errorDesc: 'Payment failed at bank gateway.'
  },
  {
    amount: 45000,
    email: 'amit.singh@b2b-corp.com',
    contact: '+919123456789',
    method: 'card',
    errorCode: 'BAD_REQUEST_ERROR',
    errorReason: 'card_declined',
    errorDesc: 'Card declined by issuer.'
  }
];

async function seed() {
  console.log(' Starting Revvy AI synthetic data generator...');

  // Clean existing DB for fresh run
  await prisma.auditLog.deleteMany({});
  await prisma.recoveryAction.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});

  for (const scenario of scenarios) {
    try {
      console.log(`\n Creating Razorpay Order for ‚${scenario.amount / 100}...`);
      
      // 1. Create a REAL order in Razorpay (Test Mode)
      const order = await razorpay.orders.create({
        amount: scenario.amount,
        currency: 'INR',
        receipt: `rcpt_${crypto.randomBytes(4).toString('hex')}`
      });
      
      console.log(` Order created: ${order.id}`);

      // 2. Save Order to our DB
      await prisma.order.create({
        data: {
          id: order.id,
          amount: scenario.amount,
          currency: 'INR',
          status: 'created'
        }
      });

      // 3. Simulate a Failed Payment Webhook directly into DB
      const mockPaymentId = `pay_${crypto.randomBytes(7).toString('hex')}`;
      
      await prisma.payment.create({
        data: {
          id: mockPaymentId,
          orderId: order.id,
          amount: scenario.amount,
          currency: 'INR',
          status: 'failed',
          method: scenario.method,
          errorCode: scenario.errorCode,
          errorReason: scenario.errorReason,
          errorDescription: scenario.errorDesc,
          email: scenario.email,
          contact: scenario.contact
        }
      });
      
      console.log(` Simulated payment failure: ${mockPaymentId} (${scenario.errorReason})`);
      
    } catch (err) {
      console.error(' Failed to generate scenario:', err);
    }
  }

  console.log('\n Synthetic data generation complete!');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
