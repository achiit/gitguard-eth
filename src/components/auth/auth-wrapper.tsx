import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
  redirectTo?: string;
}

export const AuthWrapper = ({ 
  children, 
  requireAuth = false, 
  requireProfile = false,
  redirectTo = "/login" 
}: AuthWrapperProps) => {
  const { user, isLoading, hasProfile } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // If authentication is required but user is not logged in
      if (requireAuth && !user) {
        navigate(redirectTo);
        return;
      }

      // If user is logged in but profile is required and they don't have one
      if (user && requireProfile && !hasProfile && location !== "/register") {
        navigate("/register");
        return;
      }

      // If user is logged in and has profile but is on login/register pages
      if (user && hasProfile && (location === "/login" || location === "/register")) {
        navigate("/dashboard");
        return;
      }

      // If user is logged in but doesn't have profile and is on login page
      if (user && !hasProfile && location === "/login") {
        navigate("/register");
        return;
      }
    }
  }, [user, isLoading, hasProfile, location, navigate, requireAuth, requireProfile, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FFCC66] mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If profile is required but user doesn't have one, don't render children
  if (requireProfile && user && !hasProfile && location !== "/register") {
    return null;
  }

  return <>{children}</>;
};