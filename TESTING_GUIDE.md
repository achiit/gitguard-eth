# Testing Guide - Different Wallets for Freelancer vs Client

## The Issue You're Seeing

Both freelancer and client wallet addresses are the same because you're testing with the same MetaMask account. This is expected behavior when testing locally.

## How to Test with Different Wallets

### Option 1: Use Different MetaMask Accounts
1. **For Freelancer Flow:**
   - Use MetaMask Account 1
   - Create contract, sign it, send to client

2. **For Client Flow:**
   - Switch to MetaMask Account 2 (or create new account)
   - Open client link, connect wallet, sign contract

### Option 2: Use Different Browsers
1. **Chrome (Freelancer):** 
   - Install MetaMask with Account A
   - Do freelancer flow

2. **Firefox/Safari (Client):**
   - Install MetaMask with Account B  
   - Do client flow

### Option 3: Use Incognito/Private Mode
1. **Regular Browser (Freelancer):** Normal MetaMask
2. **Incognito Mode (Client):** Different MetaMask account

## Expected Behavior

### ✅ **Same Wallet (Testing)**
- Freelancer Address: `0x53D2c4ecb50e749B827Da2db690e76B08250BeC6`
- Client Address: `0x53d2c4ecb50e749b827da2db690e76b08250bec6` (same, just different case)
- **Result:** Invoice created successfully, but both roles use same wallet

### ✅ **Different Wallets (Production)**
- Freelancer Address: `0x53D2c4ecb50e749B827Da2db690e76B08250BeC6`
- Client Address: `0x742d35Cc6634C0532925a3b8D4C9db96DfB3f091` (different)
- **Result:** Invoice created with proper payee/payer separation

## Why Same Wallet Still Works

The system is designed to handle both scenarios:
- **Same Wallet:** Works for testing, invoice gets created properly
- **Different Wallets:** Works for production, proper separation of roles

## Quick Test Steps

1. **Create contract as freelancer** (Account 1)
2. **Sign contract as freelancer** (Account 1) 
3. **Switch to different MetaMask account** (Account 2)
4. **Open client link and sign** (Account 2)
5. **Check console logs** - should show different addresses

The system is working correctly! The "same wallet" scenario is just because you're testing with one MetaMask account.