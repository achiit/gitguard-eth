import { publicClient } from '../lib/viem'
import { abiEscrow, ESCROW } from '../lib/paystream'

export async function checkIfInvoiceCanBeReleased(idHex: `0x${string}`, userAddress: string) {
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

    const [payer, payee, , , , , , , state] = invoiceData

    console.log('=== Release Check ===')
    console.log('Invoice State:', state, ['Created', 'Funded', 'Released'][state])
    console.log('Payer:', payer)
    console.log('Payee:', payee)
    console.log('Current User:', userAddress)
    console.log('User is Payee:', payee.toLowerCase() === userAddress.toLowerCase())
    console.log('====================')

    if (state === 1) { // Funded
      if (payee.toLowerCase() === userAddress.toLowerCase()) {
        return {
          canRelease: true,
          reason: 'Invoice is funded and you are the payee'
        }
      } else {
        return {
          canRelease: false,
          reason: `Only the payee (${payee}) can release this invoice`
        }
      }
    } else if (state === 0) { // Created
      return {
        canRelease: false,
        reason: 'Invoice needs to be funded first'
      }
    } else if (state === 2) { // Released
      return {
        canRelease: false,
        reason: 'Invoice has already been released'
      }
    }

    return {
      canRelease: false,
      reason: 'Unknown invoice state'
    }

  } catch (error) {
    console.error('Error checking release status:', error)
    return {
      canRelease: false,
      reason: 'Error checking invoice state'
    }
  }
}