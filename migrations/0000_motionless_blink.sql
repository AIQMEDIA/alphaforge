CREATE TABLE "account_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" varchar NOT NULL,
	"phone" varchar,
	"email_verified" boolean DEFAULT false,
	"phone_verified" boolean DEFAULT false,
	"id_verification_status" varchar DEFAULT 'pending',
	"id_document_type" varchar,
	"verification_score" integer DEFAULT 0,
	"verification_method" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "backtest_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"strategy_id" varchar,
	"name" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"initial_capital" numeric(15, 2) NOT NULL,
	"final_value" numeric(15, 2) NOT NULL,
	"total_return" numeric(10, 4) NOT NULL,
	"max_drawdown" numeric(10, 4) NOT NULL,
	"sharpe_ratio" numeric(10, 4) NOT NULL,
	"win_rate" numeric(10, 4) NOT NULL,
	"total_trades" integer NOT NULL,
	"results" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"user_message" text NOT NULL,
	"bot_response" text NOT NULL,
	"message_type" varchar DEFAULT 'general',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_id" varchar NOT NULL,
	"query_count" integer DEFAULT 0,
	"is_unlimited" boolean DEFAULT false,
	"skill_level" varchar DEFAULT 'beginner',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"role" varchar NOT NULL,
	"trading_experience" varchar NOT NULL,
	"company" varchar,
	"phone" varchar,
	"lead_source" varchar DEFAULT 'chatbot',
	"status" varchar DEFAULT 'new',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_prevention" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fingerprint" varchar NOT NULL,
	"ip_address" varchar NOT NULL,
	"user_agent" varchar,
	"session_id" varchar,
	"user_id" varchar,
	"email" varchar,
	"phone_number" varchar,
	"device_id" varchar,
	"browser_fingerprint" jsonb,
	"risk_score" integer DEFAULT 0,
	"flagged_reason" varchar,
	"is_blocked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"symbol" varchar NOT NULL,
	"quantity" numeric(15, 2) NOT NULL,
	"avg_price" numeric(15, 2) NOT NULL,
	"current_price" numeric(15, 2),
	"unrealized_pnl" numeric(15, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "risk_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"portfolio_value" numeric(15, 2) NOT NULL,
	"var_95" numeric(15, 2) NOT NULL,
	"max_drawdown" numeric(10, 4) NOT NULL,
	"beta" numeric(10, 4),
	"volatility" numeric(10, 4),
	"sharpe_ratio" numeric(10, 4),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" varchar NOT NULL,
	"status" varchar DEFAULT 'paused',
	"config" jsonb NOT NULL,
	"performance" numeric(10, 4) DEFAULT '0',
	"total_return" numeric(15, 2) DEFAULT '0',
	"max_drawdown" numeric(10, 4) DEFAULT '0',
	"sharpe_ratio" numeric(10, 4) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"strategy_id" varchar,
	"symbol" varchar NOT NULL,
	"side" varchar NOT NULL,
	"quantity" numeric(15, 2) NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"fees" numeric(15, 2) DEFAULT '0',
	"realized_pnl" numeric(15, 2) DEFAULT '0',
	"type" varchar DEFAULT 'live',
	"executed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"subscription_status" varchar DEFAULT 'trial',
	"trial_ends_at" timestamp,
	"trading_experience" varchar,
	"role" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "backtest_results" ADD CONSTRAINT "backtest_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backtest_results" ADD CONSTRAINT "backtest_results_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_metrics" ADD CONSTRAINT "risk_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategies" ADD CONSTRAINT "strategies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_strategy_id_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");