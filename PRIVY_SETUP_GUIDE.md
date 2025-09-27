# 🚀 Privy Integration Setup Guide

## 📋 Prerequisites Checklist

### ✅ **Step 1: Create Privy Account**
1. Go to [privy.io](https://privy.io)
2. Sign up for a free account
3. Create a new app in the dashboard
4. Note down your **App ID** (starts with `clp...`)

### ✅ **Step 2: Install Required Packages**
```bash
# Core Privy packages
bun add @privy-io/react-auth @privy-io/wagmi-connector

# Wallet infrastructure (recommended)
bun add wagmi viem @tanstack/react-query

# Additional wallet connectors (optional)
bun add @walletconnect/web3wallet @coinbase/wallet-sdk
```

### ✅ **Step 3: Environment Configuration**
Create `.env.local` file with:
```bash
# Required - Get from Privy Dashboard
VITE_PRIVY_APP_ID=clp_your_app_id_here

# Optional - For advanced features
VITE_PRIVY_CLIENT_ID=your_client_id
PRIVY_APP_SECRET=your_app_secret  # Server-side only
```

## 🔧 **Privy Dashboard Configuration**

### **Login Methods to Enable:**
- ✅ **Email** (passwordless)
- ✅ **Google OAuth**
- ✅ **Twitter OAuth** 
- ✅ **Discord OAuth**
- ✅ **Wallet Connect** (MetaMask, WalletConnect, etc.)
- ✅ **Embedded Wallets** (Privy creates wallets for users)

### **Domain Configuration:**
- Add your development domain: `http://localhost:5173`
- Add your production domain: `https://yourdomain.com`

### **Webhook Configuration (Optional):**
- Set webhook URL for user events
- Configure user creation/login events

## 🎨 **Customization Options**

### **Appearance Settings:**
```typescript
const privyConfig = {
  appearance: {
    theme: 'light' | 'dark',
    accentColor: '#6366f1',
    logo: '/your-logo.png',
    showWalletLoginFirst: false,
  }
}
```

### **Login Method Priority:**
```typescript
const privyConfig = {
  loginMethods: [
    'email',      // Most user-friendly
    'google',     // Popular social login
    'wallet',     // Web3 native
    'twitter',    // Social media
    'discord',    // Gaming/community
  ]
}
```

## 🔐 **Security Features**

### **Multi-Factor Authentication:**
- Email verification
- SMS verification (premium)
- Hardware wallet signatures

### **Embedded Wallets:**
- Automatic wallet creation for non-crypto users
- Secure key management
- Cross-device wallet recovery

### **Session Management:**
- JWT tokens with configurable expiry
- Refresh token rotation
- Secure logout across devices

## 💰 **Pricing Tiers**

### **Free Tier:**
- ✅ Up to 1,000 monthly active users
- ✅ All login methods
- ✅ Embedded wallets
- ✅ Basic customization

### **Pro Tier ($99/month):**
- ✅ Up to 10,000 MAU
- ✅ SMS authentication
- ✅ Advanced webhooks
- ✅ Priority support

### **Enterprise:**
- ✅ Unlimited MAU
- ✅ Custom contracts
- ✅ Dedicated support
- ✅ SLA guarantees

## 🚀 **Implementation Steps**

### **1. Wrap Your App:**
```typescript
import { PrivyProvider } from '@privy-io/react-auth';

function App() {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#6366f1',
        },
      }}
    >
      <YourApp />
    </PrivyProvider>
  );
}
```

### **2. Use Authentication:**
```typescript
import { usePrivy } from '@privy-io/react-auth';

function LoginButton() {
  const { login, logout, authenticated, user } = usePrivy();
  
  return (
    <button onClick={authenticated ? logout : login}>
      {authenticated ? `Logout ${user?.email?.address}` : 'Login'}
    </button>
  );
}
```

### **3. Access Wallets:**
```typescript
import { useWallets } from '@privy-io/react-auth';

function WalletInfo() {
  const { wallets } = useWallets();
  
  return (
    <div>
      {wallets.map(wallet => (
        <div key={wallet.address}>
          {wallet.address} - {wallet.walletClientType}
        </div>
      ))}
    </div>
  );
}
```

## 🔄 **Migration from Firebase Auth**

### **Dual Authentication Period:**
1. Keep Firebase Auth running
2. Add Privy alongside
3. Migrate users gradually
4. Sync user data between systems

### **User Data Migration:**
```typescript
// Sync Privy user with Firebase
const syncUserData = async (privyUser) => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    // Merge user data
    await updateDoc(doc(db, 'users', privyUser.id), {
      email: privyUser.email?.address,
      walletAddress: privyUser.wallet?.address,
      // ... other fields
    });
  }
};
```

## 🎯 **Next Steps After Setup**

1. **Test in Development:**
   - Verify all login methods work
   - Test wallet connections
   - Check user data flow

2. **Configure Production:**
   - Add production domains
   - Set up monitoring
   - Configure webhooks

3. **User Experience:**
   - Customize login UI
   - Add loading states
   - Handle error cases

4. **Advanced Features:**
   - Smart contract interactions
   - Token gating
   - NFT authentication

## 🆘 **Common Issues & Solutions**

### **"App ID not found":**
- Check your App ID is correct
- Verify domain is added to Privy dashboard

### **Wallet connection fails:**
- Ensure WalletConnect project ID is set
- Check wallet connector configuration

### **User data not syncing:**
- Verify webhook configuration
- Check Firebase security rules

## 📚 **Useful Resources**

- [Privy Documentation](https://docs.privy.io)
- [React Integration Guide](https://docs.privy.io/guide/react)
- [Wallet Integration](https://docs.privy.io/guide/react/wallets)
- [Customization Options](https://docs.privy.io/guide/react/configuration)

---

**Ready to implement? Start with Step 1: Create your Privy account!** 🚀