# Debug Invoice Status Issue

## The Problem
Invoice shows as "Funded" in the UI but database shows `state: "created"` and `status: "sent"`.

## Debugging Steps

### 1. Check Browser Console
When you open the payment link, look for these console logs:
```
🔍 Loading onchain status for invoice: {...}
📊 Onchain status result: {...}
🏷️ Determining status badge: {...}
```

### 2. Key Things to Check

**Database vs Blockchain State:**
- Database state: `"created"` (string)
- Blockchain state: `0` = Created, `1` = Funded, `2` = Released

**If you see:**
- `onchainState: 1` → Someone already funded this invoice on blockchain
- `onchainState: 0` → Invoice is created but not funded (correct)

### 3. Possible Causes

**A) Invoice Already Funded:**
- Someone already funded this invoice
- Database wasn't updated to reflect the funding
- Solution: The system should auto-update the database

**B) Wrong Invoice ID:**
- The `idHex` in database doesn't match the actual blockchain invoice
- Check if `idHex: "0xaf864beae92030923209a14ea5a04d963da28b1e66f857369312e721928527b5"` is correct

**C) Network/Contract Issues:**
- Reading from wrong network
- Contract address mismatch

### 4. Quick Test

**Manual Check:**
1. Open payment link
2. Open browser console
3. Look for the debug logs I added
4. Check what `onchainState` shows

**Expected for Unfunded Invoice:**
```
📊 Onchain status result: {
  onchainState: 0,
  onchainStateName: "Created",
  databaseState: "created",
  canFund: true,
  canRelease: false
}
```

**If Showing as Funded:**
```
📊 Onchain status result: {
  onchainState: 1,
  onchainStateName: "Funded", 
  databaseState: "created",  // ← Mismatch!
  canFund: false,
  canRelease: true
}
```

### 5. Solutions

**If Already Funded:**
- The invoice was actually funded on blockchain
- Database needs to be updated
- System should auto-sync this

**If Wrong ID:**
- Need to regenerate the correct `idHex`
- Or create a new invoice

The debug logs will tell us exactly what's happening!