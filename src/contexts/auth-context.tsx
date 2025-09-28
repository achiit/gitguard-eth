import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useToast } from "@/hooks/use-toast";
import { AuthUser } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { PrivyFirebaseSync } from "@/lib/privy-firebase-sync";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  hasProfile: boolean;
  setHasProfile: (value: boolean) => void;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { ready, authenticated, user: privyUser, login: privyLogin, logout: privyLogout } = usePrivy();
  const { wallets } = useWallets();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const { toast } = useToast();

  // Separate effect to handle wallet changes
  useEffect(() => {
    const handleWalletChanges = async () => {
      if (authenticated && privyUser && wallets.length > 0) {
        console.log('Wallet changes detected, syncing to Firebase...');
        
        const embeddedWallets = wallets.filter(wallet => wallet.walletClientType === 'privy');
        const externalWallets = wallets.filter(wallet => wallet.walletClientType !== 'privy');
        
        console.log('Wallet sync info:', {
          totalWallets: wallets.length,
          embeddedWallets: embeddedWallets.map(w => ({ type: w.walletClientType, address: w.address })),
          externalWallets: externalWallets.map(w => ({ type: w.walletClientType, address: w.address }))
        });

        try {
          // Update wallet addresses in Firebase
          await PrivyFirebaseSync.updateUserWallets(privyUser.id, wallets);
          
          if (embeddedWallets.length > 0) {
            console.log('✅ Embedded wallet synced to Firebase:', embeddedWallets[0].address);
            toast({
              title: "Wallet Connected",
              description: "Your wallet has been connected and synced successfully.",
            });
          }
        } catch (error) {
          console.error('Error syncing wallet changes:', error);
        }
      }
    };

    handleWalletChanges();
  }, [wallets, authenticated, privyUser, toast]);

  useEffect(() => {
    const handleAuthState = async () => {
      console.log('Auth state change:', { ready, authenticated, userId: privyUser?.id });
      
      if (!ready) {
        console.log('Privy not ready yet, waiting...');
        setIsLoading(true);
        return;
      }

      if (authenticated && privyUser) {
        console.log('User authenticated with Privy:', privyUser.id);
        
        // User is signed in with Privy
        const authUser: AuthUser = {
          uid: privyUser.id,
          email: privyUser.email?.address || "",
          displayName: privyUser.google?.name || privyUser.twitter?.name || privyUser.discord?.username || "Anonymous User",
          photoURL: privyUser.google?.profilePictureUrl || privyUser.twitter?.profilePictureUrl || null,
          hasProfile: false
        };
        
        try {
          // Sync user to Firebase first (this will include any existing wallets)
          console.log('Syncing user to Firebase...');
          const syncResult = await PrivyFirebaseSync.syncUserToFirebase(privyUser, wallets);
          console.log('Firebase sync result:', syncResult ? 'Success' : 'Failed');
          
          const embeddedWallets = wallets.filter(wallet => wallet.walletClientType === 'privy');
          if (embeddedWallets.length === 0) {
            console.warn('⚠️ No embedded wallet found - user needs to create one for receiving payments');
          }
          
          // Check if the user has completed their profile setup
          console.log('Checking user profile completion...');
          const userDoc = await getDoc(doc(firestore, 'users', privyUser.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data from Firestore:', {
              hasOrgName: !!userData.organizationName,
              hasLogo: !!userData.logoUrl,
              orgName: userData.organizationName,
              logoUrl: userData.logoUrl
            });
            
            // Check if user has completed organization profile setup
            if (userData.organizationName && userData.logoUrl) {
              console.log('User has complete profile');
              authUser.hasProfile = true;
              setHasProfile(true);
            } else {
              console.log('User profile incomplete - needs to complete registration');
              setHasProfile(false);
            }
          } else {
            console.log('User document does not exist in Firestore');
            setHasProfile(false);
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
          setHasProfile(false);
        }
        
        setUser(authUser);
      } else {
        console.log('User not authenticated, clearing state');
        // User is signed out
        setUser(null);
        setHasProfile(false);
      }
      setIsLoading(false);
    };

    handleAuthState();
  }, [ready, authenticated, privyUser, wallets]);

  const handleLogin = () => {
    privyLogin();
  };

  const handleLogout = async () => {
    await privyLogout();
    setUser(null);
    setHasProfile(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      hasProfile, 
      setHasProfile,
      login: handleLogin,
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
