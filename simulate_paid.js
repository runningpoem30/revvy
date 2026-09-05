import fetch from 'node-fetch';
import crypto from 'crypto';

const webhookSecret = 'demo_secret_for_hackathon_2026'; // From .env

const payload = {
  event: 'payment_link.paid',
  payload: {
    payment_link: {
      entity: {
        id: 'plink_TYHRrHChmx6Wba',
        amount: 42000,
        amount_paid: 42000,
        notes: {
          recovery_action_id: '25afa6e4-d4b1-45b9-a982-d0ff97823adb',
          original_payment_id: 'pay_TYHRc2oyw3pFRM'
        }
      }
    }
  }
};

const payloadString = JSON.stringify(payload);

const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payloadString)
  .digest('hex');

console.log('Sending mock payment_link.paid webhook...');

fetch('http://localhost:3001/api/webhooks/razorpay', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-razorpay-signature': signature
  },
  body: payloadString
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
