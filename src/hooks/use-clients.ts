import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { 
  getClientsByUserId, 
  createClient, 
  updateClient, 
  deleteClient,
  type Client 
} from "@/lib/firestore";

export const useClients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch clients query
  const {
    data: clients = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clients', user?.uid],
    queryFn: async () => {
      if (!user?.uid) throw new Error("User not authenticated");
      const response = await getClientsByUserId(user.uid);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: Omit<Client, 'clientId' | 'createdAt'>) => {
      if (!user?.uid) throw new Error("User not authenticated");
      return createClient({ ...clientData, userId: user.uid });
    },
    onSuccess: (response) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['clients', user?.uid] });
        toast({
          title: "Success",
          description: "Client created successfully",
        });
      } else {
        throw new Error(response.error || "Failed to create client");
      }
    },
    onError: (error) => {
      console.error("Create client error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create client. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ clientId, data }: { clientId: string; data: Partial<Client> }) => {
      return updateClient(clientId, data);
    },
    onSuccess: (response) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['clients', user?.uid] });
        toast({
          title: "Success",
          description: "Client updated successfully",
        });
      } else {
        throw new Error(response.error || "Failed to update client");
      }
    },
    onError: (error) => {
      console.error("Update client error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      return deleteClient(clientId);
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['clients', user?.uid] });
        toast({
          title: "Success",
          description: "Client deleted successfully",
        });
      } else {
        throw new Error(response.error || "Failed to delete client");
      }
    },
    onError: (error) => {
      console.error("Delete client error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Search clients
  const [searchTerm, setSearchTerm] = useState("");
  const filteredClients = clients.filter((client) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(term) ||
      client.companyName.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
  });

  return {
    // Data
    clients: filteredClients,
    allClients: clients,
    isLoading,
    error,
    
    // Search
    searchTerm,
    setSearchTerm,
    
    // Mutations
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    
    // Loading states
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
    
    // Utils
    refetch,
  };
}; 