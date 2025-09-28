import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { useToast } from '../../hooks/use-toast'
import { AlertTriangle, Search, ExternalLink, Copy } from 'lucide-react'
import { publicClient } from '../../lib/viem'
import { abiEscrow, ESCROW, idFromInvoice } from '../../lib/paystream'

export default function TransactionDebug() {
  const [txHash, setTxHash] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [loading, setLoading] = useState(false)
  const [txDetails, setTxDetails] = useState<any>(null)
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null)
  const { toast } = useToast()

  const analyzeTx = async () => {
    if (!txHash && !invoiceId) {
      toast({
        title: 'Missing Information',
        description: 'Please provide either transaction hash or invoice ID',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      let results: any = {}

      // Analyze transaction if hash provided
      if (txHash) {
        console.log('Analyzing transaction:', txHash)
        
        const receipt = await publicClient.getTransactionReceipt({
          hash: txHash as `0x${string}`
        })
        
        const transaction = await publicClient.getTransaction({
          hash: txHash as `0x${string}`
        })

        results.transaction = {
          hash: txHash,
          status: receipt.status === 'success' ? 'Success' : 'Failed',
          gasUsed: receipt.gasUsed.toString(),
          gasLimit: transaction.gas.toString(),
          gasPrice: transaction.gasPrice?.toString() || 'N/A',
          from: transaction.from,
          to: transaction.to,
          value: transaction.value.toString(),
          blockNumber: receipt.blockNumber.toString(),
          logs: receipt.logs
        }

        // Try to decode revert reason if failed
        if (receipt.status === 'reverted') {
          try {
            // Try to get revert reason
            await publicClient.call({
              ...transaction,
              blockNumber: receipt.blockNumber
            })
          } catch (error: any) {
            results.revertReason = error.message || 'Unknown revert reason'
          }
        }
      }

      // Analyze invoice if ID provided
      if (invoiceId) {
        // Convert invoice ID to proper hash format
        const idHex = idFromInvoice(invoiceId)

        console.log('Analyzing invoice...')
        console.log('Original Invoice ID:', invoiceId)
        console.log('Hashed Invoice ID:', idHex)
        
        const invoiceData = await publicClient.readContract({
          address: ESCROW,
          abi: abiEscrow,
          functionName: 'invoices',
          args: [idHex]
        })

        const [payer, payee, token, total, funded, createdAt, fundedAt, autoReleaseAt, state, disputed] = invoiceData

        results.invoice = {
          id: idHex,
          exists: payer !== '0x0000000000000000000000000000000000000000' || 
                  payee !== '0x0000000000000000000000000000000000000000',
          payer,
          payee,
          token,
          total: total.toString(),
          funded: funded.toString(),
          state: ['Created', 'Funded', 'Released'][state] || `Unknown(${state})`,
          disputed,
          createdAt: new Date(Number(createdAt) * 1000).toLocaleString(),
          fundedAt: fundedAt > 0 ? new Date(Number(fundedAt) * 1000).toLocaleString() : 'Not funded',
          autoReleaseAt: new Date(Number(autoReleaseAt) * 1000).toLocaleString()
        }
      }

      setTxDetails(results.transaction)
      setInvoiceDetails(results.invoice)
      
      toast({
        title: 'Analysis Complete',
        description: 'Check the details below'
      })
    } catch (error: any) {
      console.error('Analysis error:', error)
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: 'Copied to clipboard'
    })
  }

  const formatAmount = (amount: string, decimals = 6) => {
    const amountBig = BigInt(amount)
    const divisor = BigInt(10) ** BigInt(decimals)
    const whole = amountBig / divisor
    const fraction = amountBig % divisor
    return `${whole}.${fraction.toString().padStart(decimals, '0').slice(0, 2)}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Transaction & Invoice Debug
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analyze failed transactions and invoice states
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="txHash">Transaction Hash (Optional)</Label>
            <Input
              id="txHash"
              placeholder="0xabc123..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="invoiceId">Invoice ID (Optional)</Label>
            <Input
              id="invoiceId"
              placeholder="Invoice ID or hash"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={analyzeTx}
          disabled={loading || (!txHash && !invoiceId)}
          className="w-full"
        >
          {loading ? (
            <>Analyzing...</>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analyze
            </>
          )}
        </Button>

        {txDetails && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium flex items-center gap-2">
              Transaction Details
              <Badge variant={txDetails.status === 'Success' ? 'default' : 'destructive'}>
                {txDetails.status}
              </Badge>
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Hash</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{txDetails.hash.slice(0, 10)}...{txDetails.hash.slice(-8)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(txDetails.hash)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a
                      href={`https://explorer.testnet.citrea.xyz/tx/${txDetails.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>From</span>
                <span className="font-mono text-xs">{txDetails.from.slice(0, 6)}...{txDetails.from.slice(-4)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>To</span>
                <span className="font-mono text-xs">{txDetails.to?.slice(0, 6)}...{txDetails.to?.slice(-4)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Gas Used / Limit</span>
                <span className="font-mono text-xs">{txDetails.gasUsed} / {txDetails.gasLimit}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Block</span>
                <span className="font-mono text-xs">{txDetails.blockNumber}</span>
              </div>
            </div>

            {txDetails.revertReason && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h5 className="font-medium text-red-800 mb-1">Revert Reason</h5>
                <p className="text-sm text-red-700">{txDetails.revertReason}</p>
              </div>
            )}
          </div>
        )}

        {invoiceDetails && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-medium flex items-center gap-2">
              Invoice Details
              <Badge variant={invoiceDetails.exists ? 'default' : 'destructive'}>
                {invoiceDetails.exists ? 'Exists' : 'Not Found'}
              </Badge>
            </h4>
            
            {invoiceDetails.exists ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>State</span>
                  <Badge variant={
                    invoiceDetails.state === 'Created' ? 'secondary' :
                    invoiceDetails.state === 'Funded' ? 'default' : 'outline'
                  }>
                    {invoiceDetails.state}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Payer</span>
                  <span className="font-mono text-xs">{invoiceDetails.payer.slice(0, 6)}...{invoiceDetails.payer.slice(-4)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Payee</span>
                  <span className="font-mono text-xs">{invoiceDetails.payee.slice(0, 6)}...{invoiceDetails.payee.slice(-4)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Total Amount</span>
                  <span className="font-mono text-xs">${formatAmount(invoiceDetails.total)} wPYUSD</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Funded Amount</span>
                  <span className="font-mono text-xs">${formatAmount(invoiceDetails.funded)} wPYUSD</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Created At</span>
                  <span className="text-xs">{invoiceDetails.createdAt}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Funded At</span>
                  <span className="text-xs">{invoiceDetails.fundedAt}</span>
                </div>
                
                {invoiceDetails.disputed && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <span className="text-yellow-800 text-sm font-medium">⚠️ Invoice is disputed</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-700">
                  Invoice not found on-chain. Check the invoice ID format.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}