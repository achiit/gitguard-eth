import { Bell, Menu, X, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser } from "@/types";
import { useLocation } from "wouter";
import { usePrivyAuth } from "@/hooks/use-privy-auth";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: AuthUser | null;
}

export default function Header({ sidebarOpen, setSidebarOpen, user }: HeaderProps) {
  const { user: privyUser, logout: privyLogout } = usePrivyAuth();
  
  // Use Privy user if Firebase user is not available
  const displayUser = user || (privyUser ? {
    uid: privyUser.id,
    email: privyUser.email || '',
    displayName: privyUser.displayName || 'Anonymous User',
    photoURL: privyUser.photoURL,
    hasProfile: true
  } : null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const handleLogout = async () => {
    try {
      // If we have a Privy user, logout from Privy
      if (privyUser) {
        await privyLogout();
      }
      
      // Also logout from Firebase if user exists
      if (user) {
        const { error } = await logOut();
        if (error) {
          throw error;
        }
      }
      
      toast({
        title: "Signed out successfully",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "Failed to sign out"
      });
    }
  };
  
  return (
    <header className="bg-white sticky top-0 z-30 mx-2 my-2 rounded-2xl shadow-[0_0_10px_0_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Logo and title */}
        <div className="flex items-center space-x-2">
					<button
						type="button"
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className="text-gray-500 hover:text-gray-700 lg:hidden focus:outline-none"
					>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <img src="/logoblack.svg" alt="ContractPro" className="h-auto w-24" />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* <Button variant="ghost" size="icon" className="bg-[#ff6d00] rounded-full hover:bg-[#ff6d00]/90">
            <Bell className="h-5 w-5 text-white" />
          </Button> */}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative flex items-center space-x-2 h-8 w-8 rounded-full">
                {displayUser?.photoURL ? (
                  <img 
                    src={displayUser.photoURL} 
                    alt={displayUser.displayName || "User"} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                    {displayUser?.displayName?.charAt(0) || displayUser?.email?.charAt(0) || 'U'}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {displayUser?.displayName && (
                    <p className="font-medium">{displayUser.displayName}</p>
                  )}
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {displayUser?.email || 'No email'}
                  </p>
                </div>
              </div>
              
              <DropdownMenuItem asChild>
                <a href="/profile" className="flex w-full cursor-pointer items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </a>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <a href="/settings" className="flex w-full cursor-pointer items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </a>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="flex w-full cursor-pointer items-center"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
