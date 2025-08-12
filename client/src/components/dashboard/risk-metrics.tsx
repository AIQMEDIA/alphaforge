import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RiskMetricsProps {
  maxDrawdown?: number;
  var95?: number;
  beta?: number;
  volatility?: number;
}

export function RiskMetrics({ maxDrawdown = -5.2, var95 = -2150, beta = 0.74, volatility = 12.3 }: RiskMetricsProps) {
  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</span>
            <span className="text-sm font-medium text-loss" data-testid="text-max-drawdown">
              {formatPercent(maxDrawdown)}
            </span>
          </div>
          <Progress value={Math.abs(maxDrawdown) * 4} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Value at Risk (95%)</span>
            <span className="text-sm font-medium text-warning" data-testid="text-var95">
              {formatCurrency(var95)}
            </span>
          </div>
          <Progress value={35} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Beta</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white" data-testid="text-beta">
              {beta.toFixed(2)}
            </span>
          </div>
          <Progress value={beta * 100} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Volatility</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white" data-testid="text-volatility">
              {formatPercent(volatility)}
            </span>
          </div>
          <Progress value={volatility * 4} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
