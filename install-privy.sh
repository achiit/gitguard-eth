#!/bin/bash

echo "🚀 Installing Privy Web3 Authentication..."

# Install core Privy packages
echo "📦 Installing core packages..."
bun add @privy-io/react-auth @privy-io/wagmi-connector

# Install wallet infrastructure
echo "🔗 Installing wallet connectors..."
bun add wagmi viem @tanstack/react-query

# Install additional wallet support
echo "💰 Installing wallet providers..."
bun add @walletconnect/web3wallet @coinbase/wallet-sdk

echo "✅ Privy packages installed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Create account at https://privy.io"
echo "2. Get your App ID from the dashboard"
echo "3. Add VITE_PRIVY_APP_ID to your .env.local file"
echo "4. Check PRIVY_SETUP_GUIDE.md for complete setup"
echo ""
echo "🎉 Ready to implement Web3 authentication!"