import { PrismaClient, Payment, RecoveryAction } from '@prisma/client';
import { razorpay } from '../razorpay/client';

const prisma = new PrismaClient();

export async function executeRecovery(action: RecoveryAction, payment: Payment) {
  console.log(`\n Executing strategy: ${action.strategy} for payment ${payment.id}`);
  
  try {
    switch (action.strategy) {
      case 'PAYMENT_LINK_SMS':
        await handlePaymentLink(action, payment, { sms: true, email: false });
        break;
      
      case 'PAYMENT_LINK_EMAIL':
        await handlePaymentLink(action, payment, { sms: false, email: true });
        break;
        
      case 'ESCALATE_TO_HUMAN':
        await handleEscalation(action, payment);
        break;
        
      default:
        console.error(` Unknown strategy: ${action.strategy}`);
    }
  } catch (error) {
    console.error(` Executor failed for action ${action.id}:`, error);
    await markActionFailed(action.id, String(error));
  }
}

async function handlePaymentLink(action: RecoveryAction, payment: Payment, notify: { sms: boolean, email: boolean }) {
  console.log(` Generating Razorpay Payment Link (SMS: ${notify.sms}, Email: ${notify.email})`);
  
  const paymentLink = await razorpay.paymentLink.create({
    amount: payment.amount,
    currency: payment.currency,
    accept_partial: false,
    description: `Payment recovery for order ${payment.orderId || payment.id}`,
    customer: {
      name: 'Customer', // We might not have name, so default it
      email: payment.email || undefined,
      contact: payment.contact || undefined
    },
    notify,
    reminder_enable: true,
    notes: {
      recovery_action_id: action.id,
      original_payment_id: payment.id
    }
  });

  console.log(` Payment link created: ${paymentLink.id} (${paymentLink.short_url})`);

  await prisma.recoveryAction.update({
    where: { id: action.id },
    data: { 
      status: 'executed',
      paymentLinkId: paymentLink.id 
    }
  });

  await prisma.auditLog.create({
    data: {
      recoveryActionId: action.id,
      stage: 'execution',
      message: `Generated Payment Link: ${paymentLink.short_url}`,
      metadata: JSON.stringify({ paymentLinkId: paymentLink.id, notify })
    }
  });

  // --- HACKATHON DEMO MOCK: Auto-Recover after 60 seconds ---
  console.log(` Demo Mode: Scheduled auto-recovery simulation in 60s for ${action.id}...`);
  setTimeout(async () => {
    try {
      console.log(` Demo Mode: Triggering mock success for ${action.id}`);
      
      await prisma.recoveryAction.update({
        where: { id: action.id },
        data: { 
          status: 'recovered',
          recoveryAmount: payment.amount
        }
      });

      await prisma.auditLog.create({
        data: {
          recoveryActionId: action.id,
          stage: 'FUNDS_RECOVERED',
          message: `Mock payment successful. Recovery confirmed: INR ${payment.amount / 100}.`,
          metadata: JSON.stringify({ paymentLinkId: paymentLink.id, isMock: true })
        }
      });
      console.log(` Demo Mode: Mock success applied for action ${action.id}. Dashboard should update!`);
    } catch (err) {
      console.error(` Demo Mode: Failed to apply mock success:`, err);
    }
  }, 60000);
}

async function handleEscalation(action: RecoveryAction, payment: Payment) {
  console.log(` Escalating payment ${payment.id} to human ops team.`);
  
  await prisma.recoveryAction.update({
    where: { id: action.id },
    data: { status: 'ESCALATED_TO_HUMAN' }
  });

  await prisma.auditLog.create({
    data: {
      recoveryActionId: action.id,
      stage: 'execution',
      message: 'Escalated to human support due to constraints or unhandled error.',
      metadata: JSON.stringify({ escalated: true })
    }
  });
}

async function markActionFailed(actionId: string, reason: string) {
  await prisma.recoveryAction.update({
    where: { id: actionId },
    data: { status: 'failed' }
  });
  await prisma.auditLog.create({
    data: {
      recoveryActionId: actionId,
      stage: 'execution_failed',
      message: `Executor failed: ${reason.substring(0, 200)}`,
      metadata: JSON.stringify({ error: reason })
    }
  });
}
