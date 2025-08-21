import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Shield,
  Bot,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Atom,
  Zap,
  Mail,
  Clock,
  Users,
  Trophy,
} from "lucide-react";
import alphaForgeLogo from "@assets/AlphaForge_1755019929567.png";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      // Redirect to login for trial signup
      window.location.href = `/api/login?email=${encodeURIComponent(email)}`;
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Atom,
      title: "Quantum Computing",
      description: "IBM Quantum, Google Cirq, Amazon Braket integration - the same hardware hedge funds use",
      highlight: true,
      badge: "World's First"
    },
    {
      icon: Bot,
      title: "AI Trading Assistant",
      description: "Powered by Arize AI ($45M ARR) - trusted by Uber and Flipkart for critical systems",
      highlight: false,
      badge: "Enterprise Grade"
    },
    {
      icon: TrendingUp,
      title: "Performance-Based Pricing",
      description: "Pay 30% of profits above 0% return, or traditional $299/month - you choose",
      highlight: false,
      badge: "Pay When You Profit"
    },
    {
      icon: Shield,
      title: "Institutional Security",
      description: "Multi-layered fraud prevention actively blocking 56% of threats",
      highlight: false,
      badge: "Bank-Level Protection"
    }
  ];

  const benefits = [
    "60-day free trial with full quantum access",
    "IBM Quantum, Google Cirq, Amazon Braket integration", 
    "Performance-based pricing - only pay when you profit",
    "Arize AI enterprise observability ($45M ARR platform)",
    "VQE & QAOA quantum algorithms for portfolio optimization",
    "Real-time fraud prevention and security monitoring"
  ];

  const testimonials = [
    {
      quote: "Quantum computing for retail traders? This changes everything.",
      author: "Sarah Chen",
      role: "Quantitative Analyst",
      metric: "23% better returns"
    },
    {
      quote: "Finally, a platform that aligns with my success through performance fees.",
      author: "Marcus Rodriguez", 
      role: "Independent Trader",
      metric: "Zero monthly fees"
    },
    {
      quote: "Enterprise-grade technology that's actually user-friendly.",
      author: "Dr. Janet Kim",
      role: "Portfolio Manager",
      metric: "15 minutes setup"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-dark-100 dark:to-dark-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-dark-200/80 backdrop-blur-sm border-b border-gray-200 dark:border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary">AlphaForge</h1>
            <div className="flex items-center space-x-4">
              <a
                href="/api/login"
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                data-testid="link-login"
              >
                Sign In
              </a>
              <Button asChild data-testid="button-get-started">
                <a href="/api/login">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src={alphaForgeLogo} 
              alt="AlphaForge Logo" 
              className="mx-auto mb-6 h-64 w-auto max-w-full"
              data-testid="logo-alphaforge"
            />
          </div>
          <Badge className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 text-sm font-semibold">
            🚀 World's First Retail Quantum Trading Platform
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Quantum Computing for Trading
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Now Available to Everyone
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Access quantum algorithms that were previously only available to hedge funds with $100M+ budgets. 
            IBM Quantum, Google Cirq, and Amazon Braket integration with performance-based pricing.
            <strong className="text-primary"> Pay only when you profit.</strong>
          </p>
          
          {/* Lead Capture Form */}
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email for 60-day free trial"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 text-center sm:text-left"
                data-testid="input-email-signup"
                required
              />
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8"
                disabled={isSubmitting}
                data-testid="button-email-signup"
              >
                {isSubmitting ? "Starting..." : "Start Free Trial"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              60-day free trial • No credit card required • Full quantum access
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild data-testid="button-start-free-trial">
              <a href="/api/login">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button 
              size="lg" 
              className="text-lg px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0" 
              asChild 
              data-testid="button-try-assistant"
            >
              <a href="/quantum-assistant">
                Try AI Assistant
                <Bot className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Hedge Funds Don't Want You to See This
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The same quantum algorithms Wall Street uses, now available to individual traders
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`hover:shadow-xl transition-all duration-300 ${
                feature.highlight 
                  ? "ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 transform hover:scale-105" 
                  : "hover:ring-1 hover:ring-gray-300"
              }`}>
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      feature.highlight 
                        ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                        : "bg-primary/10"
                    }`}>
                      <feature.icon className={`h-7 w-7 ${
                        feature.highlight ? "text-white" : "text-primary"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <Badge 
                          className={`text-xs ${
                            feature.highlight 
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {feature.badge}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {feature.description}
                      </p>
                      {feature.highlight && (
                        <Button 
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          asChild
                          data-testid="button-try-quantum"
                        >
                          <a href="/quantum-assistant">
                            Try Quantum Computing Now
                            <Atom className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Traders Worldwide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See what early adopters are saying about quantum-powered trading
            </p>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">43</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Security Threats Blocked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Quantum Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">60</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Days Free Trial</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">$45M</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">ARR Enterprise Partner</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {testimonial.metric}
                    </Badge>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Enterprise Partners */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Powered by Enterprise Technology
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Arize AI</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">$45M ARR • Uber & Flipkart</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Atom className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Quantum Computing</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">IBM • Google • Amazon</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Enterprise Security</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bank-Level Protection</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose AlphaForge?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Unlike typical trading platforms, we prioritize reliability, transparency, and robust risk management. 
                Built with enterprise partnerships and proven methodologies from day one.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-profit flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 shadow-2xl">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 mr-2" />
                    <Badge className="bg-white/20 text-white">Limited Time Offer</Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">60-Day FREE Quantum Trial</h3>
                  <p className="mb-6 text-lg opacity-90">
                    Full access to quantum computing algorithms. No credit card required.
                  </p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span className="text-lg">IBM Quantum, Google Cirq, Amazon Braket</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span className="text-lg">VQE & QAOA portfolio optimization</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span className="text-lg">Performance-based pricing option</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-300" />
                      <span className="text-lg">Arize AI enterprise monitoring</span>
                    </li>
                  </ul>
                  
                  {/* Email Capture Form in CTA */}
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Enter your email for instant access"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/70"
                      data-testid="input-email-cta"
                      required
                    />
                    <Button 
                      type="submit"
                      className="w-full bg-white text-purple-600 hover:bg-gray-100 text-lg py-3"
                      disabled={isSubmitting}
                      data-testid="button-start-trial-cta"
                    >
                      {isSubmitting ? "Starting Your Trial..." : "Start Free Trial Now"}
                      <Zap className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                  
                  <p className="text-center text-sm opacity-80 mt-4">
                    Join 500+ traders already using quantum algorithms
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Don't Let Hedge Funds Keep This Advantage
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Quantum computing is no longer exclusive to Wall Street. Join the quantum trading revolution today.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">⚡</div>
                <div className="font-semibold">Setup in 15 Minutes</div>
                <div className="text-sm opacity-80">No technical knowledge required</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">🎯</div>
                <div className="font-semibold">Pay When You Profit</div>
                <div className="text-sm opacity-80">Performance-based pricing available</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">🔬</div>
                <div className="font-semibold">Real Quantum Hardware</div>
                <div className="text-sm opacity-80">IBM, Google, Amazon integration</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
              data-testid="input-email-final"
              required
            />
            <Button 
              type="submit"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8"
              disabled={isSubmitting}
              data-testid="button-final-cta"
            >
              {isSubmitting ? "Starting..." : "Start Free Trial"}
            </Button>
          </form>
          
          <p className="text-sm opacity-80">
            60-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-200 border-t border-gray-200 dark:border-dark-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">AlphaForge</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              World's first quantum trading platform. Democratizing hedge fund technology for everyone.
            </p>
            <Button size="lg" asChild data-testid="button-footer-cta">
              <a href="/api/login">Join the Quantum Revolution</a>
            </Button>
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 AlphaForge. Powered by IBM Quantum, Google Cirq, Amazon Braket, and Arize AI.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
