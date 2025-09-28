import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageLoader } from "@/components/ui/loader";
import { Search, Download, Eye, Edit, Trash } from "lucide-react";
import type { Contract } from "@/types";
import { ContractStatus } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { formatDate } from "@/lib/utils";
import { getContractsByUserId } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Web3EscrowService } from "@/lib/web3-escrow";
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { validateWalletSetup } from "@/lib/wallet-utils";
import { Receipt } from "lucide-react";

export default function Contracts() {
  const { user } = useAuth();
  const { user: privyUser } = usePrivy();
  const { wallets } = useWallets();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatingInvoice, setCreatingInvoice] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch contracts from Firestore
  useEffect(() => {
    const fetchContracts = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        const response = await getContractsByUserId(user.uid);
        if (response.error) {
          toast({
            title: "Error",
            description: "Failed to load contracts. Please try again.",
            variant: "destructive"
          });
        } else {
          setContracts(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching contracts:", error);
        toast({
          title: "Error",
          description: "Failed to load contracts. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [user?.uid, toast]);

  // Filter contracts based on tab and search term
  const getFilteredContracts = () => {
    if (!contracts) return [];

    let filtered = [...contracts];

    // Filter by tab/status
    if (activeTab !== "all") {
      filtered = filtered.filter(contract => contract.status === activeTab);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        contract =>
          (contract.projectDetails as { title: string }).title.toLowerCase().includes(term) ||
          (contract.clientInfo as { name: string }).name.toLowerCase().includes(term) ||
          (contract.clientInfo as { companyName: string }).companyName.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.SIGNED:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Signed</Badge>;
      case ContractStatus.SENT:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case ContractStatus.DRAFT:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
      case ContractStatus.COMPLETED:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case ContractStatus.EXPIRED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  // Manual invoice creation for signed contracts
  const createInvoiceForContract = async (contract: Contract) => {
    if (!privyUser || !wallets) {
      toast({
        title: "Authentication required",
        description: "Please ensure you're logged in with Privy",
        variant: "destructive"
      });
      return;
    }

    setCreatingInvoice(contract.contractId);
    
    try {
      // Validate wallet setup
      const walletValidation = validateWalletSetup(wallets, 'payee');
      
      if (!walletValidation.isValid) {
        throw new Error(walletValidation.error);
      }

      const freelancerWallet = walletValidation.address!;
      
      // Add Web3 payment configuration to contract
      const web3Config = Web3EscrowService.getPaymentConfig(
        contract.paymentTerms.currency, 
        freelancerWallet
      );
      
      // Update contract with Web3 payment terms
      const updatedContract = {
        ...contract,
        paymentTerms: {
          ...contract.paymentTerms,
          tokenAddress: web3Config.tokenAddress,
          decimals: web3Config.decimals,
          chainId: web3Config.chainId,
          payeeWallet: freelancerWallet
        }
      };
      
      // Create invoice
      const invoiceId = await Web3EscrowService.createInvoiceFromContract(updatedContract);
      
      toast({
        title: "Invoice Created",
        description: `Invoice ${invoiceId} created successfully for this contract`,
      });
      
      // Navigate to invoices page
      navigate("/invoices");
      
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast({
        title: "Failed to create invoice",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setCreatingInvoice(null);
    }
  };

  return (
    <DashboardLayout 
      title="Contracts" 
      description="Manage all your contract documents"
    >
      {/* Header with search and new button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="relative mt-4 md:mt-0 mb-4 md:mb-0">
          <Input
            type="text"
            placeholder="Search contracts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        <Button 
          onClick={() => navigate("/contracts/create")}
          className="h-11 px-6"
          variant="success"
        >
          <i className="ri-add-line mr-2" />
          New Contract
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="w-full justify-start rounded-lg bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.1)] p-0 h-auto space-x-8 px-4 py-2">
          <TabsTrigger 
            value="all" 
            className="border-none data-[state=active]:bg-[#ff6d00] data-[state=active]:text-white text-gray-500 hover:text-gray-700 hover:border-gray-300 rounded-md py-2 px-4 text-sm font-medium bg-transparent"
          >
            All Contracts
          </TabsTrigger>
          <TabsTrigger 
            value={ContractStatus.DRAFT} 
            className="border-none data-[state=active]:bg-[#ff6d00] data-[state=active]:text-white text-gray-500 hover:text-gray-700 hover:border-gray-300 rounded-md py-2 px-4 text-sm font-medium bg-transparent"
          >
            Drafts
          </TabsTrigger>
          <TabsTrigger 
            value={ContractStatus.SENT} 
            className="border-none data-[state=active]:bg-[#ff6d00] data-[state=active]:text-white text-gray-500 hover:text-gray-700 hover:border-gray-300 rounded-md py-2 px-4 text-sm font-medium bg-transparent"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger 
            value={ContractStatus.SIGNED} 
            className="border-none data-[state=active]:bg-[#ff6d00] data-[state=active]:text-white text-gray-500 hover:text-gray-700 hover:border-gray-300 rounded-md py-2 px-4 text-sm font-medium bg-transparent"
          >
            Signed
          </TabsTrigger>
          <TabsTrigger 
            value={ContractStatus.EXPIRED} 
            className="border-none data-[state=active]:bg-[#ff6d00] data-[state=active]:text-white text-gray-500 hover:text-gray-700 hover:border-gray-300 rounded-md py-2 px-4 text-sm font-medium bg-transparent"
          >
            Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0" />
        <TabsContent value={ContractStatus.DRAFT} className="mt-0" />
        <TabsContent value={ContractStatus.SENT} className="mt-0" />
        <TabsContent value={ContractStatus.SIGNED} className="mt-0" />
        <TabsContent value={ContractStatus.EXPIRED} className="mt-0" />
      </Tabs>

      {/* Contract cards */}
      {isLoading ? (
        <PageLoader text="Loading your contracts..." />
      ) : !contracts || contracts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-[0_0_10px_0_rgba(0,0,0,0.1)] p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
          <p className="text-gray-500 mb-4">Create your first contract to get started</p>
          <Link href="/contracts/create">
            <Button variant="success" className="h-11 px-6">
              Create Contract
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredContracts().map((contract) => (
            <Card key={contract.contractId} className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="font-medium text-gray-900 truncate max-w-[70%]">{(contract.projectDetails as { title: string }).title}</div>
                {getStatusBadge(contract.status as ContractStatus)}
              </div>
              <CardContent className="px-6 py-4">
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Client</div>
                  <div className="text-sm font-medium">
                    {(contract.clientInfo as { companyName: string }).companyName} - {(contract.clientInfo as { name: string }).name}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Type</div>
                  <div className="text-sm font-medium">{contract.templateType}</div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Created</div>
                  <div className="text-sm font-medium">{formatDate(contract.createdAt)}</div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Value</div>
                  <div className="text-sm font-medium">
                    {(contract.paymentTerms as { amount: number; currency: string; type: string }).amount} {(contract.paymentTerms as { currency: string }).currency}
                    {(contract.paymentTerms as { type: string }).type === 'hourly' && '/hour'}
                  </div>
                </div>
              </CardContent>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                {contract.status === ContractStatus.DRAFT && (
                  <>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                      <Trash className="h-4 w-4 mr-1" />
                      <span className="sr-only sm:not-sr-only sm:text-xs">Delete</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary-600 hover:text-primary-900"
                      onClick={() => navigate(`/contracts/edit/${contract.contractId}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span className="sr-only sm:not-sr-only sm:text-xs">Edit</span>
                    </Button>
                  </>
                )}
                
                {contract.status === ContractStatus.SENT && (
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <i className="ri-mail-send-line mr-1" />
                    <span className="sr-only sm:not-sr-only sm:text-xs">Resend</span>
                  </Button>
                )}
                
                {contract.status === ContractStatus.SIGNED && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => createInvoiceForContract(contract)}
                      disabled={creatingInvoice === contract.contractId}
                    >
                      <Receipt className="h-4 w-4 mr-1" />
                      <span className="sr-only sm:not-sr-only sm:text-xs">
                        {creatingInvoice === contract.contractId ? 'Creating...' : 'Invoice'}
                      </span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      <Download className="h-4 w-4 mr-1" />
                      <span className="sr-only sm:not-sr-only sm:text-xs">Download</span>
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-600 hover:text-primary-900"
                  onClick={() => navigate(`/contracts/${contract.contractId}`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="sr-only sm:not-sr-only sm:text-xs">View</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
