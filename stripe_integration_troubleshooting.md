# Stripe Integration Troubleshooting Guide

## Common Stripe Setup Issues and Solutions

### 1. **API Keys Configuration**
Most common issue: Using test keys in production or live keys in development

**Check Your Keys:**
- **Test keys** start with `sk_test_` and `pk_test_` - use these for development
- **Live keys** start with `sk_live_` and `pk_live_` - use these for production

**In Replit Secrets, set:**
```
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
VITE_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key_here
```

### 2. **Webhook Configuration**
If you're setting up webhooks for payment confirmations:

**Webhook URL should be:**
```
https://your-domain.replit.app/api/stripe/webhooks
```

**Required Events to Listen For:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 3. **Business Information Required**
Stripe requires business details for live mode activation:

**Required Information:**
- Business name and address
- Tax ID (EIN for US businesses)
- Bank account for payouts
- Identity verification for business owners
- Business type (LLC, Corporation, Sole Proprietorship)

### 4. **Payment Methods Setup**
Enable the payment methods you want to accept:

**Common Methods:**
- Credit/Debit Cards (enabled by default)
- ACH Direct Debit (for US customers)
- SEPA Direct Debit (for EU customers)
- Google Pay / Apple Pay

### 5. **Compliance Requirements**
For financial services like AlphaForge:

**Required Steps:**
- Complete business verification
- Provide detailed business description mentioning "quantitative trading platform"
- Submit terms of service and privacy policy
- Configure risk management settings
- Set up proper customer authentication

### 6. **Testing Your Integration**
Use Stripe's test card numbers:

**Test Cards:**
- Success: `4242424242424242`
- Decline: `4000000000000002`
- Requires 3DS: `4000002500003155`

## AlphaForge-Specific Configuration

### Performance-Based Pricing Setup
For your 30% performance fee model:

```javascript
// Create usage-based subscription for performance fees
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{
    price_data: {
      currency: 'usd',
      product: 'performance_fee',
      unit_amount_decimal: '30.00', // 30% as percentage
      recurring: {
        interval: 'month',
        usage_type: 'metered'
      }
    }
  }]
});
```

### High-Value Transaction Settings
For institutional clients with large portfolios:

- Enable high-value transaction processing
- Set up manual review thresholds
- Configure multi-party authentication
- Implement additional fraud protection

## Next Steps Based on Your Issue

Could you describe what specific error or step you're encountering? Common scenarios:

1. **Account Under Review**: Need to complete business verification
2. **Webhook Failures**: Need to configure endpoint and events
3. **Test vs Live Mode**: Need to switch API keys
4. **Payment Failures**: Need to handle declined cards
5. **Business Type Issues**: Need to specify financial services correctly

Your AlphaForge Stripe integration is already coded and ready - I just need to help you with the Stripe dashboard configuration.