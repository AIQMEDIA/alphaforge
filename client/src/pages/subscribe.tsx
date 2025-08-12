import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Check, CreditCard, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 29,
    description: "Perfect for getting started with quantitative trading",
    features: [
      "Up to 3 active strategies",
      "Basic backtesting",
      "Paper trading",
      "Standard analytics",
      "Email support",
      "5GB data storage"
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: 79,
    description: "Advanced features for serious traders",
    features: [
      "Unlimited strategies",
      "Advanced backtesting with slippage",
      "Live trading integration",
      "Advanced risk management",
      "Real-time market data",
      "Priority support",
      "50GB data storage",
      "Custom indicators",
      "API access"
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    description: "Full-featured solution for institutions",
    features: [
      "Everything in Pro",
      "Multi-account management",
      "Custom integrations",
      "Dedicated support",
      "Advanced compliance tools",
      "White-label options",
      "Unlimited data storage",
      "Custom development",
      "SLA guarantee"
    ],
    popular: false,
  },
];

const SubscribeForm = ({ selectedPlan }: { selectedPlan: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: `Welcome to ${selectedPlan.name}! Your subscription is now active.`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="payment-form">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Subscribe to {selectedPlan.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {formatCurrency(selectedPlan.price)}/month - {selectedPlan.description}
        </p>
      </div>
      
      <div className="mb-6">
        <PaymentElement data-testid="payment-element" />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe}
        className="w-full"
        data-testid="button-subscribe"
      >
        Subscribe to {selectedPlan.name}
      </Button>
    </form>
  );
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export default function Subscribe() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to Pro plan
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  // Handle unauthorized errors
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Create subscription as soon as the page loads
    const createSubscription = async () => {
      try {
        const response = await apiRequest("POST", "/api/get-or-create-subscription");
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        if (isUnauthorizedError(error)) {
          toast({
            title: "Unauthorized",
            description: "You are logged out. Logging in again...",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/api/login";
          }, 500);
          return;
        }
        toast({
          title: "Error",
          description: error.message || "Failed to initialize subscription",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createSubscription();
  }, [isAuthenticated, toast]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Setting up your subscription...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-accent" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Unlock the full potential of quantitative trading with our professional-grade platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Select a Plan
            </h2>
            
            <div className="space-y-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedPlan.id === plan.id
                      ? "border-2 border-primary bg-blue-50 dark:bg-dark-300 shadow-md"
                      : "border border-gray-200 dark:border-dark-400 hover:border-primary hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                  data-testid={`plan-${plan.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-xl font-bold ${
                            selectedPlan.id === plan.id ? "text-primary" : "text-gray-900 dark:text-white"
                          }`}>
                            {plan.name}
                          </h3>
                          {plan.popular && (
                            <Badge className="bg-primary text-white">Most Popular</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {plan.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${
                          selectedPlan.id === plan.id ? "text-primary" : "text-gray-900 dark:text-white"
                        }`}>
                          {formatCurrency(plan.price)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">/month</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Check className="h-4 w-4 text-profit flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 4 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          +{plan.features.length - 4} more features
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Complete Your Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <SubscribeForm selectedPlan={selectedPlan} />
                    </Elements>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Initializing payment...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Security */}
              <Card className="mt-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <Shield className="h-4 w-4" />
                    <span>Secure Payment</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Your payment information is encrypted and secure. We never store your credit card details.
                  </p>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex items-center justify-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-5 bg-blue-600 text-white text-xs flex items-center justify-center rounded">
                        STRIPE
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Stripe</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-5 bg-blue-500 text-white text-xs flex items-center justify-center rounded">
                        PP
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">PayPal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-5 bg-black text-white text-xs flex items-center justify-center rounded">
                        SQ
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Square</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Compare Plans
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-400">
                      <th className="text-left py-3 text-gray-900 dark:text-white font-semibold">Features</th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="text-center py-3 text-gray-900 dark:text-white font-semibold">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-gray-200 dark:border-dark-400">
                      <td className="py-3 text-gray-700 dark:text-gray-300">Active Strategies</td>
                      <td className="text-center py-3">3</td>
                      <td className="text-center py-3">Unlimited</td>
                      <td className="text-center py-3">Unlimited</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-dark-400">
                      <td className="py-3 text-gray-700 dark:text-gray-300">Advanced Backtesting</td>
                      <td className="text-center py-3">-</td>
                      <td className="text-center py-3">✓</td>
                      <td className="text-center py-3">✓</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-dark-400">
                      <td className="py-3 text-gray-700 dark:text-gray-300">Live Trading</td>
                      <td className="text-center py-3">-</td>
                      <td className="text-center py-3">✓</td>
                      <td className="text-center py-3">✓</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-dark-400">
                      <td className="py-3 text-gray-700 dark:text-gray-300">API Access</td>
                      <td className="text-center py-3">-</td>
                      <td className="text-center py-3">✓</td>
                      <td className="text-center py-3">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-700 dark:text-gray-300">Support Level</td>
                      <td className="text-center py-3">Email</td>
                      <td className="text-center py-3">Priority</td>
                      <td className="text-center py-3">Dedicated</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
