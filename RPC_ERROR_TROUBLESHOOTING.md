# 🚨 RPC Error Troubleshooting Guide

## The Current Issue
You're getting "Internal JSON-RPC error" (-32603) when trying to release invoices. This is a network/RPC communication issue.

## Root Causes & Solutions

### 1. **Gas Estimation Failure**
**Cause**: The RPC can't estimate gas because the transaction would fail
**Solutions**:
- ✅ **Added pre-validation**: Now checks invoice state before attempting transaction
- ✅ **Added fallback gas limit**: Uses 350,000 gas if estimation fails
- ✅ **Better error messages**: Explains why the transaction would fail

### 2. **Invoice State Issues**
**Cause**: Trying to release an invoice that's not in the correct state
**Solutions**:
- ✅ **State validation**: Only allows release if invoice is "Funded" (state = 1)
- ✅ **Authorization check**: Only allows payee to release
- ✅ **Existence check**: Verifies invoice exists on-chain

### 3. **Network Connection Issues**
**Cause**: Poor connection to Citrea testnet RPC
**Solutions**:
- ✅ **Better error handling**: Specific messages for RPC errors
- ✅ **Retry logic**: Can be added if needed
- 🔄 **Manual fix**: Switch to different RPC endpoint if needed

## Updated Functions

### Release Function Improvements
```typescript
// NEW: Pre-validation before attempting transaction
const invoiceData = await publicClient.readContract({
  address: ESCROW,
  abi: abiEscrow,
  functionName: 'invoices',
  args: [idHex]
})

// Check state, authorization, existence
if (state !== 1) throw new Error('Invoice must be funded to release')
if (payee !== userAddress) throw new Error('Only payee can release')

// NEW: Fallback gas limit if estimation fails
let gasLimit = '0x55730' // 350,000 gas fallback
try {
  gasLimit = estimateGas() // Try estimation first
} catch {
  // Use fallback if estimation fails
}
```

### Funding Function Improvements
```typescript
// NEW: Better RPC error handling
if (error.code === -32603) {
  throw new Error('Network error: Please check your connection and try again.')
}
if (error.message?.includes('Internal JSON-RPC error')) {
  throw new Error('RPC error: Check your network connection and try again.')
}
```

## Debug Tools Added

### 1. **Release Debug Tool**
- Pre-release validation checks
- State verification (must be "Funded")
- Authorization check (must be payee)
- Gas balance check

### 2. **Enhanced Transaction Debug**
- Analyze failed transactions
- Decode error reasons
- Check invoice state

### 3. **Improved Funding Debug**
- Pre-funding validation
- Balance and allowance checks
- State verification

## Testing Steps

### Step 1: Use Release Debug Tool
1. Go to `/invoices` page
2. Find "Release Debug Tool" in development section
3. Enter your invoice ID
4. Click "Run Checks" to validate:
   - ✅ Invoice exists and is funded
   - ✅ You are the payee
   - ✅ You have ETH for gas

### Step 2: Check Transaction Details
1. Use "Transaction Debug" with your failed tx hash
2. Look for specific error reasons
3. Verify invoice state and authorization

### Step 3: Try Release Again
1. If all checks pass in Release Debug
2. Click "Release Invoice"
3. Should work without RPC errors

## Common Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| `Internal JSON-RPC error` | Gas estimation failed | Use debug tools to check state |
| `Invoice is in Created state` | Invoice not funded yet | Fund invoice first |
| `Only the payee can release` | Wrong user trying to release | Switch to payee account |
| `Invoice does not exist` | Wrong invoice ID | Check ID format |
| `Network error` | RPC connection issue | Check internet/try again |

## Network Issues

If you continue getting RPC errors:

### Option 1: Check Network
- Ensure stable internet connection
- Try refreshing the page
- Clear browser cache

### Option 2: Switch RPC (if needed)
```typescript
// In client/src/lib/viem.ts - if current RPC is unreliable
export const publicClient = createPublicClient({
  chain: {
    ...citreaTestnet,
    rpcUrls: {
      default: {
        http: ['https://rpc.testnet.citrea.xyz'] // Alternative RPC
      }
    }
  },
  transport: http()
})
```

## Success Indicators

After the fixes, you should see:
- ✅ Pre-validation catches issues before RPC calls
- ✅ Clear error messages explain what's wrong
- ✅ Fallback gas limits prevent estimation failures
- ✅ Release works for properly funded invoices
- ✅ No more "Internal JSON-RPC error" for valid transactions

**The key improvement is that we now validate everything locally before making RPC calls, preventing most RPC errors from occurring.**