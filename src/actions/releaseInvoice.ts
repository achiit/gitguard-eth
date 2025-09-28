import { encodeFunctionData } from 'viem'
import { abiEscrow, ESCROW, idFromInvoice } from '../lib/paystream'
import { publicClient } from '../lib/viem'

export async function releaseInvoice({ 
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
    let idHex = storedIdHex || calculatedIdHex
    const userAddressHex = userAddress as `0x${string}`
    
    console.log('Starting release process...')
    console.log('Original Invoice ID:', invoiceId)
    console.log('Stored idHex:', storedIdHex)
    console.log('Calculated idHex:', calculatedIdHex)
    console.log('ID Match:', storedIdHex === calculatedIdHex)
    console.log('User address:', userAddress)

    // AUTO-FIX: If stored ID doesn't match calculated ID, use calculated and log warning
    if (storedIdHex && storedIdHex !== calculatedIdHex) {
      console.warn('⚠️ ID MISMATCH DETECTED - Using calculated ID instead of stored ID')
      console.warn('This invoice may have been created with an incorrect ID hash')
      idHex = calculatedIdHex
      
      // Try to fix the stored ID in the database (fire and forget)
      import('../utils/fix-invoice-ids').then(({ fixSingleInvoiceId }) => {
        fixSingleInvoiceId(invoiceId).catch(console.error)
      }).catch(console.error)
    }

    console.log('Using idHex:', idHex)

    // CRITICAL: First validate the invoice state before attempting release
    console.log('Validating invoice state...')
    const invoiceData = await publicClient.readContract({
      address: ESCROW,
      abi: abiEscrow,
      functionName: 'invoices',
      args: [idHex]
    })

    const [payer, payee, , , , , , , state] = invoiceData as readonly [
      `0x${string}`, // payer
      `0x${string}`, // payee
      `0x${string}`, // token
      bigint,        // total
      bigint,        // funded
      bigint,        // createdAt
      bigint,        // fundedAt
      bigint,        // autoReleaseAt
      number,        // state
      boolean,       // disputed
      string         // metaURI
    ]
    
    // Check if invoice exists
    if (payer === '0x0000000000000000000000000000000000000000' && 
        payee === '0x0000000000000000000000000000000000000000') {
      throw new Error('Invoice does not exist on-chain')
    }

    // Check invoice state
    if (state === 2) {
      // CRITICAL: Contract shows Released - this could be auto-release bug
      console.warn('⚠️ CONTRACT AUTO-RELEASE DETECTED: Invoice shows Released state')
      console.warn('This may be due to autoReleaseAt timer or a contract bug')
      console.warn('Attempting manual release to ensure funds are properly transferred...')
      
      // Continue with manual release to ensure proper fund transfer
      console.log('🔧 Performing manual release to guarantee fund transfer...')
    } else if (state === 0) {
      throw new Error('Invoice must be funded before it can be released.')
    } else if (state !== 1 && state !== 2) {
      const stateNames = ['Created', 'Funded', 'Released']
      throw new Error(`Invoice is in ${stateNames[state]} state. Cannot process release.`)
    }

    // Check if the current user is authorized (payer or payee can release)
    const isPayer = payer.toLowerCase() === userAddressHex.toLowerCase()
    const isPayee = payee.toLowerCase() === userAddressHex.toLowerCase()
    
    if (!isPayer && !isPayee) {
      throw new Error(`Only the payer (${payer}) or payee (${payee}) can release this invoice. Current user: ${userAddress}`)
    }
    
    console.log('✅ User authorization check passed:', {
      userAddress,
      isPayer,
      isPayee,
      payer,
      payee
    })

    console.log('Invoice validation passed. Proceeding with release...')

    const releaseData = encodeFunctionData({
      abi: abiEscrow,
      functionName: 'release',
      args: [idHex, BigInt(0)] // mIndex=0 for single milestone
    })

    // Try gas estimation with fallback
    let gasLimit = '0x55730' // Default fallback gas limit (350,000)
    
    try {
      const releaseGasEstimate = await window.ethereum.request({
        method: 'eth_estimateGas',
        params: [{
          to: ESCROW,
          from: userAddress,
          data: releaseData
        }]
      })
      
      gasLimit = '0x' + Math.floor(parseInt(releaseGasEstimate, 16) * 1.3).toString(16)
      console.log('Gas estimated:', gasLimit)
    } catch (gasError) {
      console.warn('Gas estimation failed, using fallback:', gasLimit)
    }

    const releaseTx = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: ESCROW,
        from: userAddress,
        data: releaseData,
        gas: gasLimit
      }]
    })

    console.log('Release transaction sent:', releaseTx)
    return releaseTx

  } catch (error: any) {
    console.error('Release error:', error)
    
    // Provide specific error messages
    if (error.message?.includes('Invoice does not exist') || 
        error.message?.includes('Invoice is in') ||
        error.message?.includes('Only the payee')) {
      // These are our custom validation errors, re-throw as-is
      throw error
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient ETH for gas fees')
    } else if (error.message?.includes('Internal JSON-RPC error')) {
      throw new Error('RPC error: Check your network connection and try again. The invoice may not be in the correct state.')
    } else if (error.message?.includes('execution reverted')) {
      // Check if this is the "already completed" case
      if (error.message?.includes('already') || error.message?.includes('completed')) {
        throw new Error('Payment already completed')
      }
      throw new Error('Release failed. You may not be authorized to release this invoice, or it may not be funded yet.')
    } else if (error.code === 4001) {
      throw new Error('Transaction rejected by user')
    } else if (error.code === -32603) {
      throw new Error('Network error: Please check your connection and try again.')
    }
    
    throw error
  }
}declare global {
  interface Window {
    ethereum?: any
  }
}