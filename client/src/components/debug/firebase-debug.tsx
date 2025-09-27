import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../contexts/auth-context'
import { useToast } from '../../hooks/use-toast'
import { firestore } from '../../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function FirebaseDebug() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const { user } = useAuth()
  const { toast } = useToast()

  const testFirebaseConnection = async () => {
    setLoading(true)
    try {
      // Try to read from the invoices collection
      const invoicesRef = collection(firestore, 'invoices')
      const snapshot = await getDocs(invoicesRef)
      
      const count = snapshot.size
      setResult(`Firebase connected! Found ${count} invoices in database.`)
      
      toast({
        title: 'Success',
        description: 'Firebase connection working'
      })
    } catch (error) {
      console.error('Firebase connection error:', error)
      setResult(`Firebase error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      toast({
        title: 'Error',
        description: 'Firebase connection failed',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Firebase Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testFirebaseConnection} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test Firebase Connection'}
        </Button>
        
        {result && (
          <div className="p-3 bg-muted rounded text-sm">
            {result}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>User: {user ? user.uid : 'Not logged in'}</p>
          <p>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID}</p>
        </div>
      </CardContent>
    </Card>
  )
}