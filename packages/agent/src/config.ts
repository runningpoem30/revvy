import { z } from 'zod';
import dotenv from 'dotenv';

import path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Define the strict schema for our environment
const envSchema = z.object({
  AGENT_PORT: z.string().default('3001'),
  
  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1, "Razorpay Key ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "Razorpay Key Secret is required"),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, "Razorpay Webhook Secret is required"),
  
  // Gemini (comma-separated list of keys supported)
  GEMINI_API_KEY: z.string().min(1, "Gemini API Key is required")
    .transform(str => str.split(',').map(s => s.trim()).filter(Boolean)),

  // DB
  DATABASE_URL: z.string().url("Must be a valid SQLite file URL"),
});

// Parse and validate process.env
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(" Invalid environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const config = parsedEnv.data;
