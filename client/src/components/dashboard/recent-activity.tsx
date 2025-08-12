import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { TrendingUp, TrendingDown, Settings, Shield } from "lucide-react";

export function RecentActivity() {
  const { data: transactions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions", { limit: 10 }],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-dark-300 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 dark:bg-dark-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-dark-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock activity data when no real transactions
  const mockActivities = [
    {
      id: '1',
      type: 'transaction',
      action: 'BUY',
      symbol: 'AAPL',
      quantity: 100,
      price: 175.32,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      id: '2',
      type: 'transaction',
      action: 'SELL',
      symbol: 'TSLA',
      quantity: 50,
      price: 248.91,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: '3',
      type: 'strategy',
      action: 'activated',
      strategy: 'Momentum RSI',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: '4',
      type: 'risk',
      action: 'triggered',
      strategy: 'Pairs Trading',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ];

  const activities = transactions?.length > 0 
    ? transactions.slice(0, 4).map((tx: any) => ({
        id: tx.id,
        type: 'transaction',
        action: tx.side,
        symbol: tx.symbol,
        quantity: parseFloat(tx.quantity),
        price: parseFloat(tx.price),
        timestamp: new Date(tx.executedAt),
      }))
    : mockActivities;

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  };

  const getActivityIcon = (activity: any) => {
    if (activity.type === 'transaction') {
      return activity.action === 'BUY' ? (
        <TrendingUp className="text-profit text-xs" />
      ) : (
        <TrendingDown className="text-loss text-xs" />
      );
    }
    if (activity.type === 'strategy') {
      return <Settings className="text-primary text-xs" />;
    }
    return <Shield className="text-warning text-xs" />;
  };

  const getActivityBg = (activity: any) => {
    if (activity.type === 'transaction') {
      return activity.action === 'BUY' ? 'bg-profit/10' : 'bg-loss/10';
    }
    if (activity.type === 'strategy') {
      return 'bg-primary/10';
    }
    return 'bg-warning/10';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity: any) => (
            <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
              <div className={`flex-shrink-0 w-8 h-8 ${getActivityBg(activity)} rounded-full flex items-center justify-center`}>
                {getActivityIcon(activity)}
              </div>
              <div className="flex-1 min-w-0">
                {activity.type === 'transaction' ? (
                  <p className="text-sm text-gray-900 dark:text-white" data-testid={`text-activity-transaction-${activity.id}`}>
                    <span className="font-medium">{activity.action}</span>{" "}
                    <span>{activity.quantity}</span> shares of{" "}
                    <span className="font-medium">{activity.symbol}</span>
                  </p>
                ) : activity.type === 'strategy' ? (
                  <p className="text-sm text-gray-900 dark:text-white" data-testid={`text-activity-strategy-${activity.id}`}>
                    Strategy <span className="font-medium">{activity.strategy}</span> {activity.action}
                  </p>
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white" data-testid={`text-activity-risk-${activity.id}`}>
                    Risk limit triggered for <span className="font-medium">{activity.strategy}</span>
                  </p>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400" data-testid={`text-activity-timestamp-${activity.id}`}>
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
              {activity.price && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`text-activity-price-${activity.id}`}>
                    ${activity.price.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
