import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase';
import type { User } from '@privy-io/react-auth';

export interface PrivyFirebaseUser {
  id: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  
  // Privy-specific fields
  privyId: string;
  walletAddress: string | null;
  embeddedWalletAddress: string | null;
  connectedWalletAddress: string | null;
  
  // Authentication methods
  linkedAccounts: {
    email: boolean;
    google: boolean;
    twitter: boolean;
    discord: boolean;
    wallet: boolean;
    embeddedWallet: boolean;
  };
  
  // Profile data from different providers
  googleProfile: {
    name?: string;
    email?: string;
    picture?: string;
  } | null;
  
  twitterProfile: {
    name?: string;
    username?: string;
    profilePictureUrl?: string;
  } | null;
  
  discordProfile: {
    username?: string;
    discriminator?: string;
    avatar?: string;
  } | null;
  
  // Timestamps
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
  
  // App-specific fields
  onboardingCompleted: boolean;
  organizationName?: string;
  logoUrl?: string;
  description?: string;
  phone?: string;
  address?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

export class PrivyFirebaseSync {
  /**
   * Extract wallet addresses from Privy user and wallets
   */
  static extractWalletAddresses(user: User, wallets: any[]) {
    // Find embedded wallet (created by Privy)
    const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
    
    // Find connected external wallet (MetaMask, WalletConnect, etc.)
    const connectedWallet = wallets.find(wallet => wallet.walletClientType !== 'privy');
    
    // Primary wallet address (prefer embedded, fallback to connected)
    const primaryWalletAddress = embeddedWallet?.address || connectedWallet?.address || null;
    
    return {
      walletAddress: primaryWalletAddress,
      embeddedWalletAddress: embeddedWallet?.address || null,
      connectedWalletAddress: connectedWallet?.address || null,
    };
  }

  /**
   * Convert Privy user to Firebase user format
   */
  static convertPrivyUserToFirebase(user: User, wallets: any[]): Partial<PrivyFirebaseUser> {
    const walletAddresses = this.extractWalletAddresses(user, wallets);
    
    return {
      privyId: user.id,
      email: user.email?.address || null,
      displayName: user.google?.name || user.twitter?.name || user.discord?.username || 'Anonymous User',
      photoURL: user.google?.profilePictureUrl || user.twitter?.profilePictureUrl || null,
      
      // Wallet addresses
      ...walletAddresses,
      
      // Linked accounts
      linkedAccounts: {
        email: !!user.email,
        google: !!user.google,
        twitter: !!user.twitter,
        discord: !!user.discord,
        wallet: wallets.length > 0,
        embeddedWallet: !!wallets.find(w => w.walletClientType === 'privy'),
      },
      
      // Profile data
      googleProfile: user.google ? {
        name: user.google.name,
        email: user.google.email,
        picture: user.google.profilePictureUrl,
      } : null,
      
      twitterProfile: user.twitter ? {
        name: user.twitter.name,
        username: user.twitter.username,
        profilePictureUrl: user.twitter.profilePictureUrl,
      } : null,
      
      discordProfile: user.discord ? {
        username: user.discord.username,
        discriminator: user.discord.discriminator,
        avatar: user.discord.avatar,
      } : null,
      
      // Timestamps
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
  }

  /**
   * Create or update user in Firebase
   */
  static async syncUserToFirebase(user: User, wallets: any[]): Promise<PrivyFirebaseUser | null> {
    try {
      const userId = user.id;
      const userRef = doc(db, 'users', userId);
      
      // Check if user already exists
      const existingUserDoc = await getDoc(userRef);
      const userData = this.convertPrivyUserToFirebase(user, wallets);
      
      if (existingUserDoc.exists()) {
        // Update existing user - preserve organization data if it exists
        const existingData = existingUserDoc.data();
        await updateDoc(userRef, {
          ...userData,
          // Preserve organization profile data if it exists
          organizationName: existingData.organizationName || userData.organizationName,
          logoUrl: existingData.logoUrl || userData.logoUrl,
          description: existingData.description || userData.description,
          phone: existingData.phone || userData.phone,
          address: existingData.address || userData.address,
          // Don't overwrite creation timestamp
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
        
        console.log('✅ Updated existing user in Firebase:', userId);
      } else {
        // Create new user
        await setDoc(userRef, {
          ...userData,
          id: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          onboardingCompleted: false,
          // Initialize organization fields as empty
          organizationName: '',
          logoUrl: '',
          description: '',
          phone: '',
          address: '',
          preferences: {
            theme: 'light',
            notifications: true,
          },
        });
        
        console.log('✅ Created new user in Firebase:', userId);
      }
      
      // Return the updated user data
      const updatedDoc = await getDoc(userRef);
      return updatedDoc.data() as PrivyFirebaseUser;
      
    } catch (error) {
      console.error('❌ Error syncing user to Firebase:', error);
      return null;
    }
  }

  /**
   * Get user from Firebase
   */
  static async getUserFromFirebase(userId: string): Promise<PrivyFirebaseUser | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as PrivyFirebaseUser;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting user from Firebase:', error);
      return null;
    }
  }

  /**
   * Update user wallet addresses when they change
   */
  static async updateUserWallets(userId: string, wallets: any[]): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const walletAddresses = this.extractWalletAddresses({ id: userId } as User, wallets);
      
      // Get existing user data to preserve other linkedAccounts
      const existingDoc = await getDoc(userRef);
      const existingData = existingDoc.exists() ? existingDoc.data() : {};
      const existingLinkedAccounts = existingData.linkedAccounts || {};
      
      await updateDoc(userRef, {
        ...walletAddresses,
        'linkedAccounts.wallet': wallets.length > 0,
        'linkedAccounts.embeddedWallet': !!wallets.find(w => w.walletClientType === 'privy'),
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Updated user wallet addresses:', {
        userId,
        walletAddresses,
        hasEmbedded: !!wallets.find(w => w.walletClientType === 'privy'),
        hasExternal: !!wallets.find(w => w.walletClientType !== 'privy')
      });
    } catch (error) {
      console.error('❌ Error updating user wallets:', error);
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId: string, preferences: Partial<PrivyFirebaseUser['preferences']>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        preferences,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Updated user preferences:', userId);
    } catch (error) {
      console.error('❌ Error updating user preferences:', error);
    }
  }

  /**
   * Mark onboarding as completed
   */
  static async completeOnboarding(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      await updateDoc(userRef, {
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ Completed onboarding for user:', userId);
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
    }
  }
}