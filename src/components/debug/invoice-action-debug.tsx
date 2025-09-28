import { useState } from 'react'
import { checkIfInvoiceCanBeReleased } from '../../utils/check-invoice-release'
import { releaseInvoice } from '../../actions/releaseInvoice'

interface Props {
  invoiceId: string
  invoiceIdHex: string
}

export default function InvoiceActionDebug({ invoiceId, invoiceIdHex }: Props) {
  const [isChecking, setIsChecking] = useState(false)
  const [releaseStatus, setReleaseStatus] = useState<any>(null)
  const [isReleasing, setIsReleasing] = useState(false)
  const [releaseResult, setReleaseResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckRelease = async () => {
    setIsChecking(true)
    setError(null)
    setReleaseStatus(null)
    
    try {
      if (!window.ethereum) {
        throw new Error('No wallet found')
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts connected')
      }

      const userAddress = accounts[0]
      const status = await checkIfInvoiceCanBeReleased(invoiceIdHex as `0x${string}`, userAddress)
      setReleaseStatus(status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsChecking(false)
    }
  }

  const handleRelease = async () => {
    setIsReleasing(true)
    setError(null)
    setReleaseResult(null)
    
    try {
      const txHash = await releaseInvoice({
        invoiceId,
        storedIdHex: invoiceIdHex
      })
      setReleaseResult(`Release successful! Transaction: ${txHash}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsReleasing(false)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #e17055', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#ffeaa7'
    }}>
      <h3 style={{ color: '#d63031' }}>🚀 Debug: Invoice Actions</h3>
      <p><strong>Invoice ID:</strong> {invoiceId}</p>
      <p><strong>Invoice Hash:</strong> {invoiceIdHex}</p>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={handleCheckRelease}
          disabled={isChecking}
          style={{
            padding: '10px 20px',
            backgroundColor: isChecking ? '#ccc' : '#0984e3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isChecking ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isChecking ? 'Checking...' : 'Check If Can Release'}
        </button>

        {releaseStatus?.canRelease && (
          <button 
            onClick={handleRelease}
            disabled={isReleasing}
            style={{
              padding: '10px 20px',
              backgroundColor: isReleasing ? '#ccc' : '#00b894',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isReleasing ? 'not-allowed' : 'pointer'
            }}
          >
            {isReleasing ? 'Releasing...' : 'Release Invoice'}
          </button>
        )}
      </div>

      {releaseStatus && (
        <div style={{ 
          marginTop: '15px', 
          padding: '15px', 
          backgroundColor: releaseStatus.canRelease ? '#d1f2eb' : '#fadbd8', 
          borderRadius: '4px' 
        }}>
          <strong>{releaseStatus.canRelease ? '✅ Can Release:' : '❌ Cannot Release:'}</strong>
          <br />
          {releaseStatus.reason}
        </div>
      )}

      {releaseResult && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d1f2eb', borderRadius: '4px' }}>
          <strong>✅ Success:</strong> {releaseResult}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fadbd8', borderRadius: '4px' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Theory:</strong> If the invoice shows as "Funded" but funding fails, it might actually be ready for release instead.
      </div>
    </div>
  )
}