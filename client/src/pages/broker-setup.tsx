/*
 * AlphaForge - Quantum Trading Platform
 * Copyright (c) 2025 AlphaForge. All rights reserved.
 */

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import BrokerOnboardingFlow from "@/components/BrokerOnboardingFlow";
import BrokerFlexibilityInfo from "@/components/BrokerFlexibilityInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BrokerSetup() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Broker Account Setup
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect your preferred broker to enable live quantum trading with real money
              </p>
            </div>

            <Tabs defaultValue="setup" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="setup">Quick Setup (Alpaca)</TabsTrigger>
                <TabsTrigger value="brokers">All Supported Brokers</TabsTrigger>
              </TabsList>

              <TabsContent value="setup">
                <BrokerOnboardingFlow />
              </TabsContent>

              <TabsContent value="brokers">
                <BrokerFlexibilityInfo />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}