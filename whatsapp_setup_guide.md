# WhatsApp Business API Setup for AlphaForge Executive Alerts

## Quick Setup Guide

### Step 1: Get WhatsApp Business API Access
1. Visit [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing app
3. Add "WhatsApp Business API" product
4. Get your permanent access token

### Step 2: Configure Environment Variables
Add these to your Replit environment:

```bash
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_RECIPIENT_NUMBER=+1234567890  # Your executive phone number
```

### Step 3: Test the Integration
Once configured, AlphaForge will automatically send WhatsApp alerts for:
- Critical hedge fund detections
- High-value business prospects (>$400K)
- System compliance issues
- Daily/weekly report summaries

### Message Format Example
```
🚨 AlphaForge Security Alert

*Hedge Fund Detection*

High-value institutional trader detected
*Severity:* CRITICAL
*Risk Score:* 175/200
*Business Value:* $480,000
*Time:* 8:50 PM

View dashboard: https://alpha-forge.io/admin/security
```

## Free Tier Limits
- Meta provides 1,000 free conversations per month
- Each conversation includes 24-hour messaging window
- Perfect for executive alerts and critical notifications

## Alternative: WhatsApp Business App
If you prefer simpler setup:
1. Use WhatsApp Business app on your phone
2. Create a business profile
3. Use webhook forwarding service (Zapier, IFTTT)
4. Forward email alerts to WhatsApp via third-party service

## Security Features
- End-to-end encryption for all messages
- Business verification badges
- Message templates for compliance
- Delivery and read receipts