import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  PieChart,
  FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Analytics() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("1M");
  const [analyticsType, setAnalyticsType] = useState("performance");

  const { data: performanceData, isLoading: performanceLoading, error } = useQuery({
    queryKey: ["/api/portfolio/performance", { days: 30 }],
    enabled: isAuthenticated,
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions", { limit: 100 }],
    enabled: isAuthenticated,
  });

  const { data: strategies } = useQuery({
    queryKey: ["/api/strategies"],
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

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleExportReport = (type: string) => {
    toast({
      title: "Export Started",
      description: `Generating ${type} report...`,
    });
    // Here you would implement actual export functionality
  };

  // Mock analytics data
  const mockAnalytics = {
    totalReturn: 15.75,
    sharpeRatio: 1.86,
    maxDrawdown: -8.5,
    winRate: 0.68,
    totalTrades: 247,
    avgTradeReturn: 0.32,
    volatility: 12.3,
    beta: 0.74,
    alpha: 4.2,
    informationRatio: 0.89,
  };

  const performanceMetrics = [
    { label: "Total Return", value: formatPercent(mockAnalytics.totalReturn), color: "text-profit" },
    { label: "Sharpe Ratio", value: mockAnalytics.sharpeRatio.toFixed(2), color: "text-primary" },
    { label: "Max Drawdown", value: formatPercent(mockAnalytics.maxDrawdown), color: "text-loss" },
    { label: "Win Rate", value: formatPercent(mockAnalytics.winRate * 100), color: "text-profit" },
    { label: "Volatility", value: formatPercent(mockAnalytics.volatility), color: "text-warning" },
    { label: "Beta", value: mockAnalytics.beta.toFixed(2), color: "text-secondary" },
    { label: "Alpha", value: formatPercent(mockAnalytics.alpha), color: "text-profit" },
    { label: "Info Ratio", value: mockAnalytics.informationRatio.toFixed(2), color: "text-primary" },
  ];

  const tradingStats = [
    { label: "Total Trades", value: mockAnalytics.totalTrades.toString(), trend: "up" },
    { label: "Avg Trade Return", value: formatPercent(mockAnalytics.avgTradeReturn), trend: "up" },
    { label: "Best Trade", value: formatPercent(8.4), trend: "up" },
    { label: "Worst Trade", value: formatPercent(-3.2), trend: "down" },
    { label: "Avg Hold Time", value: "2.4 days", trend: "neutral" },
    { label: "Success Rate", value: "68%", trend: "up" },
  ];

  const strategyPerformance = [
    { name: "Momentum RSI", return: 18.5, trades: 89, sharpe: 1.9, status: "active" },
    { name: "Mean Reversion", return: 12.3, trades: 76, sharpe: 1.4, status: "active" },
    { name: "Pairs Trading", return: 8.7, trades: 45, sharpe: 1.1, status: "paused" },
    { name: "Breakout Strategy", return: 15.2, trades: 37, sharpe: 1.6, status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics & Reports
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive performance analysis and trading insights
              </p>
            </div>
            <div className="flex space-x-3">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32" data-testid="select-timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1W">1 Week</SelectItem>
                  <SelectItem value="1M">1 Month</SelectItem>
                  <SelectItem value="3M">3 Months</SelectItem>
                  <SelectItem value="6M">6 Months</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => handleExportReport("PDF")}
                data-testid="button-export-pdf"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportReport("Excel")}
                data-testid="button-export-excel"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Portfolio Return
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-profit" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-profit" data-testid="text-portfolio-return">
                  {formatPercent(mockAnalytics.totalReturn)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {timeframe} period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sharpe Ratio
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary" data-testid="text-sharpe-ratio">
                  {mockAnalytics.sharpeRatio.toFixed(2)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Risk-adjusted return
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Win Rate
                </CardTitle>
                <PieChart className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary" data-testid="text-win-rate">
                  {formatPercent(mockAnalytics.winRate * 100)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Successful trades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Trades
                </CardTitle>
                <Calendar className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent" data-testid="text-total-trades">
                  {mockAnalytics.totalTrades}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {timeframe} period
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {performanceMetrics.map((metric, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 dark:bg-dark-300 rounded-lg" data-testid={`metric-${index}`}>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {metric.label}
                        </p>
                        <p className={`text-lg font-bold ${metric.color}`}>
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trading Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tradingStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-300 rounded-lg" data-testid={`stat-${index}`}>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {stat.value}
                          </span>
                          {stat.trend === "up" && <TrendingUp className="h-4 w-4 text-profit" />}
                          {stat.trend === "down" && <TrendingDown className="h-4 w-4 text-loss" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategy Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strategyPerformance.map((strategy, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-300 rounded-lg" data-testid={`strategy-performance-${index}`}>
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {strategy.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {strategy.trades} trades
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`font-medium ${strategy.return > 0 ? 'text-profit' : 'text-loss'}`}>
                              {formatPercent(strategy.return)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Sharpe: {strategy.sharpe.toFixed(1)}
                            </p>
                          </div>
                          <Badge className={strategy.status === 'active' ? 'bg-profit text-white' : 'bg-warning text-white'}>
                            {strategy.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Options */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Performance Report</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Complete portfolio performance analysis
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportReport("Performance PDF")}
                        data-testid="button-export-performance-pdf"
                      >
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportReport("Performance Excel")}
                        data-testid="button-export-performance-excel"
                      >
                        Excel
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Risk Report</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Risk metrics and compliance analysis
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportReport("Risk PDF")}
                        data-testid="button-export-risk-pdf"
                      >
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportReport("Risk Excel")}
                        data-testid="button-export-risk-excel"
                      >
                        Excel
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Trading Log</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Complete transaction history
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportReport("Trading Log CSV")}
                        data-testid="button-export-trading-log"
                      >
                        CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportReport("Trading Log Excel")}
                        data-testid="button-export-trading-excel"
                      >
                        Excel
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Tax Report</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tax-ready profit/loss statements
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportReport("Tax Report")}
                      data-testid="button-export-tax-report"
                    >
                      Generate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Benchmark Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">S&P 500</span>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">+10.2%</p>
                        <p className="text-xs text-gray-500">Benchmark</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Your Portfolio</span>
                      <div className="text-right">
                        <p className="font-medium text-profit">+15.7%</p>
                        <p className="text-xs text-profit">+5.5% vs benchmark</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">NASDAQ</span>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">+12.8%</p>
                        <p className="text-xs text-gray-500">Reference</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
