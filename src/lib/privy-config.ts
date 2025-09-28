import type { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  // Login methods - order matters for UI
  loginMethods: ['email', 'google', 'wallet', 'twitter', 'discord'],
  
  // Appearance customization
  appearance: {
    theme: 'light',
    accentColor: '#6366f1',
    logo: '/logo.svg',
    showWalletLoginFirst: false,
    walletChainType: 'ethereum-only',
  },
  
  // Embedded wallet configuration
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
    showWalletUIs: true,
  },
  
  // Legal and privacy
  legal: {
    termsAndConditionsUrl: '/terms',
    privacyPolicyUrl: '/privacy',
  },
  
  // Additional features
  mfa: {
    noPromptOnMfaRequired: false,
  },
  
  // Supported chains (you can add more later)
  supportedChains: [
    {
      id: 1,
      name: 'Ethereum',
      network: 'homestead',
      nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
      },
      rpcUrls: {
        default: {
          http: ['https://cloudflare-eth.com'],
        },
        public: {
          http: ['https://cloudflare-eth.com'],
        },
      },
      blockExplorers: {
        default: { name: 'Etherscan', url: 'https://etherscan.io' },
      },
    },
  ],
};