import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, X } from "lucide-react";
import { Link } from "wouter";

export function FloatingAiButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="flex flex-col items-start gap-3">
        {/* Quick Actions when expanded */}
        {isExpanded && (
          <div className="bg-white dark:bg-dark-200 rounded-lg shadow-lg border p-4 mb-2 animate-in slide-in-from-bottom-2">
            <h4 className="font-semibold text-sm mb-3">AI Assistant</h4>
            <div className="space-y-2">
              <Link href="/quantum-assistant">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  data-testid="floating-ai-chat"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
              </Link>
              <Link href="/quantum">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  data-testid="floating-quantum"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Quantum Analysis
                </Button>
              </Link>
              <Link href="/strategies">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  data-testid="floating-strategy-help"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Strategy Help
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main floating button */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
            isExpanded 
              ? "bg-gray-600 hover:bg-gray-700" 
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          }`}
          data-testid="floating-ai-button"
        >
          {isExpanded ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Bot className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}