import axios from 'axios';

// Broker Configuration
const BROKERS = {
  ALPACA: 'alpaca',
  PAPER_TRADING: 'paper',
} as const;

type Broker = typeof BROKERS[keyof typeof BROKERS];

interface OrderRequest {
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
  limitPrice?: number;
  stopPrice?: number;
}

interface Order {
  id: string;
  symbol: string;
  qty: number;
  filledQty: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  status: 'new' | 'filled' | 'partial_fill' | 'cancelled' | 'rejected';
  price?: number;
  limitPrice?: number;
  stopPrice?: number;
  createdAt: string;
  updatedAt: string;
  broker: Broker;
}

interface Position {
  symbol: string;
  qty: number;
  marketValue: number;
  costBasis: number;
  unrealizedPL: number;
  realizedPL: number;
  avgEntryPrice: number;
  side: 'long' | 'short';
  broker: Broker;
}

interface Account {
  equity: number;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
  dayTradeCount: number;
  dayTradingBuyingPower: number;
  broker: Broker;
}

class BrokerService {
  private currentBroker: Broker = BROKERS.PAPER_TRADING;
  private paperPositions: Map<string, Position> = new Map();
  private paperOrders: Map<string, Order> = new Map();
  private paperAccount: Account = {
    equity: 100000,
    cash: 100000,
    buyingPower: 100000,
    portfolioValue: 100000,
    dayTradeCount: 0,
    dayTradingBuyingPower: 100000,
    broker: BROKERS.PAPER_TRADING,
  };

  setBroker(broker: Broker) {
    this.currentBroker = broker;
  }

  getCurrentBroker(): Broker {
    return this.currentBroker;
  }

  async submitOrder(orderRequest: OrderRequest): Promise<Order> {
    switch (this.currentBroker) {
      case BROKERS.ALPACA:
        return this.submitAlpacaOrder(orderRequest);
      case BROKERS.PAPER_TRADING:
        return this.submitPaperOrder(orderRequest);
      default:
        throw new Error(`Unsupported broker: ${this.currentBroker}`);
    }
  }

  async getOrders(): Promise<Order[]> {
    switch (this.currentBroker) {
      case BROKERS.ALPACA:
        return this.getAlpacaOrders();
      case BROKERS.PAPER_TRADING:
        return this.getPaperOrders();
      default:
        throw new Error(`Unsupported broker: ${this.currentBroker}`);
    }
  }

  async getPositions(): Promise<Position[]> {
    switch (this.currentBroker) {
      case BROKERS.ALPACA:
        return this.getAlpacaPositions();
      case BROKERS.PAPER_TRADING:
        return this.getPaperPositions();
      default:
        throw new Error(`Unsupported broker: ${this.currentBroker}`);
    }
  }

