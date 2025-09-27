import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader, CardLoader } from "@/components/ui/loader";
import {
	Search,
	Mail,
	Phone,
	Building,
	Edit,
	Trash,
	Plus,
	Users,
	AlertTriangle,
} from "lucide-react";
import type { Client } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { getClientsByUserId, deleteClient } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import ClientModal from "@/components/modals/client-modal";

export default function Clients() {
	const { user } = useAuth();
	const [, navigate] = useLocation();
	const [clients, setClients] = useState<Client[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isClientModalOpen, setIsClientModalOpen] = useState(false);
	const [selectedClient, setSelectedClient] = useState<Client | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const { toast } = useToast();

	// Load clients from Firestore
	useEffect(() => {
		const fetchClients = async () => {
			if (!user?.uid) return;

			setIsLoading(true);
			try {
				console.log("Fetching clients for user:", user.uid);
				const response = await getClientsByUserId(user.uid);

				if (response.error) {
					console.error(
						"Error in getClientsByUserId response:",
						response.error,
					);
					toast({
						title: "Error",
						description: "Failed to load clients. Please try again.",
						variant: "destructive",
					});
				} else {
					console.log(
						"Successfully fetched clients:",
						response.data?.length || 0,
						"clients found",
					);
					setClients(response.data || []);
				}
			} catch (error) {
				console.error("Exception in fetchClients:", error);
				toast({
					title: "Error",
					description: "Failed to load clients. Please try again.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchClients();
	}, [user?.uid, toast]);

	// Filter clients based on search term
	const getFilteredClients = () => {
		if (!clients) return [];

		if (!searchTerm.trim()) return clients;

		const term = searchTerm.toLowerCase();
		return clients.filter(
			(client) =>
				client.name.toLowerCase().includes(term) ||
				client.companyName.toLowerCase().includes(term) ||
				client.email.toLowerCase().includes(term),
		);
	};

	// Handle opening the client form
	const handleAddClient = () => {
		setSelectedClient(null);
		setIsClientModalOpen(true);
	};

	// Handle editing a client
	const handleEditClient = (client: Client) => {
		setSelectedClient(client);
		setIsClientModalOpen(true);
	};

	// Handle deleting a client
	const handleDeleteClick = (client: Client) => {
		setSelectedClient(client);
		setIsDeleteDialogOpen(true);
	};

	// Confirm client deletion
	const confirmDelete = async () => {
		if (!selectedClient) {
			console.error("No client selected for deletion");
			return;
		}

		setIsDeleting(true);
		try {
			console.log("Confirming deletion of client:", selectedClient.clientId);
			const response = await deleteClient(selectedClient.clientId);
			console.log("Delete response:", response);

			if (response.success) {
				// Update the local state by filtering out the deleted client
				const updatedClients = clients.filter(
					(c) => c.clientId !== selectedClient.clientId,
				);
				console.log(
					"Updating clients list. Old count:",
					clients.length,
					"New count:",
					updatedClients.length,
				);
				setClients(updatedClients);

				toast({
					title: "✅ Success",
					description: `Client "${selectedClient.name}" has been deleted successfully`,
				});
			} else {
				console.error("Failed to delete client:", response.error);
				toast({
					title: "❌ Error",
					description: "Failed to delete client. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Exception in confirmDelete:", error);
			toast({
				title: "❌ Error",
				description: "Failed to delete client. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
			setSelectedClient(null);
		}
	};

	// Handle successful client creation/update
	const handleClientSuccess = (client: Client) => {
		if (selectedClient) {
			// Update existing client in the list
			setClients(clients.map(c => 
				c.clientId === selectedClient.clientId ? client : c
			));
		} else {
			// Add new client to the beginning of the list
			setClients([client, ...clients]);
		}
	};

	return (
		<DashboardLayout
			title="Clients"
			description="Manage your client contacts and information"
		>
			{/* Header with search and add button */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
				<div className="relative mt-4 md:mt-0 mb-4 md:mb-0">
					<Input
						type="text"
						placeholder="Search clients..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full md:w-64 pl-10"
					/>
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search className="h-4 w-4 text-gray-400" />
					</div>
				</div>
				<Button
					onClick={handleAddClient}
					className="h-11 px-6"
					variant="success"
				>
					<Plus className="h-4 w-4 mr-2" />
					Add Client
				</Button>
			</div>

			{/* Client cards */}
			{isLoading ? (
				<PageLoader text="Loading your clients..." />
			) : !clients || clients.length === 0 ? (
				<div className="bg-white rounded-2xl shadow-[0_0_10px_0_rgba(0,0,0,0.1)] p-12 text-center">
					<div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
						<Users className="h-8 w-8 text-gray-400" />
					</div>
					<h3 className="text-xl font-semibold text-gray-900 mb-2">
						No clients yet
					</h3>
					<p className="text-gray-500 mb-6 max-w-sm mx-auto">
						Start building your client network by adding your first client contact
					</p>
					<Button
						onClick={handleAddClient}
						className="h-11 px-6"
						variant="success"
					>
						<Plus className="h-4 w-4 mr-2" />
						Add Your First Client
					</Button>
				</div>
			) : getFilteredClients().length === 0 ? (
				<div className="bg-white rounded-2xl shadow-[0_0_10px_0_rgba(0,0,0,0.1)] p-12 text-center">
					<div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
						<Search className="h-8 w-8 text-yellow-600" />
					</div>
					<h3 className="text-xl font-semibold text-gray-900 mb-2">
						No clients found
					</h3>
					<p className="text-gray-500 mb-6">
						No clients match your search criteria. Try adjusting your search terms.
					</p>
					<Button
						onClick={() => setSearchTerm("")}
						variant="outline"
						className="h-11 px-6"
					>
						Clear Search
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{getFilteredClients().map((client) => (
						<Card key={client.clientId} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-gray-200">
							<div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
								<div className="font-semibold text-lg text-gray-900 truncate">
									{client.name}
								</div>
								<div className="text-sm text-gray-600 truncate">
									{client.companyName}
								</div>
							</div>
							<CardContent className="px-6 py-4">
								<div className="space-y-3">
									<div className="flex items-center text-sm">
										<Mail className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
										<a
											href={`mailto:${client.email}`}
											className="text-blue-600 hover:text-blue-800 hover:underline truncate transition-colors"
										>
											{client.email}
										</a>
									</div>

									{client.phone && (
										<div className="flex items-center text-sm">
											<Phone className="h-4 w-4 mr-3 text-green-500 flex-shrink-0" />
											<a 
												href={`tel:${client.phone}`} 
												className="text-gray-700 hover:text-gray-900 transition-colors"
											>
												{client.phone}
											</a>
										</div>
									)}

									{client.address && (
										<div className="flex items-start text-sm">
											<Building className="h-4 w-4 mr-3 text-orange-500 flex-shrink-0 mt-0.5" />
											<span className="text-gray-700 line-clamp-2">{client.address}</span>
										</div>
									)}
								</div>
							</CardContent>
							<div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
								<Button
									variant="ghost"
									size="sm"
									className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
									onClick={() => handleDeleteClick(client)}
								>
									<Trash className="h-4 w-4 mr-1" />
									<span className="sr-only sm:not-sr-only sm:text-xs">
										Delete
									</span>
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
									onClick={() => handleEditClient(client)}
								>
									<Edit className="h-4 w-4 mr-1" />
									<span className="sr-only sm:not-sr-only sm:text-xs">
										Edit
									</span>
								</Button>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Delete confirmation dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-3">
							<div className="p-2 bg-red-100 rounded-lg">
								<AlertTriangle className="h-5 w-5 text-red-600" />
							</div>
							Delete Client
						</DialogTitle>
						<DialogDescription className="text-base pt-2">
							Are you sure you want to delete <strong>{selectedClient?.name}</strong> from <strong>{selectedClient?.companyName}</strong>? 
							<br /><br />
							This action cannot be undone and will permanently remove all client information.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-3 pt-6">
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
							disabled={isDeleting}
							className="h-11 px-6"
						>
							Cancel
						</Button>
						<Button 
							variant="destructive" 
							onClick={confirmDelete}
							disabled={isDeleting}
							className="h-11 px-6 min-w-[100px]"
						>
							{isDeleting ? (
								<>
									<CardLoader />
									Deleting...
								</>
							) : (
								<>
									<Trash className="h-4 w-4 mr-2" />
									Delete Client
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Client Modal */}
			<ClientModal
				isOpen={isClientModalOpen}
				onClose={() => setIsClientModalOpen(false)}
				client={selectedClient}
				onSuccess={handleClientSuccess}
			/>
		</DashboardLayout>
	);
}
