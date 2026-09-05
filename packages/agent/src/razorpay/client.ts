import Razorpay from 'razorpay';
import { config } from '../config';

// Initialize the Razorpay client in Test Mode
export const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

// We also export the webhook secret for use in the webhook verification middleware
export const razorpayWebhookSecret = config.RAZORPAY_WEBHOOK_SECRET;

console.log(` Razorpay Client initialized with Key ID: ${config.RAZORPAY_KEY_ID.substring(0, 12)}...`);
