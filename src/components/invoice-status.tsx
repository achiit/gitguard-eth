import { useState, useEffect } from 'react'
import { getInvoiceStatus, InvoiceStatus } from '../utils/get-invoice-status'

interface Props {
  invoiceIdHex: string
  userAddress?: string
}

export default function InvoiceStatusComponent({ invoiceIdHex, userAddress }: Props) {
  const [status, setStatus] = useState<InvoiceStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true)
        const invoiceStatus = await getInvoiceStatus(invoiceIdHex as `0x${string}`, userAddress)
        setStatus(invoiceStatus)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    if (invoiceIdHex) {
      fetchStatus()
    }
  }, [invoiceIdHex, userAddress])

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading invoice status...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fadbd8', borderRadius: '4px' }}>
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (!status) {
    return null
  }

  const getStatusColor = () => {
    if (status.isComplete) return '#00b894'
    if (status.state === 1) return '#fdcb6e'
    return '#74b9ff'
  }

  const getStatusIcon = () => {
    if (status.isComplete) return '✅'
    if (status.state === 1) return '💰'
    return '📄'
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8f9fa',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '8px',
      margin: '20px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <span style={{ fontSize: '24px', marginRight: '10px' }}>{getStatusIcon()}</span>
        <div>
          <h3 style={{ margin: 0, color: getStatusColor() }}>
            Invoice Status: {status.stateName}
          </h3>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>{status.message}</p>
        </div>
      </div>

      <div style={{ fontSize: '14px', color: '#666' }}>
        <div><strong>Amount:</strong> ${(Number(status.total) / 1_000_000).toFixed(2)}</div>
        <div><strong>Funded:</strong> ${(Number(status.funded) / 1_000_000).toFixed(2)}</div>
        {status.payer !== '0x0000000000000000000000000000000000000000' && (
          <div><strong>Payer:</strong> {status.payer}</div>
        )}
        <div><strong>Payee:</strong> {status.payee}</div>
      </div>

      {status.isComplete && (
        <div style={{ 
          marginTop: '15px', 
          padding: '15px', 
          backgroundColor: '#d1f2eb', 
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <strong>🎉 Payment Successfully Completed!</strong>
          <br />
          <small>The funds have been released to the payee.</small>
        </div>
      )}
    </div>
  )
}