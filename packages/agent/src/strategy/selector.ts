import { PrismaClient, Payment, RecoveryAction } from '@prisma/client';
import { diagnosePaymentFailure, DiagnosisResult } from '../diagnosis/engine';
import { fallbackDiagnosis } from '../diagnosis/fallback';
import { classifyRevenueLeak } from '../detector/classifier';

const prisma = new PrismaClient();

/**
 * The core brain: Determines what to do when a payment fails.
 * Orchestrates classification, diagnosis, and constraint checking.
 */
export async function determineRecoveryStrategy(payment: Payment) {
  console.log(`\n🧠 Determining strategy for payment ${payment.id}...`);

  // 1. Classify the leak
  const category = classifyRevenueLeak(payment);
  console.log(`   Category: ${category}`);

  // 2. Check Constraints (e.g., stopping rules)
  const previousActions = await prisma.recoveryAction.count({
    where: { paymentId: payment.id }
  });

  if (previousActions >= 3) {
    console.log(`   🛑 Constraint met: Max attempts (3) reached. Escalating.`);
    return await saveAction(payment, category, {
      root_cause: payment.errorReason || 'unknown',
      confidence: 1,
      is_retryable: false,
      reasoning: 'Max recovery attempts reached. Stopping automated recovery.',
      suggested_strategy: 'ESCALATE_TO_HUMAN'
    }, ['max_attempts_reached']);
  }

  // 3. AI Diagnosis
  let diagnosis: DiagnosisResult | null = await diagnosePaymentFailure(payment);
  let usedFallback = false;

  if (!diagnosis) {
    diagnosis = fallbackDiagnosis(payment);
    usedFallback = true;
  }

  console.log(`   Diagnosis: ${diagnosis.root_cause} -> Strategy: ${diagnosis.suggested_strategy}`);

  // 4. Record Action in DB
  return await saveAction(payment, category, diagnosis, [
    `ai_diagnosis_used: ${!usedFallback}`,
    `attempt_number: ${previousActions + 1}`
  ]);
}

async function saveAction(
  payment: Payment, 
  category: string, 
  diagnosis: DiagnosisResult, 
  constraintsChecked: string[]
) {
  // First, log the diagnosis decision in the RecoveryAction table
  const action = await prisma.recoveryAction.create({
    data: {
      paymentId: payment.id,
      category,
      rootCause: diagnosis.root_cause,
      confidence: diagnosis.confidence,
      aiReasoning: diagnosis.reasoning,
      strategy: diagnosis.suggested_strategy,
      status: 'pending' // Ready for execution
    }
  });

  // Then, log the detailed audit trail
  await prisma.auditLog.create({
    data: {
      recoveryActionId: action.id,
      stage: 'diagnosis',
      message: `Selected strategy: ${diagnosis.suggested_strategy} based on root cause: ${diagnosis.root_cause}`,
      metadata: JSON.stringify({
        constraintsChecked,
        aiReasoning: diagnosis.reasoning
      })
    }
  });

  return action;
}
