import { encodeFunctionData } from 'viem'
import { abiEscrow, ESCROW, idFromInvoice } from '../lib/paystream'

/**
 * Force release an invoice that appears to be funded but has issues
 * This bypasses normal validation and attempts to release directly
 */
export async function forceReleaseInvoice({ 
  invoiceId,
  storedIdHex 
}: { 
  invoiceId: string
  storedIdHex?: string
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
    const calculatedIdHex = idFromInvoice(invoiceId)
    const idHex = storedIdHex || calculatedIdHex
    
    console.log('🚀 FORCE RELEASE - Attempting to release invoice...')
    console.log('Invoice ID:', invoiceId)
    console.log('Using idHex:', idHex)
    console.log('User address:', userAddress)

    const releaseData = encodeFunctionData({
      abi: abiEscrow,
      functionName: 'release',
      args: [idHex, BigInt(0)] // mIndex=0 for single milestone
    })

    // Use higher gas limit for force operations
    const gasLimit = '0x76C00' // 485,376 gas

    const releaseTx = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: ESCROW,
        from: userAddress,
        data: releaseData,
        gas: gasLimit
      }]
    })

    console.log('🚀 Force release transaction sent:', releaseTx)
    return releaseTx

  } catch (error: any) {
    console.error('Force release error:', error)
    
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient ETH for gas fees')
    } else if (error.message?.includes('execution reverted')) {
      throw new Error('Force release failed. The invoice may not be in a releasable state.')
    } else if (error.code === 4001) {
      throw new Error('Transaction rejected by user')
    }
    
    throw error
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}