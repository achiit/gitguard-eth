import { useState } from 'react';
import { usePrivyAuth } from '@/hooks/use-privy-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Wallet, 
  Mail, 
  Chrome, 
  Twitter, 
  MessageSquare,
  Shield,
  Copy,
  ExternalLink,
  Settings,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UserProfile() {
  const { 
    user, 
    authenticated, 
    logout,
    linkEmail,
    linkWallet,
    createWallet,
    exportWallet,
    updatePreferences,
    completeOnboarding,
    getEmbeddedWalletAddress,
    getConnectedWalletAddress,
    getPrimaryWalletAddress
  } = usePrivyAuth();
  
  const { toast } = useToast();
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);

  if (!authenticated || !user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    setIsUpdatingPreferences(true);
    try {
      await updatePreferences({ [key]: value });
      toast({
        title: "✅ Preferences Updated",
        description: "Your preferences have been saved",
      });
    } catch (error) {
      toast({
        title: "❌ Update Failed",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      toast({
        title: "🎉 Onboarding Complete!",
        description: "Welcome to the platform!",
      });
    } catch (error) {
      toast({
        title: "❌ Onboarding Failed",
        description: "Failed to complete onboarding",
        variant: "destructive",
      });
    }
  };

  const embeddedWalletAddress = getEmbeddedWalletAddress();
  const connectedWalletAddress = getConnectedWalletAddress();
  const primaryWalletAddress = getPrimaryWalletAddress();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {user.displayName}
                {user.onboardingCompleted && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{user.email || 'No email address'}</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">Privy ID: {user.id}</Badge>
                {user.hasEmbeddedWallet && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Web3 Enabled
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Onboarding */}
      {!user.onboardingCompleted && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Complete Your Setup</CardTitle>
            <CardDescription className="text-yellow-700">
              Finish setting up your account to unlock all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCompleteOnboarding} className="bg-yellow-600 hover:bg-yellow-700">
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Wallet Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Addresses
          </CardTitle>
          <CardDescription>
            Your Web3 wallet addresses for receiving payments and interacting with blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Wallet */}
          {primaryWalletAddress && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <Label className="font-medium text-blue-900">Primary Wallet</Label>
                <p className="text-sm text-blue-700 font-mono">{primaryWalletAddress}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(primaryWalletAddress, 'Primary wallet address')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Embedded Wallet */}
          {embeddedWalletAddress && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <Label className="font-medium text-purple-900">
                  Embedded Wallet
                  <Badge className="ml-2 bg-purple-100 text-purple-800">Privy</Badge>
                </Label>
                <p className="text-sm text-purple-700 font-mono">{embeddedWalletAddress}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(embeddedWalletAddress, 'Embedded wallet address')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportWallet}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Connected Wallet */}
          {connectedWalletAddress && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <Label className="font-medium text-green-900">
                  Connected Wallet
                  <Badge className="ml-2 bg-green-100 text-green-800">External</Badge>
                </Label>
                <p className="text-sm text-green-700 font-mono">{connectedWalletAddress}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(connectedWalletAddress, 'Connected wallet address')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* No Wallet */}
          {!user.hasWallet && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No Wallet Connected</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create an embedded wallet or connect an external wallet to start using Web3 features
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={createWallet} variant="outline">
                  Create Wallet
                </Button>
                <Button onClick={linkWallet}>
                  Connect Wallet
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Linked Accounts
          </CardTitle>
          <CardDescription>
            Authentication methods connected to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span>Email</span>
              </div>
              {user.linkedAccounts.email ? (
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={linkEmail}>
                  Link Email
                </Button>
              )}
            </div>

            {/* Google */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Chrome className="h-5 w-5 text-gray-500" />
                <span>Google</span>
              </div>
              {user.linkedAccounts.google ? (
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              ) : (
                <Badge variant="outline">Not Connected</Badge>
              )}
            </div>

            {/* Twitter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Twitter className="h-5 w-5 text-gray-500" />
                <span>Twitter</span>
              </div>
              {user.linkedAccounts.twitter ? (
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              ) : (
                <Badge variant="outline">Not Connected</Badge>
              )}
            </div>

            {/* Discord */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <span>Discord</span>
              </div>
              {user.linkedAccounts.discord ? (
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              ) : (
                <Badge variant="outline">Not Connected</Badge>
              )}
            </div>

            {/* Wallet */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-gray-500" />
                <span>Crypto Wallet</span>
              </div>
              {user.linkedAccounts.wallet ? (
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              ) : (
                <Button variant="outline" size="sm" onClick={linkWallet}>
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>
            Customize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Use dark theme</p>
            </div>
            <Switch
              id="theme"
              checked={user.preferences.theme === 'dark'}
              onCheckedChange={(checked) => 
                handlePreferenceChange('theme', checked ? 'dark' : 'light')
              }
              disabled={isUpdatingPreferences}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive email notifications</p>
            </div>
            <Switch
              id="notifications"
              checked={user.preferences.notifications}
              onCheckedChange={(checked) => 
                handlePreferenceChange('notifications', checked)
              }
              disabled={isUpdatingPreferences}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}