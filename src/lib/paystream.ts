import { keccak256, toHex, stringToBytes, parseAbi } from 'viem'
import escrowAbi from '../abi/PayStreamEscrow.json'
import tokenAbi from '../abi/WrappedPYUSD.json'

export const ESCROW = import.meta.env.VITE_ESCROW_ADDRESS as `0x${string}`
export const WPYUSD = import.meta.env.VITE_WPYUSD_ADDRESS as `0x${string}`
export const SIX = BigInt(10) ** BigInt(6)

export const abiEscrow = escrowAbi
export const abiErc20 = tokenAbi

export function idFromInvoice(invoiceId: string): `0x${string}` {
  return keccak256(stringToBytes(invoiceId))
}

export function toTokenAmountUSD(amountUsd: number): bigint {
  return BigInt(Math.round(amountUsd * 1_000_000))
}