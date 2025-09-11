# Production Setup Guide

## PhonePe API Configuration

To set up your production PhonePe API keys, follow these steps:

### 1. Create Environment File

Create a `.env` file in the root directory with the following variables:

```env
# PhonePe Production API Configuration
VITE_PHONEPE_MERCHANT_ID=your_production_merchant_id
VITE_PHONEPE_SALT_KEY=your_production_salt_key
VITE_PHONEPE_SALT_INDEX=1
VITE_PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg-sandbox
```

### 2. Get Your Production Credentials

1. Log in to your PhonePe Merchant Dashboard
2. Navigate to the API section
3. Copy your:
   - Merchant ID
   - Salt Key
   - Salt Index
   - Production API URL

### 3. Update Environment Variables

Replace the placeholder values in your `.env` file with your actual production credentials:

```env
VITE_PHONEPE_MERCHANT_ID=PGTESTPAYUAT  # Replace with your production merchant ID
VITE_PHONEPE_SALT_KEY=your_actual_salt_key  # Replace with your production salt key
VITE_PHONEPE_SALT_INDEX=1  # Replace with your actual salt index
VITE_PHONEPE_BASE_URL=https://api.phonepe.com/apis/pg-sandbox  # Replace with production URL
```

### 4. Important Security Notes

- **Never commit your `.env` file to version control**
- The `.env` file is already included in `.gitignore`
- Keep your salt key secure and never share it publicly
- Use different credentials for development and production

### 5. Production Checklist

Before going live, ensure:

- [ ] Production API keys are configured
- [ ] Test transactions work with production credentials
- [ ] Webhook URLs are updated to production domain
- [ ] SSL certificates are properly configured
- [ ] Error handling is tested thoroughly

### 6. Fallback Behavior

The application will fall back to test mode if:
- Environment variables are not set
- API calls fail
- Invalid credentials are provided

Remove the fallback to test mode in production by modifying the `createPhonePePayment` method in `src/services/paymentService.ts`.

### 7. Checksum Implementation

**Important**: The current checksum generation is simplified for development. For production, implement proper SHA256 checksum generation as per PhonePe's documentation.

Update the `generateChecksum` method in `src/services/paymentService.ts` with the proper implementation.

## Support

For PhonePe API documentation and support, visit: https://developer.phonepe.com/



