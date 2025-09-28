import { useState } from 'react'
import { fundInvoice } from '../../actions/fundInvoice'
import { forceReleaseInvoice } from '../../actions/forceReleaseInvoice'

interface Props {
  invoiceId: string
  invoiceIdHex: string
  amount: number
}

export default function FixStuckInvoice({ invoiceId, invoiceIdHex, amount }: Props) {
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleForceFund = async () => {
    setIsWorking(true)
    setError(null)
    setResult(null)
    
    try {
      const amountBig = BigInt(amount * 1_000_000) // Convert to 6 decimals
      const txHash = await fundInvoice({
        invoiceId,
        amountBig,
        storedIdHex: invoiceIdHex
      })
      setResult(`✅ Force funding successful! Transaction: ${txHash}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsWorking(false)
    }
  }

  const handleForceRelease = async () => {
    setIsWorking(true)
    setError(null)
    setResult(null)
    
    try {
      const txHash = await forceReleaseInvoice({
        invoiceId,
        storedIdHex: invoiceIdHex
      })
      setResult(`✅ Force release successful! Transaction: ${txHash}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '3px solid #d63031', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#fff5f5'
    }}>
      <h3 style={{ color: '#d63031' }}>🔧 EMERGENCY FIX: Stuck Invoice</h3>
      <p><strong>Problem:</strong> Invoice is in "Funded" state but has no payer (contract bug)</p>
      <p><strong>Invoice ID:</strong> {invoiceId}</p>
      <p><strong>Amount:</strong> ${amount}</p>
      
      <div style={{ marginBottom: '15px' }}>
        <h4>Try These Solutions:</h4>
        
        <button 
          onClick={handleForceFund}
          disabled={isWorking}
          style={{
            padding: '12px 24px',
            backgroundColor: isWorking ? '#ccc' : '#0984e3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isWorking ? 'not-allowed' : 'pointer',
            marginRight: '10px',
            marginBottom: '10px'
          }}
        >
          {isWorking ? 'Working...' : '💰 Force Fund (Try This First)'}
        </button>

        <button 
          onClick={handleForceRelease}
          disabled={isWorking}
          style={{
            padding: '12px 24px',
            backgroundColor: isWorking ? '#ccc' : '#00b894',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isWorking ? 'not-allowed' : 'pointer',
            marginBottom: '10px'
          }}
        >
          {isWorking ? 'Working...' : '🚀 Force Release (If Fund Fails)'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#d1f2eb', borderRadius: '4px' }}>
          <strong>{result}</strong>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#fadbd8', borderRadius: '4px' }}>
          <strong>❌ Error:</strong> {error}
          <br />
          <small>If force fund fails, try force release. If both fail, there may be a deeper contract issue.</small>
        </div>
      )}

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
        <strong>What's happening:</strong>
        <br />
        • Your invoice is stuck in "Funded" state but with no payer recorded
        <br />
        • This is likely a contract bug or state corruption
        <br />
        • Force Fund: Tries to fund anyway (bypasses validation)
        <br />
        • Force Release: Assumes it's already funded and tries to release
      </div>
    </div>
  )
}