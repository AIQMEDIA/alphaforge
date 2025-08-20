import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChartLine,
  Bot,
  FlaskConical,
  Settings as Cog,
  History,
  Shield,
  FileText,
  Settings,
  Crown,
  Atom,
} from "lucide-react";

const navigation = [
  { name: "Portfolio Overview", href: "/", icon: ChartLine },
  { name: "AI Assistant", href: "/quantum-assistant", icon: Bot, highlight: true },
  { name: "Live Trading", href: "/live-trading", icon: FlaskConical },
  { name: "Paper Trading", href: "/paper-trading", icon: FlaskConical },
  { name: "Strategy Builder", href: "/strategies", icon: Cog },
  { name: "Backtesting", href: "/backtesting", icon: History },
  { name: "Risk Management", href: "/risk-management", icon: Shield },
  { name: "Reports", href: "/analytics", icon: FileText },
  { name: "Quantum Computing", href: "/quantum", icon: Atom },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-dark-200 shadow-sm h-screen sticky top-0 border-r border-gray-200 dark:border-dark-300">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start space-x-3 h-12",
                  item.highlight
                    ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-md"
                    : location === item.href
                    ? "text-primary bg-blue-50 dark:bg-dark-300 font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-dark-300"
                )}
                data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Button>
            </Link>
          ))}
        </nav>
      </div>

      {/* Trial Status */}
      <div className="p-6 border-t border-gray-200 dark:border-dark-300">
        <Card className="bg-gradient-to-r from-accent to-orange-600 text-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Free Trial</span>
            <Crown className="h-5 w-5" />
          </div>
          <p className="text-sm opacity-90 mb-3" data-testid="text-trial-days">
            23 days remaining
          </p>
          <Link href="/subscribe">
            <Button
              className="w-full bg-white text-accent font-semibold hover:bg-gray-100"
              data-testid="button-upgrade-now"
            >
              Upgrade Now
            </Button>
          </Link>
        </Card>
      </div>
    </aside>
  );
}
