import { useState } from 'react'
import { debugInvoiceState } from '../../utils/debug-invoice-state'

export default function InvoiceStateDebug({ invoiceIdHex }: { invoiceIdHex: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [debugData, setDebugData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDebug = async () => {
    setIsLoading(true)
    setError(null)
    setDebugData(null)
    
    try {
      const data = await debugInvoiceState(invoiceIdHex as `0x${string}`)
      setDebugData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #0984e3', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3 style={{ color: '#0984e3' }}>🔍 Debug: Invoice State</h3>
      <p><strong>Invoice ID:</strong> {invoiceIdHex}</p>
      
      <button 
        onClick={handleDebug}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#0984e3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Debugging...' : 'Debug Invoice State'}
      </button>

      {debugData && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '4px' }}>
          <h4>📊 Invoice Details:</h4>
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <div><strong>Payer:</strong> {debugData.payer}</div>
            <div><strong>Payee:</strong> {debugData.payee}</div>
            <div><strong>Total:</strong> ${(Number(debugData.total) / 1_000_000).toFixed(2)}</div>
            <div><strong>Funded:</strong> ${(Number(debugData.funded) / 1_000_000).toFixed(2)}</div>
            <div><strong>State:</strong> {debugData.state} ({['Created', 'Funded', 'Released'][debugData.state]})</div>
            <div><strong>Disputed:</strong> {debugData.disputed ? 'Yes' : 'No'}</div>
            
            {debugData.isPayerZero && (
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                <strong>⚠️ Issue Detected:</strong> Payer is zero address but state is {['Created', 'Funded', 'Released'][debugData.state]}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fadbd8', borderRadius: '4px' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
    </div>
  )
}