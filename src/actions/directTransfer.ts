import { encodeFunctionData } from 'viem'
import { abiErc20, WPYUSD } from '../lib/paystream'

/**
 * Direct transfer function - bypasses escrow contract entirely
 * Sends tokens directly from current user to the payee
 * Use this as a manual override when escrow contract has bugs
 */
export async function directTransfer({
  payeeAddress,
  amountBig
}: {
  payeeAddress: `0x${string}`
  amountBig: bigint
}) {
  if (!window.ethereum) {
    throw new Error('No wallet found')
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' })
  const accounts = await window.ethereum.request({ method: 'eth_accounts' })
  
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts connected')
  }

  const userAddress = accounts[0]

  try {
    console.log('🚀 Starting direct transfer:', {
      from: userAddress,
      to: payeeAddress,
      amount: amountBig.toString(),
      token: WPYUSD
    })

    // Encode the transfer function call
    const transferData = encodeFunctionData({
      abi: abiErc20,
      functionName: 'transfer',
      args: [payeeAddress, amountBig]
    })

    // Estimate gas
    let gasLimit = '0x15F90' // Default fallback (90,000)
    
    try {
      const gasEstimate = await window.ethereum.request({
        method: 'eth_estimateGas',
        params: [{
          to: WPYUSD,
          from: userAddress,
          data: transferData
        }]
      })
      
      gasLimit = '0x' + Math.floor(parseInt(gasEstimate, 16) * 1.3).toString(16)
      console.log('Gas estimated:', gasLimit)
    } catch (gasError) {
      console.warn('Gas estimation failed, using fallback:', gasLimit)
    }

    // Send the transfer transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: WPYUSD,
        from: userAddress,
        data: transferData,
        gas: gasLimit
      }]
    })

    console.log('✅ Direct transfer transaction sent:', txHash)
    return txHash

  } catch (error: any) {
    console.error('❌ Direct transfer error:', error)
    
    // Provide specific error messages
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient token balance for transfer')
    } else if (error.message?.includes('Internal JSON-RPC error')) {
      throw new Error('RPC error: Check your network connection and try again')
    } else if (error.code === 4001) {
      throw new Error('Transaction rejected by user')
    } else if (error.code === -32603) {
      throw new Error('Network error: Please check your connection and try again')
    }
    
    throw error
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}