import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { useToast } from '../hooks/use-toast'
import { faucetTokens } from '../actions/faucetTokens'
import { Copy, ExternalLink, Wallet, Coins, AlertCircle, CheckCircle } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import DashboardLayout from '../components/layout/dashboard-layout'
import EthFaucet from '../components/debug/eth-faucet'
import TransactionDebug from '../components/debug/transaction-debug'

export default function Faucet() {
  const [amount, setAmount] = useState('100')
  const [loading, setLoading] = useState(false)
  const [txHistory, setTxHistory] = useState<Array<{hash: string, amount: string, timestamp: number}>>([])
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
      
      // Add to history
      setTxHistory(prev => [{
        hash: txHash,
        amount: amount,
        timestamp: Date.now()
      }, ...prev.slice(0, 4)]) // Keep last 5 transactions
      
      toast({
        title: 'Faucet Request Sent!',
        description: `${amount} wPYUSD tokens requested. Transaction submitted to blockchain.`
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

  const currentWallet = user?.wallet?.address

  return (
    <DashboardLayout 
      title="Token Faucet" 
      description="Get test wPYUSD tokens for Citrea Testnet"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ETH Faucet First */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EthFaucet />
          {txHistory.length > 0 && txHistory[0] && (
            <TransactionDebug txHash={txHistory[0].hash} />
          )}
        </div>

        {/* Main Faucet Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Coins className="w-6 h-6 text-blue-600" />
              </div>
              wPYUSD Test Token Faucet
            </CardTitle>
            <p className="text-muted-foreground">
              Get free test tokens for development and testing on Citrea Testnet
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wallet Status */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">Connected Wallet</Label>
                {currentWallet ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </div>
              
              {currentWallet ? (
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm bg-muted px-3 py-2 rounded">
                    {currentWallet.slice(0, 8)}...{currentWallet.slice(-6)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyAddress(currentWallet)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              ) : (
                <Button onClick={connectWallet} className="w-full">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Amount Selection */}
            <div className="space-y-3">
              <Label htmlFor="amount" className="text-base font-medium">Token Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  className="flex-1"
                />
                <Button 
                  onClick={handleFaucet} 
                  disabled={loading || !currentWallet}
                  className="px-8"
                >
                  {loading ? 'Requesting...' : 'Get Tokens'}
                </Button>
              </div>
              <div className="flex gap-2">
                {['100', '500', '1000'].map(preset => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset)}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Recommended amounts: 100-1000 tokens for testing invoices and payments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        {txHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {txHistory.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{tx.amount} wPYUSD</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm">
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`https://explorer.testnet.citrea.xyz/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Network Info */}
        <Card>
          <CardHeader>
            <CardTitle>Network Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Token Contract</Label>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1">
                  {import.meta.env.VITE_WPYUSD_ADDRESS}
                </p>
              </div>
              <div>
                <Label className="font-medium">Escrow Contract</Label>
                <p className="font-mono text-xs bg-muted p-2 rounded mt-1">
                  {import.meta.env.VITE_ESCROW_ADDRESS}
                </p>
              </div>
              <div>
                <Label className="font-medium">Network</Label>
                <p className="mt-1">Citrea Testnet</p>
              </div>
              <div>
                <Label className="font-medium">Chain ID</Label>
                <p className="mt-1">{import.meta.env.VITE_CHAIN_ID}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}