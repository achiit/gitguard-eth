import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useToast } from '../../hooks/use-toast'
import { faucetTokens } from '../../actions/faucetTokens'
import { Copy, ExternalLink, Wallet, Coins } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import TransactionDebug from './transaction-debug'

export default function FaucetDebug() {
  const [amount, setAmount] = useState('100')
  const [customAddress, setCustomAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastTxHash, setLastTxHash] = useState<string>('')
  const { user, connectWallet } = usePrivy()
  const { toast } = useToast()

  const handleFaucet = async () => {
    if (!user?.wallet?.address && !window.ethereum) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      // Convert amount to token units (6 decimals for wPYUSD)
      const tokenAmount = BigInt(parseFloat(amount) * 1_000_000)
      
      const txHash = await faucetTokens(tokenAmount)
      setLastTxHash(txHash)
      
      toast({
        title: 'Faucet Success!',
        description: `${amount} wPYUSD tokens requested. Check your wallet in a few moments.`
      })
    } catch (error) {
      console.error('Faucet error:', error)
      toast({
        title: 'Faucet Failed',
        description: error instanceof Error ? error.message : 'Failed to request tokens',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast({
      title: 'Copied',
      description: 'Address copied to clipboard'
    })
  }

  const currentWallet = user?.wallet?.address || (window.ethereum ? 'Connected via MetaMask' : null)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          wPYUSD Faucet
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get test tokens for Citrea Testnet
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Wallet */}
        <div className="p-3 bg-muted rounded-lg">
          <Label className="text-sm font-medium">Current Wallet</Label>
          {currentWallet ? (
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-mono truncate">
                {typeof currentWallet === 'string' && currentWallet.startsWith('0x') 
                  ? `${currentWallet.slice(0, 6)}...${currentWallet.slice(-4)}`
                  : currentWallet
                }
              </p>
              {typeof currentWallet === 'string' && currentWallet.startsWith('0x') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyAddress(currentWallet)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-sm text-muted-foreground mb-2">No wallet connected</p>
              <Button onClick={connectWallet} size="sm" variant="outline">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <Label htmlFor="amount">Amount (wPYUSD)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Recommended: 100-1000 tokens for testing
          </p>
        </div>

        {/* Faucet Button */}
        <Button 
          onClick={handleFaucet} 
          disabled={loading || !currentWallet}
          className="w-full"
        >
          {loading ? 'Requesting...' : `Get ${amount} wPYUSD`}
        </Button>

        {/* Transaction Debug */}
        {lastTxHash && (
          <TransactionDebug txHash={lastTxHash} />
        )}

        {/* Contract Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Token:</strong> wPYUSD</p>
          <p><strong>Contract:</strong> {import.meta.env.VITE_WPYUSD_ADDRESS}</p>
          <p><strong>Network:</strong> Citrea Testnet</p>
          <p><strong>Chain ID:</strong> {import.meta.env.VITE_CHAIN_ID}</p>
        </div>
      </CardContent>
    </Card>
  )
}