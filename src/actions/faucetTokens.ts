import { encodeFunctionData } from 'viem'
import { abiErc20, WPYUSD } from '../lib/paystream'

export async function faucetTokens(amount: bigint = BigInt(100000000)) { // Default 100 WPYUSD (6 decimals)
  if (!window.ethereum) {
    throw new Error('No wallet found')
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' })
  const accounts = await window.ethereum.request({ method: 'eth_accounts' })

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts connected')
  }

  // Call faucet function on WPYUSD contract
  const faucetData = encodeFunctionData({
    abi: abiErc20,
    functionName: 'faucet',
    args: [amount]
  })

  try {
    // Estimate gas first
    const gasEstimate = await window.ethereum.request({
      method: 'eth_estimateGas',
      params: [{
        to: WPYUSD,
        from: accounts[0],
        data: faucetData
      }]
    })

    console.log('Gas estimate for faucet:', gasEstimate)

    // Send transaction with estimated gas + buffer
    const gasLimit = Math.floor(parseInt(gasEstimate, 16) * 1.2) // Add 20% buffer
    
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: WPYUSD,
        from: accounts[0],
        data: faucetData,
        gas: '0x' + gasLimit.toString(16)
      }]
    })

    return txHash
  } catch (error) {
    console.error('Faucet transaction error:', error)
    
    // Provide more specific error messages
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient ETH for gas fees. Please get some testnet ETH first.')
    } else if (error.message?.includes('execution reverted')) {
      throw new Error('Faucet transaction failed. The contract may have restrictions or be out of tokens.')
    } else if (error.code === 4001) {
      throw new Error('Transaction rejected by user')
    }
    
    throw error
  }
} declare global {
  interface Window {
    ethereum?: any
  }
}