  async getAccount(): Promise<Account> {
    switch (this.currentBroker) {
      case BROKERS.ALPACA:
        return this.getAlpacaAccount();
      case BROKERS.PAPER_TRADING:
        return this.getPaperAccount();
      default:
        throw new Error(`Unsupported broker: ${this.currentBroker}`);
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    switch (this.currentBroker) {
      case BROKERS.ALPACA:
        return this.cancelAlpacaOrder(orderId);
      case BROKERS.PAPER_TRADING:
        return this.cancelPaperOrder(orderId);
      default:
        throw new Error(`Unsupported broker: ${this.currentBroker}`);
    }
  }

  // Alpaca Implementation
  private async submitAlpacaOrder(orderRequest: OrderRequest): Promise<Order> {
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const isPaper = process.env.ALPACA_PAPER_TRADING === 'true';
    
    if (!apiKey || !secretKey) {
      throw new Error('Alpaca API credentials not configured');
    }

    const baseUrl = isPaper 
      ? 'https://paper-api.alpaca.markets' 
      : 'https://api.alpaca.markets';

    try {
      const response = await axios.post(
        `${baseUrl}/v2/orders`,
        {
          symbol: orderRequest.symbol,
          qty: orderRequest.qty,
          side: orderRequest.side,
          type: orderRequest.type,
          time_in_force: orderRequest.timeInForce,
          limit_price: orderRequest.limitPrice,
          stop_price: orderRequest.stopPrice,
        },
        {
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': secretKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      return {
        id: data.id,
        symbol: data.symbol,
        qty: parseInt(data.qty),
        filledQty: parseInt(data.filled_qty),
        side: data.side,
        type: data.order_type,
        status: data.status,
        price: data.filled_avg_price ? parseFloat(data.filled_avg_price) : undefined,
        limitPrice: data.limit_price ? parseFloat(data.limit_price) : undefined,
        stopPrice: data.stop_price ? parseFloat(data.stop_price) : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        broker: BROKERS.ALPACA,
      };
    } catch (error: any) {
      throw new Error(`Alpaca order submission error: ${error.response?.data?.message || error.message}`);
    }
  }

  private async getAlpacaOrders(): Promise<Order[]> {
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const isPaper = process.env.ALPACA_PAPER_TRADING === 'true';
    
    if (!apiKey || !secretKey) {
      throw new Error('Alpaca API credentials not configured');
    }

    const baseUrl = isPaper 
      ? 'https://paper-api.alpaca.markets' 
      : 'https://api.alpaca.markets';

    try {
      const response = await axios.get(`${baseUrl}/v2/orders`, {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey,
        },
      });

      return response.data.map((order: any) => ({
        id: order.id,
        symbol: order.symbol,
        qty: parseInt(order.qty),
        filledQty: parseInt(order.filled_qty),
        side: order.side,
        type: order.order_type,
        status: order.status,
        price: order.filled_avg_price ? parseFloat(order.filled_avg_price) : undefined,
        limitPrice: order.limit_price ? parseFloat(order.limit_price) : undefined,
        stopPrice: order.stop_price ? parseFloat(order.stop_price) : undefined,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        broker: BROKERS.ALPACA,
      }));
    } catch (error: any) {
      throw new Error(`Alpaca orders fetch error: ${error.response?.data?.message || error.message}`);
    }
  }

  private async getAlpacaPositions(): Promise<Position[]> {
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const isPaper = process.env.ALPACA_PAPER_TRADING === 'true';
    
    if (!apiKey || !secretKey) {
      throw new Error('Alpaca API credentials not configured');
    }

    const baseUrl = isPaper 
      ? 'https://paper-api.alpaca.markets' 
      : 'https://api.alpaca.markets';

    try {
      const response = await axios.get(`${baseUrl}/v2/positions`, {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey,
        },
      });

      return response.data.map((position: any) => ({
        symbol: position.symbol,
        qty: parseInt(position.qty),
        marketValue: parseFloat(position.market_value),
        costBasis: parseFloat(position.cost_basis),
        unrealizedPL: parseFloat(position.unrealized_pl),
        realizedPL: parseFloat(position.realized_pl || '0'),
        avgEntryPrice: parseFloat(position.avg_entry_price),
        side: parseInt(position.qty) > 0 ? 'long' : 'short',
        broker: BROKERS.ALPACA,
      }));
    } catch (error: any) {
      throw new Error(`Alpaca positions fetch error: ${error.response?.data?.message || error.message}`);
    }
  }

