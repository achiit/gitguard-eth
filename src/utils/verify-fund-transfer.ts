import { publicClient } from '../lib/viem'
import { abiErc20, WPYUSD } from '../lib/paystream'

/**
 * Verifies if funds were actually transferred to the payee's wallet
 * This helps detect the auto-release bug where contract shows "Released" but funds didn't move
 */
export async function verifyFundTransfer({
  payeeAddress,
  expectedAmount,
  fromBlock
}: {
  payeeAddress: `0x${string}`
  expectedAmount: bigint
  fromBlock?: bigint
}): Promise<{
  transferred: boolean
  actualAmount: bigint
  transferEvents: any[]
}> {
  try {
    console.log('🔍 Verifying fund transfer to payee:', {
      payeeAddress,
      expectedAmount: expectedAmount.toString(),
      fromBlock: fromBlock?.toString()
    })

    // Get transfer events to the payee address
    const transferEvents = await publicClient.getLogs({
      address: WPYUSD,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'value', type: 'uint256', indexed: false }
        ]
      },
      args: {
        to: payeeAddress
      },
      fromBlock: fromBlock || 'earliest'
    })

    console.log('📊 Transfer events found:', transferEvents.length)

    // Calculate total amount received
    let totalReceived = BigInt(0)
    for (const event of transferEvents) {
      if (event.args?.value) {
        totalReceived += event.args.value as bigint
      }
    }

    const transferred = totalReceived >= expectedAmount

    console.log('💰 Transfer verification result:', {
      totalReceived: totalReceived.toString(),
      expectedAmount: expectedAmount.toString(),
      transferred,
      eventsCount: transferEvents.length
    })

    return {
      transferred,
      actualAmount: totalReceived,
      transferEvents
    }

  } catch (error) {
    console.error('❌ Error verifying fund transfer:', error)
    return {
      transferred: false,
      actualAmount: BigInt(0),
      transferEvents: []
    }
  }
}

/**
 * Gets the current token balance of an address
 */
export async function getTokenBalance(address: `0x${string}`): Promise<bigint> {
  try {
    const balance = await publicClient.readContract({
      address: WPYUSD,
      abi: abiErc20,
      functionName: 'balanceOf',
      args: [address]
    })

    return balance as bigint
  } catch (error) {
    console.error('❌ Error getting token balance:', error)
    return BigInt(0)
  }
}