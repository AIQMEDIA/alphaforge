import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingDown,
  Settings,
  PauseCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function RiskManagement() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [riskSettings, setRiskSettings] = useState({
    maxDrawdownLimit: 10,
    positionSizeLimit: 5,
    dailyLossLimit: 1000,
    varLimit: 5000,
    killSwitchEnabled: true,
    maxPositionsPerSymbol: 3,
  });

  const { data: riskMetrics = [], isLoading: metricsLoading, error } = useQuery<any[]>({
    queryKey: ["/api/risk-metrics"],
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
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getRiskLevel = (value: number, threshold: number) => {
    const percentage = (value / threshold) * 100;
    if (percentage < 50) return "low";
    if (percentage < 80) return "medium";
    return "high";
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-profit";
      case "medium":
        return "text-warning";
      case "high":
        return "text-loss";
      default:
        return "text-gray-600";
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-profit text-white";
      case "medium":
        return "bg-warning text-white";
      case "high":
        return "bg-loss text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Mock risk metrics data
  const mockRiskMetrics = {
    currentDrawdown: -5.2,
    maxDrawdown: -8.5,
    var95: -2150,
    beta: 0.74,
    volatility: 12.3,
    exposure: 85000,
    correlation: 0.65,
    leverage: 1.2,
  };

  const currentMetrics = riskMetrics?.[0] || mockRiskMetrics;

  const riskAlerts = [
    {
      id: 1,
      type: "warning",
      message: "Position concentration above 15% in AAPL",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: 2,
      type: "info",
      message: "VaR within acceptable limits",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 3,
      type: "success",
      message: "Risk controls functioning normally",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ];

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Risk management settings have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Risk Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and control portfolio risk exposure in real-time
            </p>
          </div>

          {/* Risk Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Current Drawdown
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-loss" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-loss" data-testid="text-current-drawdown">
                  {formatPercent(currentMetrics.currentDrawdown)}
                </div>
                <Progress
                  value={Math.abs(currentMetrics.currentDrawdown) * 2}
                  className="mt-2 h-2"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Limit: -{riskSettings.maxDrawdownLimit}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Value at Risk (95%)
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning" data-testid="text-var">
                  {formatCurrency(currentMetrics.var95)}
                </div>
                <Progress
                  value={(Math.abs(currentMetrics.var95) / riskSettings.varLimit) * 100}
                  className="mt-2 h-2"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Limit: {formatCurrency(riskSettings.varLimit)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Portfolio Beta
                </CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-beta">
                  {currentMetrics.beta?.toFixed(2)}
                </div>
                <Progress
                  value={currentMetrics.beta * 50}
                  className="mt-2 h-2"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Market correlation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Risk Score
                </CardTitle>
                <Shield className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-warning" data-testid="text-risk-score">
                    7.2
                  </div>
                  <Badge className="bg-warning text-white">Medium</Badge>
                </div>
                <Progress value={72} className="mt-2 h-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Composite risk metric
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Controls */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Risk Control Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="killSwitch" className="font-medium">
                          Emergency Kill Switch
                        </Label>
                        <Switch
                          id="killSwitch"
                          checked={riskSettings.killSwitchEnabled}
                          onCheckedChange={(checked) =>
                            setRiskSettings({ ...riskSettings, killSwitchEnabled: checked })
                          }
                          data-testid="switch-kill-switch"
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically halt all trading when risk limits are breached
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxDrawdown">Max Drawdown Limit (%)</Label>
                      <Input
                        id="maxDrawdown"
                        type="number"
                        value={riskSettings.maxDrawdownLimit}
                        onChange={(e) =>
                          setRiskSettings({
                            ...riskSettings,
                            maxDrawdownLimit: parseFloat(e.target.value),
                          })
                        }
                        data-testid="input-max-drawdown"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="positionSize">Position Size Limit (%)</Label>
                      <Input
                        id="positionSize"
                        type="number"
                        value={riskSettings.positionSizeLimit}
                        onChange={(e) =>
                          setRiskSettings({
                            ...riskSettings,
                            positionSizeLimit: parseFloat(e.target.value),
                          })
                        }
                        data-testid="input-position-size"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dailyLoss">Daily Loss Limit ($)</Label>
                      <Input
                        id="dailyLoss"
                        type="number"
                        value={riskSettings.dailyLossLimit}
                        onChange={(e) =>
                          setRiskSettings({
                            ...riskSettings,
                            dailyLossLimit: parseFloat(e.target.value),
                          })
                        }
                        data-testid="input-daily-loss"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="varLimit">VaR Limit ($)</Label>
                      <Input
                        id="varLimit"
                        type="number"
                        value={riskSettings.varLimit}
                        onChange={(e) =>
                          setRiskSettings({
                            ...riskSettings,
                            varLimit: parseFloat(e.target.value),
                          })
                        }
                        data-testid="input-var-limit"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxPositions">Max Positions per Symbol</Label>
                      <Input
                        id="maxPositions"
                        type="number"
                        value={riskSettings.maxPositionsPerSymbol}
                        onChange={(e) =>
                          setRiskSettings({
                            ...riskSettings,
                            maxPositionsPerSymbol: parseInt(e.target.value),
                          })
                        }
                        data-testid="input-max-positions"
                      />
                    </div>
                  </div>

                  <Separator />

                  <Button onClick={handleSaveSettings} data-testid="button-save-settings">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Risk Metrics Detail */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Volatility</span>
                        <span className="font-medium" data-testid="text-volatility">
                          {formatPercent(currentMetrics.volatility)}
                        </span>
                      </div>
                      <Progress value={currentMetrics.volatility * 4} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Correlation</span>
                        <span className="font-medium" data-testid="text-correlation">
                          {currentMetrics.correlation?.toFixed(2)}
                        </span>
                      </div>
                      <Progress value={currentMetrics.correlation * 100} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Leverage</span>
                        <span className="font-medium" data-testid="text-leverage">
                          {currentMetrics.leverage?.toFixed(1)}x
                        </span>
                      </div>
                      <Progress value={currentMetrics.leverage * 50} className="h-2" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Exposure</span>
                        <span className="font-medium" data-testid="text-exposure">
                          {formatCurrency(currentMetrics.exposure)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Max Historical Drawdown</span>
                        <span className="font-medium text-loss" data-testid="text-max-drawdown">
                          {formatPercent(currentMetrics.maxDrawdown)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Risk-Adjusted Return</span>
                        <span className="font-medium text-profit" data-testid="text-risk-adjusted-return">
                          8.4%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-300"
                      data-testid={`risk-alert-${alert.id}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {alert.type === "warning" && (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                        {alert.type === "info" && (
                          <Activity className="h-4 w-4 text-primary" />
                        )}
                        {alert.type === "success" && (
                          <CheckCircle className="h-4 w-4 text-profit" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white" data-testid={`alert-message-${alert.id}`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400" data-testid={`alert-time-${alert.id}`}>
                          {alert.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Circuit Breakers</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Market Hours</span>
                    <Badge className="bg-profit text-white">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Position Limits</span>
                    <Badge className="bg-profit text-white">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Volatility Filter</span>
                    <Badge className="bg-profit text-white">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
