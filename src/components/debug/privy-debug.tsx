import { usePrivyAuth } from '@/hooks/use-privy-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PrivyDebug() {
  const { 
    authenticated, 
    user, 
    wallets,
    embeddedWallet,
    connectedWallet,
    getEmbeddedWalletAddress,
    getConnectedWalletAddress,
    getPrimaryWalletAddress,
    firebaseUser,
    createWallet,
    linkWallet
  } = usePrivyAuth();

  if (!authenticated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Not authenticated with Privy</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privy Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div>
          <h3 className="font-semibold mb-2">User Info</h3>
          <div className="space-y-1 text-sm">
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Email:</strong> {user?.email || 'None'}</p>
            <p><strong>Display Name:</strong> {user?.displayName}</p>
            <p><strong>Has Wallet:</strong> {user?.hasWallet ? 'Yes' : 'No'}</p>
            <p><strong>Has Embedded Wallet:</strong> {user?.hasEmbeddedWallet ? 'Yes' : 'No'}</p>
            <p><strong>Has Connected Wallet:</strong> {user?.hasConnectedWallet ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Wallet Addresses */}
        <div>
          <h3 className="font-semibold mb-2">Wallet Addresses</h3>
          <div className="space-y-2">
            <div>
              <Badge variant="outline">Primary</Badge>
              <p className="text-sm font-mono mt-1">
                {getPrimaryWalletAddress() || 'None'}
              </p>
            </div>
            
            <div>
              <Badge className="bg-purple-100 text-purple-800">Embedded</Badge>
              <p className="text-sm font-mono mt-1">
                {getEmbeddedWalletAddress() || 'None'}
              </p>
            </div>
            
            <div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
              <p className="text-sm font-mono mt-1">
                {getConnectedWalletAddress() || 'None'}
              </p>
            </div>
          </div>
        </div>

        {/* Raw Wallets Data */}
        <div>
          <h3 className="font-semibold mb-2">Raw Wallets ({wallets.length})</h3>
          {wallets.map((wallet, index) => (
            <div key={index} className="text-sm bg-gray-50 p-2 rounded mb-2">
              <p><strong>Address:</strong> {wallet.address}</p>
              <p><strong>Type:</strong> {wallet.walletClientType}</p>
              <p><strong>Chain:</strong> {wallet.chainId}</p>
            </div>
          ))}
        </div>

        {/* Firebase User */}
        <div>
          <h3 className="font-semibold mb-2">Firebase Sync</h3>
          <p className="text-sm">
            <strong>Synced:</strong> {firebaseUser ? 'Yes' : 'No'}
          </p>
          {firebaseUser && (
            <div className="text-sm mt-2">
              <p><strong>Wallet Address:</strong> {firebaseUser.walletAddress || 'None'}</p>
              <p><strong>Embedded Wallet:</strong> {firebaseUser.embeddedWalletAddress || 'None'}</p>
              <p><strong>Connected Wallet:</strong> {firebaseUser.connectedWalletAddress || 'None'}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <h3 className="font-semibold">Actions</h3>
          <div className="flex gap-2">
            {!user?.hasEmbeddedWallet && (
              <Button onClick={createWallet} size="sm">
                Create Embedded Wallet
              </Button>
            )}
            {!user?.hasConnectedWallet && (
              <Button onClick={linkWallet} size="sm" variant="outline">
                Connect External Wallet
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}