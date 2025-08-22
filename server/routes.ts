/*
 * AlphaForge - API Routes & Authentication
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Contains proprietary trading algorithms and business logic.
 * Unauthorized access, copying, or distribution is strictly prohibited.
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { marketDataService, PROVIDERS } from "./marketData";
import { brokerService, BROKERS } from "./brokerApi";
import { quantumOptimizer, QuantumProvider, QuantumAlgorithm } from "./quantumOptimizer";
import { quantumAssistant } from "./quantumAssistant";
import { fraudPreventionService } from "./fraudPrevention";
import { securityCanaries } from "./canary";
import { weeklyScheduler } from './weeklyScheduler.js';
import { emailService } from './emailService.js';
import { insertStrategySchema, insertTransactionSchema, insertBacktestResultSchema, insertCrmLeadSchema } from "@shared/schema";
import {
  traceUserAction,
  traceChatInteraction,
  traceFraudDetection,
  traceMarketDataRequest,
  traceSubscriptionEvent,
  traceQuantumOperation,
} from "./observability";
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

  // Chatbot API Routes
  
  // Get or create chat session (with fraud protection)
  app.get('/api/chat/session', async (req: any, res) => {
    try {
      let sessionId = req.sessionID;
      let userId = req.isAuthenticated() ? req.user.claims.sub : undefined;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      // Generate device fingerprint from basic request data
      const fingerprint = fraudPreventionService.generateFingerprint({
        userAgent,
        language: req.get('Accept-Language') || 'en',
        platform: userAgent.includes('Windows') ? 'Win32' : userAgent.includes('Mac') ? 'MacIntel' : 'Linux',
        screenResolution: '1920x1080', // Would be sent from frontend in real implementation
        timezone: 'America/New_York', // Would be sent from frontend
        cookieEnabled: true,
        doNotTrack: req.get('DNT') || 'unspecified'
      }, ipAddress);

      // Perform fraud assessment for new sessions
      const existingConversations = await storage.getChatConversations(sessionId);
      if (existingConversations.length === 0) {
        const fraudCheck = await fraudPreventionService.assessFraudRisk(
          fingerprint,
          ipAddress,
          userAgent
        );

        // Record fraud data
        await storage.recordFraudData({
          fingerprint,
          ipAddress,
          userAgent,
          sessionId,
          userId: userId || undefined,
          riskScore: fraudCheck.riskScore,
          flaggedReason: fraudCheck.flaggedReasons.join(', ') || undefined,
          isBlocked: fraudCheck.isBlocked
        });

        // Block high-risk users
        if (fraudCheck.isBlocked) {
          return res.status(403).json({ 
            message: "Access denied. Please contact support if you believe this is an error.",
            blocked: true
          });
        }
      }
      
      const session = await storage.getOrCreateChatSession(sessionId, userId);
      res.json(session);
    } catch (error) {
      console.error("Error getting chat session:", error);
      res.status(500).json({ message: "Failed to get chat session" });
    }
  });

  // Get conversation history
  app.get('/api/chat/history/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const conversations = await storage.getChatConversations(sessionId);
      
      // Transform to frontend format
      const messages = conversations.map(conv => ({
        id: conv.id,
        message: conv.userMessage,
        sender: 'user',
        timestamp: conv.createdAt,
      })).concat(conversations.map(conv => ({
        id: conv.id + '_bot',
        message: conv.botResponse,
        sender: 'bot',
        timestamp: conv.createdAt,
        messageType: conv.messageType,
      }))).sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
      
      res.json(messages);
    } catch (error) {
      console.error("Error getting chat history:", error);
      res.status(500).json({ message: "Failed to get chat history" });
    }
  });

  // Send message to assistant (with enhanced fraud protection)
  app.post('/api/chat/send', async (req: any, res) => {
    try {
      const { message, skillLevel } = req.body;
      let sessionId = req.sessionID;
      let userId = req.isAuthenticated() ? req.user.claims.sub : undefined;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      // Enhanced fraud checks for message sending
      const fingerprint = fraudPreventionService.generateFingerprint({
        userAgent,
        language: req.get('Accept-Language') || 'en',
        platform: userAgent.includes('Windows') ? 'Win32' : userAgent.includes('Mac') ? 'MacIntel' : 'Linux',
        screenResolution: '1920x1080',
        timezone: 'America/New_York',
        cookieEnabled: true,
        doNotTrack: req.get('DNT') || 'unspecified'
      }, ipAddress);

      // Check for rapid-fire messaging (bot behavior)
      const recentConversations = await storage.getChatConversations(sessionId);
      const lastMinute = new Date(Date.now() - 60000);
      const recentMessages = recentConversations.filter(conv => 
        conv.createdAt && new Date(conv.createdAt) > lastMinute
      );

      if (recentMessages.length >= 10) {
        await storage.recordFraudData({
          fingerprint,
          ipAddress,
          userAgent,
          sessionId,
          userId,
          riskScore: 85,
          flaggedReason: "Rapid messaging detected - possible bot",
          isBlocked: true
        });

        return res.status(429).json({ 
          message: "Too many messages sent. Please wait before sending another message.",
          rateLimited: true
        });
      }

      // Get current session
      const session = await storage.getOrCreateChatSession(sessionId, userId);
      
      // Enhanced query limit with fraud consideration
      let queryLimit = 5;
      if (!session.isUnlimited && (session.queryCount || 0) >= queryLimit) {
        // Check if this device/IP has been flagged for trial abuse
        const trialEligibility = await fraudPreventionService.checkTrialEligibility(
          fingerprint, ipAddress
        );

        if (!trialEligibility.eligible) {
          return res.json({
            response: `${trialEligibility.reason}. ${trialEligibility.alternativeOffer || 'Please contact support for assistance.'}`,
            messageType: 'general',
            limitReached: true,
            trialBlocked: true
          });
        }

        return res.json({
          response: "You've reached your 5 free queries! Please share your contact details to continue with unlimited access to the Quantum Trading Assistant.",
          messageType: 'general',
          limitReached: true
        });
      }

      // Generate AI response using quantum assistant
      const aiResponse = quantumAssistant.generateResponse(message, skillLevel, sessionId);

      // Save conversation
      await storage.createChatConversation({
        sessionId: session.id,
        userMessage: message,
        botResponse: aiResponse.response,
        messageType: aiResponse.messageType
      });

      // Update session query count if not unlimited
      if (!session.isUnlimited) {
        await storage.updateChatSession(session.id, {
          queryCount: (session.queryCount || 0) + 1,
          skillLevel: skillLevel,
        });
      }

      res.json({
        response: aiResponse.response,
        messageType: aiResponse.messageType,
        limitReached: !session.isUnlimited && ((session.queryCount || 0) + 1) >= queryLimit
      });

    } catch (error) {
      console.error("Error processing chat message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Submit CRM details to unlock unlimited access (with fraud protection)
  app.post('/api/chat/submit-crm', async (req: any, res) => {
    try {
      const crmData = insertCrmLeadSchema.parse(req.body);
      let sessionId = req.sessionID;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      // Enhanced fraud protection for CRM submissions
      const fingerprint = fraudPreventionService.generateFingerprint({
        userAgent,
        language: req.get('Accept-Language') || 'en',
        platform: userAgent.includes('Windows') ? 'Win32' : userAgent.includes('Mac') ? 'MacIntel' : 'Linux',
        screenResolution: '1920x1080',
        timezone: 'America/New_York', 
        cookieEnabled: true,
        doNotTrack: req.get('DNT') || 'unspecified'
      }, ipAddress);

      // Comprehensive fraud assessment with email and phone
      const fraudCheck = await fraudPreventionService.assessFraudRisk(
        fingerprint,
        ipAddress,
        userAgent,
        crmData.email,
        crmData.phone || undefined
      );

      // Record the fraud assessment
      await storage.recordFraudData({
        fingerprint,
        ipAddress,
        userAgent,
        sessionId,
        email: crmData.email,
        phoneNumber: crmData.phone,
        riskScore: fraudCheck.riskScore,
        flaggedReason: fraudCheck.flaggedReasons.join(', '),
        isBlocked: fraudCheck.isBlocked
      });

      // Handle high-risk submissions
      if (fraudCheck.riskScore >= 50) {
        // Still save the lead for manual review, but don't grant unlimited access immediately
        await storage.createCrmLead({
          ...crmData,
          sessionId: sessionId,
          status: fraudCheck.riskScore >= 70 ? 'flagged' : 'pending_review'
        });

        if (fraudCheck.isBlocked) {
          return res.status(403).json({ 
            message: "Your submission requires manual verification. Our team will contact you within 24 hours.",
            requiresVerification: true
          });
        }

        // Medium risk - require email verification
        return res.json({
          success: true,
          message: "Thank you! Please check your email to verify your account for unlimited access.",
          requiresEmailVerification: true
        });
      }

      // Low risk - proceed normally
      const session = await storage.getOrCreateChatSession(sessionId);
      
      // Verify email and phone if provided
      const emailValid = await fraudPreventionService.verifyEmail(crmData.email);
      const phoneValid = crmData.phone ? await fraudPreventionService.verifyPhone(crmData.phone) : true;

      if (!emailValid) {
        return res.status(400).json({ 
          message: "Email address is already in use or invalid. Please use a different email.",
          emailError: true
        });
      }

      if (!phoneValid) {
        return res.status(400).json({ 
          message: "Phone number has been used too many times. Please contact support.",
          phoneError: true
        });
      }

      // Save CRM lead
      await storage.createCrmLead({
        ...crmData,
        sessionId: session.id,
        status: 'qualified'
      });

      // Create account verification record
      await storage.createAccountVerification({
        email: crmData.email,
        phone: crmData.phone,
        emailVerified: true, // Auto-verify for low-risk users
        phoneVerified: !!crmData.phone,
        verificationScore: 100 - fraudCheck.riskScore,
        verificationMethod: 'crm_form'
      });

      // Grant unlimited access for verified, low-risk users
      await storage.updateChatSession(session.id, {
        isUnlimited: true
      });

      res.json({ 
        success: true, 
        message: "Thank you! You now have unlimited access to the Quantum Trading Assistant."
      });

    } catch (error) {
      console.error("Error submitting CRM data:", error);
      res.status(500).json({ message: "Failed to submit details" });
    }
  });

  // Fraud prevention admin routes (protected)
  app.get('/api/admin/fraud-report', isAuthenticated, async (req: any, res) => {
    try {
      // Only allow admin users (you could add role checking here)
      const report = await fraudPreventionService.generateFraudReport(30);
      res.json(report);
    } catch (error) {
      console.error("Error generating fraud report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Performance monitoring routes
  app.get('/api/admin/performance-report', isAuthenticated, async (req: any, res) => {
    try {
      const weekOffset = parseInt(req.query.weekOffset as string) || 0;
      const { performanceMonitor } = await import('./performanceMonitoring.js');
      const metrics = await performanceMonitor.generateWeeklyReport(weekOffset);
      res.json(metrics);
    } catch (error) {
      console.error("Error generating performance report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.post('/api/admin/send-report', isAuthenticated, async (req: any, res) => {
    try {
      const { recipient } = req.body;
      const success = await weeklyScheduler.sendImmediateReport(recipient);
      
      if (success) {
        res.json({ success: true, message: "Report sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send report" });
      }
    } catch (error) {
      console.error("Error sending immediate report:", error);
      res.status(500).json({ success: false, message: "Failed to send report" });
    }
  });

  app.get('/api/admin/scheduler-status', isAuthenticated, async (req: any, res) => {
    try {
      const status = weeklyScheduler.getStatus();
      const emailConfig = emailService.getConfigurationStatus();
      
      res.json({
        ...status,
        emailService: emailConfig
      });
    } catch (error) {
      console.error("Error getting scheduler status:", error);
      res.status(500).json({ message: "Failed to get status" });
    }
  });

  app.post('/api/admin/test-email', isAuthenticated, async (req: any, res) => {
    try {
      const success = await weeklyScheduler.testEmailService();
      
      if (success) {
        res.json({ success: true, message: "Test email sent successfully" });
      } else {
        res.json({ success: false, message: "Email service not configured or failed" });
      }
    } catch (error) {
      console.error("Error testing email service:", error);
      res.status(500).json({ success: false, message: "Failed to test email service" });
    }
  });

  // Arize AI Observability Demo Routes
  app.get('/api/observability/demo', async (req, res) => {
    try {
      const { observabilityDemo } = await import('./observabilityDemo');
      const results = await observabilityDemo.runComprehensiveDemo();
      
      res.json({
        success: true,
        message: 'Observability demo completed - check Arize AI dashboard for trace data',
        operations: [
          'User authentication',
          'Chat interactions', 
          'Trade execution',
          'Quantum optimization',
          'Fraud detection',
          'Market data requests',
          'Backtest runs',
          'Subscription events'
        ],
        traceCount: results.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Observability demo error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Demo failed' 
      });
    }
  });

  // Generate comprehensive dataset for Arize AI demonstration
  app.post('/api/observability/generate-data', async (req, res) => {
    try {
      const { arizeDataGenerator } = await import('./arizeDataGenerator');
      const summary = await arizeDataGenerator.generateComprehensiveDataset();
      
      res.json({
        success: true,
        message: 'Comprehensive telemetry data generated successfully',
        summary,
        arizeInstructions: {
          step1: 'Check your Arize AI dashboard for incoming traces',
          step2: 'Filter by service: AlphaForge-Trading-Platform', 
          step3: 'Explore trace patterns across different operation types',
          step4: 'Set up alerts and dashboards for key metrics'
        }
      });
    } catch (error: any) {
      console.error('Data generation error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Data generation failed' 
      });
    }
  });

  // Start continuous data generation for ongoing demonstration
  app.post('/api/observability/start-continuous', async (req, res) => {
    try {
      const { intervalMinutes = 30 } = req.body;
      const { arizeDataGenerator } = await import('./arizeDataGenerator');
      const result = await arizeDataGenerator.startContinuousGeneration(intervalMinutes);
      
      res.json({
        success: true,
        message: 'Continuous data generation started',
        ...result,
        note: 'This will generate realistic telemetry data every ' + intervalMinutes + ' minutes for Arize AI analysis'
      });
    } catch (error: any) {
      console.error('Continuous generation error:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to start continuous generation' 
      });
    }
  });

  // Check data generation status
  app.get('/api/observability/generation-status', async (req, res) => {
    try {
      const { arizeDataGenerator } = await import('./arizeDataGenerator');
      const status = arizeDataGenerator.getGenerationStatus();
      
      res.json({
        ...status,
        arizeCredentials: !!(process.env.ARIZE_API_KEY && process.env.ARIZE_SPACE_ID),
        endpoint: process.env.ARIZE_ENDPOINT_URL || 'http://localhost:6006/v1/traces'
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });

  app.get('/api/observability/status', async (req, res) => {
    try {
      const hasArizeCredentials = !!(process.env.ARIZE_API_KEY && process.env.ARIZE_SPACE_ID);
      
      res.json({
        observabilityEnabled: true,
        platform: hasArizeCredentials ? 'Arize AI Cloud' : 'Local Phoenix',
        endpoint: process.env.ARIZE_ENDPOINT_URL || 'http://localhost:6006/v1/traces',
        hasCredentials: hasArizeCredentials,
        serviceName: 'AlphaForge-Trading-Platform',
        features: [
          'Trade execution tracking',
          'Quantum operation monitoring', 
          'Fraud detection events',
          'User interaction analytics',
          'Market data performance',
          'System health metrics'
        ]
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });

  // Security canary endpoints - these should never be accessed by legitimate users
  // If accessed, someone is likely probing the system
  app.get('/api/admin', (req, res) => {
    const response = securityCanaries.apiAccess(req);
    res.status(503).json(response);
  });

  app.get('/api/config', (req, res) => {
    const response = securityCanaries.apiAccess(req);
    res.status(503).json(response);
  });

  app.get('/api/debug', (req, res) => {
    const response = securityCanaries.apiAccess(req);
    res.status(503).json(response);
  });

  app.get('/api/internal', (req, res) => {
    const response = securityCanaries.apiAccess(req);
    res.status(503).json(response);
  });

  app.get('/api/.env', (req, res) => {
    const response = securityCanaries.apiAccess(req);
    res.status(503).json(response);
  });

  app.get('/api/quantum/internal', (req, res) => {
    const response = securityCanaries.apiAccess(req);
    res.status(503).json(response);
  });

  // Start the weekly performance monitoring scheduler
  console.log('🚀 Starting AlphaForge performance monitoring...');
  weeklyScheduler.startWeeklyReports();

  // Webhook routes for WhatsApp and other services
  const { webhookRoutes } = await import('./routes/webhook');
  app.use('/api/webhooks', webhookRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
