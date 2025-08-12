import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { Link } from "wouter";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const plans = [
  {
    name: "Basic Plan",
    price: 29,
    description: "Up to 3 strategies, basic analytics",
    popular: false,
  },
  {
    name: "Pro Plan",
    price: 79,
    description: "Unlimited strategies, advanced analytics",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 199,
    description: "Custom solutions, priority support",
    popular: false,
  },
];

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState("Pro Plan");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="modal-upgrade">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-accent" />
          </div>
          <DialogTitle className="text-xl">Upgrade to Continue</DialogTitle>
          <DialogDescription>
            Your 30-day trial expires in 23 days. Choose a plan to continue using QuantBot Pro.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`cursor-pointer transition-colors ${
                selectedPlan === plan.name
                  ? "border-2 border-primary bg-blue-50 dark:bg-dark-300"
                  : "border border-gray-200 dark:border-dark-400 hover:border-primary"
              }`}
              onClick={() => setSelectedPlan(plan.name)}
              data-testid={`plan-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-semibold ${
                      selectedPlan === plan.name ? "text-primary" : "text-gray-900 dark:text-white"
                    }`}>
                      {plan.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      selectedPlan === plan.name ? "text-primary" : "text-gray-900 dark:text-white"
                    }`}>
                      ${plan.price}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">/month</p>
                  </div>
                </div>
                {plan.popular && (
                  <div className="mt-2">
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex space-x-3">
          <Link href="/subscribe" className="flex-1">
            <Button className="w-full" data-testid="button-continue-with-pro">
              Continue with {selectedPlan}
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-later"
          >
            Later
          </Button>
        </div>

        <div className="flex items-center justify-center space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-dark-400">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 text-white text-xs flex items-center justify-center rounded">
              S
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Stripe</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 text-white text-xs flex items-center justify-center rounded">
              P
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">PayPal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-600 text-white text-xs flex items-center justify-center rounded">
              □
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Square</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
