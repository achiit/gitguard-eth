import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Loader2, ExternalLink, Wallet, CheckCircle, Clock } from 'lucide-react'
import { InvoiceService } from '../services/invoiceService'
import { fundInvoice } from '../actions/fundInvoice'
import { releaseInvoice } from '../actions/releaseInvoice'
import { fetchInvoiceState } from '../actions/fetchInvoiceState'
import { FirebaseInvoice } from '../../shared/schema'
import { toTokenAmountUSD } from '../lib/paystream'
import { useToast } from '../hooks/use-toast'

export default function PaymentView() {
  const { payLinkToken } = useParams<{ payLinkToken: string }>()
  const [invoice, setInvoice] = useState<FirebaseInvoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    loadInvoice()
    checkWalletConnection()
  }, [payLinkToken])

  const loadInvoice = async () => {
    if (!payLinkToken) return
    
    try {
      const invoiceData = await InvoiceService.getInvoiceByPayLink(payLinkToken)
      setInvoice(invoiceData)
    } catch (error) {
      console.error('Error loading invoice:', error)
      toast({
        title: 'Error',
        description: 'Failed to load payment information',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setWalletConnected(true)
          setCurrentAccount(accounts[0])
        }
      } catch (error) {
        console.error('Error checking wallet:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: 'Wallet Required',
        description: 'Please install MetaMask or another Web3 wallet',
        variant: 'destructive'
      })
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setWalletConnected(true)
      setCurrentAccount(accounts[0])
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to your wallet'
      })
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet',
        variant: 'destructive'
      })
    }
  }

  const handleFund = async () => {
    if (!invoice || !walletConnected) return

    setProcessing(true)
    try {
      const amountBig = toTokenAmountUSD(invoice.amount)
      const txHash = await fundInvoice({
        invoiceId: invoice.invoiceId,
        amountBig,
        storedIdHex: invoice.onchain.idHex
      })

      // Update Firestore
      await InvoiceService.updateInvoiceStatus(invoice.invoiceId, 'funded', {
        onchain: {
          ...invoice.onchain,
          state: 'funded',
          fundTx: txHash,
          payer: currentAccount
        }
      })

      toast({
        title: 'Payment Funded',
        description: 'Payment has been successfully funded to escrow'
      })

      // Reload invoice data
      await loadInvoice()
    } catch (error) {
      console.error('Error funding invoice:', error)
      toast({
        title: 'Funding Failed',
        description: 'Failed to fund the payment',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleRelease = async () => {
    if (!invoice || !walletConnected) return

    setProcessing(true)
    try {
      const txHash = await releaseInvoice({
        invoiceId: invoice.invoiceId,
        storedIdHex: invoice.onchain.idHex
      })

      // Update Firestore
      await InvoiceService.updateInvoiceStatus(invoice.invoiceId, 'paid', {
        onchain: {
          ...invoice.onchain,
          state: 'paid',
          releaseTx: txHash
        }
      })

      toast({
        title: 'Payment Released',
        description: 'Payment has been released to the freelancer'
      })

      // Reload invoice data
      await loadInvoice()
    } catch (error) {
      console.error('Error releasing payment:', error)
      toast({
        title: 'Release Failed',
        description: 'Failed to release the payment',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Awaiting Payment</Badge>
      case 'funded':
        return <Badge variant="secondary"><Wallet className="w-3 h-3 mr-1" />Funded</Badge>
      case 'paid':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
              <p className="text-muted-foreground">The payment link is invalid or has expired.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canFund = invoice.status === 'sent' && walletConnected
  const canRelease = invoice.status === 'funded' && walletConnected && currentAccount.toLowerCase() === invoice.onchain.payer?.toLowerCase()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Request</CardTitle>
              {getStatusBadge(invoice.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="text-2xl font-bold">${invoice.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Currency</label>
                <p className="text-lg">{invoice.currency}</p>
              </div>
            </div>

            {/* Wallet Connection */}
            {!walletConnected ? (
              <div className="text-center py-6">
                <Button onClick={connectWallet} size="lg">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect your wallet to make payments
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-green-800">Wallet Connected</p>
                    <p className="text-sm text-green-600">{currentAccount}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {canFund && (
                <Button 
                  onClick={handleFund} 
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-2" />
                  )}
                  Fund Payment
                </Button>
              )}

              {canRelease && (
                <Button 
                  onClick={handleRelease} 
                  disabled={processing}
                  variant="outline"
                  className="flex-1"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Release Payment
                </Button>
              )}
            </div>

            {/* Transaction Links */}
            {(invoice.onchain.fundTx || invoice.onchain.releaseTx) && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Transaction History</h4>
                <div className="space-y-2">
                  {invoice.onchain.fundTx && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Funding Transaction</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={`https://explorer.citrea.xyz/tx/${invoice.onchain.fundTx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  )}
                  {invoice.onchain.releaseTx && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Release Transaction</span>
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={`https://explorer.citrea.xyz/tx/${invoice.onchain.releaseTx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}