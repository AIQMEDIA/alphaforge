# AlphaForge - Quantitative Trading Bot Platform

## Overview

AlphaForge is a comprehensive web application for quantitative trading that addresses common shortcomings in existing trading platforms through reliability, transparency, and robust risk management. The platform provides advanced backtesting capabilities, real-time portfolio monitoring, strategy development tools, and multi-layered risk controls.

The application is designed as a full-stack TypeScript solution with a React frontend and Express backend, targeting both novice and professional traders who need institutional-grade trading tools with an intuitive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 12, 2025)

### Market Data Integration Added
- Integrated 4 major market data providers: Alpha Vantage, Finnhub, IEX Cloud, Twelve Data
- Created unified API interface for switching between providers
- Added real-time quote and historical data endpoints
- Replaced mock data with authentic market data feeds

### Broker API Integration Added  
- Integrated Alpaca Markets for live and paper trading
- Added comprehensive order management system
- Implemented position tracking and account monitoring
- Created seamless switching between paper and live trading modes

### Database Migration System
- Set up proper Drizzle ORM migration scripts
- Added automated schema management
- Created migration commands for production deployment
- Database is fully initialized and ready for production

### Production Readiness
- All TypeScript errors resolved
- Real market data integration complete
- Broker APIs functional with paper trading
- Authentication and payment systems operational
- AlphaForge branding and artwork integrated
- Comprehensive setup documentation created

### Quantum Computing Integration Added (August 14, 2025)
- Added quantum optimization module with 3 major providers: IBM Quantum, Google Cirq, Amazon Braket
- Implemented Variational Quantum Eigensolver (VQE) and Quantum Approximate Optimization Algorithm (QAOA)
- Created quantum portfolio optimization with real algorithms from production systems
- Added quantum machine learning for market prediction and risk analysis
- Built comprehensive quantum computing UI with algorithm selection and real-time results
- Integrated quantum status monitoring and provider switching capabilities

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for build tooling and development server
- **UI Library**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for client-side routing with role-based access control
- **Theme System**: Built-in dark/light mode support with CSS custom properties

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API server
- **Authentication**: Replit Auth integration with OpenID Connect (OIDC) for secure user authentication
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints with comprehensive error handling and request logging

### Database Architecture
- **Primary Database**: PostgreSQL with Neon serverless connection pooling
- **ORM**: Drizzle ORM with type-safe schema definitions and migrations
- **Schema Design**: Normalized tables for users, strategies, positions, transactions, backtest results, and risk metrics
- **Session Storage**: Dedicated sessions table for authentication state persistence

### Core Application Features
- **Portfolio Management**: Real-time position tracking, P&L calculation, and performance monitoring
- **Strategy Development**: Visual strategy builder with technical analysis and statistical arbitrage support
- **Backtesting Engine**: Historical simulation with realistic transaction costs, slippage modeling, and survivorship bias correction
- **Risk Management**: Value-at-Risk calculations, drawdown monitoring, position limits, and configurable kill-switches
- **Paper Trading**: Risk-free strategy testing with shadow portfolio functionality
- **Analytics Dashboard**: Chart.js integration for performance visualization and compliance reporting

### User Experience Design
- **Responsive Layout**: Mobile-first design with adaptive sidebar navigation
- **Progressive Disclosure**: Step-by-step wizards for strategy setup and configuration
- **Real-time Updates**: Live data streaming for portfolio values and risk metrics
- **Accessibility**: ARIA-compliant components with keyboard navigation support

## External Dependencies

### Payment Processing
- **Stripe Integration**: Full payment processing with subscription management for tiered pricing plans
- **Billing Models**: Trial-based onboarding with automated subscription conversion

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESLint and TypeScript compiler for static analysis
- **Development Environment**: Replit-specific tooling with hot module replacement

### Third-Party Services
- **Database Provider**: Neon Database for PostgreSQL hosting with connection pooling
- **Authentication Provider**: Replit Auth for OAuth-based user authentication
- **UI Components**: Radix UI for accessible component primitives
- **Styling**: Tailwind CSS for utility-first styling approach
- **Charts**: Chart.js for financial data visualization
- **State Management**: TanStack React Query for server state synchronization

### API Integrations
- **Market Data**: Designed for integration with financial data providers (implementation pending)
- **Broker APIs**: Architecture prepared for live trading integration
- **Notification Services**: Email and webhook support for alerts and reporting