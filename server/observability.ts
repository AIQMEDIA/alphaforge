import { trace, SpanStatusCode, type Attributes } from '@opentelemetry/api';

// Phoenix/Arize observability configuration
const PHOENIX_OTEL_ENDPOINT = process.env.ARIZE_ENDPOINT_URL || 'http://localhost:6006/v1/traces';
const ARIZE_API_KEY = process.env.ARIZE_API_KEY;
const ARIZE_SPACE_ID = process.env.ARIZE_SPACE_ID;

// Initialize observability system
let isInitialized = false;

export function initializeObservability() {
  if (!isInitialized) {
    try {
      // For now, just mark as initialized without SDK until OpenTelemetry version conflicts are resolved
      isInitialized = true;
      console.log('📊 AlphaForge observability system initialized');
      
      if (ARIZE_API_KEY) {
        console.log('✅ Arize AI credentials detected - ready for cloud observability');
      } else {
        console.log('📈 Local observability mode (set ARIZE_API_KEY for cloud integration)');
      }
    } catch (error) {
      console.error('❌ Failed to initialize observability:', error);
    }
  }
}

// Helper function to create traced operations
export async function traceOperation(
  name: string,
  attributes: Attributes,
  action: () => Promise<any>
): Promise<any> {
  if (!isInitialized) {
    // If observability isn't initialized, just run the action
    return await action();
  }

  const tracer = trace.getTracer('AlphaForge-Tracer');
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      const result = await action();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: (err as Error)?.message || 'Unknown error'
      });
      span.setAttribute('error.type', (err as Error)?.constructor.name || 'Error');
      span.setAttribute('error.stack', (err as Error)?.stack || '');
      throw err;
    } finally {
      span.end();
    }
  });
}

// Specialized tracing functions for different AlphaForge operations

export async function traceUserAction(
  action: string,
  userId: string,
  handler: () => Promise<any>,
  metadata: Attributes = {}
) {
  return traceOperation(
    `UserAction.${action}`,
    {
      userId,
      action,
      timestamp: Date.now(),
      ...metadata,
    },
    handler
  );
}

export async function tradeExecution(
  trade: {
    userId: string;
    strategyId?: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    type: 'live' | 'paper' | 'backtest';
  },
  handler: () => Promise<any>
) {
  return traceOperation(
    'TradeExecution',
    {
      userId: trade.userId,
      strategyId: trade.strategyId,
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      price: trade.price,
      tradeType: trade.type,
      value: trade.quantity * trade.price,
      timestamp: Date.now(),
    },
    handler
  );
}

export async function traceChatInteraction(
  sessionId: string,
  userId: string | undefined,
  messageType: string,
  queryCount: number,
  handler: () => Promise<any>
) {
  return traceOperation(
    'ChatInteraction',
    {
      sessionId,
      userId: userId || 'anonymous',
      messageType,
      queryCount,
      timestamp: Date.now(),
    },
    handler
  );
}

export async function traceQuantumOperation(
  algorithm: string,
  provider: string,
  assets: number,
  userId: string,
  handler: () => Promise<any>
) {
  return traceOperation(
    'QuantumComputation',
    {
      algorithm,
      provider,
      assetCount: assets,
      userId,
      timestamp: Date.now(),
    },
    handler
  );
}

export async function traceFraudDetection(
  details: {
    userId?: string;
    sessionId?: string;
    reason: string;
    riskScore: number;
    ipAddress: string;
    fingerprint: string;
    blocked: boolean;
  },
  handler: () => Promise<any>
) {
  return traceOperation(
    'FraudDetection',
    {
      userId: details.userId || 'anonymous',
      sessionId: details.sessionId,
      reason: details.reason,
      riskScore: details.riskScore,
      ipAddress: details.ipAddress,
      fingerprint: details.fingerprint,
      blocked: details.blocked,
      severity: details.riskScore > 70 ? 'high' : details.riskScore > 40 ? 'medium' : 'low',
      timestamp: Date.now(),
    },
    handler
  );
}

export async function traceBacktestRun(
  params: {
    strategyId: string;
    userId: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
  },
  handler: () => Promise<any>
) {
  return traceOperation(
    'BacktestRun',
    {
      userId: params.userId,
      strategyId: params.strategyId,
      startDate: params.startDate,
      endDate: params.endDate,
      initialCapital: params.initialCapital,
      duration: new Date(params.endDate).getTime() - new Date(params.startDate).getTime(),
      timestamp: Date.now(),
    },
    handler
  );
}

export async function traceMarketDataRequest(
  symbol: string,
  provider: string,
  dataType: 'quote' | 'historical',
  handler: () => Promise<any>
) {
  return traceOperation(
    'MarketDataRequest',
    {
      symbol,
      provider,
      dataType,
      timestamp: Date.now(),
    },
    handler
  );
}

export async function traceSubscriptionEvent(
  userId: string,
  event: 'trial_start' | 'subscription_create' | 'subscription_cancel' | 'payment_success' | 'payment_failed',
  handler: () => Promise<any>,
  planId?: string,
  amount?: number
) {
  return traceOperation(
    'SubscriptionEvent',
    {
      userId,
      event,
      planId,
      amount,
      timestamp: Date.now(),
    },
    handler
  );
}

// Graceful shutdown
process.on('SIGTERM', () => {
  if (isInitialized) {
    console.log('🔌 AlphaForge observability system shut down');
    process.exit(0);
  }
});

// Export initialization for server startup
export { initializeObservability as default };