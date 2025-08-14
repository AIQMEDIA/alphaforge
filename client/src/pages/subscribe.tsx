import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Shield, Atom, Zap, Cpu } from "lucide-react";
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
    id: "professional",
    name: "Professional",
    price: 99,
    originalPrice: 199,
    trialDays: 30,
    description: "Perfect for serious traders",
    features: [
      "Real market data from 4 providers",
      "Live trading with Alpaca Markets", 
      "Basic quantum optimization",
      "Portfolio backtesting",
      "Risk management tools",
      "Paper trading",
      "Strategy builder",
      "Email support"
    ],
    popular: false,
    quantumFeature: "Basic Quantum",
    badgeText: "50% OFF"
  },
  {
    id: "quantum-pro",
    name: "Quantum Pro",
    price: 299,
    originalPrice: 599,
    trialDays: 60,
    description: "Full quantum computing power",
    features: [
      "Everything in Professional",
      "Full quantum computing access",
      "VQE & QAOA algorithms",
      "Quantum machine learning",
      "IBM Quantum, Google Cirq, Amazon Braket",
      "Unlimited quantum optimizations",
      "Advanced risk analysis",
      "Priority support"
    ],
    popular: true,
    quantumFeature: "Full Quantum Access",
    badgeText: "MOST POPULAR"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    originalPrice: 1999,
    trialDays: 90,
    description: "For institutional traders",
    features: [
      "Everything in Quantum Pro",
      "Custom quantum algorithms",
      "Dedicated quantum hardware access",
      "API access & integrations",
      "White-label options",
      "24/7 dedicated support",
      "Custom training sessions",
      "Enterprise SLA"
    ],
    popular: false,
    quantumFeature: "Enterprise Quantum",
    badgeText: "50% OFF"
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
          Start Your {selectedPlan.trialDays}-Day Free Trial
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {selectedPlan.name} - {selectedPlan.quantumFeature}
        </p>
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-300 font-semibold text-sm">
            💎 FREE for {selectedPlan.trialDays} days, then ${selectedPlan.price}/month
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Cancel anytime • No hidden fees • Instant quantum access
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <PaymentElement data-testid="payment-element" />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        data-testid="button-subscribe"
      >
        Start Free Trial
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
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to Quantum Pro plan
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
        const response = await apiRequest("POST", "/api/get-or-create-subscription", { 
          plan: selectedPlan.id 
        });
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
  }, [isAuthenticated, selectedPlan.id, toast]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Atom className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Quantum Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Unlock the full potential of quantum computing for trading
          </p>
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 text-lg">
            🎉 Limited Time: 50% OFF + Extended Free Trials
          </Badge>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            World's First Quantum-Powered Trading Platform
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience the same quantum computing technology used by Goldman Sachs, JP Morgan, and Citi for institutional trading
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 ${
                plan.popular 
                  ? "border-2 border-purple-500 shadow-2xl scale-105 z-10" 
                  : "border border-gray-200 dark:border-dark-400 hover:shadow-lg"
              }`}
              data-testid={`plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                    {plan.badgeText}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mb-4">
                  {plan.id === 'quantum-pro' && (
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                  )}
                  {plan.id === 'enterprise' && (
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-800 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Cpu className="h-8 w-8 text-white" />
                    </div>
                  )}
                  {plan.id === 'professional' && (
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {plan.description}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(plan.originalPrice)}
                    </span>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      50% OFF
                    </Badge>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(plan.price)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">/month</p>
                  
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-700 dark:text-green-300 font-semibold">
                      🎁 {plan.trialDays}-Day FREE Trial
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      No credit card required
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full ${
                    selectedPlan.id === plan.id
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      : plan.popular 
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                      : "bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-gray-800"
                  }`}
                  data-testid={`select-plan-${plan.id}`}
                >
                  {selectedPlan.id === plan.id ? "Selected Plan" : `Start ${plan.trialDays}-Day Free Trial`}
                </Button>

                {plan.popular && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Most quantum traders choose this plan
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Section */}
        {selectedPlan && (
          <div className="max-w-2xl mx-auto mb-16">
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center space-x-2">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <span>Start Your {selectedPlan.trialDays}-Day Free Trial</span>
                </CardTitle>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Selected: <strong>{selectedPlan.name}</strong> - {selectedPlan.quantumFeature}
                  </p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p className="text-purple-700 dark:text-purple-300 font-semibold">
                      💎 FREE for {selectedPlan.trialDays} days, then {formatCurrency(selectedPlan.price)}/month
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                      Cancel anytime during trial • No hidden fees • Instant access to quantum algorithms
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Setting up your quantum trial...
                    </p>
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <SubscribeForm selectedPlan={selectedPlan} />
                  </Elements>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">
                      Failed to initialize payment. Please try again.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Trust Signals */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Trusted by quantum researchers and institutional traders worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">IBM</div>
              <p className="text-sm text-gray-500">Quantum Partner</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">Google</div>
              <p className="text-sm text-gray-500">Cirq Integration</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">Amazon</div>
              <p className="text-sm text-gray-500">Braket Platform</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">Alpaca</div>
              <p className="text-sm text-gray-500">Trading Partner</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  What is quantum computing in trading?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Quantum algorithms can optimize portfolios exponentially faster than classical computers, 
                  finding better risk-return combinations that traditional methods miss.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Is the free trial really free?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yes! No credit card required. Experience full quantum capabilities for 30-90 days 
                  depending on your selected plan.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Can I cancel anytime?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Absolutely. Cancel during your trial or anytime after with no penalties. 
                  You'll retain access until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Do I need quantum expertise?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Not at all! Our quantum algorithms work behind the scenes. 
                  Simply set your risk preferences and let quantum optimization do the work.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}