import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Link } from "wouter";

export function ActiveStrategies() {
  const { data: strategies = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/strategies"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-dark-300 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeStrategies = strategies?.filter((s: any) => s.status === 'running') || [];
  const mockStrategies = [
    { id: '1', name: 'Momentum RSI', type: 'Technical Analysis', performance: 3.2, status: 'running' },
    { id: '2', name: 'Mean Reversion', type: 'Statistical Arbitrage', performance: 1.8, status: 'running' },
    { id: '3', name: 'Pairs Trading', type: 'Market Neutral', performance: 0, status: 'paused' }
  ];

  const displayStrategies = activeStrategies.length > 0 ? activeStrategies : mockStrategies;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active Strategies</CardTitle>
        <Link href="/strategies">
          <Button variant="ghost" size="sm" data-testid="button-view-all-strategies">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayStrategies.slice(0, 3).map((strategy: any) => (
            <div
              key={strategy.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-300 rounded-lg"
              data-testid={`strategy-${strategy.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  strategy.status === 'running' ? 'bg-profit' : 'bg-warning'
                }`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white" data-testid={`text-strategy-name-${strategy.id}`}>
                    {strategy.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400" data-testid={`text-strategy-type-${strategy.id}`}>
                    {strategy.type}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {strategy.status === 'running' ? (
                  <>
                    <p className="text-sm font-medium text-profit" data-testid={`text-strategy-performance-${strategy.id}`}>
                      +{strategy.performance?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">7d</p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400" data-testid={`text-strategy-status-${strategy.id}`}>
                    Paused
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
