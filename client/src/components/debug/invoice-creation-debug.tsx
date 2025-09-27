import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { useToast } from '../../hooks/use-toast'
import { AlertTriangle, Search, RefreshCw, ExternalLink } from 'lucide-react'
import { publicClient } from '../../lib/viem'
import { abiEscrow, ESCROW, idFromInvoice } from '../../lib/paystream'

export default function InvoiceCreationDebug() {
  const [invoiceId, setInvoiceId] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const { toast } = useToast()

  const analyzeInvoiceCreation = async () => {
    if (!invoiceId) {
      toast({
        title: 'Missing Invoice ID',
        description: 'Please provide an invoice ID to analyze',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const idHex = idFromInvoice(invoiceId)
      
      console.log('Analyzing invoice creation...')
      console.log('Original Invoice ID:', invoiceId)
      console.log('Hashed Invoice ID:', idHex)

      // Get invoice data from contract
      const invoiceData = await publicClient.readContract({
        address: ESCROW,
        abi: abiEscrow,
        functionName: 'invoices',
        args: [idHex]
      })

      const [payer, payee, token, total, funded, createdAt, fundedAt, autoReleaseAt, state, disputed, metaURI] = invoiceData

      // Check if invoice exists
      const exists = payer !== '0x0000000000000000000000000000000000000000' || 
                   payee !== '0x0000000000000000000000000000000000000000'

      const analysisResult = {
        invoiceId,
        idHex,
        exists,
        data: {
          payer,
          payee,
          token,
          total: total.toString(),
          funded: funded.toString(),
          createdAt: Number(createdAt),
          fundedAt: Number(fundedAt),
          autoReleaseAt: Number(autoReleaseAt),
          state: Number(state),
          disputed,
          metaURI
        },
        issues: []
      }

      // Analyze potential issues
      if (!exists) {
        analysisResult.issues.push({
          type: 'error',
          message: 'Invoice does not exist on-chain'
        })
      } else {
        if (payer === '0x0000000000000000000000000000000000000000') {
          analysisResult.issues.push({
            type: 'critical',
            message: 'Payer is zero address - this indicates the invoice was created incorrectly'
          })
        }

        if (state === 1 && fundedAt === 0) {
          analysisResult.issues.push({
            type: 'critical',
            message: 'Invoice is in Funded state but has no funding timestamp - this is suspicious'
          })
        }

        if (state === 1 && funded === 0n) {
          analysisResult.issues.push({
            type: 'critical',
            message: 'Invoice is in Funded state but funded amount is 0 - this is incorrect'
          })
        }

        if (total !== funded && state === 1) {
          analysisResult.issues.push({
            type: 'warning',
            message: `Total amount (${total}) does not match funded amount (${funded})`
          })
        }
      }

      setAnalysis(analysisResult)
      
      toast({
        title: 'Analysis Complete',
        description: `Found ${analysisResult.issues.length} issues`
      })
    } catch (error) {
      console.error('Analysis error:', error)
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze invoice creation',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: number) => {
    if (timestamp === 0) return 'Not set'
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatAmount = (amount: string, decimals = 6) => {
    const amountBig = BigInt(amount)
    const divisor = BigInt(10) ** BigInt(decimals)
    const whole = amountBig / divisor
    const fraction = amountBig % divisor
    return `${whole}.${fraction.toString().padStart(decimals, '0').slice(0, 2)}`
  }

  const getStateLabel = (state: number) => {
    const states = ['Created', 'Funded', 'Released']
    return states[state] || `Unknown(${state})`
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive'
      case 'warning': return 'secondary'
      case 'error': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Invoice Creation Debug
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analyze invoice creation issues and state problems
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="invoiceId">Invoice ID</Label>
          <Input
            id="invoiceId"
            placeholder="Enter invoice ID to analyze"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
          />
        </div>

        <Button 
          onClick={analyzeInvoiceCreation}
          disabled={loading || !invoiceId}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analyze Invoice Creation
            </>
          )}
        </Button>

        {analysis && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Analysis Results</h4>
              <Badge variant={analysis.exists ? 'default' : 'destructive'}>
                {analysis.exists ? 'Exists' : 'Not Found'}
              </Badge>
            </div>

            {analysis.exists && (
              <>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">State:</span>
                      <Badge variant={analysis.data.state === 0 ? 'secondary' : analysis.data.state === 1 ? 'default' : 'outline'} className="ml-2">
                        {getStateLabel(analysis.data.state)}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Disputed:</span>
                      <Badge variant={analysis.data.disputed ? 'destructive' : 'outline'} className="ml-2">
                        {analysis.data.disputed ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Payer:</span>
                      <span className="font-mono text-xs">
                        {analysis.data.payer === '0x0000000000000000000000000000000000000000' 
                          ? '❌ Zero Address' 
                          : `${analysis.data.payer.slice(0, 6)}...${analysis.data.payer.slice(-4)}`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Payee:</span>
                      <span className="font-mono text-xs">
                        {analysis.data.payee.slice(0, 6)}...{analysis.data.payee.slice(-4)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-mono text-xs">${formatAmount(analysis.data.total)} wPYUSD</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Funded Amount:</span>
                      <span className="font-mono text-xs">${formatAmount(analysis.data.funded)} wPYUSD</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Created At:</span>
                      <span className="text-xs">{formatTimestamp(analysis.data.createdAt)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Funded At:</span>
                      <span className="text-xs">{formatTimestamp(analysis.data.fundedAt)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Auto Release:</span>
                      <span className="text-xs">{formatTimestamp(analysis.data.autoReleaseAt)}</span>
                    </div>
                  </div>

                  {analysis.data.metaURI && (
                    <div className="text-sm">
                      <span className="font-medium">Meta URI:</span>
                      <p className="text-xs text-muted-foreground mt-1">{analysis.data.metaURI}</p>
                    </div>
                  )}
                </div>

                {analysis.issues.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-red-600">Issues Found:</h5>
                    {analysis.issues.map((issue: any, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <Badge variant={getIssueColor(issue.type)} className="mt-0.5">
                          {issue.type}
                        </Badge>
                        <p className="text-sm">{issue.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Original ID:</strong> {analysis.invoiceId}</p>
              <p><strong>Hashed ID:</strong> {analysis.idHex}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}