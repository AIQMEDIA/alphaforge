import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { marketDataService, PROVIDERS } from "./marketData";
import { brokerService, BROKERS } from "./brokerApi";
import { quantumOptimizer, QuantumProvider, QuantumAlgorithm } from "./quantumOptimizer";
import { insertStrategySchema, insertTransactionSchema, insertBacktestResultSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Portfolio routes
  app.get('/api/portfolio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [positions, recentTransactions, portfolioValue, latestRisk] = await Promise.all([
        storage.getUserPositions(userId),
        storage.getUserTransactions(userId, 10),
        storage.getPortfolioValue(userId),
        storage.getLatestRiskMetric(userId)
      ]);
      
      res.json({
        positions,
        recentTransactions,
        portfolioValue,
        riskMetrics: latestRisk
      });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.get('/api/portfolio/performance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 30;
      const performance = await storage.getPortfolioPerformance(userId, days);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching performance:", error);
      res.status(500).json({ message: "Failed to fetch performance" });
    }
  });

  // Strategy routes
  app.get('/api/strategies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const strategies = await storage.getUserStrategies(userId);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      res.status(500).json({ message: "Failed to fetch strategies" });
    }
  });

  app.post('/api/strategies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertStrategySchema.parse(req.body);
      const strategy = await storage.createStrategy({ ...validatedData, userId });
      res.json(strategy);
    } catch (error: any) {
      console.error("Error creating strategy:", error);
      res.status(400).json({ message: error.message || "Failed to create strategy" });
    }
  });

  app.put('/api/strategies/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const validatedData = insertStrategySchema.partial().parse(req.body);
      const strategy = await storage.updateStrategy(id, userId, validatedData);
      res.json(strategy);
    } catch (error: any) {
      console.error("Error updating strategy:", error);
      res.status(400).json({ message: error.message || "Failed to update strategy" });
    }
  });

  app.delete('/api/strategies/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.deleteStrategy(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting strategy:", error);
      res.status(500).json({ message: "Failed to delete strategy" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({ ...validatedData, userId });
      res.json(transaction);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: error.message || "Failed to create transaction" });
    }
  });

  // Backtesting routes
  app.get('/api/backtests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const backtests = await storage.getUserBacktestResults(userId);
      res.json(backtests);
    } catch (error) {
      console.error("Error fetching backtests:", error);
      res.status(500).json({ message: "Failed to fetch backtests" });
    }
  });

  app.post('/api/backtests/run', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { strategyId, startDate, endDate, initialCapital } = req.body;
      
      // Simulate backtest execution (replace with actual backtesting engine)
      const mockResults = {
        trades: [],
        dailyReturns: [],
        equity: []
      };
      
      const result = await storage.createBacktestResult({
        userId,
        strategyId,
        name: `Backtest ${new Date().toISOString()}`,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        initialCapital: initialCapital.toString(),
        finalValue: (initialCapital * 1.15).toString(), // Mock 15% return
        totalReturn: "0.15",
        maxDrawdown: "0.08",
        sharpeRatio: "1.2",
        winRate: "0.65",
        totalTrades: 45,
        results: mockResults
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error running backtest:", error);
      res.status(400).json({ message: error.message || "Failed to run backtest" });
    }
  });

  // Risk management routes
  app.get('/api/risk-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const metrics = await storage.getUserRiskMetrics(userId, startDate, endDate);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching risk metrics:", error);
      res.status(500).json({ message: "Failed to fetch risk metrics" });
    }
  });

  // Subscription routes
  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    const user = req.user;

    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
        return;
      } catch (error) {
        console.error("Error retrieving subscription:", error);
      }
    }

    if (!user.email) {
      return res.status(400).json({ message: 'No user email on file' });
    }

    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_test', // User needs to set this
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(user.id, customer.id, subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Real Market Data Routes
  app.get("/api/market-data/quote/:symbol", isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const { provider } = req.query;
      const quote = await marketDataService.getQuote(symbol, provider as any);
      res.json(quote);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/market-data/historical/:symbol", isAuthenticated, async (req, res) => {
    try {
      const { symbol } = req.params;
      const { period, provider } = req.query;
      const data = await marketDataService.getHistoricalData(symbol, period as string, provider as any);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/market-data/providers", isAuthenticated, async (req, res) => {
    try {
      const currentProvider = marketDataService.getCurrentProvider();
      const testResults = await marketDataService.testAllProviders();
      res.json({
        available: Object.values(PROVIDERS),
        current: currentProvider,
        status: testResults
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/market-data/provider", isAuthenticated, async (req, res) => {
    try {
      const { provider } = req.body;
      if (!Object.values(PROVIDERS).includes(provider)) {
        return res.status(400).json({ message: "Invalid provider" });
      }
      marketDataService.setProvider(provider);
      res.json({ success: true, provider });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Broker Trading Routes
  app.get("/api/trading/account", isAuthenticated, async (req, res) => {
    try {
      const account = await brokerService.getAccount();
      res.json(account);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/trading/positions", isAuthenticated, async (req, res) => {
    try {
      const positions = await brokerService.getPositions();
      res.json(positions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/trading/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await brokerService.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/trading/orders", isAuthenticated, async (req, res) => {
    try {
      const order = await brokerService.submitOrder(req.body);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/trading/orders/:orderId", isAuthenticated, async (req, res) => {
    try {
      const { orderId } = req.params;
      await brokerService.cancelOrder(orderId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/trading/brokers", isAuthenticated, async (req, res) => {
    try {
      const currentBroker = brokerService.getCurrentBroker();
      const connectionStatus = await brokerService.testBrokerConnection();
      res.json({
        available: Object.values(BROKERS),
        current: currentBroker,
        connected: connectionStatus
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/trading/broker", isAuthenticated, async (req, res) => {
    try {
      const { broker } = req.body;
      if (!Object.values(BROKERS).includes(broker)) {
        return res.status(400).json({ message: "Invalid broker" });
      }
      brokerService.setBroker(broker);
      res.json({ success: true, broker });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Quantum Computing Routes
  app.get("/api/quantum/status", isAuthenticated, async (req, res) => {
    try {
      const status = await quantumOptimizer.getQuantumStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quantum/optimize-portfolio", isAuthenticated, async (req, res) => {
    try {
      const { assets, covarianceMatrix, riskTolerance, budget, algorithm } = req.body;
      
      const optimizationParams = {
        assets,
        covarianceMatrix,
        riskTolerance: riskTolerance || 0.5,
        budget: budget || 1.0
      };

      const result = await quantumOptimizer.optimizePortfolio(
        optimizationParams,
        algorithm || QuantumAlgorithm.VQE
      );

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quantum/market-prediction", isAuthenticated, async (req, res) => {
    try {
      const { historicalData, features } = req.body;
      const prediction = await quantumOptimizer.quantumMarketPrediction(historicalData, features);
      res.json(prediction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quantum/risk-analysis", isAuthenticated, async (req, res) => {
    try {
      const portfolioData = req.body;
      const riskAnalysis = await quantumOptimizer.quantumRiskAnalysis(portfolioData);
      res.json(riskAnalysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quantum/provider", isAuthenticated, async (req, res) => {
    try {
      const { provider } = req.body;
      if (!Object.values(QuantumProvider).includes(provider)) {
        return res.status(400).json({ message: "Invalid quantum provider" });
      }
      quantumOptimizer.setProvider(provider);
      res.json({ success: true, provider });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
