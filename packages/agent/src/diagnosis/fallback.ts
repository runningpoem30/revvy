import { Payment } from '@prisma/client';
import { DiagnosisResult } from './engine';

/**
 * Deterministic fallback logic if the LLM fails, times out, or returns invalid JSON.
 * This guarantees the system always knows what to do with a failed payment.
 */
export function fallbackDiagnosis(payment: Payment): DiagnosisResult {
  console.log(`⚠️  Using rule-based fallback diagnosis for payment ${payment.id}`);

  // Base fallback structure
  const result: DiagnosisResult = {
    root_cause: payment.errorReason || payment.errorCode || 'unknown_error',
    confidence: 1.0, // Rule-based is 100% confident in its simple mapping
    is_retryable: false,
    reasoning: 'Fallback to deterministic rules due to AI engine unavailability.',
    suggested_strategy: 'no_action'
  };

  // Map known Razorpay error reasons to our strategies
  switch (payment.errorReason) {
    case 'insufficient_funds':
      result.is_retryable = true;
      result.suggested_strategy = 'wait_24h_retry';
      result.reasoning = 'Rule: Insufficient funds -> wait 24h before retrying.';
      break;
      
    case 'card_declined':
    case 'invalid_cvv':
      result.is_retryable = false;
      result.suggested_strategy = 'payment_link_sms';
      result.reasoning = 'Rule: Card rejected -> send payment link for alternate method.';
      break;

    case 'bank_timeout':
    case 'payment_failed': // Generic gateway failure
      result.is_retryable = true;
      result.suggested_strategy = 'immediate_retry';
      result.reasoning = 'Rule: Gateway/bank timeout -> retry immediately.';
      break;

    case 'mandate_failed':
      result.is_retryable = true;
      result.suggested_strategy = 'payment_link_email';
      result.reasoning = 'Rule: Subscription mandate failed -> send email payment link.';
      break;

    default:
      if (payment.errorCode === 'BAD_REQUEST_ERROR') {
        result.suggested_strategy = 'payment_link_sms';
        result.reasoning = 'Rule: Bad request (likely user error) -> send payment link.';
      } else {
        result.suggested_strategy = 'escalate_to_human';
        result.reasoning = 'Rule: Unmapped error -> escalate to human ops team.';
      }
  }

  return result;
}
