import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ExternalLink, Fuel, AlertCircle } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

export default function EthFaucet() {
  const { user } = usePrivy()
  const currentWallet = user?.wallet?.address

  const openCitreaFaucet = () => {
    // Open Citrea testnet faucet in new tab
    window.open('https://faucet.testnet.citrea.xyz/', '_blank')
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="w-5 h-5" />
          ETH Faucet
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Get testnet ETH for gas fees
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">ETH Required</p>
              <p className="text-xs text-yellow-700 mt-1">
                You need testnet ETH to pay for gas fees when requesting wPYUSD tokens or creating invoices.
              </p>
            </div>
          </div>
        </div>

        {currentWallet ? (
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Your Wallet</p>
              <p className="font-mono text-xs">
                {currentWallet.slice(0, 8)}...{currentWallet.slice(-6)}
              </p>
            </div>

            <Button 
              onClick={openCitreaFaucet}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Citrea ETH Faucet
            </Button>

            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click the button above to open the faucet</li>
                <li>Paste your wallet address</li>
                <li>Request testnet ETH</li>
                <li>Wait for the transaction to confirm</li>
                <li>Return here to request wPYUSD tokens</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Badge variant="outline">No Wallet Connected</Badge>
            <p className="text-sm text-muted-foreground mt-2">
              Connect your wallet first to get your address
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}