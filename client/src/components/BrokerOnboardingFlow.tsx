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
import { 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  AlertTriangle, 
  Info, 
  Zap,
  Clock,
  DollarSign,
  Key,
  Shield
} from "lucide-react";

export default function BrokerOnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [brokerConnected, setBrokerConnected] = useState(false);

  useEffect(() => {
    const checkBrokerStatus = async () => {
      try {
        const response = await fetch('/api/broker/status');
        const data = await response.json();
        setBrokerConnected(data.connected);
        if (data.connected) {
          setCurrentStep(4); // All steps complete
        }
      } catch (error) {
        setBrokerConnected(false);
      }
    };
    
    checkBrokerStatus();
  }, []);

  const steps = [
    {
      id: 0,
      title: "Create Alpaca Account",
      description: "Sign up for a free trading account",
      icon: <ExternalLink className="h-5 w-5" />,
      estimatedTime: "5 minutes",
      instructions: [
        "Visit alpaca.markets and click 'Get Started'",
        "Choose 'Individual Account' for personal trading",
        "Complete the application with your information",
        "Upload required documents (ID, address proof)"
      ],
      actionUrl: "https://alpaca.markets/",
      actionText: "Open Alpaca Website"
    },
    {
      id: 1,
      title: "Account Verification",
      description: "Complete identity verification and funding",
      icon: <Shield className="h-5 w-5" />,
      estimatedTime: "1-3 business days",
      instructions: [
        "Alpaca will review your application",
        "You'll receive approval via email",
        "Link your bank account for funding",
        "Transfer at least $100 to start trading"
      ],
      tips: "Most accounts are approved within 24 hours on business days"
    },
    {
      id: 2,
      title: "Generate API Keys",
      description: "Create paper and live trading API keys",
      icon: <Key className="h-5 w-5" />,
      estimatedTime: "3 minutes",
      instructions: [
        "Log into your Alpaca dashboard",
        "Navigate to 'Paper Trading' section",
        "Generate paper trading API keys first",
        "Later generate live trading keys when ready"
      ],
      warning: "Keep your API keys secure - never share them publicly"
    },
    {
      id: 3,
      title: "Connect to AlphaForge",
      description: "Configure your API keys in AlphaForge",
      icon: <Zap className="h-5 w-5" />,
      estimatedTime: "2 minutes",
      instructions: [
        "Contact AlphaForge support with your API keys",
        "Our team will securely configure your account",
        "We'll enable paper trading first for testing",
        "Switch to live trading once you're comfortable"
      ],
      ctaText: "Contact Support to Configure"
    }
  ];

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  if (brokerConnected) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-800 dark:text-green-200">
                ✅ Trading Ready!
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-300">
                Your Alpaca broker account is connected and ready for quantum trading
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              onClick={() => window.location.href = '/quantum'}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Quantum Trading
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/strategies'}
            >
              Create Strategy
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Complete Broker Setup for Live Trading
          </CardTitle>
          <CardDescription>
            Connect your Alpaca account to enable quantum trading algorithms with real money
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Setup Progress</span>
            <span>{currentStep + 1}/{steps.length} Steps Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = '/paper-trading'}
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Paper Trading Now
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://alpaca.markets/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Create Alpaca Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card 
            key={step.id}
            className={`transition-all ${
              index === currentStep 
                ? 'border-blue-300 shadow-lg' 
                : index < currentStep 
                  ? 'border-green-300 bg-green-50 dark:bg-green-950' 
                  : 'border-gray-200'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentStep 
                      ? 'bg-green-100 text-green-600' 
                      : index === currentStep 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Step {index + 1}: {step.title}
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {step.estimatedTime}
                  </Badge>
                  {index < currentStep && (
                    <Badge className="bg-green-100 text-green-700">Complete</Badge>
                  )}
                  {index === currentStep && (
                    <Badge className="bg-blue-100 text-blue-700">Current</Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            {index <= currentStep && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">What to do:</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    {step.instructions.map((instruction, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Circle className="h-3 w-3 mt-1 text-gray-400" />
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>

                {step.warning && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Important:</strong> {step.warning}
                    </AlertDescription>
                  </Alert>
                )}

                {step.tips && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Tip:</strong> {step.tips}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  {step.actionUrl && (
                    <Button 
                      onClick={() => window.open(step.actionUrl, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {step.actionText}
                    </Button>
                  )}
                  
                  {step.ctaText && (
                    <Button 
                      onClick={() => window.open('mailto:support@alpha-forge.io?subject=Alpaca API Key Configuration', '_blank')}
                      variant="outline"
                    >
                      {step.ctaText}
                    </Button>
                  )}

                  {index < steps.length - 1 && (
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentStep(index + 1)}
                    >
                      Mark Complete & Continue
                    </Button>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Why This Matters */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Why connect a broker?</strong> AlphaForge's quantum algorithms need a licensed broker 
          to execute real trades. We recommend Alpaca for commission-free trading and excellent API integration, 
          but you can use your preferred broker. You can start with paper trading (virtual money) 
          and switch to live trading when ready.
        </AlertDescription>
      </Alert>

      {/* Broker Flexibility Notice */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Use Your Preferred Broker:</strong> While we feature Alpaca for its excellent API and 
          commission-free trading, AlphaForge works with multiple brokers. Contact support if you prefer 
          Interactive Brokers, TD Ameritrade, E*TRADE, or another licensed broker.
        </AlertDescription>
      </Alert>
    </div>
  );
}