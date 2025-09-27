import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { logOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader } from "@/components/ui/loader";
import { User, Settings, LogOut, ChevronUp } from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
}

export default function Sidebar({ sidebarOpen }: SidebarProps) {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewProfile = () => {
    navigate("/settings");
  };

  // Get user initials for avatar fallback
  const getUserInitials = (displayName: string | null, email: string) => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };
  
  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-20 w-64 bg-white rounded-2xl shadow-[0_0_10px_0_rgba(0,0,0,0.1)]
        transform transition-transform duration-300 ease-in-out mx-2 mb-2
        lg:translate-x-0 lg:static lg:inset-auto lg:w-64 pt-16 lg:pt-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="h-full overflow-y-auto scrollbar-hide flex flex-col">
        <nav className="px-4 py-6 space-y-1 flex-1">
          <Link 
            to="/dashboard"
            className={
              `flex items-center w-full px-4 py-2 text-sm font-medium rounded-md
              ${location === "/dashboard" 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <i className="ri-dashboard-line text-xl mr-3" />
            Dashboard
          </Link>
          <Link 
            to="/contracts"
            className={
              `flex items-center w-full px-4 py-2 text-sm font-medium rounded-md
              ${location === "/contracts" || location.startsWith("/contracts/") 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <i className="ri-file-list-3-line text-xl mr-3" />
            Contracts
          </Link>
          <Link 
            to="/invoices" 
            className={
              `flex items-center w-full px-4 py-2 text-sm font-medium rounded-md
              ${location === "/invoices" 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <i className="ri-bill-line text-xl mr-3" />
            Invoices
          </Link>
          <Link 
            to="/faucet" 
            className={
              `flex items-center w-full px-4 py-2 text-sm font-medium rounded-md
              ${location === "/faucet" 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <i className="ri-coins-line text-xl mr-3" />
            Token Faucet
          </Link>
          <Link 
            to="/clients" 
            className={
              `flex items-center w-full px-4 py-2 text-sm font-medium rounded-md
              ${location === "/clients" 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <i className="ri-user-line text-xl mr-3" />
            Clients
          </Link>
          <Link 
            to="/settings" 
            className={
              `flex items-center w-full px-4 py-2 text-sm font-medium rounded-md
              ${location === "/settings" 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <i className="ri-settings-line text-xl mr-3" />
            Settings
          </Link>
        </nav>

        <div className="px-6 py-4">
          <Link
            to="/contracts/create" 
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition flex items-center justify-center"
          >
            <i className="ri-add-line mr-2" />
            New Contract
          </Link>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <span className="text-sm text-gray-600">3 Active Contracts</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
              <span className="text-sm text-gray-600">2 Pending Signatures</span>
            </div>
          </div>
        </div>

        {/* User Profile Widget */}
        {user ? (
          <div className="px-4 py-4 border-t border-gray-200 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email} />
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-sm">
                      {getUserInitials(user.displayName, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.displayName || user.email.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                  <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 mb-2"
                side="top"
              >
                <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="px-4 py-4 border-t border-gray-200 mt-auto">
            <Loader size="sm" variant="primary" text="Loading..." />
          </div>
        )}
      </div>
    </aside>
  );
}
