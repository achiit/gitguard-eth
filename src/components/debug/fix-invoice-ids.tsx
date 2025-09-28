import { useState } from 'react'
import { fixInvoiceIds } from '../../utils/fix-invoice-ids'

export function FixInvoiceIdsDebug() {
  const [isFixing, setIsFixing] = useState(false)
  const [result, setResult] = useState<{ fixedCount: number; totalCount: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFix = async () => {
    setIsFixing(true)
    setError(null)
    setResult(null)
    
    try {
      const fixResult = await fixInvoiceIds()
      setResult(fixResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #ff6b6b', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#fff5f5'
    }}>
      <h3 style={{ color: '#d63031' }}>🔧 Debug: Fix Invoice IDs</h3>
      <p>This will fix any invoices that have incorrect idHex values stored in the database.</p>
      
      <button 
        onClick={handleFix}
        disabled={isFixing}
        style={{
          padding: '10px 20px',
          backgroundColor: isFixing ? '#ccc' : '#0984e3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isFixing ? 'not-allowed' : 'pointer'
        }}
      >
        {isFixing ? 'Fixing...' : 'Fix All Invoice IDs'}
      </button>

      {result && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d1f2eb', borderRadius: '4px' }}>
          <strong>✅ Fix Complete!</strong>
          <br />
          Fixed {result.fixedCount} out of {result.totalCount} invoices
        </div>
      )}

      {error && (
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fadbd8', borderRadius: '4px' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Note:</strong> Remove this component after fixing the invoices.
      </div>
    </div>
  )
}