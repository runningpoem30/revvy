import { Payment } from '@prisma/client';

export type LeakCategory = 
  | 'payment_failure'
  | 'checkout_abandoned'
  | 'subscription_churn'
  | 'invoice_overdue'
  | 'unknown';

/**
 * Classifies a failed payment into a specific revenue leak category.
 * In a full production system, this would evaluate time thresholds, 
 * webhooks vs active polling, and order status.
 */
export function classifyRevenueLeak(payment: Payment): LeakCategory {
  if (payment.status !== 'failed') {
    return 'unknown';
  }

  // If it's a recurring payment via UPI mandate or Card eMandate, it's subscription churn
  if (payment.method === 'emandate' || payment.method === 'upi_mandate' || payment.errorReason === 'mandate_failed') {
    return 'subscription_churn';
  }

  // If the error code relates to customer drop-off without even trying
  if (payment.errorReason === 'payment_cancelled' || payment.errorCode === 'BAD_REQUEST_ERROR' && !payment.errorReason) {
    return 'checkout_abandoned';
  }

  // Standard payment failures
  const failureReasons = [
    'insufficient_funds', 
    'card_declined', 
    'payment_failed', 
    'bank_timeout',
    'invalid_cvv'
  ];
  
  if (payment.errorReason && failureReasons.includes(payment.errorReason)) {
    return 'payment_failure';
  }

  // Default to generic payment failure for the demo if it failed
  return 'payment_failure';
}
