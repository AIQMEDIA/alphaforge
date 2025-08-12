import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Settings as SettingsIcon, 
  Link as LinkIcon, 
  Unlink, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Database,
  Shield,
  User
} from "lucide-react";

export default function Settings() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paperTradingMode, setPaperTradingMode] = useState(true);

  // Broker connection status
  const { data: brokerStatus, isLoading: brokerLoading } = useQuery({
    queryKey: ["/api/trading/brokers"],
    enabled: isAuthenticated,
  });

  // Market data providers status
  const { data: marketDataStatus, isLoading: marketDataLoading } = useQuery({
    queryKey: ["/api/market-data/providers"],
    enabled: isAuthenticated,
  });

  // Account information
  const { data: accountInfo, isLoading: accountLoading } = useQuery({
    queryKey: ["/api/trading/account"],
    enabled: isAuthenticated,
  });

  // Switch broker mutation
  const switchBrokerMutation = useMutation({
    mutationFn: async (broker: string) => {
      const response = await apiRequest("POST", "/api/trading/broker", { broker });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Broker Updated",
        description: "Successfully switched broker connection",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trading/brokers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trading/account"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
        title: "Error",
        description: "Failed to switch broker connection",
        variant: "destructive",
      });
    },
  });

  // Switch market data provider mutation
  const switchProviderMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await apiRequest("POST", "/api/market-data/provider", { provider });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Provider Updated",
        description: "Successfully switched market data provider",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/market-data/providers"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
        title: "Error",
        description: "Failed to switch market data provider",
        variant: "destructive",
      });
    },
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

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (connected: boolean) => {
    return (
      <Badge variant={connected ? "default" : "destructive"}>
        {connected ? "Connected" : "Disconnected"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-16 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <SettingsIcon className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Settings
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your trading accounts, data providers, and platform preferences
              </p>
            </div>

            <Tabs defaultValue="brokers" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="brokers" data-testid="tab-brokers">
                  Broker Accounts
                </TabsTrigger>
                <TabsTrigger value="data" data-testid="tab-data">
                  Market Data
                </TabsTrigger>
                <TabsTrigger value="trading" data-testid="tab-trading">
                  Trading Settings
                </TabsTrigger>
                <TabsTrigger value="profile" data-testid="tab-profile">
                  Profile
                </TabsTrigger>
              </TabsList>

              {/* Broker Accounts Tab */}
              <TabsContent value="brokers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <LinkIcon className="h-5 w-5" />
                      <span>Broker Account Connection</span>
                    </CardTitle>
                    <CardDescription>
                      Connect your broker account to enable live trading. Paper trading is always available.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Broker Status */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(brokerStatus?.connected || false)}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Current Broker: {brokerStatus?.current || "None"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {brokerStatus?.connected ? "Account connected and verified" : "No broker account connected"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(brokerStatus?.connected || false)}
                    </div>

                    {/* Broker Selection */}
                    <div className="space-y-4">
                      <Label htmlFor="broker-select">Select Broker</Label>
                      <Select
                        value={brokerStatus?.current || ""}
                        onValueChange={(value) => switchBrokerMutation.mutate(value)}
                        disabled={switchBrokerMutation.isPending}
                      >
                        <SelectTrigger id="broker-select" data-testid="select-broker">
                          <SelectValue placeholder="Choose a broker" />
                        </SelectTrigger>
                        <SelectContent>
                          {(brokerStatus?.available || []).map((broker: string) => (
                            <SelectItem key={broker} value={broker}>
                              {broker}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Account Information */}
                    {accountInfo && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-dark-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Type</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-account-type">
                            {(accountInfo as any)?.account_type || "Paper Trading"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Buying Power</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-buying-power">
                            ${parseFloat((accountInfo as any)?.buying_power || "100000").toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Value</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-portfolio-value">
                            ${parseFloat((accountInfo as any)?.portfolio_value || "100000").toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Setup Instructions */}
                    <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                            Setting Up Your Broker Account
                          </h4>
                          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            <p>1. Sign up with a supported broker (Alpaca Markets recommended)</p>
                            <p>2. Get your API keys from the broker dashboard</p>
                            <p>3. Add the API keys to your Replit Secrets</p>
                            <p>4. Select the broker from the dropdown above</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Market Data Tab */}
              <TabsContent value="data" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5" />
                      <span>Market Data Providers</span>
                    </CardTitle>
                    <CardDescription>
                      Configure your market data sources for real-time quotes and historical data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Provider Status */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon((marketDataStatus as any)?.status?.[(marketDataStatus as any)?.current] || false)}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Current Provider: {(marketDataStatus as any)?.current || "None"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {(marketDataStatus as any)?.status?.[(marketDataStatus as any)?.current] 
                              ? "Provider connected and working" 
                              : "Provider not configured or having issues"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge((marketDataStatus as any)?.status?.[(marketDataStatus as any)?.current] || false)}
                    </div>

                    {/* Provider Selection */}
                    <div className="space-y-4">
                      <Label htmlFor="provider-select">Select Market Data Provider</Label>
                      <Select
                        value={(marketDataStatus as any)?.current || ""}
                        onValueChange={(value) => switchProviderMutation.mutate(value)}
                        disabled={switchProviderMutation.isPending}
                      >
                        <SelectTrigger id="provider-select" data-testid="select-provider">
                          <SelectValue placeholder="Choose a provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {((marketDataStatus as any)?.available || []).map((provider: string) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Provider Status Grid */}
                    {(marketDataStatus as any)?.status && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries((marketDataStatus as any).status).map(([provider, status]) => (
                          <div key={provider} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">{provider}</h4>
                              {getStatusIcon(status as boolean)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {status ? "API key configured and working" : "API key missing or invalid"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trading Settings Tab */}
              <TabsContent value="trading" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Trading Preferences</span>
                    </CardTitle>
                    <CardDescription>
                      Configure your trading mode and risk management settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Paper Trading Mode */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="paper-trading" className="text-base font-medium">
                          Paper Trading Mode
                        </Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Use virtual money for risk-free strategy testing
                        </p>
                      </div>
                      <Switch
                        id="paper-trading"
                        checked={paperTradingMode}
                        onCheckedChange={setPaperTradingMode}
                        data-testid="switch-paper-trading"
                      />
                    </div>

                    {/* Risk Management Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">Risk Management</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="max-position">Max Position Size (%)</Label>
                          <Input
                            id="max-position"
                            type="number"
                            placeholder="10"
                            data-testid="input-max-position"
                          />
                        </div>
                        <div>
                          <Label htmlFor="stop-loss">Default Stop Loss (%)</Label>
                          <Input
                            id="stop-loss"
                            type="number"
                            placeholder="5"
                            data-testid="input-stop-loss"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <CardDescription>
                      Manage your account information and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {user && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={user.email || ""}
                            disabled
                            data-testid="input-email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="first-name">First Name</Label>
                          <Input
                            id="first-name"
                            value={user.firstName || ""}
                            data-testid="input-first-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input
                            id="last-name"
                            value={user.lastName || ""}
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      <Button className="w-full md:w-auto" data-testid="button-save-profile">
                        Save Profile Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}