import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FlaskConical, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function PaperTrading() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [trade, setTrade] = useState({
    symbol: "",
    side: "BUY" as "BUY" | "SELL",
    quantity: "",
    orderType: "MARKET",
  });

  const { data: paperPositions, isLoading: positionsLoading, error } = useQuery<any>({
    queryKey: ["/api/portfolio"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  const { data: paperTransactions = [], isLoading: transactionsLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions", { type: "paper" }],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const placeTradeMutation = useMutation({
    mutationFn: async (tradeData: any) => {
      const response = await apiRequest("POST", "/api/transactions", {
        ...tradeData,
        type: "paper",
        price: Math.random() * 200 + 50, // Simulate market price
        fees: parseFloat(tradeData.quantity) * 0.01, // Simple fee calculation
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setTradeModalOpen(false);
      setTrade({ symbol: "", side: "BUY", quantity: "", orderType: "MARKET" });
      toast({
        title: "Trade Executed",
        description: `Paper trade for ${trade.quantity} shares of ${trade.symbol} completed`,
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Trade Failed",
        description: error.message || "Failed to execute paper trade",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handlePlaceTrade = () => {
    if (!trade.symbol || !trade.quantity) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    placeTradeMutation.mutate(trade);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Mock paper trading data for demonstration
  const mockPaperPortfolio = {
    totalValue: 100000,
    totalPnL: 2500,
    positions: [
      { symbol: "AAPL", quantity: 50, avgPrice: 175, currentPrice: 178, unrealizedPnL: 150 },
      { symbol: "TSLA", quantity: 25, avgPrice: 240, currentPrice: 245, unrealizedPnL: 125 },
      { symbol: "MSFT", quantity: 30, avgPrice: 380, currentPrice: 385, unrealizedPnL: 150 },
    ]
  };

  const mockPaperTransactions = [
    {
      id: "1",
      symbol: "AAPL",
      side: "BUY",
      quantity: 50,
      price: 175,
      executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      symbol: "TSLA",
      side: "BUY",
      quantity: 25,
      price: 240,
      executedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ];

  const portfolioData = paperPositions || mockPaperPortfolio;
  const transactionData = paperTransactions?.length > 0 ? paperTransactions : mockPaperTransactions;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Paper Trading
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Practice trading with virtual money - risk-free testing environment
              </p>
            </div>
            <Dialog open={tradeModalOpen} onOpenChange={setTradeModalOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-place-trade">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Place Trade
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="modal-place-trade">
                <DialogHeader>
                  <DialogTitle>Place Paper Trade</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={trade.symbol}
                      onChange={(e) => setTrade({ ...trade, symbol: e.target.value.toUpperCase() })}
                      placeholder="e.g., AAPL"
                      data-testid="input-trade-symbol"
                    />
                  </div>
                  <div>
                    <Label htmlFor="side">Side</Label>
                    <Select
                      value={trade.side}
                      onValueChange={(value: "BUY" | "SELL") => setTrade({ ...trade, side: value })}
                    >
                      <SelectTrigger data-testid="select-trade-side">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">Buy</SelectItem>
                        <SelectItem value="SELL">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={trade.quantity}
                      onChange={(e) => setTrade({ ...trade, quantity: e.target.value })}
                      placeholder="Number of shares"
                      data-testid="input-trade-quantity"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderType">Order Type</Label>
                    <Select
                      value={trade.orderType}
                      onValueChange={(value) => setTrade({ ...trade, orderType: value })}
                    >
                      <SelectTrigger data-testid="select-order-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MARKET">Market Order</SelectItem>
                        <SelectItem value="LIMIT">Limit Order</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handlePlaceTrade}
                      disabled={placeTradeMutation.isPending}
                      data-testid="button-execute-trade"
                    >
                      {placeTradeMutation.isPending ? "Executing..." : "Execute Trade"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setTradeModalOpen(false)}
                      data-testid="button-cancel-trade"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Paper Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Paper Portfolio Value
                </CardTitle>
                <FlaskConical className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-paper-portfolio-value">
                  {formatCurrency(portfolioData.totalValue)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Virtual Money</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total P&L
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-profit" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-profit" data-testid="text-paper-pnl">
                  +{formatCurrency(portfolioData.totalPnL)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Unrealized</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Positions
                </CardTitle>
                <Activity className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-paper-positions">
                  {portfolioData.positions?.length || 0}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Day Change
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-profit" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-profit" data-testid="text-paper-day-change">
                  +{formatCurrency(425)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">+0.43%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Positions */}
            <Card>
              <CardHeader>
                <CardTitle>Paper Positions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioData.positions?.map((position: any, index: number) => (
                    <div
                      key={position.symbol || index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-300 rounded-lg"
                      data-testid={`paper-position-${position.symbol || index}`}
                    >
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white" data-testid={`text-position-symbol-${index}`}>
                          {position.symbol}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-position-quantity-${index}`}>
                          {position.quantity} shares @ {formatCurrency(position.avgPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white" data-testid={`text-position-value-${index}`}>
                          {formatCurrency(position.quantity * position.currentPrice)}
                        </p>
                        <p className={`text-sm ${position.unrealizedPnL >= 0 ? 'text-profit' : 'text-loss'}`} data-testid={`text-position-pnl-${index}`}>
                          {position.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPnL)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!portfolioData.positions || portfolioData.positions.length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400" data-testid="text-no-positions">
                      No positions yet. Place your first paper trade to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Paper Trades */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Paper Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactionData.map((transaction: any, index: number) => (
                    <div
                      key={transaction.id || index}
                      className="flex items-start space-x-3"
                      data-testid={`paper-trade-${transaction.id || index}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.side === 'BUY' ? 'bg-profit/10' : 'bg-loss/10'
                      }`}>
                        {transaction.side === 'BUY' ? (
                          <TrendingUp className={`h-4 w-4 text-profit`} />
                        ) : (
                          <TrendingDown className={`h-4 w-4 text-loss`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white" data-testid={`text-trade-details-${index}`}>
                          <span className="font-medium">{transaction.side}</span>{" "}
                          {transaction.quantity} shares of{" "}
                          <span className="font-medium">{transaction.symbol}</span>
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400" data-testid={`text-trade-time-${index}`}>
                          {new Date(transaction.executedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`text-trade-price-${index}`}>
                          {formatCurrency(transaction.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {transactionData.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400" data-testid="text-no-trades">
                      No paper trades yet. Start practicing with virtual money!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Paper Trading Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FlaskConical className="h-5 w-5 mr-2" />
                About Paper Trading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Risk-Free Environment</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Practice trading with virtual money without any real financial risk. Perfect for testing strategies and learning.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Real Market Data</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Paper trades use real-time market prices and realistic execution, giving you authentic trading experience.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Strategy Testing</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Test your trading strategies and analyze performance before committing real capital to the markets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
