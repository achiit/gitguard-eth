// import { useAuth } from "@/contexts/auth-context";
// import { usePrivy, useWallets } from '@privy-io/react-auth';
// import { useWalletAddresses } from '@/lib/wallet-utils';

// export const AuthDebug = () => {
//   const { user, isLoading, hasProfile } = useAuth();
//   const { ready, authenticated, user: privyUser } = usePrivy();
//   const { wallets } = useWallets();
//   const walletAddresses = useWalletAddresses();

//   if (process.env.NODE_ENV !== 'development') {
//     return null;
//   }

//   return (
//     <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50 max-h-96 overflow-y-auto">
//       <h3 className="font-bold mb-2">Auth & Wallet Debug</h3>
//       <div className="space-y-1">
//         <div>Privy Ready: {ready ? '✅' : '❌'}</div>
//         <div>Privy Authenticated: {authenticated ? '✅' : '❌'}</div>
//         <div>Privy User ID: {privyUser?.id || 'None'}</div>
//         <div>Auth Loading: {isLoading ? '⏳' : '✅'}</div>
//         <div>Auth User ID: {user?.uid || 'None'}</div>
//         <div>Has Profile: {hasProfile ? '✅' : '❌'}</div>
//         <div>Email: {user?.email || 'None'}</div>
//         <div>Display Name: {user?.displayName || 'None'}</div>
        
//         <div className="border-t border-gray-600 pt-2 mt-2">
//           <div className="font-bold">Wallets ({wallets.length})</div>
//           {wallets.map((wallet, i) => (
//             <div key={i} className="ml-2 text-xs">
//               <div>Type: {wallet.walletClientType}</div>
//               <div>Address: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</div>
//             </div>
//           ))}
//         </div>
        
//         <div className="border-t border-gray-600 pt-2 mt-2">
//           <div className="font-bold">Wallet Addresses</div>
//           <div>Embedded: {walletAddresses.embeddedWallet ? `${walletAddresses.embeddedWallet.slice(0, 6)}...${walletAddresses.embeddedWallet.slice(-4)}` : 'None'}</div>
//           <div>Connected: {walletAddresses.connectedWallet ? `${walletAddresses.connectedWallet.slice(0, 6)}...${walletAddresses.connectedWallet.slice(-4)}` : 'None'}</div>
//           <div>Primary: {walletAddresses.primaryWallet ? `${walletAddresses.primaryWallet.slice(0, 6)}...${walletAddresses.primaryWallet.slice(-4)}` : 'None'}</div>
//           <div>Payee Address: {walletAddresses.getPayeeAddress() ? `${walletAddresses.getPayeeAddress()!.slice(0, 6)}...${walletAddresses.getPayeeAddress()!.slice(-4)}` : 'None'}</div>
//           <div>Payer Address: {walletAddresses.getPayerAddress() ? `${walletAddresses.getPayerAddress()!.slice(0, 6)}...${walletAddresses.getPayerAddress()!.slice(-4)}` : 'None'}</div>
//         </div>
//       </div>
//     </div>
//   );
// };