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
import { directTransfer } from '../actions/directTransfer'
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
      console.log('🔍 Loading onchain status for invoice:', {
        invoiceId: invoice.invoiceId,
        idHex: invoice.onchain.idHex,
        databaseState: invoice.onchain.state,
        databaseStatus: invoice.status
      })
      
      const status = await getInvoiceStatus(invoice.onchain.idHex as `0x${string}`, currentAccount)
      
      console.log('📊 Onchain status result:', {
        onchainState: status.state,
        onchainStateName: status.stateName,
        databaseState: invoice.onchain.state,
        payer: status.payer,
        payee: status.payee,
        total: status.total.toString(),
        funded: status.funded.toString(),
        isComplete: status.isComplete,
        canFund: status.canFund,
        canRelease: status.canRelease,
        currentUser: currentAccount,
        isUserPayee: currentAccount && status.payee.toLowerCase() === currentAccount.toLowerCase()
      })
      
      // CRITICAL: Check if the state is actually 2 (Released) when it should be 1 (Funded)
      if (status.state === 2 && invoice.status === 'funded') {
        console.error('🚨 CRITICAL ISSUE: Blockchain shows Released but database shows Funded!')
        console.error('This means the payment was auto-released or someone released it without updating the database')
      }
      
      setOnchainStatus(status)
      
      // Check for state mismatch
      if (status.state.toString() !== invoice.onchain.state) {
        console.warn('⚠️ STATE MISMATCH DETECTED:', {
          onchainState: status.state,
          databaseState: invoice.onchain.state,
          message: 'Database and blockchain states are different!'
        })
      }
      
      // CRITICAL: Don't auto-update to paid when contract shows Released
      // This prevents the auto-release bug from marking payments as complete
      if (status.isComplete && invoice.status !== 'paid') {
        console.error('🚨 AUTO-RELEASE DETECTED: Contract shows Released but database shows not paid!')
        console.error('This could be due to autoReleaseAt timer or contract bug')
        console.error('NOT auto-updating to paid - payee must manually release to ensure fund transfer')
        
        // Don't auto-update - require manual release by payee
        console.log('⚠️ Requiring manual release by payee to ensure proper fund transfer')
      } else if (status.state === 1 && invoice.status !== 'funded') {
        // Update to funded if blockchain shows funded but database doesn't
        console.log('🔄 Updating database to reflect funded status')
        await InvoiceService.updateInvoiceStatus(invoice.invoiceId, 'funded', {
          onchain: {
            ...invoice.onchain,
            state: 'funded'
          }
        })
        await loadInvoice()
      }
    } catch (error) {
      console.error('❌ Error loading on-chain status:', error)
      
      // If invoice doesn't exist on-chain, that's okay - it will be created during funding
      if (error instanceof Error && error.message.includes('does not exist on blockchain')) {
        console.log('ℹ️ Invoice does not exist on blockchain yet - will be created during funding')
        setOnchainStatus({
          state: 0,
          stateName: 'Created',
          payer: '0x0000000000000000000000000000000000000000',
          payee: invoice?.onchain?.payee || '0x0000000000000000000000000000000000000000',
          total: BigInt((invoice?.amount || 0) * 1_000_000),
          funded: BigInt(0),
          isComplete: false,
          canFund: true,
          canRelease: false,
          message: 'Invoice ready to be funded (will be created on-chain during funding)'
        })
      }
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

    console.log('🚀 Starting manual release process:', {
      invoiceId: invoice.invoiceId,
      currentUser: currentAccount,
      payee: invoice.onchain.payee,
      isUserPayee: currentAccount?.toLowerCase() === invoice.onchain.payee?.toLowerCase(),
      contractState: onchainStatus?.state,
      contractStateName: onchainStatus?.stateName,
      databaseStatus: invoice.status,
      amount: invoice.amount,
      isAutoReleaseCase: onchainStatus?.state === 2 && invoice.status !== 'paid'
    })

    setProcessing(true)
    try {
      const txHash = await releaseInvoice({
        invoiceId: invoice.invoiceId,
        storedIdHex: invoice.onchain.idHex
      })

      console.log('✅ Release transaction successful:', txHash)

      // Update Firestore
      await InvoiceService.updateInvoiceStatus(invoice.invoiceId, 'paid', {
        onchain: {
          ...invoice.onchain,
          state: 'released',
          releaseTx: txHash
        }
      })

      toast({
        title: 'Payment Released',
        description: 'Payment has been successfully released and transferred to your wallet'
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

  const handleDirectTransfer = async () => {
    if (!invoice || !walletConnected || !invoice.onchain.payee) return

    console.log('🚀 Starting direct transfer (escrow bypass):', {
      invoiceId: invoice.invoiceId,
      currentUser: currentAccount,
      payee: invoice.onchain.payee,
      amount: invoice.amount,
      reason: 'Escrow contract bug - direct transfer needed'
    })

    setProcessing(true)
    try {
      const amountBig = toTokenAmountUSD(invoice.amount)
      const txHash = await directTransfer({
        payeeAddress: invoice.onchain.payee as `0x${string}`,
        amountBig
      })

      console.log('✅ Direct transfer successful:', txHash)

      // Update Firestore to mark as paid
      await InvoiceService.updateInvoiceStatus(invoice.invoiceId, 'paid', {
        onchain: {
          ...invoice.onchain,
          state: 'paid',
          directTransferTx: txHash
        }
      })

      toast({
        title: 'Direct Transfer Complete',
        description: 'Funds have been transferred directly to the freelancer\'s wallet'
      })

      // Reload invoice data and on-chain status
      await loadInvoice()
      await loadOnchainStatus()
    } catch (error: any) {
      console.error('Error with direct transfer:', error)
      toast({
        title: 'Direct Transfer Failed',
        description: error.message || 'Failed to transfer funds directly',
        variant: 'destructive'
      })
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
    console.log('🏷️ Determining status badge:', {
      onchainStatus: onchainStatus ? {
        state: onchainStatus.state,
        stateName: onchainStatus.stateName,
        isComplete: onchainStatus.isComplete
      } : null,
      invoiceStatus: invoice?.status,
      databaseOnchainState: invoice?.onchain?.state
    })
    
    // CRITICAL: Don't trust onchain isComplete - check database status first
    // Only show complete if database confirms payment is actually paid
    if (invoice?.status === 'paid') {
      console.log('✅ Showing: Payment Complete (database confirms paid)')
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Payment Complete</Badge>
    }
    
    // Show warning for auto-release bug case
    if (onchainStatus?.state === 2 && invoice?.status !== 'paid') {
      console.log('⚠️ Showing: Action Required (auto-release detected)')
      return <Badge variant="destructive"><Clock className="w-3 h-3 mr-1" />Action Required</Badge>
    }
    
    if (onchainStatus?.state === 1) {
      console.log('💰 Showing: Funded (onchain state === 1)')
      return <Badge variant="secondary"><Wallet className="w-3 h-3 mr-1" />Funded</Badge>
    }
    
    // Fall back to database status
    console.log('📋 Using database status:', invoice?.status)
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
  
  // RELEASE LOGIC: Allow both payer and payee to release funds
  const isUserPayee = currentAccount && invoice?.onchain?.payee && 
    currentAccount.toLowerCase() === invoice.onchain.payee.toLowerCase()
  
  const isUserPayer = currentAccount && onchainStatus?.payer && 
    currentAccount.toLowerCase() === onchainStatus.payer.toLowerCase()
  
  // Allow release if:
  // 1. User is the payer (client who funded) OR payee (freelancer)
  // 2. Invoice is funded (state 1) OR contract shows released but DB shows not paid (bug case)
  const canRelease = walletConnected && (isUserPayer || isUserPayee) && (
    onchainStatus?.state === 1 || // Normal case: state is Funded
    (onchainStatus?.state === 2 && invoice?.status !== 'paid') // Bug case: contract shows Released but DB shows not paid
  )
  
  const isComplete = invoice?.status === 'paid' // Only trust database status, not contract

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

            {/* Auto-Release Bug Warning */}
            {console.log('🔍 Warning visibility check:', {
              onchainState: onchainStatus?.state,
              invoiceStatus: invoice?.status,
              isUserPayee,
              currentAccount,
              payeeAddress: invoice?.onchain?.payee,
              shouldShowWarning: onchainStatus?.state === 2 && invoice?.status !== 'paid' && isUserPayee
            })}
            {onchainStatus?.state === 2 && invoice?.status !== 'paid' && (isUserPayee || isUserPayer) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Action Required: Manual Release Needed</h3>
                    <p className="text-yellow-700 mb-3">
                      The smart contract shows this payment as "Released" but the funds may not have been properly transferred to your wallet. 
                      This can happen due to an auto-release timer or contract bug.
                    </p>
                    <p className="text-yellow-700 font-medium">
                      {isUserPayer ? 
                        'As the payer, please click "Release Payment" below to release the funds to the freelancer.' :
                        'As the freelancer, please click "Claim Funds" below to ensure the funds are properly transferred to your wallet.'
                      }
                    </p>
                    <p className="text-yellow-600 text-sm mt-2">
                      The smart contract release function should be called by the payer (who funded the payment).
                    </p>
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
                    variant={onchainStatus?.state === 2 ? "default" : "outline"}
                    className="flex-1"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {isUserPayer ? 'Release Payment' : 
                     (onchainStatus?.state === 2 ? 'Claim Funds' : 'Release Payment')}
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