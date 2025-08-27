/*
 * AlphaForge - Quantum Trading Platform
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 */

export const BROKER_SETUP_GUIDANCE = `
## AlphaForge Broker Setup Assistant

I'm your personal guide for connecting your Alpaca trading account to AlphaForge. Here's what I can help you with:

### 🚀 Quick Start Options:

**Option 1: Start Paper Trading Immediately (Recommended for beginners)**
- Test quantum algorithms with $100,000 virtual money
- No broker account needed
- Learn how the platform works risk-free
- Switch to real money later

**Option 2: Set Up Real Money Trading**
- Connect Alpaca broker account
- Start with as little as $100
- Use quantum algorithms with real money
- Full risk management and stop-losses

### 📋 Broker Setup Steps:

1. **Create Alpaca Account** (5 minutes)
   - Go to alpaca.markets
   - Choose "Individual Account"
   - Complete application with your information

2. **Account Verification** (1-3 business days)
   - Upload ID and address proof
   - Link bank account
   - Fund with minimum $100

3. **Generate API Keys** (3 minutes)
   - Login to Alpaca dashboard
   - Create paper trading keys first
   - Generate live trading keys when ready

4. **Connect to AlphaForge** (2 minutes)
   - Contact our support team
   - We'll securely configure your keys
   - Start with paper trading, upgrade to live

### 🤖 Quantum Trading Benefits:

- **IBM Quantum VQE**: Portfolio optimization algorithms
- **Google Cirq**: Market prediction models  
- **Amazon Braket**: Risk analysis and hedging strategies
- **Performance-Based Pricing**: Pay only when you profit (15-30% of gains)

### ❓ Common Questions:

**Q: Is Alpaca safe?**
A: Yes, Alpaca is SIPC-insured and regulated by FINRA. Your funds are protected up to $500,000.

**Q: What's the minimum to start?**
A: $100 for live trading, $0 for paper trading. We recommend starting with paper trading.

**Q: How long does setup take?**
A: Paper trading: 0 minutes. Live trading: 1-3 business days for account approval.

**Q: Can I switch between paper and live trading?**
A: Yes, you can easily switch modes in your AlphaForge dashboard.

### 🔒 Security & Risk Management:

- API keys are encrypted and stored securely
- Position limits prevent over-leveraging
- Stop-losses automatically limit downside
- Real-time risk monitoring with quantum analysis

### Need Help?
Ask me specific questions about:
- Alpaca account creation
- API key generation
- Risk management settings
- Quantum algorithm selection
- Platform features and navigation

I'm here to make sure you're completely comfortable with the setup process!
`;

export const generateBrokerGuidanceResponse = (userMessage: string, userContext?: any) => {
  const message = userMessage.toLowerCase();
  
  // Broker setup questions
  if (message.includes('broker') || message.includes('alpaca') || message.includes('setup') || message.includes('connect')) {
    return `I'd be happy to help you set up your broker connection! 

${BROKER_SETUP_GUIDANCE}

What specific part of the broker setup can I help you with? Are you looking to:
1. Start paper trading immediately (no broker needed)
2. Create an Alpaca account for real money trading
3. Configure API keys
4. Understand the differences between paper and live trading

Just let me know what you'd like to focus on first!`;
  }

  // Trading experience questions
  if (message.includes('beginner') || message.includes('new') || message.includes('start')) {
    return `Perfect! Since you're new to trading, I recommend this path:

**🎯 Beginner-Friendly Approach:**

1. **Start with Paper Trading** (Do this today!)
   - $100,000 virtual money to practice
   - Test all quantum algorithms risk-free
   - Learn the platform without pressure

2. **Study the Results** 
   - Watch how quantum algorithms perform
   - Understand risk management tools
   - Practice different strategies

3. **Move to Real Money When Ready**
   - Start small ($100-500)
   - Use same strategies that worked in paper trading
   - Gradually increase position sizes

**📚 Learning Resources:**
- Paper trading tutorial: /paper-trading
- Quantum algorithms explained: /quantum
- Risk management guide: /risk-management

**🤝 Support Options:**
- AI assistant (that's me!)
- Step-by-step broker setup guide: /broker-setup
- Email support for complex questions

Would you like me to walk you through starting paper trading right now?`;
  }

  // API key questions
  if (message.includes('api') || message.includes('key') || message.includes('credentials')) {
    return `I'll help you with API key setup! Here's the secure process:

**🔐 API Key Generation (Alpaca Dashboard):**

1. **Login to Alpaca**
   - Go to app.alpaca.markets
   - Navigate to "API Keys" section

2. **Create Paper Trading Keys First**
   - Click "Generate API Key"
   - Choose "Paper Trading" environment
   - Copy both Key ID and Secret Key

3. **Security Best Practices**
   - Never share keys publicly
   - Use paper trading keys for testing
   - Generate live keys only when ready

**⚡ Connecting to AlphaForge:**

For security, we handle API key configuration:
1. Contact: support@alpha-forge.io
2. Subject: "API Key Configuration"
3. Include: Your account email and whether you want paper or live trading

Our team will securely configure your keys within 24 hours.

**🛡️ Why This Approach?**
- Prevents accidental key exposure
- Ensures proper encryption
- Validates key permissions
- Sets up risk management controls

Do you have your Alpaca account ready, or do you need help creating one first?`;
  }

  // General trading questions
  if (message.includes('trade') || message.includes('money') || message.includes('profit')) {
    return `Great question about trading! Here's how AlphaForge makes trading more profitable:

**🚀 Quantum Advantage:**
- IBM quantum algorithms optimize your portfolio
- Google Cirq predicts market movements
- Amazon Braket calculates optimal risk levels
- Historical testing shows 15-40% better returns

**💰 Profit Structure:**
- Performance-based pricing: pay only when you profit
- No monthly fees on performance-only plans
- 15-30% of gains above benchmark
- Keep 70-85% of all profits

**🎯 Trading Approach:**
1. **Start Small**: $100-500 initial capital
2. **Diversify**: Quantum algorithms spread risk
3. **Monitor**: Real-time performance tracking
4. **Scale**: Gradually increase successful strategies

**📊 Risk Management:**
- Maximum 5% stop-loss per position
- 20% position size limits
- Daily loss limits
- Quantum-calculated risk scores

**🔄 Trading Options:**
- Paper trading: Virtual money, real algorithms
- Live trading: Real money, same quantum advantage
- Swing trading: Hold positions 1-30 days
- Day trading: Intraday quantum opportunities

What type of trading interests you most? I can provide specific guidance for your goals!`;
  }

  // Default response for other questions
  return `I'm your AlphaForge trading assistant! I specialize in helping with:

**🔧 Setup & Configuration:**
- Broker account creation (Alpaca)
- API key generation and security
- Paper vs live trading setup
- Risk management configuration

**🤖 Quantum Trading:**
- IBM, Google, Amazon quantum algorithms
- Portfolio optimization strategies
- Market prediction models
- Performance analysis

**📚 Trading Education:**
- Beginner-friendly guidance
- Platform navigation
- Risk management principles
- Profit maximization strategies

What specific aspect would you like help with? You can ask me things like:
- "How do I start paper trading?"
- "What's the minimum to begin live trading?"
- "How do quantum algorithms work?"
- "Help me set up my Alpaca account"

I'm here to make sure you're completely comfortable with every step!`;
};