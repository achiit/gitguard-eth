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

    const [payer, payee, , total, funded, , , , state] = invoiceData
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