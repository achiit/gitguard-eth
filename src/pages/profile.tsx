import DashboardLayout from "@/components/layout/dashboard-layout";
import UserProfile from "@/components/user/user-profile";
import PrivyDebug from "@/components/debug/privy-debug";
import FirebaseTest from "@/components/test/firebase-test";

export default function Profile() {
  return (
    <DashboardLayout
      title="Profile"
      description="Manage your account settings and Web3 identity"
    >
      <div className="space-y-6">
        <FirebaseTest />
        <PrivyDebug />
        <UserProfile />
      </div>
    </DashboardLayout>
  );
}