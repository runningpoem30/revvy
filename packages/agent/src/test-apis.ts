import { config } from './config';
import { razorpay } from './razorpay/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testAPIs() {
  console.log('Testing APIs...');

  try {
    // 1. Test Razorpay
    const orders = await razorpay.orders.all({ count: 1 });
    console.log('✅ Razorpay API is working. Fetched orders count:', orders.items.length);
  } catch (e: any) {
    console.error('❌ Razorpay API Error:', e.message);
  }

  try {
    // 2. Test Gemini - List Models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log('✅ Available Gemini Models:');
    if (data.models) {
      data.models.forEach((m: any) => console.log(`  - ${m.name}`));
    } else {
      console.log(data);
    }
  } catch (e: any) {
    console.error('❌ Gemini API Error:', e.message);
  }
}

testAPIs();
