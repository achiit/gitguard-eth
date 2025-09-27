import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonLoader, OverlayLoader } from "@/components/ui/loader";
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  X, 
  UserPlus,
  Edit3
} from "lucide-react";
import { createClient, updateClient } from "@/lib/firestore";
import type { Client } from "@/types";

// Enhanced client form schema with better validation
const clientFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-\(\)]/g, "")),
      "Please enter a valid phone number"
    ),
  address: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= 500, "Address must be less than 500 characters"),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess?: (client: Client) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  const isEditing = !!client;
  const { formState: { errors, isValid, isDirty } } = form;

  // Reset form when modal opens/closes or client changes
  useEffect(() => {
    if (isOpen) {
      if (client) {
        form.reset({
          name: client.name,
          companyName: client.companyName,
          email: client.email,
          phone: client.phone || "",
          address: client.address || "",
        });
      } else {
        form.reset({
          name: "",
          companyName: "",
          email: "",
          phone: "",
          address: "",
        });
      }
    }
  }, [isOpen, client, form]);

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      if (!user?.uid) throw new Error("User not authenticated");
      return createClient({ ...data, userId: user.uid });
    },
    onSuccess: (response) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['clients', user?.uid] });
        toast({
          title: "✅ Success",
          description: `Client "${response.data.name}" has been created successfully`,
        });
        onSuccess?.(response.data);
        handleClose();
      } else {
        throw new Error(String(response.error) || "Failed to create client");
      }
    },
    onError: (error) => {
      console.error("Create client error:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to create client. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      if (!client?.clientId) throw new Error("Client ID not found");
      return updateClient(client.clientId, { ...data, userId: user?.uid });
    },
    onSuccess: (response) => {
      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['clients', user?.uid] });
        toast({
          title: "✅ Success",
          description: `Client "${response.data.name}" has been updated successfully`,
        });
        onSuccess?.(response.data);
        handleClose();
      } else {
        throw new Error(String(response.error) || "Failed to update client");
      }
    },
    onError: (error) => {
      console.error("Update client error:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  const onSubmit = async (data: ClientFormValues) => {
    if (!user?.uid) {
      toast({
        title: "❌ Authentication Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateClientMutation.mutateAsync(data);
      } else {
        await createClientMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = createClientMutation.isPending || updateClientMutation.isPending || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Loading Overlay */}
        {isLoading && (
          <OverlayLoader text={isEditing ? "Updating client..." : "Creating client..."} />
        )}
        
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl">
            {isEditing ? (
              <>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                </div>
                Edit Client
              </>
            ) : (
              <>
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserPlus className="h-5 w-5 text-green-600" />
                </div>
                Add New Client
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEditing 
              ? "Update the client information below. All changes will be saved automatically." 
              : "Fill in the client details to add them to your contact list. Required fields are marked with an asterisk (*)."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <User className="h-4 w-4 text-gray-500" />
                      Full Name *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., John Doe" 
                        {...field}
                        disabled={isLoading}
                        className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Company Name Field */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Building className="h-4 w-4 text-gray-500" />
                      Company Name *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Acme Corporation" 
                        {...field}
                        disabled={isLoading}
                        className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., john@acme.com" 
                        type="email"
                        {...field}
                        disabled={isLoading}
                        className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <Phone className="h-4 w-4 text-gray-500" />
                      Phone Number
                      <span className="text-xs text-gray-400 font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., +1 (555) 123-4567" 
                        {...field}
                        disabled={isLoading}
                        className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Address Field */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      Address
                      <span className="text-xs text-gray-400 font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 123 Main St, City, State, ZIP" 
                        {...field}
                        disabled={isLoading}
                        className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-gray-200"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="h-11 px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isValid || (!isDirty && !isEditing)}
                className="h-11 px-6 min-w-[140px]"
                variant={isEditing ? "default" : "success"}
              >
                {isLoading ? (
                  <ButtonLoader variant="white" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Update Client" : "Create Client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientModal; 