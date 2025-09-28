import type { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export default function DashboardLayout({ 
  children,
  title,
  description 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Temporarily disable Firebase auth requirement to prevent conflicts with Privy
  // const { isLoading } = useRequireAuth();
  const { user } = useAuth();

  // Temporarily disable Firebase auth check
  // if (isLoading || !user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Loader2 className="h-8 w-8 animate-spin text-primary" />
  //     </div>
  //   );
  // }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        user={user}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          sidebarOpen={sidebarOpen} 
        />
        
        <main className="flex-1 overflow-y-auto bg-white p-4 lg:p-6 rounded-2xl shadow-[0_0_10px_0_rgba(0,0,0,0.1)] mr-2 mb-2">
          {/* Page header */}
          {(title || description) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
              {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            </div>
          )}
          
          {children}
        </main>
      </div>
      
      {/* Mobile bottom navigation for small screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="grid grid-cols-5">
          <Link to="/dashboard" className="flex flex-col items-center justify-center py-3 text-primary-600">
            <i className="ri-dashboard-line text-xl"/>
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link
            to="/contracts"
            className="flex flex-col items-center justify-center py-3 text-gray-500"
          >
            <i className="ri-file-list-3-line text-xl" />
            <span className="text-xs mt-1">Contracts</span>
          </Link>
          <Link
            to="/contracts/create"
            className="flex flex-col items-center justify-center py-3 text-gray-500"
          >
            <i className="ri-add-circle-line text-2xl" />
            <span className="text-xs mt-1">Create</span>
          </Link>
          <Link
            to="/clients"
            className="flex flex-col items-center justify-center py-3 text-gray-500"
          >
            <i className="ri-user-line text-xl" />
            <span className="text-xs mt-1">Clients</span>
          </Link>
          <Link
            to="/settings"
            className="flex flex-col items-center justify-center py-3 text-gray-500"
          >
            <i className="ri-settings-line text-xl" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
