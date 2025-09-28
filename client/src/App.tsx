import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/hooks/use-toast";
import { PrivyProvider } from '@privy-io/react-auth';
// import { privyConfig } from '@/lib/privy-config';
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Contracts from "@/pages/contracts";
import CreateContract from "@/pages/create-contract";
import ContractView from "@/pages/contract-view";
import ClientView from "@/pages/client-view";
import Clients from "@/pages/clients";
import Settings from "@/pages/settings";
import Home from "@/pages/home";
import Web3Login from "@/pages/web3-login";
import Profile from "@/pages/profile";
import PrivyTest from "@/pages/privy-test";
import Invoices from "@/pages/invoices";
import PaymentView from "@/pages/payment-view";
import Faucet from "@/pages/faucet";
import { AuthProvider } from "@/contexts/auth-context";
import { AppProvider } from "@/contexts/app-context";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
// import { AuthDebug } from "@/components/debug/auth-debug";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/c/:accessToken" component={ClientView} />
      <Route path="/pay/:payLinkToken" component={PaymentView} />

      {/* Auth routes - redirect if already authenticated */}
      <Route path="/login">
        <AuthWrapper>
          <Login />
        </AuthWrapper>
      </Route>
      <Route path="/login/web3">
        <AuthWrapper>
          <Web3Login />
        </AuthWrapper>
      </Route>

      {/* Registration route - requires auth but not profile */}
      <Route path="/register">
        <AuthWrapper requireAuth={true}>
          <Register />
        </AuthWrapper>
      </Route>

      {/* Protected routes - require auth and profile */}
      <Route path="/dashboard">
        <AuthWrapper requireAuth={true} requireProfile={true}>
          <Dashboard />
        </AuthWrapper>
      </Route>
      <Route path="/contracts">
        <AuthWrapper requireAuth={true} requireProfile={true}>
          <Contracts />
        </AuthWrapper>
      </Route>
      <Route path="/contracts/create">
        <AuthWrapper requireAuth={true} requireProfile={true}>
          <CreateContract />
        </AuthWrapper>
      </Route>
      <Route path="/contracts/:contractId">
        <AuthWrapper requireAuth={true} requireProfile={true}>
          <ContractView />
        </AuthWrapper>
      </Route>
      <Route path="/clients">
        <AuthWrapper requireAuth={true} requireProfile={true}>
          <Clients />
        </AuthWrapper>
      </Route>
      <Route path="/profile">
        <AuthWrapper requireAuth={true} requireProfile={true}>
          <Profile />
        </AuthWrapper>
      </Route>
      <Route path="/invoices">
        <AuthWrapper requireAuth={true} requireProfile={true}>
          <Invoices />
        </AuthWrapper>
      </Route>
      <Route path="/faucet">
        <AuthWrapper requireAuth={true} requireProfile={true}>
          <Faucet />
        </AuthWrapper>
      </Route>
      <Route path="/settings">
        <AuthWrapper requireAuth={true} requireProfile={true}>
          <Settings />
        </AuthWrapper>
      </Route>

      {/* Debug/test routes */}
      <Route path="/privy-test" component={PrivyTest} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Debug the app ID
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;
  console.log('Privy App ID:', privyAppId);

  if (!privyAppId) {
    console.error('VITE_PRIVY_APP_ID is not defined in environment variables');
    return <div>Error: Privy App ID not configured</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['email', 'google', 'wallet'],
          appearance: {
            theme: 'light',
            accentColor: '#6366f1',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets', // Automatically create embedded wallet for users without wallets
            requireUserPasswordOnCreate: false, // Don't require password for embedded wallet creation
          },
        }}
      >
        <ToastProvider>
          <AppProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
                {/* <AuthDebug /> */}
              </TooltipProvider>
            </AuthProvider>
          </AppProvider>
        </ToastProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}

export default App;
