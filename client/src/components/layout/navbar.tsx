import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, ChevronDown, Bot, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-dark-200 shadow-sm border-b border-gray-200 dark:border-dark-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">AlphaForge</h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="text-primary bg-blue-50 dark:bg-dark-300 px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="link-dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  href="/strategies"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="link-strategies"
                >
                  Strategies
                </Link>
                <Link
                  href="/backtesting"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="link-backtesting"
                >
                  Backtesting
                </Link>
                <Link
                  href="/analytics"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  data-testid="link-analytics"
                >
                  Analytics
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* AI Assistant Button */}
            <Link href="/quantum-assistant">
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                data-testid="button-ai-assistant"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.profileImageUrl || undefined}
                      alt="Profile"
                    />
                    <AvatarFallback>
                      {(user?.firstName && user.firstName.charAt(0)) || 
                       (user?.email && user.email.charAt(0)) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium" data-testid="text-username">
                    {user?.firstName || user?.email || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings" data-testid="link-settings">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/api/logout" data-testid="link-logout">
                    Logout
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
