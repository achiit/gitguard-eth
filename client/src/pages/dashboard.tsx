import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCard from "@/components/dashboard/stats-card";
import ContractsTable from "@/components/dashboard/contracts-table";
import RecentActivity from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckSquare, Clock, Wallet, User, Sparkles } from "lucide-react";
import type { Contract, ContractStatus, ActivityItem } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { usePrivyAuth } from "@/hooks/use-privy-auth";
import { getContractsByUserId } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { WalletStatus } from "@/components/wallet/wallet-status";

export default function Dashboard() {
	const { user } = useAuth();
	const { user: privyUser, authenticated: privyAuthenticated, getPrimaryWalletAddress } = usePrivyAuth();
	const { toast } = useToast();
	const [stats, setStats] = useState({
		totalContracts: 0,
		pendingSignatures: 0,
		completedContracts: 0,
	});
	const [contracts, setContracts] = useState<Contract[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

	// Fetch contracts from Firestore
	useEffect(() => {
		const fetchContracts = async () => {
			if (!user?.uid) {
				console.log('No user ID available for fetching contracts');
				setIsLoading(false);
				return;
			}

			console.log('Fetching contracts for user:', user.uid);
			setIsLoading(true);
			try {
				const response = await getContractsByUserId(user.uid);
				if (response.error) {
					console.error('Error fetching contracts:', response.error);
					toast({
						title: "Error",
						description: "Failed to load contracts data. Please try again.",
						variant: "destructive",
					});
				} else {
					console.log('Contracts fetched successfully:', response.data?.length || 0);
					setContracts(response.data || []);
				}
			} catch (error) {
				console.error("Error fetching contracts:", error);
				toast({
					title: "Error",
					description: "Failed to load contracts data. Please try again.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchContracts();
	}, [user?.uid, toast]);

	// Process contracts data once loaded
	useEffect(() => {
		if (contracts) {
			// Calculate stats
			const pending = contracts.filter((c) => c.status === "SENT").length;
			const completed = contracts.filter(
				(c) => c.status === "SIGNED" || c.status === "COMPLETED",
			).length;

			setStats({
				totalContracts: contracts.length,
				pendingSignatures: pending,
				completedContracts: completed,
			});

			// Generate activity items
			const activities: ActivityItem[] = [];

			// Sort contracts by dates
			const sortedContracts = [...contracts].sort((a, b) => {
				// Convert Firestore timestamps to dates if necessary
				const dateA = a.signedAt
					? new Date(a.signedAt)
					: a.sentAt
						? new Date(a.sentAt)
						: new Date(a.createdAt);
				const dateB = b.signedAt
					? new Date(b.signedAt)
					: b.sentAt
						? new Date(b.sentAt)
						: new Date(b.createdAt);
				return dateB.getTime() - dateA.getTime();
			});

			// Create activity items from contracts
			for (const contract of sortedContracts.slice(0, 4)) {
				if (contract.signedAt) {
					activities.push({
						id: `signed-${contract.contractId}`,
						type: "signed",
						title: (contract.projectDetails as { title: string }).title,
						timestamp: new Date(contract.signedAt),
						entity: {
							id: contract.contractId,
							name: (contract.clientInfo as { name: string }).name,
						},
					});
				} else if (contract.sentAt) {
					activities.push({
						id: `sent-${contract.contractId}`,
						type: "sent",
						title: (contract.projectDetails as { title: string }).title,
						timestamp: new Date(contract.sentAt),
						entity: {
							id: contract.contractId,
							name: (contract.clientInfo as { name: string }).name,
						},
					});
				} else {
					activities.push({
						id: `created-${contract.contractId}`,
						type: "created",
						title: (contract.projectDetails as { title: string }).title,
						timestamp: new Date(contract.createdAt),
					});
				}
			}

			setRecentActivities(activities);
		}
	}, [contracts]);

	return (
		<DashboardLayout
			title="Dashboard"
			description="Overview of your contract activity"
		>
			{/* Web3 User Info Card */}
			{privyAuthenticated && privyUser && (
				<Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-blue-600" />
							Web3 Profile Active
						</CardTitle>
						<CardDescription>
							Your decentralized identity and wallet information
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-gray-500" />
									<span className="font-medium">{privyUser.displayName}</span>
								</div>
								{privyUser.email && (
									<div className="text-sm text-gray-600">
										{privyUser.email}
									</div>
								)}
								<div className="flex gap-2 flex-wrap">
									{privyUser.linkedAccounts.email && (
										<Badge variant="secondary">Email</Badge>
									)}
									{privyUser.linkedAccounts.google && (
										<Badge variant="secondary">Google</Badge>
									)}
									{privyUser.linkedAccounts.wallet && (
										<Badge className="bg-purple-100 text-purple-800">Wallet</Badge>
									)}
								</div>
							</div>
							
							{privyUser.hasWallet && (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Wallet className="h-4 w-4 text-purple-600" />
										<span className="font-medium">Primary Wallet</span>
									</div>
									<div className="text-sm font-mono bg-white p-2 rounded border">
										{getPrimaryWalletAddress()?.slice(0, 6)}...{getPrimaryWalletAddress()?.slice(-4)}
									</div>
									{privyUser.hasEmbeddedWallet && (
										<Badge className="bg-green-100 text-green-800">
											Embedded Wallet
										</Badge>
									)}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Wallet Status */}
			<div className="mb-6">
				<WalletStatus role="payee" showDetails={true} />
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<StatsCard
					title="Total Contracts"
					value={stats.totalContracts}
					icon={<FileText className="h-5 w-5" />}
					trend={
						contracts && contracts.length > 0
							? { value: "All time", positive: true }
							: undefined
					}
					iconBgColor="bg-blue-100"
					iconColor="text-blue-600"
				/>

				<StatsCard
					title="Pending Signatures"
					value={stats.pendingSignatures}
					icon={<Clock className="h-5 w-5" />}
					trend={
						stats.pendingSignatures > 0
							? {
									value: `${stats.pendingSignatures} contracts waiting`,
									positive: false,
								}
							: undefined
					}
					iconBgColor="bg-yellow-100"
					iconColor="text-yellow-600"
				/>

				<StatsCard
					title="Completed"
					value={stats.completedContracts}
					icon={<CheckSquare className="h-5 w-5" />}
					trend={
						stats.completedContracts > 0
							? { value: "Signed and delivered", positive: true }
							: undefined
					}
					iconBgColor="bg-green-100"
					iconColor="text-green-600"
				/>
			</div>

			{/* Recent Contracts Table */}
			{isLoading ? (
				<PageLoader text="Loading your contracts..." />
			) : contracts && contracts.length > 0 ? (
				<ContractsTable contracts={contracts.slice(0, 5)} />
			) : (
				<div className="bg-white rounded-2xl shadow-[0_0_10px_0_rgba(0,0,0,0.1)] p-8 text-center">
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						No contracts yet
					</h3>
					<p className="text-gray-500 mb-4">
						Create your first contract to get started
					</p>
					<Link href="/contracts/create">
						<Button variant="success" className="h-11 px-6">
							Create Contract
						</Button>
					</Link>
				</div>
			)}

			{/* Recent Activity */}
			{recentActivities.length > 0 && (
				<RecentActivity activities={recentActivities} />
			)}
		</DashboardLayout>
	);
}
