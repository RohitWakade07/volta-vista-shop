# Payment Gateway Debug Guide

This project now uses Razorpay.

## Server Environment Variables (Firebase Functions)
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET

Set them as secrets in Firebase (Gen 2):
```bash
firebase functions:secrets:set RAZORPAY_KEY_ID
firebase functions:secrets:set RAZORPAY_KEY_SECRET
firebase functions:secrets:set RAZORPAY_WEBHOOK_SECRET
```

## Endpoints (auto-routed under Hosting /__/functions/)
- POST /__/functions/razorpayCreateOrder
- POST /__/functions/razorpayVerify
- POST /__/functions/razorpayWebhook

## Flow
1. Checkout creates Firestore order (status=pending, paymentStatus=pending).
2. Frontend calls createOrder endpoint, receives { order, key }.
3. Razorpay Checkout opens; on success, frontend calls verify endpoint.
4. Server updates `orders` and writes to `payments`.

## Testing Locally
```bash
cd functions && npm i && cd ..
firebase emulators:start --only functions,hosting
```
Use Razorpay test keys. Configure webhook in Razorpay dashboard to point to your deployed `/__/functions/razorpayWebhook`.
