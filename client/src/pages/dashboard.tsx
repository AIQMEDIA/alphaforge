import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { RiskMetrics } from "@/components/dashboard/risk-metrics";
import { ActiveStrategies } from "@/components/dashboard/active-strategies";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";
import { ObservabilityStatus } from "@/components/dashboard/observability-status";
import { FloatingAiButton } from "@/components/ui/floating-ai-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Download, Settings, History, FileDown, Activity, CheckCircle, MessageSquare, Bot } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const { data: portfolioData, isLoading: portfolioLoading, error } = useQuery<any>({
    queryKey: ["/api/portfolio"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAuthenticated,
  });

  // Redirect if not authenticated
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

  // Handle API errors
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

  // Mock data when portfolio data is not available
  const mockPortfolioData = {
    portfolioValue: 127450.32,
    positions: [],
    recentTransactions: [],
    riskMetrics: {
      maxDrawdown: -5.2,
      var95: -2150,
      beta: 0.74,
      volatility: 12.3
    }
  };

  const data = portfolioData || mockPortfolioData;
  const totalPnL = 15678.90; // Mock P&L
  const activeStrategiesCount = 8;
  const sharpeRatio = 1.86;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Portfolio Overview
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Real-time performance and analytics powered by Arize AI observability
                </p>
              </div>
              <div className="flex space-x-3">
                <Link href="/strategies">
                  <Button data-testid="button-new-strategy">
                    <Plus className="h-4 w-4 mr-2" />
                    New Strategy
                  </Button>
                </Link>
                <Button variant="outline" data-testid="button-export-report">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* AI Assistant Quick Access */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        AI Trading Assistant
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Get intelligent insights, strategy recommendations, and quantum-powered analysis
                      </p>
                    </div>
                  </div>
                  <Link href="/quantum-assistant">
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6"
                      data-testid="button-chat-ai"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Overview Cards */}
            <PortfolioOverview
              portfolioValue={data.portfolioValue}
              totalPnL={totalPnL}
              activeStrategies={activeStrategiesCount}
              sharpeRatio={sharpeRatio}
            />
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <PerformanceChart userId={user?.id || ""} />
            <RiskMetrics
              maxDrawdown={data.riskMetrics?.maxDrawdown}
              var95={data.riskMetrics?.var95}
              beta={data.riskMetrics?.beta}
              volatility={data.riskMetrics?.volatility}
            />
          </div>

          {/* Strategies and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ActiveStrategies />
            <RecentActivity />
          </div>

          {/* Enterprise Features */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ObservabilityStatus />
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quantum Computing</h3>
                    <p className="text-sm text-muted-foreground">IBM, Google, Amazon</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Advanced portfolio optimization using quantum algorithms
                </p>
                <Link href="/quantum">
                  <Button variant="outline" size="sm" className="w-full">
                    Explore Quantum
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Enterprise Security</h3>
                    <p className="text-sm text-muted-foreground">Bank-level protection</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Advanced fraud prevention and institutional security
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Security Details
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Floating AI Assistant */}
          <FloatingAiButton />
          
          {/* Quick Actions Floating Panel */}
          <div className="fixed bottom-6 right-6 z-40">
            <Card className="p-4 shadow-lg">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <Link href="/strategies">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    data-testid="button-quick-new-strategy"
                  >
                    <Plus className="h-4 w-4 mr-2 text-primary" />
                    New Strategy
                  </Button>
                </Link>
                <Link href="/backtesting">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    data-testid="button-quick-backtest"
                  >
                    <History className="h-4 w-4 mr-2 text-secondary" />
                    Run Backtest
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  data-testid="button-quick-export"
                >
                  <FileDown className="h-4 w-4 mr-2 text-accent" />
                  Export Data
                </Button>
              </div>
            </Card>
          </div>

          {/* Upgrade Modal */}
          <UpgradeModal
            open={upgradeModalOpen}
            onOpenChange={setUpgradeModalOpen}
          />
        </main>
      </div>
    </div>
  );
}
