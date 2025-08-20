import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';

interface ObservabilityStatusProps {
  className?: string;
}

export function ObservabilityStatus({ className }: ObservabilityStatusProps) {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/observability/status');
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch observability status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Enterprise Observability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isEnterprise = status?.hasCredentials;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Arize AI Observability
        </CardTitle>
        <CardDescription>
          Enterprise-grade monitoring and analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEnterprise ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
            <span className="text-sm font-medium">
              {status?.platform || 'Local Phoenix'}
            </span>
          </div>
          <Badge variant={isEnterprise ? "default" : "secondary"}>
            {isEnterprise ? "Enterprise" : "Development"}
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isEnterprise 
              ? "Connected to Arize AI cloud platform - trusted by Uber, Flipkart, and 6,000+ developers"
              : "Running in local development mode"
            }
          </p>
          
          {status?.features && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {status.features.slice(0, 4).map((feature: string, index: number) => (
                <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  {feature.replace('tracking', '').replace('monitoring', '').trim()}
                </div>
              ))}
            </div>
          )}
        </div>

        {!isEnterprise && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Upgrade to enterprise Arize AI integration for advanced analytics, 
              ML-powered insights, and enterprise-grade observability.
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('/arize-demo', '_blank')}
            className="flex-1"
          >
            <Activity className="h-4 w-4 mr-1" />
            View Demo
          </Button>
          {isEnterprise && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://app.arize.com', '_blank')}
              className="flex-1"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}