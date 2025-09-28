import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { useToast } from '../../hooks/use-toast'
import { Wallet, AlertCircle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { fundInvoice } from '../../actions/fundInvoice'
import { publicClient } from '../../lib/viem'
import { abiEscrow, abiErc20, ESCROW, WPYUSD, idFromInvoice } from '../../lib/paystream'
import { usePrivy } from '@privy-io/react-auth'

interface FundingDebugProps {
  invoiceId?: string
  amount?: string
}

export default function FundingDebug({ invoiceId: propInvoiceId, amount: propAmount }: FundingDebugProps) {
  const [invoiceId, setInvoiceId] = useState(propInvoiceId || '')
  const [amount, setAmount] = useState(propAmount || '')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [checks, setChecks] = useState<any>(null)
  const [lastTxHash, setLastTxHash] = useState('')
  const { user } = usePrivy()
  const { toast } = useToast()

  const runPreFundingChecks = async () => {
    if (!invoiceId || !amount || !user?.wallet?.address) {
      toast({
        title: 'Missing Information',
        description: 'Please provide invoice ID, amount, and connect wallet',
        variant: 'destructive'
      })
      return
    }

    setChecking(true)
    try {
      const userAddress = user.wallet.address as `0x${string}`
      const amountBig = BigInt(parseFloat(amount) * 1_000_000) // Convert to 6 decimals
      
      // Convert invoice ID to proper hash format
      const idHex = idFromInvoice(invoiceId)

      console.log('Running pre-funding checks...')
      console.log('Original Invoice ID:', invoiceId)
      console.log('Hashed Invoice ID:', idHex)
      console.log('Amount:', amountBig.toString())
      console.log('User:', userAddress)

      // Check 1: Invoice exists and state
      let invoiceExists = false
      let invoiceState = null
      try {
        const invoiceData = await publicClient.readContract({
          address: ESCROW,
          abi: abiEscrow,
          functionName: 'invoices',
          args: [idHex]
        })
        
        invoiceExists = invoiceData[0] !== '0x0000000000000000000000000000000000000000' || 
                       invoiceData[1] !== '0x0000000000000000000000000000000000000000'
        invoiceState = {
          payer: invoiceData[0],
          payee: invoiceData[1],
          total: invoiceData[3],
          state: invoiceData[8]
        }
      } catch (error) {
        console.error('Invoice check failed:', error)
      }

      // Check 2: User balance
      const balance = await publicClient.readContract({
        address: WPYUSD,
        abi: abiErc20,
        functionName: 'balanceOf',
        args: [userAddress]
      })

      // Check 3: User allowance
      const allowance = await publicClient.readContract({
        address: WPYUSD,
        abi: abiErc20,
        functionName: 'allowance',
        args: [userAddress, ESCROW]
      })

      // Check 4: ETH balance for gas
      const ethBalance = await publicClient.getBalance({ address: userAddress })

      const checkResults = {
        invoiceExists,
        invoiceState,
        userBalance: balance,
        userAllowance: allowance,
        ethBalance,
        requiredAmount: amountBig,
        canFund: invoiceExists && 
                balance >= amountBig && 
                ethBalance > BigInt(0) &&
                invoiceState?.state === 0 && // Must be in 'Created' state
                invoiceState?.payer.toLowerCase() === userAddress.toLowerCase() // Must be the payer
      }

      setChecks(checkResults)
      
      toast({
        title: 'Pre-funding Checks Complete',
        description: checkResults.canFund ? 'Ready to fund!' : 'Issues found - check details below'
      })
    } catch (error) {
      console.error('Pre-funding check error:', error)
      toast({
        title: 'Check Failed',
        description: 'Failed to run pre-funding checks',
        variant: 'destructive'
      })
    } finally {
      setChecking(false)
    }
  }

  const handleFunding = async () => {
    if (!checks?.canFund) {
      toast({
        title: 'Cannot Fund',
        description: 'Please run checks first and resolve any issues',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const amountBig = BigInt(parseFloat(amount) * 1_000_000)
      
      const txHash = await fundInvoice({
        invoiceId: invoiceId,
        amountBig
      })
      
      setLastTxHash(txHash)
      
      toast({
        title: 'Funding Transaction Sent',
        description: 'Transaction submitted to blockchain'
      })
    } catch (error) {
      console.error('Funding error:', error)
      toast({
        title: 'Funding Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: bigint, decimals = 6) => {
    const divisor = BigInt(10) ** BigInt(decimals)
    const whole = amount / divisor
    const fraction = amount % divisor
    return `${whole}.${fraction.toString().padStart(decimals, '0').slice(0, 2)}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Funding Debug Tool
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Debug and test invoice funding process
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceId">Invoice ID</Label>
            <Input
              id="invoiceId"
              placeholder="Enter original invoice ID"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={runPreFundingChecks}
            disabled={checking || !user?.wallet?.address}
            variant="outline"
            className="flex-1"
          >
            {checking ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-2" />
            )}
            Run Checks
          </Button>
          <Button 
            onClick={handleFunding}
            disabled={loading || !checks?.canFund}
            className="flex-1"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4 mr-2" />
            )}
            Fund Invoice
          </Button>
        </div>

        {checks && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium">Pre-funding Check Results</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Invoice exists on-chain</span>
                {checks.invoiceExists ? (
                  <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Yes</Badge>
                ) : (
                  <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />No</Badge>
                )}
              </div>
              
              {checks.invoiceState && (
                <>
                  <div className="flex items-center justify-between">
                    <span>Invoice state</span>
                    <Badge variant={checks.invoiceState.state === 0 ? 'default' : 'destructive'}>
                      {checks.invoiceState.state === 0 ? 'Created' : 
                       checks.invoiceState.state === 1 ? 'Funded' : 'Released'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>You are the payer</span>
                    {checks.invoiceState.payer.toLowerCase() === user?.wallet?.address?.toLowerCase() ? (
                      <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Yes</Badge>
                    ) : (
                      <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />No</Badge>
                    )}
                  </div>
                </>
              )}
              
              <div className="flex items-center justify-between">
                <span>wPYUSD balance</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {formatAmount(checks.userBalance)} wPYUSD
                  </span>
                  {checks.userBalance >= checks.requiredAmount ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Token allowance</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {formatAmount(checks.userAllowance)} wPYUSD
                  </span>
                  {checks.userAllowance >= checks.requiredAmount ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>ETH for gas</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {formatAmount(checks.ethBalance, 18)} ETH
                  </span>
                  {checks.ethBalance > BigInt(0) ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="font-medium">Ready to fund</span>
              {checks.canFund ? (
                <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Ready</Badge>
              ) : (
                <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Not Ready</Badge>
              )}
            </div>
          </div>
        )}

        {lastTxHash && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Last Transaction</span>
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <a
                  href={`https://explorer.testnet.citrea.xyz/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </a>
              </Button>
            </div>
            <p className="font-mono text-xs text-muted-foreground mt-1">
              {lastTxHash}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}