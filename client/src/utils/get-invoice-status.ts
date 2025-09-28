import { publicClient } from '../lib/viem'
import { abiEscrow, ESCROW } from '../lib/paystream'

export interface InvoiceStatus {
  state: number
  stateName: string
  payer: string
  payee: string
  total: bigint
  funded: bigint
  isComplete: boolean
  canFund: boolean
  canRelease: boolean
  message: string
}

export async function getInvoiceStatus(idHex: `0x${string}`, userAddress?: string): Promise<InvoiceStatus> {
  try {
    console.log('🔍 Reading invoice from blockchain:', {
      idHex,
      escrowContract: ESCROW,
      userAddress
    })
    
    const invoiceData = await publicClient.readContract({
      address: ESCROW,
      abi: abiEscrow,
      functionName: 'invoices',
      args: [idHex]
    }) as readonly [
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

    const [payer, payee, token, total, funded, createdAt, fundedAt, autoReleaseAt, state, disputed, metaURI] = invoiceData
    
    const now = Math.floor(Date.now() / 1000)
    const autoReleaseTime = Number(autoReleaseAt)
    const isAutoReleaseTriggered = autoReleaseTime > 0 && now >= autoReleaseTime
    
    console.log('📋 Raw blockchain data:', {
      payer,
      payee,
      token,
      total: total.toString(),
      funded: funded.toString(),
      createdAt: createdAt.toString(),
      fundedAt: fundedAt.toString(),
      autoReleaseAt: autoReleaseAt.toString(),
      autoReleaseDate: autoReleaseTime > 0 ? new Date(autoReleaseTime * 1000).toISOString() : 'Not set',
      currentTime: new Date(now * 1000).toISOString(),
      isAutoReleaseTriggered,
      state,
      disputed,
      metaURI
    })
    
    // Check if auto-release might be the cause
    if (state === 2 && isAutoReleaseTriggered) {
      console.warn('⏰ AUTO-RELEASE TRIGGERED: Payment was automatically released due to timeout')
    } else if (state === 2 && !isAutoReleaseTriggered) {
      console.warn('🔄 MANUAL RELEASE: Payment was manually released by someone')
    }
    
    // Check if invoice exists (payee should not be zero address for real invoices)
    const isZeroAddress = payee === '0x0000000000000000000000000000000000000000'
    if (isZeroAddress) {
      console.error('❌ INVOICE DOES NOT EXIST ON BLOCKCHAIN:', {
        idHex,
        payee,
        message: 'Payee is zero address - invoice was never created on-chain'
      })
      throw new Error(`Invoice ${idHex} does not exist on blockchain`)
    }
    const stateNames = ['Created', 'Funded', 'Released']
    const stateName = stateNames[state] || 'Unknown'

    let canFund = false
    let canRelease = false
    let message = ''
    let isComplete = false

    if (state === 0) { // Created
      canFund = true
      message = 'Invoice is ready to be funded'
    } else if (state === 1) { // Funded
      console.log('🔍 Checking release permissions:', {
        userAddress,
        payee,
        userIsPayee: userAddress && payee.toLowerCase() === userAddress.toLowerCase(),
        canRelease: userAddress && payee.toLowerCase() === userAddress.toLowerCase()
      })
      
      if (userAddress && payee.toLowerCase() === userAddress.toLowerCase()) {
        canRelease = true
        message = 'Invoice is funded and ready for release'
      } else {
        message = 'Invoice is funded, waiting for payee to release'
      }
    } else if (state === 2) { // Released
      isComplete = true
      message = '✅ Payment completed successfully!'
    }

    return {
      state,
      stateName,
      payer,
      payee,
      total,
      funded,
      isComplete,
      canFund,
      canRelease,
      message
    }

  } catch (error) {
    console.error('Error getting invoice status:', error)
    throw error
  }
}