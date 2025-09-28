import { encodeFunctionData } from 'viem'
import { abiEscrow, ESCROW, WPYUSD, idFromInvoice, toTokenAmountUSD } from '../lib/paystream'

type MilestoneInput = { amount: bigint }

export async function createOnchainInvoice({
  invoiceId,
  payee,
  amountUsd,
  autoReleaseAt,
  metaURI
}: {
  invoiceId: string
  payee: `0x${string}`
  amountUsd: number
  autoReleaseAt: number
  metaURI: string
}) {
  const id = idFromInvoice(invoiceId)
  const milestones: MilestoneInput[] = [{ amount: toTokenAmountUSD(amountUsd) }]

  // Ensure wallet is connected
  if (!window.ethereum) {
    throw new Error('No wallet found')
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' })

  const accounts = await window.ethereum.request({ method: 'eth_accounts' })
  
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts connected')
  }

  // Encode function data
  const data = encodeFunctionData({
    abi: abiEscrow,
    functionName: 'createInvoice',
    args: [id, payee, WPYUSD, BigInt(autoReleaseAt), metaURI, milestones]
  })

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      to: ESCROW,
      from: accounts[0],
      data
    }]
  })

  return { id, txHash }
}declare global {
  interface Window {
    ethereum?: any
  }
}