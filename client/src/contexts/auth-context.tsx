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
          // Sync user to Firebase first
          console.log('Syncing user to Firebase...');
          await PrivyFirebaseSync.syncUserToFirebase(privyUser, wallets);
          
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