  private async getAlpacaAccount(): Promise<Account> {
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const isPaper = process.env.ALPACA_PAPER_TRADING === 'true';
    
    if (!apiKey || !secretKey) {
      throw new Error('Alpaca API credentials not configured');
    }

    const baseUrl = isPaper 
      ? 'https://paper-api.alpaca.markets' 
      : 'https://api.alpaca.markets';

    try {
      const response = await axios.get(`${baseUrl}/v2/account`, {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey,
        },
      });

      const data = response.data;
      return {
        equity: parseFloat(data.equity),
        cash: parseFloat(data.cash),
        buyingPower: parseFloat(data.buying_power),
        portfolioValue: parseFloat(data.portfolio_value),
        dayTradeCount: parseInt(data.daytrade_count),
        dayTradingBuyingPower: parseFloat(data.daytrading_buying_power),
        broker: BROKERS.ALPACA,
      };
    } catch (error: any) {
      throw new Error(`Alpaca account fetch error: ${error.response?.data?.message || error.message}`);
    }
  }

  private async cancelAlpacaOrder(orderId: string): Promise<void> {
    const apiKey = process.env.ALPACA_API_KEY;
    const secretKey = process.env.ALPACA_SECRET_KEY;
    const isPaper = process.env.ALPACA_PAPER_TRADING === 'true';
    
    if (!apiKey || !secretKey) {
      throw new Error('Alpaca API credentials not configured');
    }

    const baseUrl = isPaper 
      ? 'https://paper-api.alpaca.markets' 
      : 'https://api.alpaca.markets';

    try {
      await axios.delete(`${baseUrl}/v2/orders/${orderId}`, {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey,
        },
      });
    } catch (error: any) {
      throw new Error(`Alpaca order cancellation error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Paper Trading Implementation
  private async submitPaperOrder(orderRequest: OrderRequest): Promise<Order> {
    const orderId = `paper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate market price (in real implementation, would get from market data service)
    const simulatedPrice = 150 + (Math.random() - 0.5) * 20;
    
    const order: Order = {
      id: orderId,
      symbol: orderRequest.symbol,
      qty: orderRequest.qty,
      filledQty: orderRequest.type === 'market' ? orderRequest.qty : 0,
      side: orderRequest.side,
      type: orderRequest.type,
      status: orderRequest.type === 'market' ? 'filled' : 'new',
      price: orderRequest.type === 'market' ? simulatedPrice : undefined,
      limitPrice: orderRequest.limitPrice,
      stopPrice: orderRequest.stopPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      broker: BROKERS.PAPER_TRADING,
    };

    this.paperOrders.set(orderId, order);

    // If market order, immediately update positions
    if (orderRequest.type === 'market') {
      this.updatePaperPosition(orderRequest, simulatedPrice);
    }

    return order;
  }

  private updatePaperPosition(orderRequest: OrderRequest, fillPrice: number) {
    const symbol = orderRequest.symbol;
    const existingPosition = this.paperPositions.get(symbol);
    
    if (existingPosition) {
      const newQty = orderRequest.side === 'buy' 
        ? existingPosition.qty + orderRequest.qty
        : existingPosition.qty - orderRequest.qty;
      
      if (newQty === 0) {
        this.paperPositions.delete(symbol);
      } else {
        const newCostBasis = orderRequest.side === 'buy'
          ? existingPosition.costBasis + (orderRequest.qty * fillPrice)
          : existingPosition.costBasis - (orderRequest.qty * existingPosition.avgEntryPrice);
        
        existingPosition.qty = newQty;
        existingPosition.costBasis = newCostBasis;
        existingPosition.avgEntryPrice = newCostBasis / newQty;
        existingPosition.side = newQty > 0 ? 'long' : 'short';
      }
    } else if (orderRequest.side === 'buy') {
      const newPosition: Position = {
        symbol,
        qty: orderRequest.qty,
        marketValue: orderRequest.qty * fillPrice,
        costBasis: orderRequest.qty * fillPrice,
        unrealizedPL: 0,
        realizedPL: 0,
        avgEntryPrice: fillPrice,
        side: 'long',
        broker: BROKERS.PAPER_TRADING,
      };
      this.paperPositions.set(symbol, newPosition);
    }

    // Update cash
    const cashChange = orderRequest.side === 'buy' 
      ? -(orderRequest.qty * fillPrice)
      : (orderRequest.qty * fillPrice);
    this.paperAccount.cash += cashChange;
    this.paperAccount.buyingPower += cashChange;
  }

  private async getPaperOrders(): Promise<Order[]> {
    return Array.from(this.paperOrders.values());
  }

  private async getPaperPositions(): Promise<Position[]> {
    return Array.from(this.paperPositions.values());
  }

  private async getPaperAccount(): Promise<Account> {
    return { ...this.paperAccount };
  }

  private async cancelPaperOrder(orderId: string): Promise<void> {
    const order = this.paperOrders.get(orderId);
    if (order && order.status === 'new') {
      order.status = 'cancelled';
      order.updatedAt = new Date().toISOString();
    }
  }

  // Utility methods
  async testBrokerConnection(): Promise<boolean> {
    try {
      await this.getAccount();
      return true;
    } catch (error: any) {
      console.error(`Broker connection test failed:`, error.message);
      return false;
    }
  }
}

export const brokerService = new BrokerService();
export { BROKERS, type Broker, type OrderRequest, type Order, type Position, type Account };