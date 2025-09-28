import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SignaturePad from "@/components/contract/signature-pad";
import ContractPreview from "@/components/contract/contract-preview";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Contract, ContractStatus, User } from "@/types";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, Download, Loader2, Wallet } from "lucide-react";
import { getPublicContract, getUserProfile, updateContract } from "@/lib/firestore";
import { uploadSignature } from "@/lib/mock-imagekit";
import { useOptionalAuth } from "@/hooks/use-auth";
import { Web3EscrowService } from "@/lib/web3-escrow";
import { PrivyFirebaseSync } from "@/lib/privy-firebase-sync";
import { WalletStatus } from "@/components/wallet/wallet-status";

export default function ClientView() {
  const { accessToken } = useParams();
  const { toast } = useToast();
  const { user } = useOptionalAuth();
  const [signature, setSignature] = useState<string>("");
  const [signingComplete, setSigningComplete] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch contract and freelancer profile
  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) return;
      
      setIsLoading(true);
      try {
        console.log("Fetching contract with access token:", accessToken);
        const contractResponse = await getPublicContract(accessToken);
        
        if (contractResponse.data) {
          setContract(contractResponse.data);
          
          // Fetch freelancer profile if contract is available
          if (contractResponse.data.userId) {
            const profileResponse = await getUserProfile(contractResponse.data.userId);
            if (profileResponse.data) {
              setFreelancerProfile(profileResponse.data);
            }
          }
        } else {
          console.error("Contract not found:", contractResponse.error);
        }
      } catch (error) {
        console.error("Error fetching contract data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [accessToken]);

  // Sign contract mutation
  const signContractMutation = useMutation({
    mutationFn: async (signatureData: string) => {
      if (!accessToken || !contract) throw new Error("No access token or contract provided");
      
      console.log("Preparing to sign contract with access token:", accessToken);
      
      // STEP 1: Client must connect wallet first
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Web3 wallet to sign this contract");
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error("Please connect your wallet to sign this contract");
      }

      const clientWalletAddress = accounts[0] as `0x${string}`;
      console.log("Client wallet connected:", clientWalletAddress);
      
      // STEP 2: Upload signature to ImageKit
      console.log("Uploading signature to ImageKit...");
      const { url, error: uploadError } = await uploadSignature(contract.userId, signatureData);
      
      if (uploadError || !url) {
        throw new Error(uploadError?.message || "Failed to upload signature");
      }
      
      console.log("Signature uploaded successfully:", url);
      
      // STEP 3: Update contract with signature URL and change status to SIGNED
      const signatures = contract.signatures || {};
      const clientSignature = {
        signature: url,
        date: new Date().toISOString(),
        walletAddress: clientWalletAddress // Store client wallet address
      };
      
      const updateData = {
        signatures: { ...signatures, client: clientSignature },
        status: ContractStatus.SIGNED,
        signedAt: new Date(),
        clientWalletAddress // Store client wallet at contract level too
      };
      
      console.log("Updating contract with signature:", updateData);
      const updateResponse = await updateContract(contract.contractId, updateData);
      
      if (!updateResponse.success) {
        throw new Error(updateResponse.error as string || "Failed to update contract");
      }
      
      console.log("Contract signed successfully");
      
      // STEP 4: Create invoice after successful contract signing
      if (contract?.paymentTerms && contract.userId) {
        try {
          console.log("Creating invoice for signed contract...");
          
          // Get freelancer profile to get wallet address
          const freelancerProfile = await getUserProfile(contract.userId);
          console.log('Freelancer profile data:', freelancerProfile.data);
          
          // Get freelancer wallet address
          let freelancerWalletAddress = freelancerProfile.data?.embeddedWalletAddress || 
                                       freelancerProfile.data?.walletAddress;
          
          if (!freelancerWalletAddress) {
            console.error('Freelancer wallet not found. Profile data:', {
              embeddedWalletAddress: freelancerProfile.data?.embeddedWalletAddress,
              walletAddress: freelancerProfile.data?.walletAddress,
              connectedWalletAddress: freelancerProfile.data?.connectedWalletAddress,
              linkedAccounts: freelancerProfile.data?.linkedAccounts
            });
            
            throw new Error("The freelancer hasn't created their payment wallet yet. Please ask them to:\n1. Log into their account\n2. Go to their contract\n3. Click 'Create Wallet' in the wallet status section\n4. Then you can sign this contract to create the invoice.");
          }
          
          console.log('Freelancer wallet address:', freelancerWalletAddress);
          console.log('Client wallet address:', clientWalletAddress);
          
          // Check if addresses are the same (case-insensitive)
          if (freelancerWalletAddress.toLowerCase() === clientWalletAddress.toLowerCase()) {
            console.warn('⚠️ WARNING: Freelancer and client are using the same wallet address!');
            console.warn('This is likely because you are testing with the same MetaMask account.');
            console.warn('For production use, freelancer and client should have different wallet addresses.');
            
            // Still create the invoice but show a warning
            toast({
              title: "Same Wallet Detected",
              description: "Freelancer and client are using the same wallet. This is fine for testing but should be different in production.",
              variant: "default"
            });
          }
          
          // Add Web3 payment configuration to contract
          const web3Config = Web3EscrowService.getPaymentConfig(
            contract.paymentTerms.currency, 
            freelancerWalletAddress
          );
          
          // Update contract with Web3 payment terms including both wallet addresses
          const updatedContract = {
            ...contract,
            paymentTerms: {
              ...contract.paymentTerms,
              tokenAddress: web3Config.tokenAddress,
              decimals: web3Config.decimals,
              chainId: web3Config.chainId,
              payeeWallet: freelancerWalletAddress,
              payerWallet: clientWalletAddress // Add client wallet
            },
            clientWalletAddress,
            freelancerWalletAddress
          };
          
          // Create invoice with both wallet addresses
          const invoiceId = await Web3EscrowService.createInvoiceFromContract(updatedContract);
          console.log('Invoice created successfully with both wallet addresses:', invoiceId);
          
        } catch (error) {
          console.error('Failed to create invoice after contract signing:', error);
          // Don't fail the contract signing, but show a warning
          toast({
            title: "Contract signed successfully",
            description: "However, invoice creation failed. Please contact the freelancer to create the invoice manually.",
            variant: "default"
          });
        }
      }
      
      return { success: true };
    },
    onSuccess: () => {
      setSigningComplete(true);
      toast({
        title: "Contract signed successfully",
        description: "Thank you for signing the contract! An invoice has been created for payment.",
      });
    },
    onError: (error) => {
      console.error("Error in signContractMutation:", error);
      toast({
        variant: "destructive",
        title: "Failed to sign contract",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  // Handle signature submission
  const handleSignContract = async () => {
    if (!signature) {
      toast({
        variant: "destructive",
        title: "Signature required",
        description: "Please provide your signature to sign the contract",
      });
      return;
    }

    try {
      console.log("Submitting signature for contract signing...");
      await signContractMutation.mutateAsync(signature);
      console.log("Contract signed successfully");
    } catch (error) {
      console.error("Error signing contract:", error);
      toast({
        variant: "destructive",
        title: "Failed to sign contract",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  };

  // Handle signature capture
  const handleSignatureCapture = (signatureData: string) => {
    setSignature(signatureData);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading contract...</p>
        </div>
      </div>
    );
  }

  // Show error if contract not found
  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-center">Contract Not Found</CardTitle>
            <CardDescription className="text-center">
              This contract link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show completion state if contract is already signed
  if (contract.status === ContractStatus.SIGNED || signingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-center">Contract Signed Successfully</CardTitle>
              <CardDescription className="text-center">
                Thank you for signing the contract. Both parties will receive a confirmation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4">
                <Badge className="bg-green-100 text-green-800">Signed</Badge>
                <p className="text-sm text-gray-600">
                  Signed by {contract.clientInfo.name} on {formatDate(new Date())}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-4">
              <Button className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Download Contract PDF
              </Button>
              
              {!user && (
                <div className="mt-6 text-center border-t border-gray-200 pt-6 w-full">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your Own Contracts</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Need to create professional contracts for your freelance business? 
                    Sign up today and start managing your client agreements in one place.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => window.location.href = "/login"}>
                      Sign In
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = "/register"}>
                      Create Account
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <ContractPreview 
              contract={contract}
              userProfile={freelancerProfile}
              readOnly
            />
          </div>
        </div>
      </div>
    );
  }

  // Show pending contract to sign
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Contract from {freelancerProfile?.organizationName || "Freelancer"}
          </h1>
          <p className="mt-2 text-gray-600">
            Please review the contract and sign at the bottom
          </p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{contract.projectDetails.title}</CardTitle>
                <CardDescription>
                  From {freelancerProfile?.organizationName || "Freelancer"} to {contract.clientInfo.name} at {contract.clientInfo.companyName}
                </CardDescription>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                Awaiting Signature
              </Badge>
            </div>
          </CardHeader>
        </Card>
        
        {/* Contract Preview */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <ContractPreview 
            contract={contract}
            userProfile={freelancerProfile}
            readOnly
          />
        </div>
        
        {/* Wallet Connection Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Your Wallet
            </CardTitle>
            <CardDescription>
              You need to connect your wallet to sign this contract and make payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletStatus role="payer" showDetails={true} />
          </CardContent>
        </Card>

        {/* Signature Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Contract</CardTitle>
            <CardDescription>
              By signing this contract, you agree to all the terms and conditions outlined above.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Your Information</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-500">Name</span>
                    <span className="font-medium">{contract.clientInfo.name}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Company</span>
                    <span className="font-medium">{contract.clientInfo.companyName}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Email</span>
                    <span className="font-medium">{contract.clientInfo.email}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">Date</span>
                    <span className="font-medium">{formatDate(new Date())}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Your Signature</p>
                <SignaturePad onSignatureCapture={handleSignatureCapture} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button 
              onClick={handleSignContract}
              disabled={!signature || signContractMutation.isPending || !window.ethereum}
            >
              {signContractMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : !window.ethereum ? (
                "Install Web3 Wallet"
              ) : (
                "Sign Contract"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
