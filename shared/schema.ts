import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  integer,
  text,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("trial"), // trial, active, canceled, expired
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading strategies
export const strategies = pgTable("strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // "technical", "statistical", "momentum", "mean_reversion", etc.
  status: varchar("status").default("paused"), // "running", "paused", "stopped"
  config: jsonb("config").notNull(), // strategy parameters
  performance: decimal("performance", { precision: 10, scale: 4 }).default("0"),
  totalReturn: decimal("total_return", { precision: 15, scale: 2 }).default("0"),
  maxDrawdown: decimal("max_drawdown", { precision: 10, scale: 4 }).default("0"),
  sharpeRatio: decimal("sharpe_ratio", { precision: 10, scale: 4 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio positions
export const positions = pgTable("positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  symbol: varchar("symbol").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  avgPrice: decimal("avg_price", { precision: 15, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 15, scale: 2 }),
  unrealizedPnL: decimal("unrealized_pnl", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  strategyId: varchar("strategy_id").references(() => strategies.id),
  symbol: varchar("symbol").notNull(),
  side: varchar("side").notNull(), // "BUY" or "SELL"
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  fees: decimal("fees", { precision: 15, scale: 2 }).default("0"),
  realizedPnL: decimal("realized_pnl", { precision: 15, scale: 2 }).default("0"),
  type: varchar("type").default("live"), // "live", "paper", "backtest"
  executedAt: timestamp("executed_at").defaultNow(),
});

// Backtesting results
export const backtestResults = pgTable("backtest_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  strategyId: varchar("strategy_id").references(() => strategies.id),
  name: varchar("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  initialCapital: decimal("initial_capital", { precision: 15, scale: 2 }).notNull(),
  finalValue: decimal("final_value", { precision: 15, scale: 2 }).notNull(),
  totalReturn: decimal("total_return", { precision: 10, scale: 4 }).notNull(),
  maxDrawdown: decimal("max_drawdown", { precision: 10, scale: 4 }).notNull(),
  sharpeRatio: decimal("sharpe_ratio", { precision: 10, scale: 4 }).notNull(),
  winRate: decimal("win_rate", { precision: 10, scale: 4 }).notNull(),
  totalTrades: integer("total_trades").notNull(),
  results: jsonb("results").notNull(), // detailed backtest data
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk metrics tracking
export const riskMetrics = pgTable("risk_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  portfolioValue: decimal("portfolio_value", { precision: 15, scale: 2 }).notNull(),
  var95: decimal("var_95", { precision: 15, scale: 2 }).notNull(),
  maxDrawdown: decimal("max_drawdown", { precision: 10, scale: 4 }).notNull(),
  beta: decimal("beta", { precision: 10, scale: 4 }),
  volatility: decimal("volatility", { precision: 10, scale: 4 }),
  sharpeRatio: decimal("sharpe_ratio", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  strategies: many(strategies),
  positions: many(positions),
  transactions: many(transactions),
  backtestResults: many(backtestResults),
  riskMetrics: many(riskMetrics),
}));

export const strategiesRelations = relations(strategies, ({ one, many }) => ({
  user: one(users, {
    fields: [strategies.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  backtestResults: many(backtestResults),
}));

export const positionsRelations = relations(positions, ({ one }) => ({
  user: one(users, {
    fields: [positions.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  strategy: one(strategies, {
    fields: [transactions.strategyId],
    references: [strategies.id],
  }),
}));

export const backtestResultsRelations = relations(backtestResults, ({ one }) => ({
  user: one(users, {
    fields: [backtestResults.userId],
    references: [users.id],
  }),
  strategy: one(strategies, {
    fields: [backtestResults.strategyId],
    references: [strategies.id],
  }),
}));

export const riskMetricsRelations = relations(riskMetrics, ({ one }) => ({
  user: one(users, {
    fields: [riskMetrics.userId],
    references: [users.id],
  }),
}));

// Schema exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = typeof strategies.$inferInsert;
export type Position = typeof positions.$inferSelect;
export type InsertPosition = typeof positions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type BacktestResult = typeof backtestResults.$inferSelect;
export type InsertBacktestResult = typeof backtestResults.$inferInsert;
export type RiskMetric = typeof riskMetrics.$inferSelect;
export type InsertRiskMetric = typeof riskMetrics.$inferInsert;

// Insert schemas for validation
export const insertStrategySchema = createInsertSchema(strategies).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true,
  executedAt: true,
});

export const insertBacktestResultSchema = createInsertSchema(backtestResults).omit({
  id: true,
  userId: true,
  createdAt: true,
});
