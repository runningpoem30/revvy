// Mock data matching the Prisma schema: Payment + RecoveryAction + AuditLog[]
// All amounts are in paise (divide by 100 for display).

export type AuditLogEntry = {
  id: string;
  stage: string;
  message: string;
  metadata: string;
  createdAt: string;
};

export type RecoveryJob = {
  payment: {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    errorCode: string;
    errorReason: string;
    errorDescription: string;
    email: string;
    contact: string;
    createdAt: string;
  };
  recoveryAction: {
    id: string;
    rootCause: string;
    confidence: number;
    aiReasoning: string;
    strategy: string;
    status: string;
    recoveryAmount: number | null;
    createdAt: string;
  };
  auditLogs: AuditLogEntry[];
};

export const MOCK_RECOVERY_JOBS: RecoveryJob[] = [
  {
    payment: {
      id: "pay_QR7x9kLm4nP2aB",
      orderId: "order_QR7x8jKl3mN1zA",
      amount: 1500000,
      currency: "INR",
      status: "failed",
      method: "card",
      errorCode: "BAD_REQUEST_ERROR",
      errorReason: "insufficient_funds",
      errorDescription: "Payment declined due to insufficient funds in the account.",
      email: "karan.sharma@outlook.com",
      contact: "+919876543210",
      createdAt: "2026-09-04T14:23:11.000Z",
    },
    recoveryAction: {
      id: "ra_001",
      rootCause: "Insufficient Funds",
      confidence: 0.94,
      aiReasoning:
        "Error code BAD_REQUEST_ERROR with reason insufficient_funds indicates the cardholder's account lacks the required balance. This is a transient issue — the customer likely intends to pay but needs time to arrange funds. A payment link via SMS gives them a frictionless retry path within 24h.",
      strategy: "PAYMENT_LINK_SMS",
      status: "recovered",
      recoveryAmount: 1500000,
      createdAt: "2026-09-04T14:23:14.000Z",
    },
    auditLogs: [
      { id: "al_001a", stage: "INGESTED", message: "Webhook payload received. Payment pay_QR7x9kLm4nP2aB marked as failed.", metadata: "{}", createdAt: "2026-09-04T14:23:11.000Z" },
      { id: "al_001b", stage: "SCORING", message: "Gemini diagnosis complete. Root cause: insufficient_funds (confidence: 0.94).", metadata: '{"model":"gemini-3.5-flash","latency_ms":340}', createdAt: "2026-09-04T14:23:14.000Z" },
      { id: "al_001c", stage: "STRATEGY_SELECTED", message: "Strategy PAYMENT_LINK_SMS selected. Bounded retry: attempt 1/3.", metadata: '{"max_retries":3,"cooldown_hours":6}', createdAt: "2026-09-04T14:23:14.500Z" },
      { id: "al_001d", stage: "INTERVENTION_SENT", message: "Payment link plink_QR8a created and SMS dispatched to +91****3210.", metadata: '{"link_id":"plink_QR8a","channel":"sms"}', createdAt: "2026-09-04T14:23:16.000Z" },
      { id: "al_001e", stage: "FUNDS_RECOVERED", message: "Payment link paid. Recovery confirmed: INR 15,000.00.", metadata: '{"recovered_payment_id":"pay_QR8b2mNp5qR3cD"}', createdAt: "2026-09-04T16:45:02.000Z" },
    ],
  },
  {
    payment: {
      id: "pay_QR6w8jKl3mN1zA",
      orderId: "order_QR6w7iJk2lM0yZ",
      amount: 50000,
      currency: "INR",
      status: "failed",
      method: "upi",
      errorCode: "GATEWAY_ERROR",
      errorReason: "payment_failed",
      errorDescription: "Payment processing failed at the bank gateway.",
      email: "priya.patel@gmail.com",
      contact: "+919988776655",
      createdAt: "2026-09-04T15:10:22.000Z",
    },
    recoveryAction: {
      id: "ra_002",
      rootCause: "Bank Gateway Timeout",
      confidence: 0.87,
      aiReasoning:
        "GATEWAY_ERROR with generic payment_failed on UPI indicates a transient bank-side issue — not a customer fault. The customer likely saw a timeout screen. Sending a payment link via SMS provides an immediate retry without requiring them to re-enter details.",
      strategy: "PAYMENT_LINK_SMS",
      status: "recovered",
      recoveryAmount: 50000,
      createdAt: "2026-09-04T15:10:25.000Z",
    },
    auditLogs: [
      { id: "al_002a", stage: "INGESTED", message: "Webhook payload received. Payment pay_QR6w8jKl3mN1zA marked as failed.", metadata: "{}", createdAt: "2026-09-04T15:10:22.000Z" },
      { id: "al_002b", stage: "SCORING", message: "Gemini diagnosis complete. Root cause: bank_gateway_timeout (confidence: 0.87).", metadata: '{"model":"gemini-3.5-flash","latency_ms":290}', createdAt: "2026-09-04T15:10:25.000Z" },
      { id: "al_002c", stage: "STRATEGY_SELECTED", message: "Strategy PAYMENT_LINK_SMS selected. Bounded retry: attempt 1/3.", metadata: '{"max_retries":3,"cooldown_hours":6}', createdAt: "2026-09-04T15:10:25.500Z" },
      { id: "al_002d", stage: "INTERVENTION_SENT", message: "Payment link plink_QR6b created and SMS dispatched to +91****6655.", metadata: '{"link_id":"plink_QR6b","channel":"sms"}', createdAt: "2026-09-04T15:10:27.000Z" },
      { id: "al_002e", stage: "FUNDS_RECOVERED", message: "Payment link paid. Recovery confirmed: INR 500.00.", metadata: '{"recovered_payment_id":"pay_QR6c3nOq6rS4dE"}', createdAt: "2026-09-04T17:32:11.000Z" },
    ],
  },
  {
    payment: {
      id: "pay_QR5v7iJk2lM0yZ",
      orderId: "order_QR5v6hIj1kL9xY",
      amount: 4250000,
      currency: "INR",
      status: "failed",
      method: "card",
      errorCode: "BAD_REQUEST_ERROR",
      errorReason: "card_declined",
      errorDescription: "Card was declined by the issuing bank.",
      email: "amit.singh@b2bcorp.in",
      contact: "+919123456789",
      createdAt: "2026-09-04T16:45:30.000Z",
    },
    recoveryAction: {
      id: "ra_003",
      rootCause: "Card Declined by Issuer",
      confidence: 0.78,
      aiReasoning:
        "BAD_REQUEST_ERROR with card_declined on a high-value B2B transaction (INR 42,500) may indicate a spending limit or fraud flag on the card. Given the amount and B2B context, email is preferred over SMS — the finance team likely handles procurement. Recovery link sent via email to the registered address.",
      strategy: "PAYMENT_LINK_EMAIL",
      status: "intervention_sent",
      recoveryAmount: null,
      createdAt: "2026-09-04T16:45:33.000Z",
    },
    auditLogs: [
      { id: "al_003a", stage: "INGESTED", message: "Webhook payload received. Payment pay_QR5v7iJk2lM0yZ marked as failed.", metadata: "{}", createdAt: "2026-09-04T16:45:30.000Z" },
      { id: "al_003b", stage: "SCORING", message: "Gemini diagnosis complete. Root cause: card_declined (confidence: 0.78).", metadata: '{"model":"gemini-3.5-flash","latency_ms":410}', createdAt: "2026-09-04T16:45:33.000Z" },
      { id: "al_003c", stage: "STRATEGY_SELECTED", message: "Strategy PAYMENT_LINK_EMAIL selected. B2B heuristic applied.", metadata: '{"max_retries":2,"cooldown_hours":12}', createdAt: "2026-09-04T16:45:33.500Z" },
      { id: "al_003d", stage: "INTERVENTION_SENT", message: "Payment link plink_QR5c created and email dispatched to amit.singh@b2bcorp.in.", metadata: '{"link_id":"plink_QR5c","channel":"email"}', createdAt: "2026-09-04T16:45:35.000Z" },
    ],
  },
  {
    payment: {
      id: "pay_QR4u6hIj1kL9xY",
      orderId: "order_QR4u5gHi0jK8wX",
      amount: 250000,
      currency: "INR",
      status: "failed",
      method: "card",
      errorCode: "BAD_REQUEST_ERROR",
      errorReason: "card_expired",
      errorDescription: "The card used for payment has expired.",
      email: "neha.gupta@yahoo.com",
      contact: "+919234567890",
      createdAt: "2026-09-04T17:02:15.000Z",
    },
    recoveryAction: {
      id: "ra_004",
      rootCause: "Card Expired",
      confidence: 0.97,
      aiReasoning:
        "Error reason card_expired is deterministic — the card is definitively past its expiry date. This is not retryable with the same instrument. Sending a payment link via SMS allows the customer to pay with a different card or UPI method.",
      strategy: "PAYMENT_LINK_SMS",
      status: "recovered",
      recoveryAmount: 250000,
      createdAt: "2026-09-04T17:02:18.000Z",
    },
    auditLogs: [
      { id: "al_004a", stage: "INGESTED", message: "Webhook payload received. Payment pay_QR4u6hIj1kL9xY marked as failed.", metadata: "{}", createdAt: "2026-09-04T17:02:15.000Z" },
      { id: "al_004b", stage: "SCORING", message: "Gemini diagnosis complete. Root cause: card_expired (confidence: 0.97).", metadata: '{"model":"gemini-3.5-flash","latency_ms":220}', createdAt: "2026-09-04T17:02:18.000Z" },
      { id: "al_004c", stage: "STRATEGY_SELECTED", message: "Strategy PAYMENT_LINK_SMS selected. Non-retryable instrument detected.", metadata: '{"max_retries":3,"cooldown_hours":6}', createdAt: "2026-09-04T17:02:18.500Z" },
      { id: "al_004d", stage: "INTERVENTION_SENT", message: "Payment link plink_QR4d created and SMS dispatched to +91****7890.", metadata: '{"link_id":"plink_QR4d","channel":"sms"}', createdAt: "2026-09-04T17:02:20.000Z" },
      { id: "al_004e", stage: "FUNDS_RECOVERED", message: "Payment link paid. Recovery confirmed: INR 2,500.00.", metadata: '{"recovered_payment_id":"pay_QR4e4oPs7sT5fG"}', createdAt: "2026-09-04T19:14:55.000Z" },
    ],
  },
  {
    payment: {
      id: "pay_QR3t5gHi0jK8wX",
      orderId: "order_QR3t4fGh9iJ7vW",
      amount: 875000,
      currency: "INR",
      status: "failed",
      method: "netbanking",
      errorCode: "GATEWAY_ERROR",
      errorReason: "payment_failed",
      errorDescription: "Transaction could not be completed. Bank server unavailable.",
      email: "rohit.kumar@hotmail.com",
      contact: "+919345678901",
      createdAt: "2026-09-04T18:30:45.000Z",
    },
    recoveryAction: {
      id: "ra_005",
      rootCause: "Bank Server Unavailable",
      confidence: 0.91,
      aiReasoning:
        "GATEWAY_ERROR on netbanking with server unavailable description points to a bank-side outage. This is entirely transient and not customer-attributable. A payment link via SMS gives the customer an immediate alternative path to complete payment once the bank recovers.",
      strategy: "PAYMENT_LINK_SMS",
      status: "intervention_sent",
      recoveryAmount: null,
      createdAt: "2026-09-04T18:30:48.000Z",
    },
    auditLogs: [
      { id: "al_005a", stage: "INGESTED", message: "Webhook payload received. Payment pay_QR3t5gHi0jK8wX marked as failed.", metadata: "{}", createdAt: "2026-09-04T18:30:45.000Z" },
      { id: "al_005b", stage: "SCORING", message: "Gemini diagnosis complete. Root cause: bank_server_unavailable (confidence: 0.91).", metadata: '{"model":"gemini-3.5-flash","latency_ms":310}', createdAt: "2026-09-04T18:30:48.000Z" },
      { id: "al_005c", stage: "STRATEGY_SELECTED", message: "Strategy PAYMENT_LINK_SMS selected. Transient bank failure detected.", metadata: '{"max_retries":3,"cooldown_hours":4}', createdAt: "2026-09-04T18:30:48.500Z" },
      { id: "al_005d", stage: "INTERVENTION_SENT", message: "Payment link plink_QR3e created and SMS dispatched to +91****8901.", metadata: '{"link_id":"plink_QR3e","channel":"sms"}', createdAt: "2026-09-04T18:30:50.000Z" },
    ],
  },
  {
    payment: {
      id: "pay_QR2s4fGh9iJ7vW",
      orderId: "order_QR2s3eFg8hI6uV",
      amount: 3200000,
      currency: "INR",
      status: "failed",
      method: "card",
      errorCode: "BAD_REQUEST_ERROR",
      errorReason: "international_transaction_not_allowed",
      errorDescription: "International transactions are not enabled on this card.",
      email: "deepika.nair@company.co",
      contact: "+919456789012",
      createdAt: "2026-09-04T19:15:10.000Z",
    },
    recoveryAction: {
      id: "ra_006",
      rootCause: "International Tx Blocked",
      confidence: 0.96,
      aiReasoning:
        "The card does not have international transactions enabled. This requires the cardholder to contact their bank to enable international payments — a multi-step manual process. Escalating to human support is the appropriate strategy as automated retry would fail identically.",
      strategy: "ESCALATE_TO_HUMAN",
      status: "escalated",
      recoveryAmount: null,
      createdAt: "2026-09-04T19:15:13.000Z",
    },
    auditLogs: [
      { id: "al_006a", stage: "INGESTED", message: "Webhook payload received. Payment pay_QR2s4fGh9iJ7vW marked as failed.", metadata: "{}", createdAt: "2026-09-04T19:15:10.000Z" },
      { id: "al_006b", stage: "SCORING", message: "Gemini diagnosis complete. Root cause: international_transaction_not_allowed (confidence: 0.96).", metadata: '{"model":"gemini-3.5-flash","latency_ms":280}', createdAt: "2026-09-04T19:15:13.000Z" },
      { id: "al_006c", stage: "STRATEGY_SELECTED", message: "Strategy ESCALATE_TO_HUMAN selected. Non-retryable: requires bank intervention.", metadata: '{"reason":"requires_customer_bank_action"}', createdAt: "2026-09-04T19:15:13.500Z" },
      { id: "al_006d", stage: "ESCALATED", message: "Case escalated to merchant support queue. Merchant notified via dashboard.", metadata: '{"escalation_id":"esc_QR2f"}', createdAt: "2026-09-04T19:15:15.000Z" },
    ],
  },
  {
    payment: {
      id: "pay_QR1r3eFg8hI6uV",
      orderId: "order_QR1r2dEf7gH5tU",
      amount: 75000,
      currency: "INR",
      status: "failed",
      method: "upi",
      errorCode: "BAD_REQUEST_ERROR",
      errorReason: "upi_invalid_vpa",
      errorDescription: "The UPI VPA entered is invalid.",
      email: "sanjay.mehta@gmail.com",
      contact: "+919567890123",
      createdAt: "2026-09-04T20:00:30.000Z",
    },
    recoveryAction: {
      id: "ra_007",
      rootCause: "Invalid UPI VPA",
      confidence: 0.99,
      aiReasoning:
        "The customer entered an invalid UPI handle (VPA). This is a user input error. A payment link via SMS bypasses the VPA entry entirely, allowing payment through any supported method including QR scan, card, or corrected UPI.",
      strategy: "PAYMENT_LINK_SMS",
      status: "recovered",
      recoveryAmount: 75000,
      createdAt: "2026-09-04T20:00:33.000Z",
    },
    auditLogs: [
      { id: "al_007a", stage: "INGESTED", message: "Webhook payload received. Payment pay_QR1r3eFg8hI6uV marked as failed.", metadata: "{}", createdAt: "2026-09-04T20:00:30.000Z" },
      { id: "al_007b", stage: "SCORING", message: "Gemini diagnosis complete. Root cause: upi_invalid_vpa (confidence: 0.99).", metadata: '{"model":"gemini-3.5-flash","latency_ms":190}', createdAt: "2026-09-04T20:00:33.000Z" },
      { id: "al_007c", stage: "STRATEGY_SELECTED", message: "Strategy PAYMENT_LINK_SMS selected. User input error — bypass VPA entry.", metadata: '{"max_retries":3,"cooldown_hours":6}', createdAt: "2026-09-04T20:00:33.500Z" },
      { id: "al_007d", stage: "INTERVENTION_SENT", message: "Payment link plink_QR1f created and SMS dispatched to +91****0123.", metadata: '{"link_id":"plink_QR1f","channel":"sms"}', createdAt: "2026-09-04T20:00:35.000Z" },
      { id: "al_007e", stage: "FUNDS_RECOVERED", message: "Payment link paid. Recovery confirmed: INR 750.00.", metadata: '{"recovered_payment_id":"pay_QR1g5qRt8uV6hI"}', createdAt: "2026-09-04T21:10:42.000Z" },
    ],
  },
  {
    payment: {
      id: "pay_QR0q2dEf7gH5tU",
      orderId: "order_QR0q1cDe6fG4sT",
      amount: 120000,
      currency: "INR",
      status: "failed",
      method: "card",
      errorCode: "SERVER_ERROR",
      errorReason: "internal_error",
      errorDescription: "An internal server error occurred during payment processing.",
      email: "ananya.joshi@protonmail.com",
      contact: "+919678901234",
      createdAt: "2026-09-04T21:20:05.000Z",
    },
    recoveryAction: {
      id: "ra_008",
      rootCause: "Internal Server Error",
      confidence: 0.72,
      aiReasoning:
        "SERVER_ERROR with internal_error is a platform-side failure — neither the customer nor their bank caused this. Confidence is moderate because the root cause is opaque. Escalating to human review since the issue may require infrastructure investigation before retrying.",
      strategy: "ESCALATE_TO_HUMAN",
      status: "escalated",
      recoveryAmount: null,
      createdAt: "2026-09-04T21:20:08.000Z",
    },
    auditLogs: [
      { id: "al_008a", stage: "INGESTED", message: "Webhook payload received. Payment pay_QR0q2dEf7gH5tU marked as failed.", metadata: "{}", createdAt: "2026-09-04T21:20:05.000Z" },
      { id: "al_008b", stage: "SCORING", message: "Gemini diagnosis complete. Root cause: internal_error (confidence: 0.72).", metadata: '{"model":"gemini-3.5-flash","latency_ms":450}', createdAt: "2026-09-04T21:20:08.000Z" },
      { id: "al_008c", stage: "STRATEGY_SELECTED", message: "Strategy ESCALATE_TO_HUMAN selected. Low-confidence diagnosis on server error.", metadata: '{"reason":"opaque_server_failure"}', createdAt: "2026-09-04T21:20:08.500Z" },
      { id: "al_008d", stage: "ESCALATED", message: "Case escalated to merchant support queue. Requires infra review.", metadata: '{"escalation_id":"esc_QR0g"}', createdAt: "2026-09-04T21:20:10.000Z" },
    ],
  },
  {
    payment: {
      id: "pay_QP9p1cDe6fG4sT",
      orderId: "order_QP9p0bCd5eF3rS",
      amount: 185000,
      currency: "INR",
      status: "failed",
      method: "wallet",
      errorCode: "BAD_REQUEST_ERROR",
      errorReason: "insufficient_funds",
      errorDescription: "Wallet balance is insufficient for this transaction.",
      email: "vikram.reddy@gmail.com",
      contact: "+919789012345",
      createdAt: "2026-09-04T22:05:40.000Z",
    },
    recoveryAction: {
      id: "ra_009",
      rootCause: "Insufficient Funds",
      confidence: 0.93,
      aiReasoning:
        "Insufficient wallet balance. The customer intended to pay but the selected wallet (likely Paytm/PhonePe) did not have enough balance. Sending a payment link via email provides an alternative payment path using card or UPI.",
      strategy: "PAYMENT_LINK_EMAIL",
      status: "recovered",
      recoveryAmount: 185000,
      createdAt: "2026-09-04T22:05:43.000Z",
    },
    auditLogs: [
      { id: "al_009a", stage: "INGESTED", message: "Webhook payload received. Payment pay_QP9p1cDe6fG4sT marked as failed.", metadata: "{}", createdAt: "2026-09-04T22:05:40.000Z" },
      { id: "al_009b", stage: "SCORING", message: "Gemini diagnosis complete. Root cause: insufficient_funds (confidence: 0.93).", metadata: '{"model":"gemini-3.5-flash","latency_ms":260}', createdAt: "2026-09-04T22:05:43.000Z" },
      { id: "al_009c", stage: "STRATEGY_SELECTED", message: "Strategy PAYMENT_LINK_EMAIL selected. Wallet failure — offering card/UPI alternative.", metadata: '{"max_retries":2,"cooldown_hours":8}', createdAt: "2026-09-04T22:05:43.500Z" },
      { id: "al_009d", stage: "INTERVENTION_SENT", message: "Payment link plink_QP9h created and email dispatched to vikram.reddy@gmail.com.", metadata: '{"link_id":"plink_QP9h","channel":"email"}', createdAt: "2026-09-04T22:05:45.000Z" },
      { id: "al_009e", stage: "FUNDS_RECOVERED", message: "Payment link paid. Recovery confirmed: INR 1,850.00.", metadata: '{"recovered_payment_id":"pay_QP9i6rSu9vW7jK"}', createdAt: "2026-09-05T00:30:18.000Z" },
    ],
  },
  {
    payment: {
      id: "pay_QP8o0bCd5eF3rS",
      orderId: "order_QP8n9aBc4dE2qR",
      amount: 560000,
      currency: "INR",
      status: "failed",
      method: "card",
      errorCode: "BAD_REQUEST_ERROR",
      errorReason: "card_declined",
      errorDescription: "Transaction declined — suspected fraud by issuing bank.",
      email: "meera.iyer@techstartup.io",
      contact: "+919890123456",
      createdAt: "2026-09-04T23:30:22.000Z",
    },
    recoveryAction: {
      id: "ra_010",
      rootCause: "Suspected Fraud Block",
      confidence: 0.85,
      aiReasoning:
        "Card declined with suspected fraud indication from the issuing bank. This is a security hold — automated retry would be blocked identically. The customer needs to contact their bank to whitelist the merchant or confirm the transaction. Escalating to human support to assist the customer through the process.",
      strategy: "ESCALATE_TO_HUMAN",
      status: "escalated",
      recoveryAmount: null,
      createdAt: "2026-09-04T23:30:25.000Z",
    },
    auditLogs: [
      { id: "al_010a", stage: "INGESTED", message: "Webhook payload received. Payment pay_QP8o0bCd5eF3rS marked as failed.", metadata: "{}", createdAt: "2026-09-04T23:30:22.000Z" },
      { id: "al_010b", stage: "SCORING", message: "Gemini diagnosis complete. Root cause: suspected_fraud_block (confidence: 0.85).", metadata: '{"model":"gemini-3.5-flash","latency_ms":380}', createdAt: "2026-09-04T23:30:25.000Z" },
      { id: "al_010c", stage: "STRATEGY_SELECTED", message: "Strategy ESCALATE_TO_HUMAN selected. Fraud block requires customer-bank interaction.", metadata: '{"reason":"issuer_fraud_hold"}', createdAt: "2026-09-04T23:30:25.500Z" },
      { id: "al_010d", stage: "ESCALATED", message: "Case escalated to merchant support queue. Customer requires bank verification.", metadata: '{"escalation_id":"esc_QP8i"}', createdAt: "2026-09-04T23:30:27.000Z" },
    ],
  },
];

// Derived summary metrics
export const METRICS = {
  atRiskTotal: MOCK_RECOVERY_JOBS.reduce((sum, j) => sum + j.payment.amount, 0),
  atRiskCount: MOCK_RECOVERY_JOBS.length,
  recoveredTotal: MOCK_RECOVERY_JOBS.reduce(
    (sum, j) => sum + (j.recoveryAction.recoveryAmount ?? 0),
    0
  ),
  recoveredCount: MOCK_RECOVERY_JOBS.filter(
    (j) => j.recoveryAction.status === "recovered"
  ).length,
  escalatedCount: MOCK_RECOVERY_JOBS.filter(
    (j) => j.recoveryAction.status === "escalated"
  ).length,
};

export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return rupees.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}

export function maskContact(contact: string): string {
  if (contact.length < 6) return contact;
  return contact.slice(0, 4) + "****" + contact.slice(-4);
}
