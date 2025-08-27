# AlphaForge - Quantitative Trading Bot Platform

## Overview

AlphaForge is a comprehensive web application for quantitative trading designed to provide reliability, transparency, and robust risk management. It offers advanced backtesting, real-time portfolio monitoring, strategy development tools, and multi-layered risk controls. The platform aims to serve both novice and professional traders with institutional-grade tools and an intuitive interface. Key ambitions include offering the "World's First Retail Quantum Trading Platform" and leveraging a unique performance-based revenue model.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, Vite for build tooling.
- **UI Library**: Shadcn/UI (on Radix UI primitives) with Tailwind CSS.
- **State Management**: TanStack React Query for server state and caching.
- **Routing**: Wouter for client-side routing with role-based access control.
- **Theme System**: Dark/light mode support with CSS custom properties.
- **UI/UX Decisions**: Mobile-first responsive design, progressive disclosure for setup wizards, real-time data updates, ARIA-compliant components.

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API server.
- **Authentication**: Replit Auth (OpenID Connect) for secure user authentication.
- **Session Management**: Express sessions with PostgreSQL storage using `connect-pg-simple`.
- **API Design**: RESTful endpoints with error handling and request logging.

### Database Architecture
- **Primary Database**: PostgreSQL with Neon serverless connection pooling.
- **ORM**: Drizzle ORM with type-safe schema definitions and migrations.
- **Schema Design**: Normalized tables for users, strategies, positions, transactions, backtest results, and risk metrics.
- **Session Storage**: Dedicated sessions table for authentication state persistence.

### Core Application Features
- **Portfolio Management**: Real-time position tracking, P&L, and performance monitoring.
- **Strategy Development**: Visual builder with technical analysis and statistical arbitrage support.
- **Backtesting Engine**: Historical simulation with realistic costs, slippage, and survivorship bias correction.
- **Risk Management**: Value-at-Risk, drawdown monitoring, position limits, and kill-switches.
- **Paper Trading**: Risk-free strategy testing with shadow portfolio functionality.
- **Analytics Dashboard**: Chart.js for performance visualization and compliance reporting.
- **Quantum Optimization**: Module with IBM Quantum, Google Cirq, Amazon Braket integrations for VQE, QAOA, portfolio optimization, and quantum ML.
- **Fraud Prevention**: Multi-layered detection (device fingerprinting, IP tracking, behavioral analysis), risk scoring, email/phone verification, bot behavior detection, trial eligibility.
- **Performance Monitoring**: Automated weekly reports for user activity, fraud stats, growth metrics.
- **Broker Onboarding**: Comprehensive 4-step setup flow for Alpaca Markets, smart alerts, dedicated setup page, AI chatbot integration.
- **Security Canary System**: 6 hidden API endpoints for intrusion detection, honeypots, and integration with Arize Phoenix for real-time threat detection.
- **Observability**: OpenTelemetry-based system compatible with Arize AI for tracing critical operations (trading, quantum, fraud, user actions).

### Technical Implementations
- **Payment Processing**: Stripe integration for subscriptions and performance-based pricing (15-30% on profits above benchmark).
- **Testing Framework**: Pytest for backend, Playwright for E2E validation, covering API functionality, security, quantum features, and user flows.
- **Email Notifications**: SMTP for executive alerts, daily security summaries, weekly board reports, and critical alerts.

## External Dependencies

### Payment Processing
- **Stripe**: For subscription management and performance-based billing.

### Development Tools
- **Vite**: Build system for frontend.
- **ESLint**: Code quality.
- **TypeScript**: Static analysis.
- **Replit-specific tooling**: For development environment.

### Third-Party Services
- **Neon Database**: PostgreSQL hosting.
- **Replit Auth**: OAuth-based user authentication.
- **Radix UI**: Accessible UI component primitives.
- **Tailwind CSS**: Utility-first styling.
- **Chart.js**: Financial data visualization.
- **TanStack React Query**: Server state synchronization.
- **SendGrid**: Email service for report delivery.
- **Arize AI / Arize Phoenix**: AI observability and security event monitoring.

### API Integrations
- **Market Data Providers**: Alpha Vantage, Finnhub, IEX Cloud, Twelve Data (for real-time and historical data).
- **Broker APIs**: Alpaca Markets (for live and paper trading).
- **Quantum Computing Providers**: IBM Quantum, Google Cirq, Amazon Braket.