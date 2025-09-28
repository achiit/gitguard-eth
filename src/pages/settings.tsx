import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, Save, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getUserProfile, updateUserProfile } from "@/lib/firestore";
import { uploadLogo } from "@/lib/mock-imagekit";
import { logOut } from "@/lib/firebase";
import { useLocation } from "wouter";

// Profile form schema
const profileFormSchema = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Settings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Setup form with React Hook Form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      organizationName: "",
      description: "",
      phone: "",
      address: "",
    },
  });

  // Load user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        const response = await getUserProfile(user.uid);
        if (response.data) {
          // Populate form with user data
          form.reset({
            organizationName: response.data.organizationName || "",
            description: response.data.description || "",
            phone: response.data.phone || "",
            address: response.data.address || "",
          });
          setCurrentLogoUrl(response.data.logoUrl || null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.uid, form, toast]);

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file",
        description: "Please upload a JPEG or PNG image.",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!logoFile || !user?.uid) return;
    
    setIsUploadingLogo(true);
    try {
      console.log("Uploading logo to ImageKit...");
      const response = await uploadLogo(user.uid, logoFile);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.url) {
        console.log("Logo uploaded successfully:", response.url);
        
        // Update user profile with new logo URL
        const updateResponse = await updateUserProfile(user.uid, {
          logoUrl: response.url
        });
        
        if (updateResponse.success) {
          setCurrentLogoUrl(response.url);
          toast({
            title: "Success",
            description: "Logo uploaded successfully",
          });
        } else {
          throw new Error("Failed to update profile with new logo");
        }
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingLogo(false);
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  // Handle profile form submission
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.uid) return;
    
    setIsSubmitting(true);
    try {
      const response = await updateUserProfile(user.uid, {
        ...data,
        email: user.email || "",
      });
      
      if (response.success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully."
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <DashboardLayout title="Settings" description="Manage your account settings">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings" description="Manage your account settings">
      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Update your business information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Business Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A brief description of your business..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Logo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
            <CardDescription>
              Upload or update your company logo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="h-32 w-32 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="h-full w-full object-contain" 
                    />
                  ) : currentLogoUrl ? (
                    <img 
                      src={currentLogoUrl} 
                      alt="Company logo" 
                      className="h-full w-full object-contain" 
                    />
                  ) : (
                    <div className="text-gray-400 text-xs text-center p-2">
                      No logo uploaded
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select Image
                    </Button>
                    
                    {logoFile && (
                      <Button 
                        type="button"
                        onClick={handleLogoUpload}
                        disabled={isUploadingLogo}
                      >
                        {isUploadingLogo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload
                      </Button>
                    )}
                    
                    {currentLogoUrl && !logoFile && (
                      <Button 
                        type="button"
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Are you sure you want to remove your logo?")) {
                            updateUserProfile(user!.uid, { logoUrl: null })
                              .then(response => {
                                if (response.success) {
                                  setCurrentLogoUrl(null);
                                  toast({
                                    title: "Logo removed",
                                    description: "Your logo has been removed successfully."
                                  });
                                }
                              })
                              .catch(error => {
                                console.error("Error removing logo:", error);
                                toast({
                                  title: "Error",
                                  description: "Failed to remove logo. Please try again.",
                                  variant: "destructive"
                                });
                              });
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  
                  <p className="text-sm text-gray-500">
                    Recommended: 512x512px. JPG or PNG. Max 5MB.
                  </p>
                  
                  {logoFile && (
                    <p className="text-sm text-blue-600 mt-1">
                      Selected: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-1">Email Address</h3>
                <p className="text-gray-700">{user?.email}</p>
              </div>
              
              <Separator />
              
              <div className="pt-2">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}