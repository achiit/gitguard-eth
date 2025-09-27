import { publicClient } from '../lib/viem'
import { abiEscrow, ESCROW } from '../lib/paystream'

export async function debugInvoiceState(idHex: `0x${string}`) {
  try {
    console.log('=== Invoice State Debug ===')
    console.log('Invoice ID:', idHex)
    
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

    console.log('Payer:', payer)
    console.log('Payee:', payee)
    console.log('Token:', token)
    console.log('Total:', total.toString(), `($${Number(total) / 1_000_000})`)
    console.log('Funded:', funded.toString(), `($${Number(funded) / 1_000_000})`)
    console.log('Created At:', new Date(Number(createdAt) * 1000).toISOString())
    console.log('Funded At:', fundedAt > 0 ? new Date(Number(fundedAt) * 1000).toISOString() : 'Not funded')
    console.log('Auto Release At:', new Date(Number(autoReleaseAt) * 1000).toISOString())
    console.log('State:', state, ['Created', 'Funded', 'Released'][state])
    console.log('Disputed:', disputed)
    console.log('Meta URI:', metaURI)
    
    // Check if payer is zero address
    if (payer === '0x0000000000000000000000000000000000000000') {
      console.log('⚠️ ISSUE: Payer is zero address but state is', ['Created', 'Funded', 'Released'][state])
      console.log('This suggests the invoice state is inconsistent')
    }
    
    // Check remaining amount
    try {
      const remaining = await publicClient.readContract({
        address: ESCROW,
        abi: abiEscrow,
        functionName: 'remaining',
        args: [idHex]
      })
      console.log('Remaining:', remaining.toString(), `($${Number(remaining) / 1_000_000})`)
    } catch (e) {
      console.log('Could not fetch remaining amount:', e)
    }
    
    console.log('========================')
    
    return {
      payer,
      payee,
      token,
      total,
      funded,
      state,
      disputed,
      isPayerZero: payer === '0x0000000000000000000000000000000000000000'
    }
    
  } catch (error) {
    console.error('Error debugging invoice state:', error)
    throw error
  }
}