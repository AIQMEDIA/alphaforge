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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Atom, 
  Zap, 
  Target, 
  TrendingUp, 
  Brain,
  Shield,
  Cpu,
  BarChart3,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Settings
} from "lucide-react";

enum QuantumAlgorithm {
  VQE = 'VQE',
  QAOA = 'QAOA', 
  QUANTUM_SVM = 'QUANTUM_SVM',
  QIRO = 'QIRO'
}

enum QuantumProvider {
  IBM_QUANTUM = 'IBM_QUANTUM',
  GOOGLE_CIRQ = 'GOOGLE_CIRQ', 
  AMAZON_BRAKET = 'AMAZON_BRAKET'
}

export default function QuantumOptimization() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for quantum optimization
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<QuantumAlgorithm>(QuantumAlgorithm.VQE);
  const [riskTolerance, setRiskTolerance] = useState([0.5]);
  const [budget, setBudget] = useState("100000");
  const [optimizationRunning, setOptimizationRunning] = useState(false);
  const [assets, setAssets] = useState([
    { symbol: "AAPL", expectedReturn: 0.12, weight: 0 },
    { symbol: "GOOGL", expectedReturn: 0.15, weight: 0 },
    { symbol: "MSFT", expectedReturn: 0.10, weight: 0 },
    { symbol: "TSLA", expectedReturn: 0.18, weight: 0 }
  ]);

  // Query quantum status
  const { data: quantumStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/quantum/status"],
    enabled: isAuthenticated,
  });

  // Portfolio optimization mutation
  const optimizationMutation = useMutation({
    mutationFn: async (params: any) => {
      setOptimizationRunning(true);
      const response = await apiRequest("POST", "/api/quantum/optimize-portfolio", params);
      return response.json();
    },
    onSuccess: (result) => {
      setOptimizationRunning(false);
      
      // Update asset weights with quantum results
      if (result.optimalWeights) {
        const updatedAssets = assets.map((asset, index) => ({
          ...asset,
          weight: result.optimalWeights[index] || 0
        }));
        setAssets(updatedAssets);
      }

      toast({
        title: "Quantum Optimization Complete",
        description: result.quantumAdvantage 
          ? `Achieved quantum advantage! Sharpe ratio: ${result.sharpeRatio?.toFixed(3)}`
          : "Completed with classical fallback",
      });
    },
    onError: (error) => {
      setOptimizationRunning(false);
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
        title: "Optimization Failed", 
        description: "Failed to run quantum optimization",
        variant: "destructive",
      });
    },
  });

  // Market prediction mutation
  const predictionMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest("POST", "/api/quantum/market-prediction", params);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Quantum Prediction Complete",
        description: `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
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

  const runOptimization = () => {
    // Create covariance matrix (simplified for demo)
    const covarianceMatrix = [
      [0.05, 0.02, 0.01, 0.03],
      [0.02, 0.06, 0.02, 0.04], 
      [0.01, 0.02, 0.04, 0.02],
      [0.03, 0.04, 0.02, 0.05]
    ];

    optimizationMutation.mutate({
      assets,
      covarianceMatrix,
      riskTolerance: riskTolerance[0],
      budget: parseFloat(budget),
      algorithm: selectedAlgorithm
    });
  };

  const runMarketPrediction = () => {
    // Mock historical data
    const historicalData = Array.from({ length: 100 }, () => 
      Array.from({ length: 4 }, () => Math.random() * 0.1 - 0.05)
    );
    
    predictionMutation.mutate({
      historicalData,
      features: assets.map(a => a.symbol)
    });
  };

  const getAlgorithmDescription = (algorithm: QuantumAlgorithm) => {
    const descriptions = {
      [QuantumAlgorithm.VQE]: "Variational Quantum Eigensolver - Hybrid quantum-classical optimization",
      [QuantumAlgorithm.QAOA]: "Quantum Approximate Optimization Algorithm - Specialized for combinatorial problems",
      [QuantumAlgorithm.QUANTUM_SVM]: "Quantum Support Vector Machine - Quantum machine learning for classification",
      [QuantumAlgorithm.QIRO]: "Quantum-Informed Recursive Optimization - Advanced constraint handling"
    };
    return descriptions[algorithm];
  };

  const getTotalWeight = () => assets.reduce((sum, asset) => sum + asset.weight, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-16 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <Atom className="h-8 w-8 text-purple-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Quantum Optimization
                </h1>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Next-Gen AI
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Leverage quantum computing for portfolio optimization, risk analysis, and market predictions
              </p>
            </div>

            {/* Quantum Status */}
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cpu className="h-5 w-5" />
                    <span>Quantum Computing Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quantumStatus?.providers?.map((provider: any) => (
                      <div key={provider.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{provider.name}</p>
                          <p className="text-sm text-gray-500">
                            {provider.available ? "Ready" : "Setup Required"}
                          </p>
                        </div>
                        {provider.available ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {quantumStatus?.recommendedSetup && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        <strong>Setup Required:</strong> {quantumStatus.recommendedSetup}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="portfolio" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="portfolio" data-testid="tab-portfolio">
                  Portfolio Optimization
                </TabsTrigger>
                <TabsTrigger value="prediction" data-testid="tab-prediction">
                  Market Prediction
                </TabsTrigger>
                <TabsTrigger value="risk" data-testid="tab-risk">
                  Risk Analysis
                </TabsTrigger>
              </TabsList>

              {/* Portfolio Optimization Tab */}
              <TabsContent value="portfolio" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuration Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Optimization Settings</span>
                      </CardTitle>
                      <CardDescription>
                        Configure quantum algorithms and risk parameters
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Algorithm Selection */}
                      <div>
                        <Label>Quantum Algorithm</Label>
                        <Select value={selectedAlgorithm} onValueChange={(value) => setSelectedAlgorithm(value as QuantumAlgorithm)}>
                          <SelectTrigger data-testid="select-algorithm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(QuantumAlgorithm).map((alg) => (
                              <SelectItem key={alg} value={alg}>
                                {alg}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                          {getAlgorithmDescription(selectedAlgorithm)}
                        </p>
                      </div>

                      {/* Risk Tolerance */}
                      <div>
                        <Label>Risk Tolerance: {riskTolerance[0].toFixed(2)}</Label>
                        <Slider
                          value={riskTolerance}
                          onValueChange={setRiskTolerance}
                          max={1}
                          min={0}
                          step={0.01}
                          className="mt-2"
                          data-testid="slider-risk-tolerance"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Conservative</span>
                          <span>Aggressive</span>
                        </div>
                      </div>

                      {/* Budget */}
                      <div>
                        <Label htmlFor="budget">Portfolio Budget ($)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          data-testid="input-budget"
                        />
                      </div>

                      {/* Run Optimization */}
                      <Button 
                        onClick={runOptimization}
                        disabled={optimizationRunning}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        data-testid="button-optimize"
                      >
                        {optimizationRunning ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Run Quantum Optimization
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Results Panel */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Optimization Results</span>
                      </CardTitle>
                      <CardDescription>
                        Quantum-optimized portfolio allocation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {assets.map((asset, index) => (
                          <div key={asset.symbol} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{asset.symbol}</span>
                              <span className="text-sm text-gray-500">
                                {(asset.weight * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={asset.weight * 100} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Expected Return: {(asset.expectedReturn * 100).toFixed(1)}%</span>
                              <span>
                                Amount: ${((asset.weight * parseFloat(budget)) || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        <div className="pt-4 border-t">
                          <div className="flex justify-between font-medium">
                            <span>Total Allocation:</span>
                            <span>{(getTotalWeight() * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Market Prediction Tab */}
              <TabsContent value="prediction" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>Quantum Market Prediction</span>
                    </CardTitle>
                    <CardDescription>
                      Use quantum machine learning for market forecasting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Quantum Support Vector Machines can analyze complex market patterns 
                        that classical algorithms might miss.
                      </p>
                      
                      <Button
                        onClick={runMarketPrediction}
                        disabled={predictionMutation.isPending}
                        data-testid="button-predict"
                      >
                        {predictionMutation.isPending ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Predicting...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Run Quantum Prediction
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Risk Analysis Tab */}
              <TabsContent value="risk" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Quantum Risk Analysis</span>
                    </CardTitle>
                    <CardDescription>
                      Advanced risk calculations using quantum Monte Carlo methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Quantum algorithms can perform risk calculations exponentially 
                        faster than classical methods for complex portfolios.
                      </p>
                      
                      <Button variant="outline" data-testid="button-risk-analysis">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Run Risk Analysis
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