import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ContractPreview from "@/components/contract/contract-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Download, 
  Mail, 
  Copy, 
  CheckCircle, 
  Edit, 
  AlertTriangle 
} from "lucide-react";
import { Contract, ContractStatus, User } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { formatDate } from "@/lib/utils";
import { getContractById, updateContract, getUserProfile } from "@/lib/firestore";
import { WalletStatus } from "@/components/wallet/wallet-status";

export default function ContractView() {
  const { contractId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isContractLoading, setIsContractLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Fetch contract details from Firestore
  useEffect(() => {
    const fetchContract = async () => {
      if (!contractId) return;
      
      setIsContractLoading(true);
      try {
        const response = await getContractById(contractId);
        if (response.error) {
          toast({
            title: "Error",
            description: "Failed to load contract. Please try again.",
            variant: "destructive"
          });
        } else {
          setContract(response.data);
          // Prefill client email if contract has it
          if (response.data?.clientInfo?.email) {
            setClientEmail(response.data.clientInfo.email);
          }
        }
      } catch (error) {
        console.error("Error fetching contract:", error);
        toast({
          title: "Error",
          description: "Failed to load contract. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsContractLoading(false);
      }
    };

    fetchContract();
  }, [contractId, toast]);

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      
      setIsProfileLoading(true);
      try {
        const response = await getUserProfile(user.uid);
        if (response.error) {
          toast({
            title: "Error",
            description: "Failed to load your profile. Please try again.",
            variant: "destructive"
          });
        } else {
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.uid, toast]);

  // Update contract mutation
  const updateContractMutation = useMutation({
    mutationFn: async ({ contractId, status }: { contractId: string; status: ContractStatus }) => {
      // Use Firestore update function
      const response = await updateContract(contractId, { status });
      if (!response.success) {
        throw new Error(response.error as string || "Failed to update contract");
      }
      
      // Refresh contract data
      const updatedContractResponse = await getContractById(contractId);
      if (updatedContractResponse.data) {
        setContract(updatedContractResponse.data);
      }
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Contract updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update contract",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  // Send contract to client
  const handleSendContract = async () => {
    if (!contract) return;
    
    // Update contract status to SENT
    await updateContractMutation.mutateAsync({ 
      contractId: contract.contractId, 
      status: ContractStatus.SENT 
    });
    
    // Close dialog
    setSendDialogOpen(false);
    
    // Show success toast
    toast({
      title: "Contract sent successfully",
      description: `The contract has been sent to ${clientEmail || contract.clientInfo.email}`,
    });
  };

  // Copy public link to clipboard
  const copyPublicLink = () => {
    if (!contract?.accessToken) return;
    
    const baseUrl = window.location.origin;
    const publicLink = `${baseUrl}/c/${contract.accessToken}`;
    
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    
    toast({
      title: "Link copied to clipboard",
      description: "You can now share this link with your client",
    });
    
    // Reset copied state after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status?: ContractStatus) => {
    if (!status) return null;
    
    switch (status) {
      case ContractStatus.SIGNED:
        return <Badge className="bg-green-100 text-green-800">Signed</Badge>;
      case ContractStatus.SENT:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case ContractStatus.DRAFT:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case ContractStatus.COMPLETED:
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case ContractStatus.EXPIRED:
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const isLoading = isContractLoading || isProfileLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Contract Details">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) {
    return (
      <DashboardLayout title="Contract Not Found">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Not Found</h3>
          <p className="text-gray-500 mb-4">The contract you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate("/contracts")}>
            Back to Contracts
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={contract.projectDetails.title}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column: Contract details and actions */}
        <div className="lg:w-1/3 space-y-6">
          {/* Status card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Contract Status</h3>
              {getStatusBadge(contract.status as ContractStatus)}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Created on</p>
                <p className="text-sm font-medium">{formatDate(contract.createdAt)}</p>
              </div>
              
              {contract.sentAt && (
                <div>
                  <p className="text-sm text-gray-500">Sent on</p>
                  <p className="text-sm font-medium">{formatDate(contract.sentAt)}</p>
                </div>
              )}
              
              {contract.signedAt && (
                <div>
                  <p className="text-sm text-gray-500">Signed on</p>
                  <p className="text-sm font-medium">{formatDate(contract.signedAt)}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-3">
              {contract.status === ContractStatus.DRAFT && (
                <>
                  {/* Wallet Status Check */}
                  <div className="mb-4">
                    <WalletStatus role="payee" />
                  </div>
                  
                  {!contract.signatures?.freelancer && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                        <p className="text-sm text-yellow-800">
                          You must sign the contract first before sending it to the client. This ensures your wallet address is recorded for payments.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {!contract.signatures?.freelancer ? (
                    <Button 
                      className="w-full"
                      onClick={() => {
                        // Navigate to a signing page or open a signing modal
                        // For now, let's navigate to edit where they can sign
                        navigate(`/contracts/edit/${contract.contractId}`)
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Sign Contract
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => setSendDialogOpen(true)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send to Client
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/contracts/edit/${contract.contractId}`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Contract
                  </Button>
                </>
              )}
              
              {contract.status === ContractStatus.SENT && (
                <>
                  <Button 
                    className="w-full"
                    onClick={copyPublicLink}
                  >
                    {copied ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Copy Signing Link
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSendDialogOpen(true)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Email
                  </Button>
                </>
              )}
              
              {contract.status === ContractStatus.SIGNED && (
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
          
          {/* Client card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-sm font-medium">{contract.clientInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="text-sm font-medium">{contract.clientInfo.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium">{contract.clientInfo.email}</p>
              </div>
              {contract.clientInfo.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{contract.clientInfo.phone}</p>
                </div>
              )}
              {contract.clientInfo.address && (
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium">{contract.clientInfo.address}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Project details card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Contract Type</p>
                <p className="text-sm font-medium">{contract.templateType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Timeline</p>
                <p className="text-sm font-medium">
                  {formatDate(contract.projectDetails.startDate)} to {formatDate(contract.projectDetails.endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <p className="text-sm font-medium">
                  {contract.paymentTerms.amount} {contract.paymentTerms.currency}
                  {contract.paymentTerms.type === 'hourly' && ' / hour'}
                </p>
              </div>
              {contract.paymentTerms.schedule && (
                <div>
                  <p className="text-sm text-gray-500">Payment Schedule</p>
                  <p className="text-sm font-medium">{contract.paymentTerms.schedule}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column: Contract preview */}
        <div className="lg:w-2/3">
          <ContractPreview 
            contract={contract}
            userProfile={userProfile}
          />
        </div>
      </div>
      
      {/* Send Contract Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Contract to Client</DialogTitle>
            <DialogDescription>
              The client will receive a link to view and sign the contract.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="clientEmail" className="text-sm font-medium">
                Client Email
              </label>
              <Input
                id="clientEmail"
                placeholder={contract.clientInfo.email}
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Leave blank to use the email from client details: {contract.clientInfo.email}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendContract}>
              Send Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
