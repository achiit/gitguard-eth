import { useState, useEffect } from 'react'
import { useParams } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Loader2, ExternalLink, Wallet, CheckCircle, Clock, Coins } from 'lucide-react'
import { InvoiceService } from '../services/invoiceService'
import { fundInvoice } from '../actions/fundInvoice'
import { releaseInvoice } from '../actions/releaseInvoice'
import { fetchInvoiceState } from '../actions/fetchInvoiceState'
import { faucetTokens } from '../actions/faucetTokens'
import { FirebaseInvoice } from '../../../shared/schema'
import { toTokenAmountUSD } from '../lib/paystream'
import { useToast } from '../hooks/use-toast'
import { getInvoiceStatus, InvoiceStatus } from '../utils/get-invoice-status'

export default function PaymentView() {
  const { payLinkToken } = useParams<{ payLinkToken: string }>()
  const [invoice, setInvoice] = useState<FirebaseInvoice | null>(null)
  const [onchainStatus, setOnchainStatus] = useState<InvoiceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<string>('')
  const { toast } = useToast()

  useEffect(() => {
    loadInvoice()
    checkWalletConnection()
  }, [payLinkToken])

  useEffect(() => {
    if (invoice && walletConnected) {
      loadOnchainStatus()
    }
  }, [invoice, walletConnected, currentAccount])

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

  const loadOnchainStatus = async () => {
    if (!invoice?.onchain?.idHex) return
    
    try {
      const status = await getInvoiceStatus(invoice.onchain.idHex as `0x${string}`, currentAccount)
      setOnchainStatus(status)
      
      // Update database if on-chain state is different
      if (status.isComplete && invoice.status !== 'paid') {
        await InvoiceService.updateInvoiceStatus(invoice.invoiceId, 'paid', {
          onchain: {
            ...invoice.onchain,
            state: 'paid'
          }
        })
        // Reload invoice to get updated data
        await loadInvoice()
      }
    } catch (error) {
      console.error('Error loading on-chain status:', error)
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

      // Reload invoice data and on-chain status
      await loadInvoice()
      await loadOnchainStatus()
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

      // Reload invoice data and on-chain status
      await loadInvoice()
      await loadOnchainStatus()
    } catch (error: any) {
      console.error('Error releasing payment:', error)
      
      // Handle the "already completed" case as success
      if (error.message?.includes('Payment already completed')) {
        toast({
          title: 'Payment Complete',
          description: 'This payment has already been completed successfully!',
          variant: 'default'
        })
        // Update the database to reflect completion
        await InvoiceService.updateInvoiceStatus(invoice.invoiceId, 'paid', {
          onchain: {
            ...invoice.onchain,
            state: 'paid'
          }
        })
        await loadInvoice()
        await loadOnchainStatus()
      } else {
        toast({
          title: 'Release Failed',
          description: 'Failed to release the payment',
          variant: 'destructive'
        })
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleFaucet = async () => {
    if (!walletConnected) return

    setProcessing(true)
    try {
      const txHash = await faucetTokens()
      
      toast({
        title: 'Faucet Success',
        description: 'Test tokens have been sent to your wallet'
      })
    } catch (error) {
      console.error('Error getting faucet tokens:', error)
      toast({
        title: 'Faucet Failed',
        description: 'Failed to get test tokens',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = () => {
    // Use on-chain status if available, otherwise fall back to database status
    if (onchainStatus?.isComplete) {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Payment Complete</Badge>
    }
    
    if (onchainStatus?.state === 1) {
      return <Badge variant="secondary"><Wallet className="w-3 h-3 mr-1" />Funded</Badge>
    }
    
    // Fall back to database status
    switch (invoice?.status) {
      case 'sent':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Awaiting Payment</Badge>
      case 'funded':
        return <Badge variant="secondary"><Wallet className="w-3 h-3 mr-1" />Funded</Badge>
      case 'paid':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="outline">{invoice?.status || 'Unknown'}</Badge>
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

  // Use on-chain status for button logic
  const canFund = onchainStatus?.canFund && walletConnected
  const canRelease = onchainStatus?.canRelease && walletConnected
  const isComplete = onchainStatus?.isComplete || invoice?.status === 'paid'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payment Request</CardTitle>
              {getStatusBadge()}
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

            {/* Payment Complete Message */}
            {isComplete && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Completed Successfully!</h3>
                <p className="text-green-600">
                  The payment of ${invoice?.amount.toLocaleString()} has been successfully processed and released to the freelancer.
                </p>
                {onchainStatus?.message && (
                  <p className="text-sm text-green-600 mt-2">{onchainStatus.message}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!isComplete && (
              <div className="flex gap-3">
                {walletConnected && !onchainStatus?.isComplete && (
                  <Button 
                    onClick={handleFaucet} 
                    disabled={processing}
                    variant="secondary"
                    size="sm"
                  >
                    {processing ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Coins className="w-3 h-3 mr-1" />
                    )}
                    Get Test Tokens
                  </Button>
                )}

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
            )}

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