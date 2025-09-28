import { publicClient } from '../lib/viem'
import { abiEscrow, ESCROW } from '../lib/paystream'

export async function fetchInvoiceState(idHex: `0x${string}`) {
  try {
    const data = await publicClient.readContract({
      address: ESCROW,
      abi: abiEscrow,
      functionName: 'invoices',
      args: [idHex]
    }) as any[]

    // Return structured data based on the contract's invoices mapping
    return {
      payer: data[0] as string,
      payee: data[1] as string,
      token: data[2] as string,
      total: data[3] as bigint,
      funded: data[4] as bigint,
      createdAt: data[5] as bigint,
      fundedAt: data[6] as bigint,
      autoReleaseAt: data[7] as bigint,
      state: data[8] as number, // 0=None,1=Created,2=Funded,3=Completed,4=Refunded
      disputed: data[9] as boolean,
      metaURI: data[10] as string
    }
  } catch (error) {
    console.error('Error fetching invoice state:', error)
    return null
  }
}