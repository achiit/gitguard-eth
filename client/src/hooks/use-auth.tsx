import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

// Hook to require authentication for a route
export const useRequireAuth = (redirectTo = "/login") => {
  const { user, isLoading, hasProfile } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate(redirectTo);
      } else if (!hasProfile && location !== "/register") {
        // If user is logged in but doesn't have a profile, redirect to registration page
        navigate("/register");
      }
    }
  }, [user, isLoading, hasProfile, navigate, redirectTo, location]);

  return { user, isLoading };
};

// Hook to redirect if already authenticated
export const useRedirectIfAuthenticated = (redirectTo = "/dashboard") => {
  const { user, isLoading, hasProfile } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      if (hasProfile) {
        // If user is logged in and has a profile, redirect to dashboard
        navigate(redirectTo);
      } else {
        // If user is logged in but doesn't have a profile, redirect to registration page
        navigate("/register");
      }
    }
  }, [user, isLoading, hasProfile, navigate, redirectTo]);

  return { user, isLoading };
};

// Hook that provides authentication state but doesn't redirect
// Useful for public pages that can have enhanced functionality when logged in
export const useOptionalAuth = () => {
  const { user, isLoading, hasProfile } = useAuth();
  return { user, isLoading, hasProfile };
};
