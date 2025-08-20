import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Play, Pause, Trash2, Settings } from "lucide-react";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Strategies() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newStrategyOpen, setNewStrategyOpen] = useState(false);
  const [newStrategy, setNewStrategy] = useState({
    name: "",
    description: "",
    type: "",
    symbols: [] as string[],
    symbolInput: "",
    config: {},
  });

  const { data: strategies = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/strategies"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const createMutation = useMutation({
    mutationFn: async (strategy: any) => {
      await apiRequest("POST", "/api/strategies", strategy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      setNewStrategyOpen(false);
      setNewStrategy({ name: "", description: "", type: "", symbols: [], symbolInput: "", config: {} });
      toast({
        title: "Strategy Created",
        description: "Your new strategy has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create strategy",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      await apiRequest("PUT", `/api/strategies/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      toast({
        title: "Strategy Updated",
        description: "Strategy status has been updated.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/strategies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      toast({
        title: "Strategy Deleted",
        description: "The strategy has been deleted successfully.",
      });
    },
  });

  const handleCreateStrategy = () => {
    createMutation.mutate({
      ...newStrategy,
      config: { 
        rsiPeriod: 14,
        buyThreshold: 30,
        sellThreshold: 70 
      }
    });
  };

  const toggleStrategy = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "running" ? "paused" : "running";
    updateMutation.mutate({ id, updates: { status: newStatus } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-profit text-white";
      case "paused":
        return "bg-warning text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPerformanceColor = (performance: number) => {
    return performance > 0 ? "text-profit" : performance < 0 ? "text-loss" : "text-gray-600";
  };

  // Mock data when no strategies exist
  const mockStrategies = [
    {
      id: "1",
      name: "Momentum RSI",
      description: "RSI-based momentum strategy",
      type: "technical",
      status: "running",
      performance: "3.2",
      totalReturn: "1200.50",
      maxDrawdown: "-0.08",
      sharpeRatio: "1.4"
    },
    {
      id: "2", 
      name: "Mean Reversion",
      description: "Statistical arbitrage strategy",
      type: "statistical",
      status: "running",
      performance: "1.8",
      totalReturn: "890.25",
      maxDrawdown: "-0.05",
      sharpeRatio: "1.2"
    },
    {
      id: "3",
      name: "Pairs Trading",
      description: "Market neutral pairs strategy",
      type: "pairs",
      status: "paused",
      performance: "0.5",
      totalReturn: "150.00",
      maxDrawdown: "-0.12",
      sharpeRatio: "0.8"
    }
  ];

  const displayStrategies = strategies?.length > 0 ? strategies : mockStrategies;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Trading Strategies
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Create, manage, and monitor your trading strategies
              </p>
            </div>
            <Dialog open={newStrategyOpen} onOpenChange={setNewStrategyOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-strategy">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Strategy
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="modal-create-strategy">
                <DialogHeader>
                  <DialogTitle>Create New Strategy</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Strategy Name</Label>
                    <Input
                      id="name"
                      value={newStrategy.name}
                      onChange={(e) =>
                        setNewStrategy({ ...newStrategy, name: e.target.value })
                      }
                      placeholder="Enter strategy name"
                      data-testid="input-strategy-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newStrategy.description}
                      onChange={(e) =>
                        setNewStrategy({ ...newStrategy, description: e.target.value })
                      }
                      placeholder="Describe your strategy"
                      data-testid="input-strategy-description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Strategy Type</Label>
                    <Select
                      value={newStrategy.type}
                      onValueChange={(value) =>
                        setNewStrategy({ ...newStrategy, type: value })
                      }
                    >
                      <SelectTrigger data-testid="select-strategy-type">
                        <SelectValue placeholder="Select strategy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Analysis</SelectItem>
                        <SelectItem value="statistical">Statistical Arbitrage</SelectItem>
                        <SelectItem value="momentum">Momentum</SelectItem>
                        <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                        <SelectItem value="pairs">Pairs Trading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="symbols">Trading Symbols</Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          id="symbols"
                          value={newStrategy.symbolInput}
                          onChange={(e) =>
                            setNewStrategy({ ...newStrategy, symbolInput: e.target.value.toUpperCase() })
                          }
                          placeholder="Enter symbols (e.g., AAPL, MSFT)"
                          data-testid="input-strategy-symbols"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (newStrategy.symbolInput.trim()) {
                              const symbols = newStrategy.symbolInput.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
                              const uniqueSymbols = Array.from(new Set([...newStrategy.symbols, ...symbols]));
                              setNewStrategy({ 
                                ...newStrategy, 
                                symbols: uniqueSymbols,
                                symbolInput: ""
                              });
                            }
                          }}
                          data-testid="button-add-symbols"
                        >
                          Add
                        </Button>
                      </div>
                      {newStrategy.symbols.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newStrategy.symbols.map((symbol, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {symbol}
                              <button
                                type="button"
                                onClick={() => {
                                  setNewStrategy({
                                    ...newStrategy,
                                    symbols: newStrategy.symbols.filter((_, i) => i !== index)
                                  });
                                }}
                                className="ml-1 text-xs hover:text-red-600"
                                data-testid={`button-remove-symbol-${symbol}`}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Popular: AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCreateStrategy}
                      disabled={createMutation.isPending || !newStrategy.name || !newStrategy.type}
                      data-testid="button-submit-strategy"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Strategy"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setNewStrategyOpen(false)}
                      data-testid="button-cancel-strategy"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 dark:bg-dark-300 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-dark-300 rounded"></div>
                      <div className="h-3 bg-gray-200 dark:bg-dark-300 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayStrategies.map((strategy: any) => (
                <Card key={strategy.id} className="hover:shadow-lg transition-shadow" data-testid={`strategy-card-${strategy.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg" data-testid={`strategy-name-${strategy.id}`}>
                        {strategy.name}
                      </CardTitle>
                      <Badge className={getStatusColor(strategy.status)} data-testid={`strategy-status-${strategy.id}`}>
                        {strategy.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`strategy-description-${strategy.id}`}>
                      {strategy.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Performance (7d):</span>
                        <span className={getPerformanceColor(parseFloat(strategy.performance))} data-testid={`strategy-performance-${strategy.id}`}>
                          {parseFloat(strategy.performance) > 0 ? '+' : ''}{strategy.performance}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Return:</span>
                        <span className="font-medium" data-testid={`strategy-return-${strategy.id}`}>
                          ${strategy.totalReturn}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Max Drawdown:</span>
                        <span className="text-loss" data-testid={`strategy-drawdown-${strategy.id}`}>
                          {(parseFloat(strategy.maxDrawdown) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                        <span className="font-medium" data-testid={`strategy-sharpe-${strategy.id}`}>
                          {strategy.sharpeRatio}
                        </span>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant={strategy.status === "running" ? "secondary" : "default"}
                          onClick={() => toggleStrategy(strategy.id, strategy.status)}
                          disabled={updateMutation.isPending}
                          data-testid={`button-toggle-${strategy.id}`}
                        >
                          {strategy.status === "running" ? (
                            <>
                              <Pause className="h-3 w-3 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-settings-${strategy.id}`}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(strategy.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${strategy.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
