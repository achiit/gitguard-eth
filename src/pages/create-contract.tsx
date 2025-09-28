import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { nanoid } from "nanoid";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ContractStepperForm from "@/components/contract/contract-stepper-form";
import ContractPreview from "@/components/contract/contract-preview";
import { ContractFormData, ContractStatus, User } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { usePrivy } from '@privy-io/react-auth';
// Using the mock ImageKit implementation for frontend
import { uploadSignature } from "@/lib/mock-imagekit";
import { createContract } from "@/lib/firestore";
import { getUserProfile } from "@/lib/firestore";
import { Web3EscrowService, PYUSD_CONFIG } from "@/lib/web3-escrow";
import { getPayeeWalletAddress, validateWalletSetup } from "@/lib/wallet-utils";
import { WalletStatus } from "@/components/wallet/wallet-status";

export default function CreateContract() {
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { user: privyUser } = usePrivy();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  // Get the user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      
      setIsProfileLoading(true);
      try {
        const response = await getUserProfile(user.uid);
        if (response.data) {
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user?.uid]);

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (contractData: any) => {
      // Create contract in Firestore
      const response = await createContract({
        ...contractData,
        userId: user?.uid,
      });
      
      if (!response.data) {
        throw new Error(response.error as string || "Failed to create contract");
      }
      
      const contract = response.data;
      
      // Note: Invoice creation happens when the CLIENT signs the contract, not when freelancer creates it
      console.log('Contract created successfully. Invoice will be created when client signs.');
      
      return contract;
    },
    onSuccess: () => {      
      toast({
        title: "Contract created successfully",
      });
      
      // Redirect to contracts page
      navigate("/contracts");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create contract",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  // Handle form submission
  const handleSubmit = async (data: ContractFormData, isDraft = false) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to create contracts",
      });
      return;
    }

    try {
      // If we have a signature, upload it to ImageKit first and wait for the result
      let freelancerSignature = data.signatures?.freelancer;
      let signatureUrl = null;
      
      if (freelancerSignature?.signature) {
        console.log("Uploading signature to ImageKit...");
        const { url, error } = await uploadSignature(user.uid, freelancerSignature.signature);
        
        if (error) {
          throw new Error(`Failed to upload signature: ${error.message}`);
        }
        
        if (url) {
          console.log("Signature uploaded successfully:", url);
          signatureUrl = url;
          freelancerSignature = {
            ...freelancerSignature,
            signature: url
          };
        }
      }

      console.log("Preparing contract data with signature:", signatureUrl);

      // Prepare contract data with proper handling of signature URLs
      const contractData = {
        contractId: nanoid(10),
        userId: user.uid,
        templateType: data.templateType,
        status: isDraft ? ContractStatus.DRAFT : ContractStatus.SENT,
        clientInfo: data.clientInfo,
        projectDetails: data.projectDetails,
        deliverables: data.deliverables,
        paymentTerms: data.paymentTerms,
        legalClauses: data.legalClauses,
        // Store the signature URL from ImageKit in Firestore
        signatures: freelancerSignature ? { freelancer: freelancerSignature } : undefined,
        accessToken: nanoid(16),
        // Add timestamps for proper tracking
        createdAt: new Date(),
        updatedAt: new Date(),
        sentAt: isDraft ? null : new Date(),
        signedAt: null
      };

      // Create the contract
      await createContractMutation.mutateAsync(contractData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create contract",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  };

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <DashboardLayout title="" description="">
      {/* Wallet Status Check */}
      <div className="mb-6">
        <WalletStatus role="payee" />
      </div>
      
      <div className={`${showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'block'}`}>
        <div className="space-y-6">
          <ContractStepperForm
            onSubmit={handleSubmit}
            onPreview={togglePreview}
            showPreview={showPreview}
            isSubmitting={createContractMutation.isPending}
          />
        </div>
        
        {showPreview && (
          <div className="lg:sticky lg:top-6">
            <ContractPreview
              formData={null} // This will be handled by the component
              userProfile={userProfile}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
