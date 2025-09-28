import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { PrivyFirebaseSync, type PrivyFirebaseUser } from '@/lib/privy-firebase-sync';

export const usePrivyAuth = () => {
  const { 
    ready, 
    authenticated, 
    user, 
    login, 
    logout, 
    linkEmail, 
    linkWallet, 
    unlinkEmail, 
    unlinkWallet,
    exportWallet,
    createWallet
  } = usePrivy();
  
  const { wallets } = useWallets();
  const { toast } = useToast();
  
  // Firebase user state
  const [firebaseUser, setFirebaseUser] = useState<PrivyFirebaseUser | null>(null);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(false);

  // Temporarily disable debug logging to reduce noise
  // useEffect(() => {
  //   console.log('🔍 Privy Auth State:', {
  //     ready,
  //     authenticated,
  //     userId: user?.id,
  //     walletsCount: wallets.length,
  //     isFirebaseSyncing
  //   });
  // }, [ready, authenticated, user, wallets, isFirebaseSyncing]);

  // Temporarily disable Firebase sync to prevent infinite loops
  // TODO: Re-enable this when the authentication flow is stable
  // useEffect(() => {
  //   const syncUserToFirebase = async () => {
  //     if (authenticated && user && ready && !isFirebaseSyncing) {
  //       console.log('🔄 Starting Firebase sync for user:', user.id);
  //       setIsFirebaseSyncing(true);
  //       try {
  //         const syncedUser = await PrivyFirebaseSync.syncUserToFirebase(user, wallets);
  //         if (syncedUser) {
  //           setFirebaseUser(syncedUser);
  //           console.log('✅ User synced to Firebase:', syncedUser);
  //         }
  //       } catch (error) {
  //         console.error('❌ Failed to sync user to Firebase:', error);
  //       } finally {
  //         setIsFirebaseSyncing(false);
  //       }
  //     }
  //   };

  //   syncUserToFirebase();
  // }, [authenticated, user, ready, wallets]);

  // Update wallet addresses when wallets change
  useEffect(() => {
    const updateWallets = async () => {
      if (authenticated && user && wallets.length > 0 && firebaseUser) {
        try {
          await PrivyFirebaseSync.updateUserWallets(user.id, wallets);
          console.log('✅ Updated wallet addresses in Firebase');
        } catch (error) {
          console.error('❌ Failed to update wallets:', error);
        }
      }
    };

    updateWallets();
  }, [wallets, authenticated, user, firebaseUser]);

  // Enhanced login with error handling
  const handleLogin = async () => {
    try {
      console.log('🔄 Starting Privy login process...');
      await login();
      console.log('✅ Privy login completed successfully');
      // Temporarily disable toast to prevent infinite loops
      // toast({
      //   title: "✅ Welcome!",
      //   description: "Successfully signed in to your account",
      // });
    } catch (error) {
      console.error('❌ Privy login error:', error);
      toast({
        title: "❌ Login Failed",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Enhanced logout with cleanup
  const handleLogout = async () => {
    try {
      await logout();
      setFirebaseUser(null);
      toast({
        title: "👋 Goodbye!",
        description: "Successfully signed out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "❌ Logout Failed",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get user's wallets with detailed info
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
  const connectedWallet = wallets.find(wallet => wallet.walletClientType !== 'privy');
  const primaryWallet = embeddedWallet || connectedWallet;

  // Enhanced user object with Web3 capabilities and Firebase data
  const enhancedUser = user ? {
    // Basic user info
    id: user.id,
    email: user.email?.address || '',
    displayName: user.google?.name || user.twitter?.name || user.discord?.username || 'Anonymous',
    photoURL: user.google?.profilePictureUrl || user.twitter?.profilePictureUrl || null,
    
    // Web3 specific fields
    walletAddress: primaryWallet?.address || null,
    embeddedWalletAddress: embeddedWallet?.address || null,
    connectedWalletAddress: connectedWallet?.address || null,
    hasWallet: wallets.length > 0,
    hasEmbeddedWallet: !!embeddedWallet,
    hasConnectedWallet: !!connectedWallet,
    
    // Authentication methods
    linkedAccounts: {
      email: !!user.email,
      google: !!user.google,
      twitter: !!user.twitter,
      discord: !!user.discord,
      wallet: wallets.length > 0,
      embeddedWallet: !!embeddedWallet,
    },
    
    // Firebase user data (if available)
    firebaseUser,
    onboardingCompleted: firebaseUser?.onboardingCompleted || false,
    preferences: firebaseUser?.preferences || { theme: 'light', notifications: true },
    
    // Original user object for compatibility
    privyUser: user,
  } : null;

  // Wallet management functions
  const getEmbeddedWalletAddress = () => embeddedWallet?.address || null;
  const getConnectedWalletAddress = () => connectedWallet?.address || null;
  const getPrimaryWalletAddress = () => primaryWallet?.address || null;
  
  // User preference management
  const updatePreferences = async (preferences: Partial<PrivyFirebaseUser['preferences']>) => {
    if (user) {
      await PrivyFirebaseSync.updateUserPreferences(user.id, preferences);
      // Refresh Firebase user data
      const updatedUser = await PrivyFirebaseSync.getUserFromFirebase(user.id);
      if (updatedUser) {
        setFirebaseUser(updatedUser);
      }
    }
  };

  const completeOnboarding = async () => {
    if (user) {
      await PrivyFirebaseSync.completeOnboarding(user.id);
      // Refresh Firebase user data
      const updatedUser = await PrivyFirebaseSync.getUserFromFirebase(user.id);
      if (updatedUser) {
        setFirebaseUser(updatedUser);
      }
    }
  };

  return {
    // Core authentication state
    ready,
    authenticated,
    user: enhancedUser,
    isLoading: !ready || isFirebaseSyncing,
    
    // Authentication actions
    login: handleLogin,
    logout: handleLogout,
    
    // Account linking
    linkEmail,
    linkWallet,
    unlinkEmail,
    unlinkWallet,
    
    // Wallet management
    createWallet,
    exportWallet,
    wallets,
    embeddedWallet,
    connectedWallet,
    primaryWallet,
    
    // Wallet address getters
    getEmbeddedWalletAddress,
    getConnectedWalletAddress,
    getPrimaryWalletAddress,
    
    // User management
    firebaseUser,
    updatePreferences,
    completeOnboarding,
    
    // Firebase sync state
    isFirebaseSyncing,
  };
};