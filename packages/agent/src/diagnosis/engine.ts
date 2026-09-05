import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { Payment } from '@prisma/client';
import { config } from '../config';

// Initialize Gemini pool
const models = config.GEMINI_API_KEY.map(key => {
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
});

// Strict Zod schema for the expected LLM output
export const DiagnosisSchema = z.object({
  root_cause: z.string(),
  confidence: z.number().min(0).max(1),
  is_retryable: z.boolean(),
  reasoning: z.string(),
  suggested_strategy: z.enum([
    'PAYMENT_LINK_SMS',
    'PAYMENT_LINK_EMAIL',
    'ESCALATE_TO_HUMAN'
  ]),
});

export type DiagnosisResult = z.infer<typeof DiagnosisSchema>;

/**
 * Uses Gemini to diagnose a payment failure and select a recovery strategy.
 */
export async function diagnosePaymentFailure(payment: Payment): Promise<DiagnosisResult | null> {
  const prompt = `
You are an expert Staff-Level FinTech AI Agent specializing in Revenue Recovery for a payment gateway.
Analyze the following failed payment and determine the root cause and the best recovery strategy.

Payment Context:
- Amount: ₹${payment.amount / 100}
- Currency: ${payment.currency}
- Method: ${payment.method}
- Error Code: ${payment.errorCode}
- Error Reason: ${payment.errorReason}
- Error Description: ${payment.errorDescription}

Output Requirements:
Provide a strictly valid JSON response matching this schema exactly (no markdown formatting, no comments):
{
  "root_cause": "string describing root cause",
  "confidence": number between 0 and 1,
  "is_retryable": boolean,
  "reasoning": "string explaining your thought process",
  "suggested_strategy": "one of: PAYMENT_LINK_SMS, PAYMENT_LINK_EMAIL, ESCALATE_TO_HUMAN"
}
  `;

  let lastError = null;

  for (const model of models) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });

      const responseText = result.response.text();
      
      // Parse the JSON string
      const jsonParsed = JSON.parse(responseText);
      
      // Validate with Zod
      const validatedData = DiagnosisSchema.safeParse(jsonParsed);
      
      if (!validatedData.success) {
        console.error(' LLM output failed Zod validation:', validatedData.error.format());
        return null; // Will trigger fallback in the caller
      }

      return validatedData.data;

    } catch (error: any) {
      console.warn(`⚠️ Gemini API failed (Error: ${error.status || error.message}). Retrying with next key...`);
      lastError = error;
      // loop continues to the next model
    }
  }

  console.error('❌ All Gemini API keys failed. Last error:', lastError?.message || lastError);
  return null; // Will trigger fallback in the caller
}
