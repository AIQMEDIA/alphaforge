/*
 * AlphaForge - Quantum Trading Platform
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 */

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ExternalLink, Info, X } from "lucide-react";

interface SmartBrokerAlertProps {
  className?: string;
}

export default function SmartBrokerAlert({ className = "" }: SmartBrokerAlertProps) {
  const [brokerConnected, setBrokerConnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBrokerStatus = async () => {
      try {
        const response = await fetch('/api/broker/status');
        const data = await response.json();
        setBrokerConnected(data.connected);
      } catch (error) {
        setBrokerConnected(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkBrokerStatus();
  }, []);

  // Don't show if loading, already connected, or manually dismissed
  if (loading || brokerConnected || dismissed) {
    return null;
  }

  return (
    <div className={className}>
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <div className="flex items-center justify-between w-full">
          <div className="flex-1">
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <div className="flex items-center justify-between mb-2">
                <strong>Trading Setup Required</strong>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDismissed(true)}
                  className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="mb-3">
                To use quantum algorithms with real money, connect a broker account. 
                We recommend Alpaca, but you can use your preferred broker.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = '/paper-trading'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Start Paper Trading
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open('https://alpaca.markets/', '_blank')}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Setup Real Account
                </Button>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}