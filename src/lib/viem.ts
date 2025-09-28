import { createPublicClient, http } from 'viem'

export const chainId = Number(import.meta.env.VITE_CHAIN_ID)
export const rpcUrl = import.meta.env.VITE_CITREA_RPC

export const publicClient = createPublicClient({
  transport: http(rpcUrl)
})