# Payment Gateway Debug Guide

## Issue: Payment Gateway Not Showing Up

The payment gateway is not appearing because the PhonePe API call is failing and falling back to test mode.

## Steps to Debug and Fix

### 1. Check Environment Variables

Open your browser's developer console (F12) and look for the environment variables test output when you try to make a payment. You should see:

```
=== Environment Variables Test ===
VITE_PHONEPE_MERCHANT_ID: your_merchant_id
VITE_PHONEPE_SALT_KEY: ***SET***
VITE_PHONEPE_SALT_INDEX: 1
VITE_PHONEPE_BASE_URL: your_api_url
================================
```

### 2. Check Console Logs

When you proceed to payment, check the console for:

1. **PhonePe Config** - Should show your production values
2. **Payment Payload** - Should show the order details
3. **Generated Checksum** - Should show the SHA256 checksum
4. **PhonePe Response Status** - Should be 200 for success
5. **PhonePe Response Data** - Should contain the payment URL

### 3. Common Issues and Solutions

#### Issue 1: Environment Variables Not Loading
**Symptoms:** Console shows fallback values (PGTESTPAYUAT, etc.)
**Solution:** 
- Ensure your `.env` file is in the root directory
- Restart the development server after updating `.env`
- Check that variable names start with `VITE_`

#### Issue 2: Invalid API Credentials
**Symptoms:** PhonePe API returns 401/403 errors
**Solution:**
- Verify your merchant ID is correct
- Verify your salt key is correct
- Ensure you're using production credentials, not test credentials

#### Issue 3: Wrong API URL
**Symptoms:** Network errors or 404 responses
**Solution:**
- For production: `https://api.phonepe.com/apis/pg-sandbox`
- For testing: `https://api-preprod.phonepe.com/apis/pg-sandbox`

#### Issue 4: Checksum Generation Issues
**Symptoms:** PhonePe returns checksum validation errors
**Solution:**
- The new SHA256 implementation should fix this
- Ensure your salt key and salt index are correct

### 4. Testing Steps

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser console (F12)**

3. **Go through checkout process:**
   - Add items to cart
   - Go to checkout
   - Fill in details
   - Click "Proceed to Payment"

4. **Check console output:**
   - Look for environment variables test
   - Check PhonePe API response
   - Verify payment URL generation

### 5. Expected Behavior

**If working correctly:**
- Console shows your production environment variables
- PhonePe API call succeeds (status 200)
- You get redirected to PhonePe payment page
- No fallback to test mode

**If still failing:**
- Console shows fallback to test mode
- You get redirected to `/payment/test` page
- Check the specific error in console

### 6. Production Checklist

Before going live, ensure:

- [ ] Environment variables are set correctly
- [ ] PhonePe API calls succeed
- [ ] Payment gateway redirects properly
- [ ] No fallback to test mode
- [ ] SSL certificates are configured
- [ ] Webhook URLs are updated

### 7. Remove Debug Code

Once everything is working, remove the debug console.log statements from `src/services/paymentService.ts` for production.

## Support

If you're still having issues:
1. Check PhonePe merchant dashboard for API status
2. Verify your account is approved for production
3. Contact PhonePe support for API issues
