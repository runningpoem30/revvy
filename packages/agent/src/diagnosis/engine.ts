import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { Payment } from '@prisma/client';
import { config } from '../config';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

// Strict Zod schema for the expected LLM output
export const DiagnosisSchema = z.object({
  root_cause: z.string(),
  confidence: z.number().min(0).max(1),
  is_retryable: z.boolean(),
  reasoning: z.string(),
  suggested_strategy: z.enum([
    'immediate_retry',
    'wait_24h_retry',
    'payment_link_sms',
    'payment_link_email',
    'escalate_to_human',
    'no_action'
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
  "suggested_strategy": "one of: immediate_retry, wait_24h_retry, payment_link_sms, payment_link_email, escalate_to_human, no_action"
}
  `;

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

  } catch (error) {
    console.error(' Gemini API Error:', error);
    return null; // Will trigger fallback in the caller
  }
}
