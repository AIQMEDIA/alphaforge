# WhatsApp Setup - Ready in 5 Minutes

## Current Status: ✅ CONFIGURED - NEEDS API KEY

Your WhatsApp integration is built and ready. You just need to add your credentials.

## Step 1: Get WhatsApp Business API Access (FREE)

1. Visit https://developers.facebook.com/
2. Click "Create App" → Choose "Business" 
3. Add "WhatsApp Business API" product
4. Copy your access token and phone number ID

## Step 2: Add to Replit Environment Variables

Go to your Replit project settings and add:

```
WHATSAPP_ACCESS_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here  
WHATSAPP_RECIPIENT_NUMBER=+1234567890
```

Replace with your actual values.

## Step 3: Test Integration

After adding the variables, test with:
```bash
curl -X POST https://your-replit-url/api/webhooks/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"message":"Test from AlphaForge"}'
```

## What You'll Get

Once configured, your executive team will receive instant WhatsApp alerts like:

```
🚨 AlphaForge Security Alert

*Hedge Fund Detection*

High-value trader detected
*Business Value:* $480,000
*Risk Score:* 175/200
*Time:* Now

View: https://alpha-forge.io/admin
```

## Free Tier Benefits
- 1,000 free conversations per month
- Perfect for executive alerts (50-100/month typical)
- Professional business verification
- Rich message formatting

The integration is ready to activate immediately once you add your credentials.