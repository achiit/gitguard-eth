import { encodeFunctionData } from 'viem'
import { abiErc20, abiEscrow, WPYUSD, ESCROW, idFromInvoice } from '../lib/paystream'
import { publicClient } from '../lib/viem'

export async function fundInvoice({
  invoiceId,
  amountBig,
  storedIdHex
}: {
  invoiceId: string
  amountBig: bigint
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

  const userAddress = accounts[0] as `0x${string}`

  try {
    const calculatedIdHex = idFromInvoice(invoiceId)
    let idHex = storedIdHex || calculatedIdHex

    console.log('Starting funding process...')
    console.log('Original Invoice ID:', invoiceId)
    console.log('Stored idHex:', storedIdHex)
    console.log('Calculated idHex:', calculatedIdHex)
    console.log('ID Match:', storedIdHex === calculatedIdHex)
    console.log('Amount:', amountBig.toString())
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

    // CRITICAL: First check if invoice exists and get its details
    console.log('Checking invoice state...')
    console.log('Calculated idHex:', idHex)

    let invoiceData
    let needsOnchainCreation = false

    try {
      invoiceData = await publicClient.readContract({
        address: ESCROW,
        abi: abiEscrow,
        functionName: 'invoices',
        args: [idHex]
      })

      console.log('Invoice data:', invoiceData)

      const [payer, payee] = invoiceData as readonly [
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

      // Check if invoice exists (payee should not be zero address for created invoices)
      if (payee === '0x0000000000000000000000000000000000000000') {
        console.log('📝 Invoice does not exist on-chain yet - needs to be created first')
        needsOnchainCreation = true
      }
    } catch (error) {
      console.log('📝 Error reading invoice - likely does not exist on-chain yet')
      needsOnchainCreation = true
    }

    // Create invoice on-chain if it doesn't exist
    if (needsOnchainCreation) {
      console.log('🚀 Creating invoice on-chain before funding...')
      
      // Get invoice details from Firestore to create on-chain
      const { InvoiceService } = await import('../services/invoiceService')
      const firestoreInvoice = await InvoiceService.getInvoice(invoiceId)
      
      if (!firestoreInvoice) {
        throw new Error('Invoice not found in database')
      }

      const { createOnchainInvoice } = await import('./createOnchainInvoice')
      
      try {
        const { txHash } = await createOnchainInvoice({
          invoiceId,
          payee: firestoreInvoice.onchain.payee as `0x${string}`,
          amountUsd: firestoreInvoice.amount,
          autoReleaseAt: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
          metaURI: `Invoice ${invoiceId}`
        })

        console.log('✅ Invoice created on-chain:', txHash)

        // Update Firestore with creation transaction
        await InvoiceService.updateOnchainData(invoiceId, {
          createTx: txHash,
          state: 'created'
        })

        // Wait a moment for the transaction to be mined
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Now read the invoice data again
        invoiceData = await publicClient.readContract({
          address: ESCROW,
          abi: abiEscrow,
          functionName: 'invoices',
          args: [idHex]
        })
      } catch (createError) {
        console.error('❌ Failed to create invoice on-chain:', createError)
        throw new Error(`Failed to create invoice on-chain: ${createError instanceof Error ? createError.message : 'Unknown error'}`)
      }
    }

    const [payer, payee, , total, , , , , state] = invoiceData as readonly [
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

    // Special handling for invoices with zero payer address
    const isPayerZero = payer === '0x0000000000000000000000000000000000000000'

    if (state === 0) {
      // Invoice is in Created state - this is normal for funding
      if (isPayerZero) {
        console.log('✅ Invoice is in Created state with no payer set - ready for funding')
      } else {
        // Check if the current user is the designated payer
        if (payer.toLowerCase() !== userAddress.toLowerCase()) {
          throw new Error(`Only the designated payer (${payer}) can fund this invoice. Current user: ${userAddress}`)
        }
      }
    } else if (state === 1) {
      // Invoice is already funded
      if (isPayerZero) {
        console.warn('⚠️ DETECTED: Invoice is in Funded state but payer is zero address')
        console.warn('This is likely a contract bug. Attempting to force-fund anyway...')
        console.warn('If this fails, the invoice may need to be released instead of funded')
        // Don't throw error - let it try to fund anyway
      } else {
        throw new Error(`Invoice is already funded by ${payer}. Current state: Funded`)
      }
    } else if (state === 2) {
      throw new Error('Invoice has already been released and completed')
    }

    // Check if total amount matches what we're trying to fund
    if (total !== amountBig) {
      const totalFormatted = (Number(total) / 1_000_000).toFixed(2)
      const amountFormatted = (Number(amountBig) / 1_000_000).toFixed(2)
      throw new Error(`Amount mismatch. Invoice total: $${totalFormatted}, trying to fund: $${amountFormatted}`)
    }

    console.log('Invoice validation passed. Proceeding with funding...')

    // Step 1: Check current allowance
    const allowanceData = encodeFunctionData({
      abi: abiErc20,
      functionName: 'allowance',
      args: [userAddress, ESCROW]
    })

    const currentAllowance = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: WPYUSD,
        data: allowanceData
      }, 'latest']
    })

    const allowanceBig = BigInt(currentAllowance)
    console.log('Current allowance:', allowanceBig.toString())

    // Step 2: Approve if needed
    if (allowanceBig < amountBig) {
      console.log('Insufficient allowance, approving tokens...')

      const approveData = encodeFunctionData({
        abi: abiErc20,
        functionName: 'approve',
        args: [ESCROW, amountBig]
      })

      // Estimate gas for approval
      const approveGasEstimate = await window.ethereum.request({
        method: 'eth_estimateGas',
        params: [{
          to: WPYUSD,
          from: userAddress,
          data: approveData
        }]
      })

      const approveGasLimit = Math.floor(parseInt(approveGasEstimate, 16) * 1.2)

      const approveTx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: WPYUSD,
          from: userAddress,
          data: approveData,
          gas: '0x' + approveGasLimit.toString(16)
        }]
      })

      console.log('Approval transaction sent:', approveTx)

      // Wait for approval to be mined
      let approvalMined = false
      let attempts = 0
      const maxAttempts = 30 // 30 seconds timeout

      while (!approvalMined && attempts < maxAttempts) {
        try {
          const receipt = await window.ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [approveTx]
          })

          if (receipt && receipt.status === '0x1') {
            approvalMined = true
            console.log('Approval confirmed')
          } else if (receipt && receipt.status === '0x0') {
            throw new Error('Approval transaction failed')
          }
        } catch (e) {
          // Transaction not mined yet, continue waiting
        }

        if (!approvalMined) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          attempts++
        }
      }

      if (!approvalMined) {
        throw new Error('Approval transaction timeout. Please try again.')
      }
    } else {
      console.log('Sufficient allowance already exists')
    }

    // Step 3: Fund the invoice
    console.log('Funding invoice...')

    const fundData = encodeFunctionData({
      abi: abiEscrow,
      functionName: 'fund',
      args: [idHex]
    })

    // Estimate gas for funding
    const fundGasEstimate = await window.ethereum.request({
      method: 'eth_estimateGas',
      params: [{
        to: ESCROW,
        from: userAddress,
        data: fundData
      }]
    })

    const fundGasLimit = Math.floor(parseInt(fundGasEstimate, 16) * 1.2)

    const fundTx = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: ESCROW,
        from: userAddress,
        data: fundData,
        gas: '0x' + fundGasLimit.toString(16)
      }]
    })

    console.log('Fund transaction sent:', fundTx)
    return fundTx

  } catch (error: any) {
    console.error('Funding error:', error)

    // Handle our custom validation errors first
    if (error.message?.includes('Invoice does not exist') ||
      error.message?.includes('Invoice is in') ||
      error.message?.includes('Only the payer') ||
      error.message?.includes('Amount mismatch')) {
      // These are our custom validation errors, re-throw as-is
      throw error
    }

    // Decode specific error codes
    if (error.message?.includes('0x8523b62a')) {
      throw new Error('Contract error: Invoice may not exist, already funded, or you are not authorized to fund it')
    } else if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient ETH for gas fees')
    } else if (error.message?.includes('insufficient allowance')) {
      throw new Error('Token approval failed. Please try again.')
    } else if (error.message?.includes('Internal JSON-RPC error')) {
      throw new Error('RPC error: Check your network connection and try again. The transaction may have failed due to network issues.')
    } else if (error.message?.includes('execution reverted')) {
      throw new Error('Transaction failed. Check invoice state and your authorization.')
    } else if (error.code === 4001) {
      throw new Error('Transaction rejected by user')
    } else if (error.code === -32603) {
      throw new Error('Network error: Please check your connection and try again.')
    }

    throw error
  }
} declare global {
  interface Window {
    ethereum?: any
  }
}