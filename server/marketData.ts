import axios from 'axios';

// Market Data Provider Configuration
const PROVIDERS = {
  ALPHA_VANTAGE: 'alphavantage',
  FINNHUB: 'finnhub',
  IEX_CLOUD: 'iexcloud',
  TWELVE_DATA: 'twelvedata',
} as const;

type Provider = typeof PROVIDERS[keyof typeof PROVIDERS];

interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  provider: Provider;
}

interface HistoricalData {
  symbol: string;
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  provider: Provider;
}

class MarketDataService {
  private currentProvider: Provider = PROVIDERS.ALPHA_VANTAGE;

  setProvider(provider: Provider) {
    this.currentProvider = provider;
  }

  getCurrentProvider(): Provider {
    return this.currentProvider;
  }

  async getQuote(symbol: string, provider?: Provider): Promise<QuoteData> {
    const activeProvider = provider || this.currentProvider;
    
    switch (activeProvider) {
      case PROVIDERS.ALPHA_VANTAGE:
        return this.getAlphaVantageQuote(symbol);
      case PROVIDERS.FINNHUB:
        return this.getFinnhubQuote(symbol);
      case PROVIDERS.IEX_CLOUD:
        return this.getIEXQuote(symbol);
      case PROVIDERS.TWELVE_DATA:
        return this.getTwelveDataQuote(symbol);
      default:
        throw new Error(`Unsupported provider: ${activeProvider}`);
    }
  }

  async getHistoricalData(symbol: string, period: string = '1M', provider?: Provider): Promise<HistoricalData> {
    const activeProvider = provider || this.currentProvider;
    
    switch (activeProvider) {
      case PROVIDERS.ALPHA_VANTAGE:
        return this.getAlphaVantageHistorical(symbol, period);
      case PROVIDERS.FINNHUB:
        return this.getFinnhubHistorical(symbol, period);
      case PROVIDERS.IEX_CLOUD:
        return this.getIEXHistorical(symbol, period);
      case PROVIDERS.TWELVE_DATA:
        return this.getTwelveDataHistorical(symbol, period);
      default:
        throw new Error(`Unsupported provider: ${activeProvider}`);
    }
  }

  // Alpha Vantage Implementation
  private async getAlphaVantageQuote(symbol: string): Promise<QuoteData> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY not configured');
    }

    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data['Global Quote'];
      
      if (!data) {
        throw new Error('Invalid response from Alpha Vantage');
      }

      return {
        symbol: data['01. symbol'],
        price: parseFloat(data['05. price']),
        change: parseFloat(data['09. change']),
        changePercent: parseFloat(data['10. change percent'].replace('%', '')),
        volume: parseInt(data['06. volume']),
        timestamp: Date.now(),
        provider: PROVIDERS.ALPHA_VANTAGE,
      };
    } catch (error: any) {
      throw new Error(`Alpha Vantage API error: ${error.message}`);
    }
  }

  private async getAlphaVantageHistorical(symbol: string, period: string): Promise<HistoricalData> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY not configured');
    }

    try {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
      const response = await axios.get(url);
      const timeSeries = response.data['Time Series (Daily)'];
      
      if (!timeSeries) {
        throw new Error('Invalid response from Alpha Vantage');
      }

      const data = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }));

      return {
        symbol,
        data: data.slice(0, 30), // Limit to recent 30 days
        provider: PROVIDERS.ALPHA_VANTAGE,
      };
    } catch (error: any) {
      throw new Error(`Alpha Vantage historical data error: ${error.message}`);
    }
  }

  // Finnhub Implementation
  private async getFinnhubQuote(symbol: string): Promise<QuoteData> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;

      return {
        symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        volume: 0, // Finnhub doesn't provide volume in quote endpoint
        timestamp: Date.now(),
        provider: PROVIDERS.FINNHUB,
      };
    } catch (error: any) {
      throw new Error(`Finnhub API error: ${error.message}`);
    }
  }

  private async getFinnhubHistorical(symbol: string, period: string): Promise<HistoricalData> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    try {
      const to = Math.floor(Date.now() / 1000);
      const from = to - (30 * 24 * 60 * 60); // 30 days ago
      
      const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;

      if (data.s !== 'ok') {
        throw new Error('Invalid response from Finnhub');
      }

      const historicalData = data.t.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v[index],
      }));

      return {
        symbol,
        data: historicalData,
        provider: PROVIDERS.FINNHUB,
      };
    } catch (error: any) {
      throw new Error(`Finnhub historical data error: ${error.message}`);
    }
  }

  // IEX Cloud Implementation
  private async getIEXQuote(symbol: string): Promise<QuoteData> {
    const apiKey = process.env.IEX_CLOUD_API_KEY;
    if (!apiKey) {
      throw new Error('IEX_CLOUD_API_KEY not configured');
    }

    try {
      const url = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;

      return {
        symbol: data.symbol,
        price: data.latestPrice,
        change: data.change,
        changePercent: data.changePercent * 100,
        volume: data.latestVolume,
        timestamp: Date.now(),
        provider: PROVIDERS.IEX_CLOUD,
      };
    } catch (error: any) {
      throw new Error(`IEX Cloud API error: ${error.message}`);
    }
  }

  private async getIEXHistorical(symbol: string, period: string): Promise<HistoricalData> {
    const apiKey = process.env.IEX_CLOUD_API_KEY;
    if (!apiKey) {
      throw new Error('IEX_CLOUD_API_KEY not configured');
    }

    try {
      const url = `https://cloud.iexapis.com/stable/stock/${symbol}/chart/1m?token=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;

      const historicalData = data.map((item: any) => ({
        date: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));

      return {
        symbol,
        data: historicalData,
        provider: PROVIDERS.IEX_CLOUD,
      };
    } catch (error: any) {
      throw new Error(`IEX Cloud historical data error: ${error.message}`);
    }
  }

  // Twelve Data Implementation
  private async getTwelveDataQuote(symbol: string): Promise<QuoteData> {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) {
      throw new Error('TWELVE_DATA_API_KEY not configured');
    }

    try {
      const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;

      return {
        symbol: data.symbol,
        price: parseFloat(data.close),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.percent_change),
        volume: parseInt(data.volume),
        timestamp: Date.now(),
        provider: PROVIDERS.TWELVE_DATA,
      };
    } catch (error: any) {
      throw new Error(`Twelve Data API error: ${error.message}`);
    }
  }

  private async getTwelveDataHistorical(symbol: string, period: string): Promise<HistoricalData> {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) {
      throw new Error('TWELVE_DATA_API_KEY not configured');
    }

    try {
      const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;

      if (!data.values) {
        throw new Error('Invalid response from Twelve Data');
      }

      const historicalData = data.values.map((item: any) => ({
        date: item.datetime,
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume),
      }));

      return {
        symbol,
        data: historicalData,
        provider: PROVIDERS.TWELVE_DATA,
      };
    } catch (error: any) {
      throw new Error(`Twelve Data historical data error: ${error.message}`);
    }
  }

  // Utility method to test all providers
  async testAllProviders(symbol: string = 'AAPL'): Promise<Record<Provider, boolean>> {
    const results: Record<Provider, boolean> = {} as any;
    
    for (const provider of Object.values(PROVIDERS)) {
      try {
        await this.getQuote(symbol, provider);
        results[provider] = true;
      } catch (error: any) {
        results[provider] = false;
        console.error(`Provider ${provider} failed:`, error.message);
      }
    }
    
    return results;
  }
}

export const marketDataService = new MarketDataService();
export { PROVIDERS, type Provider, type QuoteData, type HistoricalData };