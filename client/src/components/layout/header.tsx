import { Bell, Menu, X, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser } from "@/types";
import { useLocation } from "wouter";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: AuthUser;
}

export default function Header({ sidebarOpen, setSidebarOpen, user }: HeaderProps) {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const handleLogout = async () => {
    const { error } = await logOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message
      });
    } else {
      toast({
        title: "Signed out successfully",
      });
      navigate("/login");
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
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                    {user.displayName?.charAt(0) || user.email.charAt(0)}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user.displayName && (
                    <p className="font-medium">{user.displayName}</p>
                  )}
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
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
