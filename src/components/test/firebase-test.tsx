import { useEffect, useState } from 'react';
import { firestore } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState<string>('Not tested');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    try {
      // Test writing to Firestore
      const testDoc = doc(firestore, 'test', 'connection-test');
      await setDoc(testDoc, {
        message: 'Firebase connection successful!',
        timestamp: new Date(),
      });

      // Test reading from Firestore
      const docSnap = await getDoc(testDoc);
      if (docSnap.exists()) {
        setTestResult('✅ Firebase connection successful!');
        toast({
          title: "✅ Firebase Connected",
          description: "Firestore read/write operations working correctly",
        });
      } else {
        setTestResult('❌ Document not found after write');
      }
    } catch (error) {
      console.error('Firebase test error:', error);
      setTestResult(`❌ Firebase error: ${error}`);
      toast({
        title: "❌ Firebase Error",
        description: "Failed to connect to Firestore",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firebase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          <strong>Status:</strong> {testResult}
        </p>
        <Button 
          onClick={testFirebaseConnection} 
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? 'Testing...' : 'Test Firebase Connection'}
        </Button>
      </CardContent>
    </Card>
  );
}