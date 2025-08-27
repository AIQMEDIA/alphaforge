/*
 * AlphaForge - Quantum Trading Platform
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, Info, Star } from "lucide-react";

export default function BrokerFlexibilityInfo() {
  const supportedBrokers = [
    {
      name: "Alpaca Markets",
      recommended: true,
      features: ["Commission-free trading", "Excellent API", "Paper trading", "Real-time data"],
      url: "https://alpaca.markets/",
      description: "Perfect for algorithmic trading with quantum algorithms"
    },
    {
      name: "Interactive Brokers",
      recommended: false,
      features: ["Global markets", "Low margin rates", "Professional tools", "Institutional grade"],
      url: "https://www.interactivebrokers.com/",
      description: "Ideal for professional traders and international markets"
    },
    {
      name: "TD Ameritrade",
      recommended: false,
      features: ["Research tools", "Educational resources", "Options trading", "Mobile app"],
      url: "https://www.tdameritrade.com/",
      description: "Great for traders who want comprehensive research"
    },
    {
      name: "E*TRADE",
      recommended: false,
      features: ["User-friendly platform", "Options specialist", "Banking services", "Mobile trading"],
      url: "https://us.etrade.com/",
      description: "Excellent for options strategies and mobile trading"
    }
  ];

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Broker Flexibility:</strong> AlphaForge works with multiple licensed brokers. 
          Choose the one that best fits your trading style and needs.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supportedBrokers.map((broker) => (
          <Card key={broker.name} className={`${broker.recommended ? 'border-green-300 bg-green-50 dark:bg-green-950' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {broker.name}
                  {broker.recommended && (
                    <Badge className="bg-green-100 text-green-700">
                      <Star className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </CardTitle>
              </div>
              <CardDescription>{broker.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Key Features:</h4>
                <ul className="space-y-1">
                  {broker.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => window.open(broker.url, '_blank')}
                  className={broker.recommended ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit Website
                </Button>
                {!broker.recommended && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open('mailto:support@alpha-forge.io?subject=Custom Broker Integration Request&body=I would like to use ' + broker.name + ' with AlphaForge.', '_blank')}
                  >
                    Request Setup
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
        <Info className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <strong>Custom Integration:</strong> Don't see your preferred broker? Contact our support team. 
          We can integrate with any licensed broker that provides API access for automated trading.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Why We Recommend Alpaca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-600 dark:text-gray-300">
            While you can use any broker, we recommend Alpaca because:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span><strong>Zero commissions</strong> maximize your quantum algorithm profits</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span><strong>Superior API</strong> ensures reliable quantum strategy execution</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span><strong>Paper trading</strong> lets you test algorithms risk-free</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span><strong>Fastest setup</strong> gets you trading quantum strategies immediately</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}