import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PrivyTest() {
  const { login, logout, ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  if (!ready) {
    return <div>Loading Privy...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Privy Authentication Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p><strong>Ready:</strong> {ready ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {authenticated ? 'Yes' : 'No'}</p>
            </div>

            {!authenticated ? (
              <Button onClick={login}>
                Login with Privy
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">User Info:</h3>
                  <p><strong>ID:</strong> {user?.id}</p>
                  <p><strong>Email:</strong> {user?.email?.address || 'None'}</p>
                  <p><strong>Google:</strong> {user?.google?.name || 'Not connected'}</p>
                  <p><strong>Twitter:</strong> {user?.twitter?.name || 'Not connected'}</p>
                </div>

                <div>
                  <h3 className="font-semibold">Wallets ({wallets.length}):</h3>
                  {wallets.map((wallet, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded mb-2">
                      <p><strong>Address:</strong> {wallet.address}</p>
                      <p><strong>Type:</strong> {wallet.walletClientType}</p>
                      <Badge className={wallet.walletClientType === 'privy' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                        {wallet.walletClientType === 'privy' ? 'Embedded' : 'Connected'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Button onClick={logout} variant="outline">
                  Logout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}