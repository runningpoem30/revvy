import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

import { config } from './config';
import { handleRazorpayWebhook } from './razorpay/webhooks';

const app = express();
const port = config.AGENT_PORT;

// Initialize Prisma
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    (req as any).rawBody = buf.toString();
  }
}));

// Webhooks
app.post('/api/webhooks/razorpay', handleRazorpayWebhook);

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Quick DB check
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'ok', 
      service: 'Revvy AI Agent',
      db: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      service: 'Revvy AI Agent',
      db: 'disconnected',
      error: String(error)
    });
  }
});

// Start server
const server = app.listen(port, () => {
  console.log(`🛡️ Revvy AI Agent running on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
});
