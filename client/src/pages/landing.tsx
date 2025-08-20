import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Shield,
  Bot,
  BarChart3,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import alphaForgeLogo from "@assets/AlphaForge_1755019929567.png";

export default function Landing() {
  const features = [
    {
      icon: TrendingUp,
      title: "Advanced Backtesting",
      description: "Run realistic historical simulations with transaction costs, slippage, and market constraints"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Multi-layered risk controls with real-time monitoring and configurable kill-switches"
    },
    {
      icon: Bot,
      title: "Strategy Builder",
      description: "Create and deploy trading strategies with an intuitive no-code interface"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Comprehensive reporting with Sharpe ratio, drawdown analysis, and compliance exports"
    }
  ];

  const benefits = [
    "60-day free trial with full features",
    "Arize AI enterprise observability integration",
    "Quantum computing portfolio optimization",
    "Real-time portfolio monitoring with ML insights",
    "Institutional-grade risk controls and fraud prevention",
    "Transparent audit trail and compliance exports"
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
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            Professional Trading Platform
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Quantitative Trading Bot System
            <span className="block text-primary">Made Reliable</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Build, backtest, and deploy trading strategies with institutional-grade risk management. 
            Powered by enterprise observability from Arize AI, trusted by Uber and Flipkart.
            Start your 30-day free trial and experience the difference of transparent, reliable quantitative trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild data-testid="button-start-free-trial">
              <a href="/api/login">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild data-testid="button-try-assistant">
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Trading Tools
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to build, test, and deploy successful trading strategies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Partnerships Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Powered by Enterprise Partners
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            AlphaForge leverages best-in-class enterprise observability and infrastructure
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Arize AI Observability</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Enterprise-grade monitoring trusted by Uber, Flipkart, and 6,000+ developers
                </p>
                <Badge variant="secondary">$45M ARR Partner</Badge>
              </CardContent>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quantum Computing</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  IBM Quantum, Google Cirq, and Amazon Braket integration
                </p>
                <Badge variant="secondary">3 Major Providers</Badge>
              </CardContent>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Institutional Security</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Multi-layered fraud prevention and enterprise-grade security
                </p>
                <Badge variant="secondary">Bank-Level Protection</Badge>
              </CardContent>
            </Card>
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
              <Card className="bg-gradient-to-r from-primary to-blue-600 text-white p-8">
                <CardContent className="p-0">
                  <h3 className="text-2xl font-bold mb-4">Start Your Free Trial</h3>
                  <p className="mb-6 opacity-90">
                    Get full access to all features for 30 days. No credit card required.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Unlimited strategies</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Full backtesting engine</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Paper trading</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Risk management tools</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-white text-primary hover:bg-gray-100"
                    asChild
                    data-testid="button-start-trial-cta"
                  >
                    <a href="/api/login">Start Free Trial Now</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-200 border-t border-gray-200 dark:border-dark-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">AlphaForge</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Professional quantitative trading platform built for reliability and transparency.
            </p>
            <Button size="lg" asChild data-testid="button-footer-cta">
              <a href="/api/login">Get Started Today</a>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
