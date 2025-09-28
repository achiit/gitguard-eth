import { usePrivy, useWallets } from '@privy-io/react-auth';

/**
 * Utility functions for handling different types of wallet addresses
 */

export interface WalletAddresses {
  embeddedWallet: string | null;
  connectedWallet: string | null;
  primaryWallet: string | null;
}

/**
 * Extract wallet addresses from Privy wallets array
 */
export function extractWalletAddresses(wallets: any[]): WalletAddresses {
  // Find embedded wallet (created by Privy) - this should be used for payees
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
  
  // Find connected external wallet (MetaMask, WalletConnect, etc.) - this should be used for payers
  const connectedWallet = wallets.find(wallet => wallet.walletClientType !== 'privy');
  
  // Primary wallet address (prefer embedded for payees, connected for payers)
  const primaryWallet = embeddedWallet?.address || connectedWallet?.address || null;
  
  return {
    embeddedWallet: embeddedWallet?.address || null,
    connectedWallet: connectedWallet?.address || null,
    primaryWallet,
  };
}

/**
 * Get the payee wallet address (should always be the Privy embedded wallet)
 */
export function getPayeeWalletAddress(wallets: any[]): string | null {
  const { embeddedWallet } = extractWalletAddresses(wallets);
  return embeddedWallet;
}

/**
 * Get the payer wallet address (should be the connected external wallet if available)
 */
export function getPayerWalletAddress(wallets: any[]): string | null {
  const { connectedWallet, embeddedWallet } = extractWalletAddresses(wallets);
  // Prefer connected wallet for payments, fallback to embedded if no external wallet
  return connectedWallet || embeddedWallet;
}

/**
 * Hook to get wallet addresses for the current user
 */
export function useWalletAddresses() {
  const { wallets } = useWallets();
  
  const addresses = extractWalletAddresses(wallets);
  
  return {
    ...addresses,
    getPayeeAddress: () => getPayeeWalletAddress(wallets),
    getPayerAddress: () => getPayerWalletAddress(wallets),
    hasEmbeddedWallet: !!addresses.embeddedWallet,
    hasConnectedWallet: !!addresses.connectedWallet,
  };
}

/**
 * Validate that a user has the required wallet setup for their role
 */
export function validateWalletSetup(wallets: any[], role: 'payee' | 'payer'): {
  isValid: boolean;
  error?: string;
  address?: string;
} {
  const addresses = extractWalletAddresses(wallets);
  
  if (role === 'payee') {
    // Payees must have an embedded wallet
    if (!addresses.embeddedWallet) {
      return {
        isValid: false,
        error: 'Payees must have a Privy embedded wallet. Please complete your wallet setup.',
      };
    }
    return {
      isValid: true,
      address: addresses.embeddedWallet,
    };
  } else {
    // Payers should preferably have a connected wallet, but can use embedded as fallback
    const payerAddress = addresses.connectedWallet || addresses.embeddedWallet;
    if (!payerAddress) {
      return {
        isValid: false,
        error: 'Please connect a wallet to make payments.',
      };
    }
    return {
      isValid: true,
      address: payerAddress,
    };
  }
}