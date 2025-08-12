import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Bot, BarChart3 } from "lucide-react";

interface PortfolioOverviewProps {
  portfolioValue: number;
  totalPnL: number;
  activeStrategies: number;
  sharpeRatio: number;
}

export function PortfolioOverview({
  portfolioValue,
  totalPnL,
  activeStrategies,
  sharpeRatio,
}: PortfolioOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
    }).format(value / 100);
  };

  const todayChange = portfolioValue * 0.0187; // Mock 1.87% daily change
  const allTimeReturn = totalPnL / (portfolioValue - totalPnL);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Portfolio Value
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-portfolio-value">
            {formatCurrency(portfolioValue)}
          </div>
          <div className="flex items-center mt-2">
            <span className="text-profit text-sm font-medium" data-testid="text-today-change">
              +{formatCurrency(todayChange)} ({formatPercent(1.87)})
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Today</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total P&L
          </CardTitle>
          <div className="p-2 bg-profit/10 rounded-lg">
            <TrendingUp className="h-4 w-4 text-profit" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-profit" data-testid="text-total-pnl">
            {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
          </div>
          <div className="flex items-center mt-2">
            <span className="text-profit text-sm font-medium" data-testid="text-total-return">
              {totalPnL >= 0 ? "+" : ""}{formatPercent(allTimeReturn * 100)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">All Time</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Active Strategies
          </CardTitle>
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Bot className="h-4 w-4 text-secondary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-active-strategies">
            {activeStrategies}
          </div>
          <div className="flex items-center mt-2">
            <span className="text-secondary text-sm font-medium">3 Running</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {Math.max(0, activeStrategies - 3)} Paused
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Sharpe Ratio
          </CardTitle>
          <div className="p-2 bg-accent/10 rounded-lg">
            <BarChart3 className="h-4 w-4 text-accent" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-sharpe-ratio">
            {sharpeRatio.toFixed(2)}
          </div>
          <div className="flex items-center mt-2">
            <span className="text-profit text-sm font-medium">
              {sharpeRatio > 1.5 ? "Excellent" : sharpeRatio > 1 ? "Good" : "Fair"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Risk-Adjusted</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
