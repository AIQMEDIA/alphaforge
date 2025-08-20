import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Play, BarChart3, Database, Zap, Shield } from 'lucide-react';

export default function ArizeDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [observabilityStatus, setObservabilityStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateData = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/observability/generate-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGenerationResult(data);
      } else {
        setError(data.message || 'Data generation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/observability/status');
      const data = await response.json();
      setObservabilityStatus(data);
    } catch (err: any) {
      console.error('Status check failed:', err);
    }
  };

  const runQuickDemo = async () => {
    try {
      const response = await fetch('/api/observability/demo');
      const data = await response.json();
      
      if (data.success) {
        setGenerationResult({
          success: true,
          message: data.message,
          summary: {
            totalOperations: data.traceCount,
            breakdown: {
              basicOperations: data.traceCount
            }
          }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Demo failed');
    }
  };

  // Check status on component mount
  useState(() => {
    checkStatus();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Arize AI Integration Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Generate comprehensive telemetry data to demonstrate Arize AI's observability capabilities with AlphaForge
          </p>
        </div>

        {/* Status Card */}
        {observabilityStatus && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Observability Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Platform</p>
                  <Badge variant={observabilityStatus.hasCredentials ? "default" : "secondary"}>
                    {observabilityStatus.platform}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Service Name</p>
                  <p className="text-sm text-muted-foreground">{observabilityStatus.serviceName}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Credentials</p>
                  <Badge variant={observabilityStatus.hasCredentials ? "default" : "destructive"}>
                    {observabilityStatus.hasCredentials ? "Configured" : "Missing"}
                  </Badge>
                </div>
              </div>
              
              {!observabilityStatus.hasCredentials && (
                <Alert>
                  <AlertDescription>
                    Add ARIZE_API_KEY, ARIZE_SPACE_ID, and ARIZE_ENDPOINT_URL to your environment variables to enable cloud integration.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Generation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Comprehensive Data Generation */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Comprehensive Dataset
              </CardTitle>
              <CardDescription>
                Generate 150+ realistic operations across all AlphaForge features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>15 User Authentications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>25 Trade Executions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>12 Quantum Operations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>18 Fraud Detections</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>35 Market Data Requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>40 Chat Interactions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>8 Backtest Runs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>Real Performance Data</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={generateData} 
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating Data...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Generate Comprehensive Data
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Demo */}
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Quick Demo
              </CardTitle>
              <CardDescription>
                Run a basic observability demo with 8 sample operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p>Perfect for initial testing and verification:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Sample trade execution</li>
                  <li>Quantum optimization demo</li>
                  <li>Fraud detection example</li>
                  <li>Market data request</li>
                  <li>Chat interaction sample</li>
                </ul>
              </div>
              
              <Button 
                onClick={runQuickDemo}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Run Quick Demo
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {generationResult && (
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                Data Generation Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  {generationResult.message}
                </AlertDescription>
              </Alert>
              
              {generationResult.summary && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {generationResult.summary.totalOperations}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Operations</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {generationResult.summary.breakdown.tradeExecutions || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">Trade Executions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {generationResult.summary.breakdown.quantumOperations || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">Quantum Operations</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {generationResult.summary.breakdown.chatInteractions || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">Chat Interactions</p>
                    </div>
                  </div>
                  
                  {generationResult.arizeInstructions && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-semibold mb-2">Next Steps for Arize AI:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>{generationResult.arizeInstructions.step1}</li>
                        <li>{generationResult.arizeInstructions.step2}</li>
                        <li>{generationResult.arizeInstructions.step3}</li>
                        <li>{generationResult.arizeInstructions.step4}</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use This Data with Arize AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Setup Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Arize AI account with API access</li>
                  <li>Environment variables configured</li>
                  <li>Service name: AlphaForge-Trading-Platform</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What You'll See:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Real-time trace data and performance metrics</li>
                  <li>Service topology and dependency mapping</li>
                  <li>Latency analysis and error tracking</li>
                  <li>Business intelligence dashboards</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}