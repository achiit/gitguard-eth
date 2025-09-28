import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, Building, Mail, Phone, MapPin, Plus, Search, Check, ChevronDown, Users } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { getClientsByUserId } from "@/lib/firestore";
import { ContractFormData, Client } from "@/types";
import ClientModal from "@/components/modals/client-modal";
import { cn } from "@/lib/utils";

export default function ClientInfoStep() {
  const form = useFormContext<ContractFormData>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [clientType, setClientType] = useState<"new" | "existing">("new");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);

  // Load existing clients
  useEffect(() => {
    const fetchClients = async () => {
      if (!user?.uid || clientType !== "existing") return;
      
      setIsLoadingClients(true);
      try {
        const response = await getClientsByUserId(user.uid);
        if (response.error) {
          toast({
            title: "Error",
            description: "Failed to load clients. Please try again.",
            variant: "destructive",
          });
        } else {
          setClients(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Failed to load clients. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, [user?.uid, clientType, toast]);

  // Handle client type change
  const handleClientTypeChange = (type: "new" | "existing") => {
    setClientType(type);
    setSelectedClient(null);
    
    if (type === "new") {
      // Clear form when switching to new client
      form.setValue("clientInfo", {
        name: "",
        companyName: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  };

  // Handle existing client selection
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setIsClientSelectorOpen(false);
    
    // Populate form with selected client data
    form.setValue("clientInfo", {
      clientId: client.clientId,
      name: client.name,
      companyName: client.companyName,
      email: client.email,
      phone: client.phone || "",
      address: client.address || "",
    });
  };

  // Handle new client creation success
  const handleNewClientSuccess = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
    handleClientSelect(newClient);
    setClientType("existing");
  };

  return (
    <div className="space-y-6">
      {/* Client Type Selection */}
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Client Selection</h3>
              <p className="text-sm text-muted-foreground">
                Choose an existing client or add a new one
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => setIsClientModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add New Client
            </Button>
          </div>
          
          <RadioGroup 
            value={clientType} 
            onValueChange={handleClientTypeChange}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <FormLabel htmlFor="new" className="font-normal">New Client</FormLabel>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <FormLabel htmlFor="existing" className="font-normal">
                Existing Client
                {clients.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {clients.length} available
                  </Badge>
                )}
              </FormLabel>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Existing Client Selector */}
      {clientType === "existing" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Select Existing Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingClients ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Loading clients...</span>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No clients found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any clients yet. Create your first client to get started.
                </p>
                <Button 
                  onClick={() => setIsClientModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Client
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Popover open={isClientSelectorOpen} onOpenChange={setIsClientSelectorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isClientSelectorOpen}
                      className="w-full justify-between h-12"
                    >
                      {selectedClient ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{selectedClient.name}</div>
                            <div className="text-sm text-muted-foreground">{selectedClient.companyName}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Search className="w-4 h-4" />
                          Search and select a client...
                        </div>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search clients..." />
                      <CommandEmpty>No clients found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          <ScrollArea className="h-64">
                            {clients.map((client) => (
                              <CommandItem
                                key={client.clientId}
                                value={`${client.name} ${client.companyName} ${client.email}`}
                                onSelect={() => handleClientSelect(client)}
                                className="flex items-center gap-3 p-3"
                              >
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{client.name}</div>
                                  <div className="text-sm text-muted-foreground truncate">
                                    {client.companyName}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {client.email}
                                  </div>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedClient?.clientId === client.clientId
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedClient && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-900">Client Selected</h4>
                          <p className="text-sm text-green-800 mt-1">
                            Contract will be created for <strong>{selectedClient.name}</strong> at{" "}
                            <strong>{selectedClient.companyName}</strong>
                          </p>
                          <div className="mt-2 text-xs text-green-700">
                            📧 {selectedClient.email}
                            {selectedClient.phone && (
                              <span className="ml-3">📞 {selectedClient.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client Information Form - Only show for new clients or when no existing client selected */}
      {(clientType === "new" || (clientType === "existing" && !selectedClient)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              {clientType === "new" ? "New Client Information" : "Client Details"}
            </CardTitle>
            {clientType === "existing" && (
              <p className="text-sm text-muted-foreground">
                Please select a client above or the form will be used to create a new client
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientInfo.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Client Name *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., John Doe" 
                        {...field} 
                        className="h-11"
                        disabled={clientType === "existing" && !!selectedClient}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clientInfo.companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      Company Name *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Acme Corporation" 
                        {...field} 
                        className="h-11"
                        disabled={clientType === "existing" && !!selectedClient}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="clientInfo.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="e.g., john@acme.com" 
                      {...field} 
                      className="h-11"
                      disabled={clientType === "existing" && !!selectedClient}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientInfo.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone Number
                      <span className="text-xs text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="e.g., +1 (555) 123-4567" 
                        {...field} 
                        className="h-11"
                        disabled={clientType === "existing" && !!selectedClient}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clientInfo.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Address
                      <span className="text-xs text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., 123 Main St, City, State, ZIP" 
                        {...field} 
                        rows={3}
                        className="resize-none"
                        disabled={clientType === "existing" && !!selectedClient}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Double-check the email address - this is where the contract will be sent</li>
            <li>• Include the full company name as it should appear on the contract</li>
            <li>• Phone number helps with quick communication during the project</li>
            {clientType === "existing" && (
              <li>• You can select from your existing clients or add a new one on the fly</li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={handleNewClientSuccess}
      />
    </div>
  );
}