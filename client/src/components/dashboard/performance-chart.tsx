import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface PerformanceChartProps {
  userId: string;
}

export function PerformanceChart({ userId }: PerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const { data: performance = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/portfolio/performance", { days: 365 }],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (!performance || !chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Generate mock data if no real data available
    const mockData = Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2024, i, 1).toLocaleDateString("en-US", { month: "short" }),
      value: 100000 + (i * 2500) + (Math.random() - 0.5) * 5000
    }));

    const chartData = performance.length > 0 ? performance : mockData;

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.map((d: any) => d.date || d.label),
        datasets: [
          {
            label: "Portfolio Value",
            data: chartData.map((d: any) => parseFloat(d.value) || d.value),
            borderColor: "hsl(203.8863, 88.2845%, 53.1373%)",
            backgroundColor: "hsla(203.8863, 88.2845%, 53.1373%, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: function (value: any) {
                return "$" + (value / 1000).toFixed(0) + "K";
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [performance]);

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Portfolio Performance</CardTitle>
        <div className="flex space-x-2">
          <Button size="sm" variant="default" data-testid="button-period-1d">1D</Button>
          <Button size="sm" variant="ghost" data-testid="button-period-1w">1W</Button>
          <Button size="sm" variant="ghost" data-testid="button-period-1m">1M</Button>
          <Button size="sm" variant="ghost" data-testid="button-period-1y">1Y</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={chartRef} data-testid="chart-performance" />
        </div>
      </CardContent>
    </Card>
  );
}
