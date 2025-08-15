import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, TrendingUp, Shield, Zap, BookOpen, BarChart3, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  messageType?: 'general' | 'portfolio_advice' | 'risk_alert' | 'quantum_analysis';
}

interface ChatSession {
  id: string;
  queryCount: number;
  isUnlimited: boolean;
  skillLevel: 'beginner' | 'professional';
}

interface CrmFormData {
  name: string;
  email: string;
  role: string;
  tradingExperience: string;
  company?: string;
  phone?: string;
}

export default function QuantumAssistant() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCrmForm, setShowCrmForm] = useState(false);
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'professional'>('beginner');
  const [crmFormData, setCrmFormData] = useState<CrmFormData>({
    name: "",
    email: "",
    role: "",
    tradingExperience: "",
    company: "",
    phone: ""
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get or create chat session
  const { data: chatSession, isLoading: sessionLoading } = useQuery<ChatSession>({
    queryKey: ['/api/chat/session'],
  });

  // Get conversation history
  const { data: conversationHistory } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/history', chatSession?.id],
    enabled: !!chatSession?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; skillLevel: string }) => {
      const response = await apiRequest("POST", "/api/chat/send", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '_bot',
        message: data.response,
        sender: 'bot',
        timestamp: new Date(),
        messageType: data.messageType
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Update session data
      queryClient.invalidateQueries({ queryKey: ['/api/chat/session'] });
      
      // Check if limit reached
      if (data.limitReached) {
        setShowCrmForm(true);
      }
      
      setIsTyping(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  // Submit CRM form mutation
  const submitCrmMutation = useMutation({
    mutationFn: async (data: CrmFormData) => {
      return await apiRequest("POST", "/api/chat/submit-crm", data);
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your details have been submitted. You now have unlimited access to the assistant.",
      });
      setShowCrmForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/chat/session'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit details. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize conversation with welcome message
  useEffect(() => {
    if (chatSession && messages.length === 0 && !conversationHistory?.length) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message: getWelcomeMessage(skillLevel),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } else if (conversationHistory?.length) {
      setMessages(conversationHistory);
    }
  }, [chatSession, skillLevel, conversationHistory, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getWelcomeMessage = (level: 'beginner' | 'professional') => {
    if (level === 'beginner') {
      return `Welcome to AlphaForge Quantum Trading Assistant! 🚀\n\nI'm here to help you understand quantum-powered portfolio optimization and guide you through advanced trading strategies.\n\n**What I can help you with:**\n• Quantum vs Classical portfolio optimization\n• Risk management and alerts\n• Real-time market analysis\n• Educational trading concepts\n• Strategy recommendations\n\nYou have **5 free queries** to explore quantum trading. After that, just share your contact details for unlimited access!\n\nWhat would you like to learn about first?`;
    } else {
      return `Welcome to AlphaForge Quantum Trading Assistant - Professional Mode! ⚡\n\n**Advanced Features Available:**\n• VQE & QAOA algorithm implementation\n• Custom API integrations (Alpaca, market data)\n• Advanced risk modeling and stress testing\n• Quantum vs classical performance comparisons\n• Direct trading execution commands\n• Institutional-grade analytics\n\nYou have **5 free queries** before verification. Ready to explore quantum trading advantages?\n\nHow can I assist with your portfolio optimization today?`;
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      message: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    sendMessageMutation.mutate({
      message: inputMessage.trim(),
      skillLevel: skillLevel
    });
    
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCrmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCrmMutation.mutate(crmFormData);
  };

  const formatMessage = (message: string) => {
    return message.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  const getMessageTypeIcon = (type?: string) => {
    switch (type) {
      case 'portfolio_advice': return <TrendingUp className="h-4 w-4" />;
      case 'risk_alert': return <AlertTriangle className="h-4 w-4" />;
      case 'quantum_analysis': return <Zap className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AlphaForge Quantum Trading Assistant</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Interactive AI assistant powered by quantum computing algorithms for portfolio optimization, 
          risk management, and trading strategy guidance.
        </p>
        
        {/* Skill Level Toggle */}
        <div className="flex items-center justify-center gap-4">
          <Label htmlFor="skill-level">Mode:</Label>
          <Select value={skillLevel} onValueChange={(value: 'beginner' | 'professional') => setSkillLevel(value)}>
            <SelectTrigger className="w-40" data-testid="select-skill-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">👶 Beginner</SelectItem>
              <SelectItem value="professional">🚀 Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Usage Stats */}
        {chatSession && (
          <div className="flex items-center justify-center gap-4">
            <Badge variant={chatSession.isUnlimited ? "default" : "secondary"}>
              {chatSession.isUnlimited ? "Unlimited Access" : `${chatSession.queryCount}/5 Free Queries`}
            </Badge>
            {!isAuthenticated && !chatSession.isUnlimited && (
              <Badge variant="outline">Sign up for unlimited access</Badge>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setInputMessage("How does quantum portfolio optimization work?")}>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium">Quantum Basics</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setInputMessage("Show me risk management strategies")}>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">Risk Management</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setInputMessage("What are the best strategies for current market conditions?")}>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-medium">Strategy Advice</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setInputMessage("Explain VQE and QAOA algorithms")}>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-sm font-medium">Learn More</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chat with Quantum Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-3xl ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <div className={`flex-shrink-0 ${
                    message.sender === 'user' ? 'bg-primary' : 'bg-muted'
                  } rounded-full p-2`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      getMessageTypeIcon(message.messageType)
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-muted'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">
                      {formatMessage(message.message)}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-3xl">
                  <div className="bg-muted rounded-full p-2">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about quantum trading strategies, risk management, or portfolio optimization..."
                disabled={sendMessageMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CRM Form Dialog */}
      <Dialog open={showCrmForm} onOpenChange={setShowCrmForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unlock Unlimited Access</DialogTitle>
            <DialogDescription>
              You've reached your 5 free queries. Share your details to continue with unlimited access to the Quantum Trading Assistant.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCrmSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crm-name">Name *</Label>
                <Input
                  id="crm-name"
                  value={crmFormData.name}
                  onChange={(e) => setCrmFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  data-testid="input-crm-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crm-email">Email *</Label>
                <Input
                  id="crm-email"
                  type="email"
                  value={crmFormData.email}
                  onChange={(e) => setCrmFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  data-testid="input-crm-email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="crm-role">Role *</Label>
              <Select value={crmFormData.role} onValueChange={(value) => setCrmFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger data-testid="select-crm-role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trader">Trader</SelectItem>
                  <SelectItem value="portfolio_manager">Portfolio Manager</SelectItem>
                  <SelectItem value="quantitative_analyst">Quantitative Analyst</SelectItem>
                  <SelectItem value="fund_manager">Fund Manager</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crm-experience">Trading Experience *</Label>
              <Select value={crmFormData.tradingExperience} onValueChange={(value) => setCrmFormData(prev => ({ ...prev, tradingExperience: value }))}>
                <SelectTrigger data-testid="select-crm-experience">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (&lt; 1 year)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-7 years)</SelectItem>
                  <SelectItem value="professional">Professional (7+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crm-company">Company</Label>
                <Input
                  id="crm-company"
                  value={crmFormData.company}
                  onChange={(e) => setCrmFormData(prev => ({ ...prev, company: e.target.value }))}
                  data-testid="input-crm-company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crm-phone">Phone</Label>
                <Input
                  id="crm-phone"
                  value={crmFormData.phone}
                  onChange={(e) => setCrmFormData(prev => ({ ...prev, phone: e.target.value }))}
                  data-testid="input-crm-phone"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCrmForm(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitCrmMutation.isPending || !crmFormData.name || !crmFormData.email || !crmFormData.role || !crmFormData.tradingExperience}
                data-testid="button-submit-crm"
              >
                {submitCrmMutation.isPending ? "Submitting..." : "Get Unlimited Access"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}