import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useAuth } from '../../contexts/auth-context'
import { useToast } from '../../hooks/use-toast'
import { InvoiceService } from '../../services/invoiceService'
import { generateId } from '../../lib/utils'
import { WPYUSD, idFromInvoice } from '../../lib/paystream'

interface InvoiceDebugProps {
  onInvoiceCreated?: () => void
}

export default function InvoiceDebug({ onInvoiceCreated }: InvoiceDebugProps) {
  const [amount, setAmount] = useState('100')
  const [status, setStatus] = useState<'sent' | 'funded' | 'paid'>('sent')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const createMultipleTestInvoices = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in first',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const testData = [
        { amount: 250, status: 'sent' as const },
        { amount: 500, status: 'funded' as const },
        { amount: 1000, status: 'paid' as const }
      ]

      for (const data of testData) {
        const invoiceId = generateId()
        const payLinkToken = generateId()
        const onchainState = data.status === 'sent' ? 'created' : data.status === 'funded' ? 'funded' : 'paid'
        
        const testInvoice = {
          contractId: 'test-contract-' + generateId(),
          userId: user.uid,
          clientId: 'test-client',
          currency: 'USD',
          amount: data.amount,
          status: data.status,
          payLinkToken,
          onchain: {
            chainId: Number(import.meta.env.VITE_CHAIN_ID),
            escrow: import.meta.env.VITE_ESCROW_ADDRESS,
            idHex: idFromInvoice(invoiceId),
            token: WPYUSD,
            amount: (data.amount * 1_000_000).toString(),
            state: onchainState as 'created' | 'funded' | 'paid',
            payee: '0x742d35Cc6634C0532925a3b8D0C9e3e0C0c0c0c0',
            ...(data.status === 'funded' && {
              fundTx: '0x' + Math.random().toString(16).substring(2, 66),
              payer: '0x' + Math.random().toString(16).substring(2, 42)
            }),
            ...(data.status === 'paid' && {
              fundTx: '0x' + Math.random().toString(16).substring(2, 66),
              releaseTx: '0x' + Math.random().toString(16).substring(2, 66),
              payer: '0x' + Math.random().toString(16).substring(2, 42)
            })
          }
        }

        await InvoiceService.createInvoice(testInvoice)
      }
      
      toast({
        title: 'Success',
        description: 'Created 3 sample invoices with different statuses'
      })

      if (onInvoiceCreated) {
        onInvoiceCreated()
      }
    } catch (error) {
      console.error('Error creating test invoices:', error)
      toast({
        title: 'Error',
        description: 'Failed to create test invoices',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createTestInvoice = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in first',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const invoiceId = generateId()
      const payLinkToken = generateId()

      // Map status to onchain state
      const onchainState = status === 'sent' ? 'created' : status === 'funded' ? 'funded' : 'paid'
      
      const testInvoice = {
        contractId: 'test-contract-' + generateId(),
        userId: user.uid,
        clientId: 'test-client',
        currency: 'USD',
        amount: parseFloat(amount),
        status: status,
        payLinkToken,
        onchain: {
          chainId: Number(import.meta.env.VITE_CHAIN_ID),
          escrow: import.meta.env.VITE_ESCROW_ADDRESS,
          idHex: idFromInvoice(invoiceId),
          token: WPYUSD,
          amount: (parseFloat(amount) * 1_000_000).toString(), // Convert to 6 decimals
          state: onchainState as 'created' | 'funded' | 'paid',
          payee: '0x742d35Cc6634C0532925a3b8D0C9e3e0C0c0c0c0', // Test address
          // Add some test transaction hashes for funded/paid invoices
          ...(status === 'funded' && {
            fundTx: '0x' + Math.random().toString(16).substring(2, 66),
            payer: '0x' + Math.random().toString(16).substring(2, 42)
          }),
          ...(status === 'paid' && {
            fundTx: '0x' + Math.random().toString(16).substring(2, 66),
            releaseTx: '0x' + Math.random().toString(16).substring(2, 66),
            payer: '0x' + Math.random().toString(16).substring(2, 42)
          })
        }
      }

      const createdInvoiceId = await InvoiceService.createInvoice(testInvoice)
      
      toast({
        title: 'Success',
        description: `Test invoice created: ${createdInvoiceId.slice(-8)}`
      })

      // Trigger refresh of invoices list
      if (onInvoiceCreated) {
        onInvoiceCreated()
      }
    } catch (error) {
      console.error('Error creating test invoice:', error)
      toast({
        title: 'Error',
        description: 'Failed to create test invoice',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Invoice Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value: 'sent' | 'funded' | 'paid') => setStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sent">Sent (Awaiting Payment)</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="paid">Paid (Completed)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Button 
            onClick={createTestInvoice} 
            disabled={loading || !user}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Test Invoice'}
          </Button>
          <Button 
            onClick={createMultipleTestInvoices} 
            disabled={loading || !user}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create 3 Sample Invoices'}
          </Button>
        </div>
        {!user && (
          <p className="text-sm text-muted-foreground">
            Please log in to create test invoices
          </p>
        )}
      </CardContent>
    </Card>
  )
}