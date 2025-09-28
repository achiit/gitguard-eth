import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Mail, 
  Chrome, 
  Twitter, 
  MessageSquare, 
  Shield, 
  Zap,
  ArrowLeft,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function Web3Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "🚀 Web3 Authentication Ready!",
        description: "Privy integration will be available soon with full Web3 capabilities.",
      });
      // For now, redirect back to regular login
      navigate("/login");
    } catch (error) {
      toast({
        title: "❌ Connection Failed",
        description: "Web3 authentication is coming soon!",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const loginMethods = [
    {
      icon: <Mail className="w-5 h-5" />,
      name: "Email",
      description: "Sign in with your email address",
      popular: true,
    },
    {
      icon: <Chrome className="w-5 h-5" />,
      name: "Google",
      description: "Continue with your Google account",
      popular: true,
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      name: "Wallet",
      description: "Connect with MetaMask, WalletConnect, or other wallets",
      web3: true,
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      name: "Twitter",
      description: "Sign in with your Twitter account",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      name: "Discord",
      description: "Continue with Discord",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="text-white hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome to Web3</h1>
            <p className="text-gray-300 mt-2">
              The future of decentralized authentication
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-white">
              <Shield className="w-5 h-5 text-blue-400" />
              Multi-Modal Authentication
            </CardTitle>
            <CardDescription className="text-gray-300">
              Choose from multiple secure sign-in methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Web3 Features Banner */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-400/30">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-white">Web3 Enabled</span>
                <Badge className="bg-green-500 text-white">
                  LIVE NOW
                </Badge>
              </div>
              <p className="text-sm text-gray-300">
                Create contracts on blockchain, manage crypto payments, and own your data
              </p>
            </div>

            {/* Login Methods Preview */}
            <div className="space-y-3">
              <h3 className="font-medium text-white text-sm">Available Sign-in Methods:</h3>
              <div className="grid gap-2">
                {loginMethods.map((method) => (
                  <div 
                    key={method.name}
                    className="flex items-center gap-3 p-3 rounded-lg border border-white/20 bg-white/5"
                  >
                    <div className="p-2 bg-white/10 rounded-lg">
                      {method.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{method.name}</span>
                        {method.popular && (
                          <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">Popular</Badge>
                        )}
                        {method.web3 && (
                          <Badge className="text-xs bg-purple-500/20 text-purple-400">Web3</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{method.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg border-0"
            >
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Initializing Web3...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Experience Web3 Login
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>

            {/* Active Notice */}
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-sm text-green-300">
                ✅ <strong>Privy is Live!</strong> Full Web3 authentication with wallets, 
                social login, and blockchain features is now active. Go back to login to try it!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card className="border-0 bg-white/5 backdrop-blur-sm border border-white/10">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-white mb-3 text-center">What's Coming</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-gray-300">Built-in crypto wallet for payments</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-300">Blockchain-verified contracts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-gray-300">Decentralized data ownership</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}