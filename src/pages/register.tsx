import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { updateUserProfile } from "@/lib/firestore";
import { uploadLogo } from "@/lib/mock-imagekit";
import { Loader2, Upload, ChevronRight, FileCheck, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Form validation schema
const formSchema = z.object({
  organizationName: z.string().min(1, { message: "Organization name is required" }),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Animated logo for the left panel
const ContractDocumentSVG = () => (
  <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
    <g className="animate-float">
      <rect x="70" y="40" width="140" height="180" rx="8" fill="url(#docGradient)" />
      <path d="M90 80H190" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M90 100H170" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M90 120H190" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M90 140H150" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M90 160H190" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M90 180H170" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <rect x="160" y="190" width="60" height="20" rx="4" fill="#FFB88C" className="animate-pulse" />
    </g>
    <g className="animate-float-delayed">
      <rect x="100" y="70" width="140" height="180" rx="8" fill="url(#docGradient2)" />
      <path d="M120 110H220" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M120 130H200" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M120 150H220" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M120 170H180" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M120 190H220" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M120 210H200" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="200" cy="100" r="15" fill="#FFCC66" className="animate-ping-slow opacity-70" />
    </g>
    <defs>
      <linearGradient id="docGradient" x1="70" y1="40" x2="210" y2="220" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF9F5A" />
        <stop offset="1" stopColor="#FF7A45" />
      </linearGradient>
      <linearGradient id="docGradient2" x1="100" y1="70" x2="240" y2="250" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFB266" />
        <stop offset="1" stopColor="#FFCC66" />
      </linearGradient>
    </defs>
  </svg>
);

// Circular checkmark animation for benefits
const BenefitCheck = () => (
  <div className="bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66] p-2 rounded-full">
    <Check className="w-5 h-5 text-black" />
  </div>
);

export default function Register() {
  const { user, isLoading: authLoading, setHasProfile } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Set up form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationName: "",
      description: "",
      phone: "",
      address: "",
    },
  });

  // Check if user is authenticated
  useRequireAuth();

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#FFCC66]" />
      </div>
    );
  }

  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!logoFile) {
      toast({
        variant: "destructive",
        title: "Logo is required",
        description: "Please upload your organization logo",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload logo to ImageKit
      const { url: logoUrl, error: uploadError } = await uploadLogo(user.uid, logoFile);
      
      if (uploadError || !logoUrl) {
        throw new Error(uploadError?.message || "Failed to upload logo");
      }

      // Update user profile in Firestore (user already exists from Privy sync)
      const userData = {
        organizationName: data.organizationName,
        logoUrl,
        description: data.description || null,
        phone: data.phone || null,
        address: data.address || null,
      };

      const { success, error } = await updateUserProfile(user.uid, userData);
      
      if (!success) {
        throw new Error(error as string || "Failed to update user profile");
      }

      // Update auth context
      setHasProfile(true);
      
      toast({
        title: "Profile created successfully",
        description: "You can now start creating contracts",
      });

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error in profile creation:", error);
      toast({
        variant: "destructive",
        title: "Error creating profile",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Center glow effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[1200px] h-[30vh] bg-gradient-to-r from-[#FF9F5A]/30 via-[#FFCC66]/40 to-[#FF9F5A]/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] max-w-[800px] h-[15vh] bg-gradient-to-r from-[#FF9F5A]/20 via-[#FFCC66]/30 to-[#FF9F5A]/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="min-h-screen flex bg-black text-white font-sans relative z-10">
        {/* Left Panel - Illustration / Benefits */}
        <div className="hidden md:flex md:w-1/2 lg:w-2/5 flex-col justify-center items-center p-8 relative">
          <div className="mb-12">
            <ContractDocumentSVG />
          </div>

          <div className="space-y-6 max-w-md">
            <div className="flex items-start space-x-4">
              <BenefitCheck />
              <div>
                <h3 className="text-white font-medium text-lg">Streamlined Contract Creation</h3>
                <p className="text-gray-400">Create professional contracts with just a few clicks</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <BenefitCheck />
              <div>
                <h3 className="text-white font-medium text-lg">Professional Branding</h3>
                <p className="text-gray-400">Add your logo and business details to all documents</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <BenefitCheck />
              <div>
                <h3 className="text-white font-medium text-lg">Secure Document Storage</h3>
                <p className="text-gray-400">All your contracts are safely stored and accessible anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 relative overflow-auto">
          <div className="w-full max-w-md">
            <div className="flex items-center mb-10">
              <div className="h-12 w-12 bg-gradient-to-br from-[#FF9F5A] to-[#FFCC66] rounded-md flex items-center justify-center mr-3">
                <FileCheck className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">GitGuard</h1>
            </div>

            <h2 className="text-3xl font-bold mb-3 text-white">Complete Your Profile</h2>
            <p className="text-gray-400 mb-8">
              Let's set up your organization profile to get started with GitGuard.
            </p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Logo Upload Section */}
              <div className="p-6 border border-gray-800 bg-black/30 rounded-xl mb-6">
                <h3 className="text-xl font-bold mb-4 text-white">Upload Logo</h3>
                <div className="flex items-center space-x-6">
                  <div className="h-20 w-20 border-2 border-gray-700 rounded-lg overflow-hidden flex items-center justify-center bg-gray-900">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("logo")?.click()}
                      className="bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66] text-black font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Upload Logo
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a square logo, at least 200x200px.
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization Name */}
              <div className="space-y-2">
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-400">
                  Organization Name<span className="text-[#FF9F5A]">*</span>
                </label>
                <Input
                  {...form.register("organizationName", { required: true })}
                  id="organizationName"
                  placeholder="Your Company or Freelance Business Name"
                  className="bg-gray-900 border-gray-800 text-white placeholder-gray-500 rounded-lg focus:ring-[#FFCC66] focus:border-[#FFCC66]"
                />
                {form.formState.errors.organizationName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.organizationName.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-400">
                  Description (Optional)
                </label>
                <Textarea
                  {...form.register("description")}
                  id="description"
                  placeholder="A brief description of your services"
                  rows={3}
                  className="bg-gray-900 border-gray-800 text-white placeholder-gray-500 rounded-lg focus:ring-[#FFCC66] focus:border-[#FFCC66]"
                />
              </div>

              {/* Two Columns Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-400">
                    Phone Number (Optional)
                  </label>
                  <Input
                    {...form.register("phone")}
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    className="bg-gray-900 border-gray-800 text-white placeholder-gray-500 rounded-lg focus:ring-[#FFCC66] focus:border-[#FFCC66]"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-400">
                    Address (Optional)
                  </label>
                  <Input
                    {...form.register("address")}
                    id="address"
                    placeholder="Your business address"
                    className="bg-gray-900 border-gray-800 text-white placeholder-gray-500 rounded-lg focus:ring-[#FFCC66] focus:border-[#FFCC66]"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                This information will be displayed on your contracts and client-facing materials.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-gradient-to-r from-[#FF9F5A] to-[#FFCC66] text-black font-semibold px-6 py-3 rounded-lg flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <>
                    Complete Setup
                    <ChevronRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
