# Freelancer Wallet Setup Guide

## The Issue
When clients try to sign contracts, they get an error: "Freelancer wallet address not found"

## Root Cause
The freelancer hasn't created their Privy embedded wallet yet, so their wallet address is `null` in the database.

## Solution Steps for Freelancer

### 1. Login to Your Account
- Go to your freelancer dashboard
- Make sure you're logged in with Privy

### 2. Create Your Payment Wallet
- Go to any contract (draft or sent)
- Look for the "Wallet Status" section
- Click the **"Create Wallet"** button next to "Privy Wallet (for receiving payments)"
- This creates your embedded wallet for receiving payments

### 3. Verify Wallet Creation
After clicking "Create Wallet", you should see:
- ✅ "Connected" badge next to Privy Wallet
- Your wallet address displayed (0x...)
- "Ready to receive payments" status

### 4. Now Clients Can Sign
Once your wallet is created:
- Clients can sign contracts successfully
- Invoices will be created automatically with your wallet address
- You can receive payments to this wallet

## Technical Details

### Before Wallet Creation:
```
embeddedWalletAddress: null
walletAddress: null
connectedWalletAddress: null
```

### After Wallet Creation:
```
embeddedWalletAddress: "0x53D2c4ecb50e749B827Da2db690e76B08250BeC6"
walletAddress: "0x53D2c4ecb50e749B827Da2db690e76B08250BeC6"
connectedWalletAddress: null
```

## Important Notes

1. **One-Time Setup**: You only need to create the wallet once
2. **Automatic Sync**: The wallet address is automatically saved to your profile
3. **Required for Payments**: Without this wallet, clients can't create invoices
4. **Secure**: Privy wallets are secure and managed for you

## Troubleshooting

If you still see issues after creating the wallet:
1. Refresh the page
2. Check the browser console for sync messages
3. Try logging out and back in
4. Contact support if the wallet address is still null

The system will automatically sync your wallet address to Firebase when you create it!