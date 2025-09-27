// import { useAuth } from "@/contexts/auth-context";
// import { usePrivy } from '@privy-io/react-auth';

// export const AuthDebug = () => {
//   const { user, isLoading, hasProfile } = useAuth();
//   const { ready, authenticated, user: privyUser } = usePrivy();

//   if (process.env.NODE_ENV !== 'development') {
//     return null;
//   }

//   return (
//     <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
//       <h3 className="font-bold mb-2">Auth Debug</h3>
//       <div className="space-y-1">
//         <div>Privy Ready: {ready ? '✅' : '❌'}</div>
//         <div>Privy Authenticated: {authenticated ? '✅' : '❌'}</div>
//         <div>Privy User ID: {privyUser?.id || 'None'}</div>
//         <div>Auth Loading: {isLoading ? '⏳' : '✅'}</div>
//         <div>Auth User ID: {user?.uid || 'None'}</div>
//         <div>Has Profile: {hasProfile ? '✅' : '❌'}</div>
//         <div>Email: {user?.email || 'None'}</div>
//         <div>Display Name: {user?.displayName || 'None'}</div>
//       </div>
//     </div>
//   );
// };