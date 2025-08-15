import {
  users,
  strategies,
  positions,
  transactions,
  backtestResults,
  riskMetrics,
  chatSessions,
  chatConversations,
  crmLeads,
  fraudPrevention,
  accountVerifications,
  type User,
  type UpsertUser,
  type Strategy,
  type InsertStrategy,
  type Position,
  type InsertPosition,
  type Transaction,
  type InsertTransaction,
  type BacktestResult,
  type InsertBacktestResult,
  type RiskMetric,
  type InsertRiskMetric,
  type ChatSession,
  type InsertChatSession,
  type ChatConversation,
  type InsertChatConversation,
  type CrmLead,
  type InsertCrmLead,
  type FraudPrevention,
  type InsertFraudPrevention,
  type AccountVerification,
  type InsertAccountVerification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User>;
  
  // Strategy operations
  getUserStrategies(userId: string): Promise<Strategy[]>;
  getStrategy(id: string, userId: string): Promise<Strategy | undefined>;
  createStrategy(strategy: InsertStrategy & { userId: string }): Promise<Strategy>;
  updateStrategy(id: string, userId: string, updates: Partial<InsertStrategy>): Promise<Strategy>;
  deleteStrategy(id: string, userId: string): Promise<void>;
  
  // Portfolio operations
  getUserPositions(userId: string): Promise<Position[]>;
  getPosition(userId: string, symbol: string): Promise<Position | undefined>;
  upsertPosition(position: InsertPosition & { userId: string }): Promise<Position>;
  
  // Transaction operations
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction>;
  getStrategyTransactions(strategyId: string, userId: string): Promise<Transaction[]>;
  
  // Backtesting operations
  getUserBacktestResults(userId: string): Promise<BacktestResult[]>;
  getBacktestResult(id: string, userId: string): Promise<BacktestResult | undefined>;
  createBacktestResult(result: InsertBacktestResult & { userId: string }): Promise<BacktestResult>;
  
  // Risk metrics operations
  getUserRiskMetrics(userId: string, startDate?: Date, endDate?: Date): Promise<RiskMetric[]>;
  createRiskMetric(metric: InsertRiskMetric & { userId: string }): Promise<RiskMetric>;
  getLatestRiskMetric(userId: string): Promise<RiskMetric | undefined>;

  // Chatbot operations
  getOrCreateChatSession(sessionId: string, userId?: string): Promise<ChatSession>;
  updateChatSession(id: string, updates: Partial<InsertChatSession>): Promise<ChatSession>;
  getChatConversations(sessionId: string): Promise<ChatConversation[]>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  createCrmLead(lead: InsertCrmLead): Promise<CrmLead>;
  getCrmLeadBySessionId(sessionId: string): Promise<CrmLead | undefined>;

  // Fraud prevention operations
  recordFraudData(data: InsertFraudPrevention): Promise<FraudPrevention>;
  getFraudDataByFingerprint(fingerprint: string): Promise<FraudPrevention[]>;
  createAccountVerification(verification: InsertAccountVerification): Promise<AccountVerification>;
  updateAccountVerification(id: string, updates: Partial<InsertAccountVerification>): Promise<AccountVerification>;
  
  // Portfolio analytics
  getPortfolioValue(userId: string): Promise<number>;
  getPortfolioPerformance(userId: string, days: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Strategy operations
  async getUserStrategies(userId: string): Promise<Strategy[]> {
    return await db.select().from(strategies).where(eq(strategies.userId, userId)).orderBy(desc(strategies.createdAt));
  }

  async getStrategy(id: string, userId: string): Promise<Strategy | undefined> {
    const [strategy] = await db.select().from(strategies).where(and(eq(strategies.id, id), eq(strategies.userId, userId)));
    return strategy;
  }

  async createStrategy(strategy: InsertStrategy & { userId: string }): Promise<Strategy> {
    const [newStrategy] = await db.insert(strategies).values(strategy).returning();
    return newStrategy;
  }

  async updateStrategy(id: string, userId: string, updates: Partial<InsertStrategy>): Promise<Strategy> {
    const [strategy] = await db
      .update(strategies)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(strategies.id, id), eq(strategies.userId, userId)))
      .returning();
    return strategy;
  }

  async deleteStrategy(id: string, userId: string): Promise<void> {
    await db.delete(strategies).where(and(eq(strategies.id, id), eq(strategies.userId, userId)));
  }

  // Portfolio operations
  async getUserPositions(userId: string): Promise<Position[]> {
    return await db.select().from(positions).where(eq(positions.userId, userId));
  }

  async getPosition(userId: string, symbol: string): Promise<Position | undefined> {
    const [position] = await db.select().from(positions).where(and(eq(positions.userId, userId), eq(positions.symbol, symbol)));
    return position;
  }

  async upsertPosition(position: InsertPosition & { userId: string }): Promise<Position> {
    const [pos] = await db
      .insert(positions)
      .values(position)
      .onConflictDoUpdate({
        target: [positions.userId, positions.symbol],
        set: {
          ...position,
          updatedAt: new Date(),
        },
      })
      .returning();
    return pos;
  }

  // Transaction operations
  async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.executedAt))
      .limit(limit);
  }

  async createTransaction(transaction: InsertTransaction & { userId: string }): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values(transaction).returning();
    return tx;
  }

  async getStrategyTransactions(strategyId: string, userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.strategyId, strategyId), eq(transactions.userId, userId)))
      .orderBy(desc(transactions.executedAt));
  }

  // Backtesting operations
  async getUserBacktestResults(userId: string): Promise<BacktestResult[]> {
    return await db.select().from(backtestResults).where(eq(backtestResults.userId, userId)).orderBy(desc(backtestResults.createdAt));
  }

  async getBacktestResult(id: string, userId: string): Promise<BacktestResult | undefined> {
    const [result] = await db.select().from(backtestResults).where(and(eq(backtestResults.id, id), eq(backtestResults.userId, userId)));
    return result;
  }

  async createBacktestResult(result: InsertBacktestResult & { userId: string }): Promise<BacktestResult> {
    const [backtest] = await db.insert(backtestResults).values(result).returning();
    return backtest;
  }

  // Risk metrics operations
  async getUserRiskMetrics(userId: string, startDate?: Date, endDate?: Date): Promise<RiskMetric[]> {
    const whereConditions = [eq(riskMetrics.userId, userId)];
    
    if (startDate && endDate) {
      whereConditions.push(gte(riskMetrics.date, startDate));
      whereConditions.push(lte(riskMetrics.date, endDate));
    }
    
    return await db
      .select()
      .from(riskMetrics)
      .where(and(...whereConditions))
      .orderBy(desc(riskMetrics.date));
  }

  async createRiskMetric(metric: InsertRiskMetric & { userId: string }): Promise<RiskMetric> {
    const [risk] = await db.insert(riskMetrics).values(metric).returning();
    return risk;
  }

  async getLatestRiskMetric(userId: string): Promise<RiskMetric | undefined> {
    const [metric] = await db
      .select()
      .from(riskMetrics)
      .where(eq(riskMetrics.userId, userId))
      .orderBy(desc(riskMetrics.date))
      .limit(1);
    return metric;
  }

  // Portfolio analytics
  async getPortfolioValue(userId: string): Promise<number> {
    const positions = await this.getUserPositions(userId);
    return positions.reduce((total, pos) => {
      const currentValue = parseFloat(pos.quantity.toString()) * parseFloat(pos.currentPrice?.toString() || pos.avgPrice.toString());
      return total + currentValue;
    }, 0);
  }

  async getPortfolioPerformance(userId: string, days: number): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select({
        date: riskMetrics.date,
        value: riskMetrics.portfolioValue,
      })
      .from(riskMetrics)
      .where(and(eq(riskMetrics.userId, userId), gte(riskMetrics.date, startDate), lte(riskMetrics.date, endDate)))
      .orderBy(riskMetrics.date);
  }

  // Chatbot operations implementation
  async getOrCreateChatSession(sessionId: string, userId?: string): Promise<ChatSession> {
    const [existing] = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId));
    
    if (existing) {
      return existing;
    }

    const [session] = await db.insert(chatSessions).values({
      sessionId,
      userId,
      queryCount: 0,
      isUnlimited: !!userId, // Give unlimited access to authenticated users initially
      skillLevel: 'beginner'
    }).returning();
    
    return session;
  }

  async updateChatSession(id: string, updates: Partial<InsertChatSession>): Promise<ChatSession> {
    const [session] = await db
      .update(chatSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    
    return session;
  }

  async getChatConversations(sessionId: string): Promise<ChatConversation[]> {
    return await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.sessionId, sessionId))
      .orderBy(chatConversations.createdAt);
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [conv] = await db
      .insert(chatConversations)
      .values(conversation)
      .returning();
    
    return conv;
  }

  async createCrmLead(lead: InsertCrmLead): Promise<CrmLead> {
    const [crmLead] = await db
      .insert(crmLeads)
      .values(lead)
      .returning();
    
    return crmLead;
  }

  async getCrmLeadBySessionId(sessionId: string): Promise<CrmLead | undefined> {
    const [lead] = await db
      .select()
      .from(crmLeads)
      .where(eq(crmLeads.sessionId, sessionId));
    
    return lead;
  }

  // Fraud prevention operations implementation
  async recordFraudData(data: InsertFraudPrevention): Promise<FraudPrevention> {
    const [record] = await db
      .insert(fraudPrevention)
      .values(data)
      .returning();
    
    return record;
  }

  async getFraudDataByFingerprint(fingerprint: string): Promise<FraudPrevention[]> {
    return await db
      .select()
      .from(fraudPrevention)
      .where(eq(fraudPrevention.fingerprint, fingerprint))
      .orderBy(desc(fraudPrevention.createdAt));
  }

  async createAccountVerification(verification: InsertAccountVerification): Promise<AccountVerification> {
    const [record] = await db
      .insert(accountVerifications)
      .values(verification)
      .returning();
    
    return record;
  }

  async updateAccountVerification(id: string, updates: Partial<InsertAccountVerification>): Promise<AccountVerification> {
    const [record] = await db
      .update(accountVerifications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(accountVerifications.id, id))
      .returning();
    
    return record;
  }
}

export const storage = new DatabaseStorage();
