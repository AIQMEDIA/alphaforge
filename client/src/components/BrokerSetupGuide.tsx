/*
 * AlphaForge - Quantum Trading Platform
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ExternalLink, AlertTriangle, Info, Zap } from "lucide-react";

interface BrokerSetupGuideProps {
  onDismiss?: () => void;
  showFullGuide?: boolean;
}

export default function BrokerSetupGuide({ onDismiss, showFullGuide = false }: BrokerSetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [brokerConnected, setBrokerConnected] = useState(false);

  // Check broker connection status
  useEffect(() => {
    const checkBrokerStatus = async () => {
      try {
        const response = await fetch('/api/broker/status');
        const data = await response.json();
        setBrokerConnected(data.connected);
      } catch (error) {
        setBrokerConnected(false);
      }
    };
    
    checkBrokerStatus();
    const interval = setInterval(checkBrokerStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      title: "Create Alpaca Account",
      description: "Open a free brokerage account to enable live trading",
      action: "Sign up at alpaca.markets",
      link: "https://alpaca.markets/",
      estimatedTime: "5 minutes",
      status: "pending"
    },
    {
      title: "Account Verification", 
      description: "Complete identity verification and fund with $100",
      action: "Upload documents and transfer funds",
      estimatedTime: "1-3 business days",
      status: "pending"
    },
    {
      title: "Generate API Keys",
      description: "Create paper trading keys first, then live trading keys",
      action: "Copy API keys from Alpaca dashboard",
      estimatedTime: "2 minutes",
      status: "pending"
    },
    {
      title: "Configure AlphaForge",
      description: "Add your API keys to enable quantum trading algorithms",
      action: "Contact support to configure your keys",
      estimatedTime: "5 minutes",
      status: "pending"
    }
  ];

  const completedSteps = brokerConnected ? 4 : 0;
  const progressPercentage = (completedSteps / steps.length) * 100;

  if (!showFullGuide && brokerConnected) {
    return null; // Don't show if broker is already connected
  }

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              {brokerConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {brokerConnected ? "✅ Trading Ready!" : "⚠️ Trading Setup Required"}
              </CardTitle>
              <CardDescription>
                {brokerConnected 
                  ? "Your account is connected and ready for quantum trading"
                  : "Connect a broker account to start live trading with quantum algorithms"
                }
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!brokerConnected && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Setup Progress</span>
                <span>{completedSteps}/{steps.length} Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Why This Matters Alert */}
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Why do I need this?</strong> To trade with real money using quantum algorithms, 
                you need a connected broker account. This is required by financial regulations and 
                enables our IBM Quantum, Google Cirq, and Amazon Braket algorithms to execute real trades.
              </AlertDescription>
            </Alert>

            {/* Quick Start vs Full Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    Start Immediately
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Test quantum algorithms with virtual money while your broker account gets approved.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => window.location.href = '/paper-trading'}
                    data-testid="button-paper-trading"
                  >
                    Start Paper Trading
                  </Button>
                  <Badge variant="secondary" className="w-full justify-center">
                    $100,000 virtual capital
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    Setup Real Trading
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Create broker account for live trading with quantum algorithms.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('https://alpaca.markets/', '_blank')}
                    data-testid="button-create-broker"
                  >
                    Create Alpaca Account
                  </Button>
                  <Badge variant="outline" className="w-full justify-center">
                    $100 minimum
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Steps */}
            {showFullGuide && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Complete Setup Guide:</h4>
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg border">
                    <div className="mt-0.5">
                      {index < completedSteps ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{step.title}</h5>
                        <Badge variant="outline" className="text-xs">
                          {step.estimatedTime}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {step.description}
                      </p>
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        → {step.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Support Contact */}
            <Alert>
              <AlertDescription>
                <strong>Need help?</strong> Our quantum trading specialists can assist with broker setup. 
                Contact support or use the AI assistant for step-by-step guidance.
              </AlertDescription>
            </Alert>
          </>
        )}

        {brokerConnected && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Ready for Quantum Trading!</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your broker account is connected. Start trading with IBM Quantum, Google Cirq, 
                and Amazon Braket algorithms.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.href = '/quantum'}>
                  Start Quantum Trading
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/strategies'}>
                  Create Strategy
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}