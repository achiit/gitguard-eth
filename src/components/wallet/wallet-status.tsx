import { useWallets, usePrivy } from '@privy-io/react-auth';
import { useWalletAddresses, validateWalletSetup } from '@/lib/wallet-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface WalletStatusProps {
  role?: 'payee' | 'payer';
  showDetails?: boolean;
}

export function WalletStatus({ role, showDetails = false }: WalletStatusProps) {
  const { wallets } = useWallets();
  const { createWallet, connectWallet } = usePrivy();
  const walletAddresses = useWalletAddresses();

  const payeeValidation = validateWalletSetup(wallets, 'payee');
  const payerValidation = validateWalletSetup(wallets, 'payer');

  if (!showDetails && wallets.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Embedded Wallet Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {walletAddresses.hasEmbeddedWallet ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium">Privy Wallet (for receiving payments)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {walletAddresses.hasEmbeddedWallet ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            ) : (
              <Button size="sm" onClick={createWallet}>
                Create Wallet
              </Button>
            )}
          </div>
        </div>

        {walletAddresses.embeddedWallet && showDetails && (
          <div className="text-xs text-gray-500 ml-6">
            {walletAddresses.embeddedWallet.slice(0, 6)}...{walletAddresses.embeddedWallet.slice(-4)}
          </div>
        )}

        {/* Connected Wallet Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {walletAddresses.hasConnectedWallet ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Info className="h-4 w-4 text-blue-500" />
              )}
              <span className="text-sm font-medium">External Wallet (for making payments)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {walletAddresses.hasConnectedWallet ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Connected
              </Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={connectWallet}>
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {walletAddresses.connectedWallet && showDetails && (
          <div className="text-xs text-gray-500 ml-6">
            {walletAddresses.connectedWallet.slice(0, 6)}...{walletAddresses.connectedWallet.slice(-4)}
          </div>
        )}

        {/* Role-specific validation */}
        {role && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2">
              {role === 'payee' ? (
                payeeValidation.isValid ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">Ready to receive payments</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{payeeValidation.error}</span>
                  </>
                )
              ) : (
                payerValidation.isValid ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">Ready to make payments</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{payerValidation.error}</span>
                  </>
                )
              )}
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <div className="font-medium mb-1">How it works:</div>
          <ul className="space-y-1">
            <li>• <strong>Privy Wallet:</strong> Used by freelancers to receive payments securely</li>
            <li>• <strong>External Wallet:</strong> Used by clients to pay invoices (MetaMask, etc.)</li>
            <li>• Both wallet types can be used for payments, but Privy wallets are recommended for receiving</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}