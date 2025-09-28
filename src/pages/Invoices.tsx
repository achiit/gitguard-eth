import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Copy, ExternalLink, RefreshCw, Clock, Wallet, CheckCircle } from 'lucide-react'
import { InvoiceService } from '../services/invoiceService'
import { fetchInvoiceState } from '../actions/fetchInvoiceState'
import { FirebaseInvoice } from '../../../shared/schema'
import { useAuth } from '../contexts/auth-context'
import { useToast } from '../hooks/use-toast'
import InvoiceDebug from '../components/debug/invoice-debug'
import FirebaseDebug from '../components/debug/firebase-debug'
import FaucetDebug from '../components/debug/faucet-debug'
import InvoiceStateDebug from '../components/debug/invoice-state-debug'
import FundingDebug from '../components/debug/funding-debug'
import ReleaseDebug from '../components/debug/release-debug'
import TransactionDebug from '../components/debug/transaction-debug'
import InvoiceCreationDebug from '../components/debug/invoice-creation-debug'
import DashboardLayout from '../components/layout/dashboard-layout'

export default function Invoices() {
  const [invoices, setInvoices] = useState<FirebaseInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadInvoices()
    }
  }, [user])

  const loadInvoices = async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      console.log('Loading invoices for user:', user.uid)
      const userInvoices = await InvoiceService.getUserInvoices(user.uid)
      console.log('Loaded invoices:', userInvoices.length)
      setInvoices(userInvoices)
    } catch (error) {
      console.error('Error loading invoices:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load invoices'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const syncWithBlockchain = async (invoice: FirebaseInvoice) => {
    setSyncing(invoice.invoiceId)
    try {
      const onchainState = await fetchInvoiceState(invoice.onchain.idHex as `0x${string}`)

      if (onchainState) {
        // Map blockchain state to our status
        let newStatus = invoice.status
        let newOnchainState = invoice.onchain.state

        if (onchainState.state === 2 && invoice.status === 'sent') {
          newStatus = 'funded'
          newOnchainState = 'funded'
        } else if (onchainState.state === 3 && invoice.status !== 'paid') {
          newStatus = 'paid'
          newOnchainState = 'paid'
        }

        if (newStatus !== invoice.status) {
          await InvoiceService.updateInvoiceStatus(invoice.invoiceId, newStatus as any, {
            onchain: {
              ...invoice.onchain,
              state: newOnchainState,
              payer: onchainState.payer !== '0x0000000000000000000000000000000000000000' ? onchainState.payer : undefined
            }
          })

          toast({
            title: 'Status Updated',
            description: `Invoice status synced with blockchain: ${newStatus}`
          })

          // Reload invoices
          await loadInvoices()
        } else {
          toast({
            title: 'Already Synced',
            description: 'Invoice is already up to date with blockchain'
          })
        }
      }
    } catch (error) {
      console.error('Error syncing with blockchain:', error)
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync with blockchain',
        variant: 'destructive'
      })
    } finally {
      setSyncing(null)
    }
  }

  const copyPaymentLink = (payLinkToken: string) => {
    const link = `${window.location.origin}/pay/${payLinkToken}`
    navigator.clipboard.writeText(link)
    toast({
      title: 'Link Copied',
      description: 'Payment link copied to clipboard'
    })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <DashboardLayout 
        title="Invoices" 
        description="Manage your payment invoices and track their status"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Your Invoices</h1>
              <p className="text-muted-foreground">Track payments and manage invoice status</p>
            </div>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="Invoices" 
      description="Manage your payment invoices and track their status"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Invoices</h1>
            <p className="text-muted-foreground">Track payments and manage invoice status</p>
          </div>
          <Button onClick={loadInvoices} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2 text-destructive">Error Loading Invoices</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadInvoices} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : invoices.length === 0 ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">No Invoices Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Invoices will appear here when you send contracts to clients.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Debug tools - only show in development */}
          {import.meta.env.DEV && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Development Tools</CardTitle>
                <p className="text-sm text-muted-foreground">
                  These tools are only visible in development mode
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FaucetDebug />
                    <FirebaseDebug />
                    <InvoiceDebug onInvoiceCreated={loadInvoices} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InvoiceStateDebug />
                    <FundingDebug />
                    <ReleaseDebug />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TransactionDebug />
                    <InvoiceCreationDebug />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {invoices.map((invoice) => (
            <Card key={invoice.invoiceId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Invoice #{invoice.invoiceId.slice(-8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center md:text-left">
                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                    <p className="text-2xl font-bold text-primary">${invoice.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{invoice.currency}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <label className="text-sm font-medium text-muted-foreground">Blockchain</label>
                    <p className="text-sm font-medium">Citrea Testnet</p>
                    <p className="text-xs text-muted-foreground">wPYUSD Token</p>
                  </div>
                  <div className="text-center md:text-left">
                    <label className="text-sm font-medium text-muted-foreground">Contract</label>
                    <p className="text-sm font-mono">{invoice.contractId.slice(-8)}</p>
                    <p className="text-xs text-muted-foreground">Contract ID</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => copyPaymentLink(invoice.payLinkToken)}
                    className="flex-1 sm:flex-none"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Payment Link
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncWithBlockchain(invoice)}
                    disabled={syncing === invoice.invoiceId}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing === invoice.invoiceId ? 'animate-spin' : ''}`} />
                    Sync Status
                  </Button>

                  {invoice.onchain.fundTx && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://explorer.citrea.xyz/tx/${invoice.onchain.fundTx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Fund Tx
                      </a>
                    </Button>
                  )}

                  {invoice.onchain.releaseTx && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://explorer.citrea.xyz/tx/${invoice.onchain.releaseTx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Release Tx
                      </a>
                    </Button>
                  )}
                </div>

                {invoice.onchain.payer && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Payer:</span> {invoice.onchain.payer}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </DashboardLayout>
  )
}