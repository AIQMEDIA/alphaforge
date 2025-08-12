# AlphaForge Setup Guide

## Quick Start for Production Trading

This guide walks you through setting up AlphaForge with real market data and broker APIs for live trading.

## 1. Required API Keys

### Market Data Providers (Choose at least one)

**Alpha Vantage** (Recommended - Most comprehensive)
- Sign up: https://www.alphavantage.co/
- Get free API key (500 requests/day)
- Set environment variable: `ALPHA_VANTAGE_API_KEY`

**Finnhub** (Good for real-time data)
- Sign up: https://finnhub.io/
- Free tier: 60 calls/minute
- Set environment variable: `FINNHUB_API_KEY`

**IEX Cloud** (US stocks only, very reliable)
- Sign up: https://iexcloud.io/
- Free tier: 50,000 calls/month
- Set environment variable: `IEX_CLOUD_API_KEY`

**Twelve Data** (Multi-asset coverage)
- Sign up: https://twelvedata.com/
- Free tier: 800 requests/day
- Set environment variable: `TWELVE_DATA_API_KEY`

### Broker APIs (For live trading)

**Alpaca Markets** (Recommended for beginners)
- Sign up: https://alpaca.markets/
- Get API keys from dashboard
- Set environment variables:
  - `ALPACA_API_KEY`
  - `ALPACA_SECRET_KEY`
  - `ALPACA_PAPER_TRADING=true` (for paper trading)

**Interactive Brokers** (Advanced users)
- Account required: https://www.interactivebrokers.com/
- Set up TWS Gateway or REST API
- More complex setup - requires additional configuration

## 2. Environment Variables Setup

Add these to your Replit Secrets:

```bash
# Database (Already configured)
DATABASE_URL=your_database_url

# Stripe Payment (Already configured)
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Market Data (Add at least one)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINNHUB_API_KEY=your_finnhub_key
IEX_CLOUD_API_KEY=your_iex_key
TWELVE_DATA_API_KEY=your_twelve_data_key

# Broker APIs (For live trading)
ALPACA_API_KEY=your_alpaca_key
ALPACA_SECRET_KEY=your_alpaca_secret
ALPACA_PAPER_TRADING=true

# Session Secret (Already configured)
SESSION_SECRET=your_session_secret
```

## 3. Database Migration

Run the database setup:

```bash
npm run db:push
```

This will:
- Create all required tables
- Set up user authentication schema
- Initialize trading and portfolio tables

## 4. Testing Your Setup

### Test Market Data Integration

1. Start the application: `npm run dev`
2. Navigate to `/api/market-data/providers` (after login)
3. Check which providers are working
4. Test real quotes: `/api/market-data/quote/AAPL`

### Test Broker Integration

1. Navigate to `/api/trading/brokers`
2. Check broker connection status
3. Switch between paper and live trading modes

## 5. Using the Platform

### Paper Trading (Risk-Free)
- Default mode for new users
- Uses simulated $100,000 account
- Perfect for testing strategies
- No real money at risk

### Live Trading (Real Money)
- Requires funded broker account
- Set `ALPACA_PAPER_TRADING=false`
- Start with small positions
- Monitor risk management closely

### Strategy Development
1. Create strategies in Strategy Builder
2. Backtest with historical data
3. Paper trade to validate
4. Deploy to live trading when confident

## 6. Production Deployment

### Pre-Deployment Checklist
- [ ] All API keys configured
- [ ] Database migrations run successfully
- [ ] Market data providers tested
- [ ] Broker connections verified
- [ ] Strategy backtests completed
- [ ] Risk management limits set

### Deploy to Replit
1. Click "Deploy" button in Replit
2. Configure custom domain (optional)
3. Set up monitoring and alerts
4. Start with paper trading
5. Gradually transition to live trading

## 7. Security Best Practices

- Never share API keys
- Use paper trading for testing
- Set position size limits
- Monitor drawdowns closely
- Keep emergency stop-loss ready
- Regular backup of strategies

## 8. Getting Help

### API Documentation
- Alpha Vantage: https://www.alphavantage.co/documentation/
- Finnhub: https://finnhub.io/docs/api
- IEX Cloud: https://iexcloud.io/docs/api/
- Twelve Data: https://twelvedata.com/docs
- Alpaca: https://alpaca.markets/docs/

### Troubleshooting
- Check API key validity
- Verify rate limits
- Monitor server logs
- Test with smaller datasets
- Use paper trading first

## 9. Cost Optimization

### Free Tier Limits
- Alpha Vantage: 500 calls/day
- Finnhub: 60 calls/minute
- IEX Cloud: 50,000/month
- Twelve Data: 800 calls/day
- Alpaca: Unlimited paper trading

### Pro Tips
- Cache market data when possible
- Use multiple providers for redundancy
- Start with daily data before real-time
- Monitor API usage carefully
- Upgrade plans as needed

## 10. Advanced Features

### Custom Indicators
- Implement technical analysis
- Create proprietary signals
- Backtest extensively
- Validate with paper trading

### Risk Management
- Position sizing algorithms
- Stop-loss automation
- Portfolio correlation limits
- Drawdown monitoring

### Performance Analytics
- Sharpe ratio tracking
- Alpha/Beta calculations
- Risk-adjusted returns
- Compliance reporting

---

🚀 **You're ready to build institutional-grade trading strategies!**

Start with paper trading, validate your approach, then gradually transition to live trading with proper risk management.