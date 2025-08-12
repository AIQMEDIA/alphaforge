import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Separator } from "@/components/ui/separator";
import { Play, History, TrendingUp, TrendingDown } from "lucide-react";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Backtesting() {
  const { toast } = useToast();
  const [backtest, setBacktest] = useState({
    strategyId: "",
    startDate: "",
    endDate: "",
    initialCapital: 100000,
  });

  const { data: strategies = [] } = useQuery<any[]>({
    queryKey: ["/api/strategies"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: backtestResults = [] } = useQuery<any[]>({
    queryKey: ["/api/backtests"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const runBacktestMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest("POST", "/api/backtests/run", params);
      return await response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Backtest Completed",
        description: `Total Return: ${(parseFloat(result.totalReturn) * 100).toFixed(2)}%`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Backtest Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRunBacktest = () => {
    if (!backtest.strategyId || !backtest.startDate || !backtest.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    runBacktestMutation.mutate(backtest);
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatPercent = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `${num > 0 ? '+' : ''}${(num * 100).toFixed(2)}%`;
  };

  // Mock backtest results when no data is available
  const mockResults = [
    {
      id: "1",
      name: "Momentum RSI Backtest",
      strategyId: "1",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      initialCapital: "100000",
      finalValue: "115000",
      totalReturn: "0.15",
      maxDrawdown: "0.08",
      sharpeRatio: "1.2",
      winRate: "0.65",
      totalTrades: 45,
      createdAt: new Date().toISOString()
    },
    {
      id: "2", 
      name: "Mean Reversion Test",
      strategyId: "2",
      startDate: "2023-06-01",
      endDate: "2023-12-31",
      initialCapital: "50000",
      finalValue: "53500",
      totalReturn: "0.07",
      maxDrawdown: "0.05",
      sharpeRatio: "0.9",
      winRate: "0.58",
      totalTrades: 28,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const displayResults = backtestResults?.length > 0 ? backtestResults : mockResults;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Backtesting
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Test your strategies against historical market data
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Backtest Configuration */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Run New Backtest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="strategy">Strategy</Label>
                  <Select
                    value={backtest.strategyId}
                    onValueChange={(value) => setBacktest({ ...backtest, strategyId: value })}
                  >
                    <SelectTrigger data-testid="select-backtest-strategy">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies?.map((strategy: any) => (
                        <SelectItem key={strategy.id} value={strategy.id}>
                          {strategy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={backtest.startDate}
                    onChange={(e) => setBacktest({ ...backtest, startDate: e.target.value })}
                    data-testid="input-start-date"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={backtest.endDate}
                    onChange={(e) => setBacktest({ ...backtest, endDate: e.target.value })}
                    data-testid="input-end-date"
                  />
                </div>

                <div>
                  <Label htmlFor="capital">Initial Capital</Label>
                  <Input
                    id="capital"
                    type="number"
                    value={backtest.initialCapital}
                    onChange={(e) => setBacktest({ ...backtest, initialCapital: parseInt(e.target.value) })}
                    data-testid="input-initial-capital"
                  />
                </div>

                <Button
                  onClick={handleRunBacktest}
                  disabled={runBacktestMutation.isPending}
                  className="w-full"
                  data-testid="button-run-backtest"
                >
                  {runBacktestMutation.isPending ? "Running..." : "Run Backtest"}
                </Button>
              </CardContent>
            </Card>

            {/* Backtest Results */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    Recent Backtest Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayResults.map((result: any) => (
                      <Card key={result.id} className="border" data-testid={`backtest-result-${result.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white" data-testid={`result-name-${result.id}`}>
                              {result.name}
                            </h3>
                            <Badge className={parseFloat(result.totalReturn) > 0 ? "bg-profit" : "bg-loss"}>
                              {formatPercent(result.totalReturn)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Period:</span>
                              <p className="font-medium" data-testid={`result-period-${result.id}`}>
                                {new Date(result.startDate).toLocaleDateString()} - {new Date(result.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Initial Capital:</span>
                              <p className="font-medium" data-testid={`result-capital-${result.id}`}>
                                {formatCurrency(result.initialCapital)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Final Value:</span>
                              <p className="font-medium" data-testid={`result-final-value-${result.id}`}>
                                {formatCurrency(result.finalValue)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Total Trades:</span>
                              <p className="font-medium" data-testid={`result-trades-${result.id}`}>
                                {result.totalTrades}
                              </p>
                            </div>
                          </div>

                          <Separator className="my-3" />

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <span className="text-gray-600 dark:text-gray-400 block">Max Drawdown</span>
                              <span className="font-medium text-loss" data-testid={`result-drawdown-${result.id}`}>
                                {formatPercent(result.maxDrawdown)}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="text-gray-600 dark:text-gray-400 block">Sharpe Ratio</span>
                              <span className="font-medium" data-testid={`result-sharpe-${result.id}`}>
                                {parseFloat(result.sharpeRatio).toFixed(2)}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="text-gray-600 dark:text-gray-400 block">Win Rate</span>
                              <span className="font-medium text-profit" data-testid={`result-winrate-${result.id}`}>
                                {formatPercent(result.winRate)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-8 w-8 text-profit" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Best Return</h3>
                    <p className="text-2xl font-bold text-profit" data-testid="text-best-return">
                      +15.0%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Last 12 months</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingDown className="h-8 w-8 text-warning" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Avg Drawdown</h3>
                    <p className="text-2xl font-bold text-warning" data-testid="text-avg-drawdown">
                      -6.5%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Across all tests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <History className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Total Tests</h3>
                    <p className="text-2xl font-bold text-primary" data-testid="text-total-tests">
                      {displayResults.length}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
