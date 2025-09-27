// Quick debug script for the failed transaction
// Run with: node debug-tx.js

const txHash = '0xb7adc720a0d556cfcbb8952f962ea1770719e91cd6f5c88d4f6f35185ede56e5'
const escrowAddress = '0x3617c20B169d5f49E44aF7a072f41dB0e6b641B0'
const userAddress = '0x53D2c4ecb50e749B827Da2db690e76B08250BeC6'

console.log('🔍 DEBUGGING FAILED FUNDING TRANSACTION')
console.log('=====================================')
console.log('Transaction Hash:', txHash)
console.log('Escrow Contract:', escrowAddress)
console.log('User Address:', userAddress)
console.log('Revert Reason:', '0x8523b62a')
console.log('')

console.log('🚨 LIKELY CAUSES OF ERROR 0x8523b62a:')
console.log('1. Invoice does not exist on-chain')
console.log('2. Invoice is not in "Created" state (already funded/released)')
console.log('3. User is not the designated payer for this invoice')
console.log('4. Invoice amount mismatch')
console.log('5. Contract state validation failed')
console.log('')

console.log('🔧 DEBUGGING STEPS:')
console.log('1. Go to /invoices page in your app')
console.log('2. Use "Transaction Debug" tool with this hash:', txHash)
console.log('3. Use "Invoice State Debug" to check the invoice details')
console.log('4. Verify you are the correct payer address')
console.log('5. Check if invoice exists and is in "Created" state')
console.log('')

console.log('💡 QUICK FIXES TO TRY:')
console.log('1. Make sure you are using the correct invoice ID format')
console.log('2. Verify the invoice was created on-chain successfully')
console.log('3. Check that you are the payer (not payee) for this invoice')
console.log('4. Ensure the invoice is in "Created" state, not already funded')
console.log('')

console.log('🌐 Explorer Link:')
console.log('https://explorer.testnet.citrea.xyz/tx/' + txHash)