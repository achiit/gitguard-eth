import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, onAuthStateChanged, FirebaseUser, firestore } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { AuthUser } from "@/types";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  hasProfile: boolean;
  setHasProfile: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          hasProfile: false
        };
        
        try {
          // Check if the user has a profile in Firestore
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            authUser.hasProfile = true;
            setHasProfile(true);
          }
        } catch (error) {
          console.error("Error checking user profile:", error);
          // User doesn't have a profile yet - that's okay
        }
        
        setUser(authUser);
      } else {
        // User is signed out
        setUser(null);
        setHasProfile(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, hasProfile, setHasProfile }}>
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
