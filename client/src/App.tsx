import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Strategies from "@/pages/strategies";
import Backtesting from "@/pages/backtesting";
import PaperTrading from "@/pages/paper-trading";
import RiskManagement from "@/pages/risk-management";
import Analytics from "@/pages/analytics";
import Subscribe from "@/pages/subscribe";
import Settings from "@/pages/settings";
import QuantumOptimization from "@/pages/quantum-optimization";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/strategies" component={Strategies} />
          <Route path="/backtesting" component={Backtesting} />
          <Route path="/paper-trading" component={PaperTrading} />
          <Route path="/risk-management" component={RiskManagement} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/settings" component={Settings} />
          <Route path="/quantum" component={QuantumOptimization} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
