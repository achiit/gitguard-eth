import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contract, ContractStatus } from "@/types";
import { formatDate } from "@/lib/utils";

interface ContractsTableProps {
  contracts: Contract[];
}

export default function ContractsTable({ contracts }: ContractsTableProps) {
  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.SIGNED:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Signed</Badge>;
      case ContractStatus.SENT:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case ContractStatus.DRAFT:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
      case ContractStatus.COMPLETED:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case ContractStatus.EXPIRED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Contracts</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[250px]">Contract</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.contractId}>
                <TableCell>
                  <div className="font-medium text-gray-900">{(contract.projectDetails as any)?.title}</div>
                  <div className="text-sm text-gray-500">{contract.templateType}</div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-900">{(contract.clientInfo as any)?.companyName}</div>
                  <div className="text-sm text-gray-500">{(contract.clientInfo as any)?.name}</div>
                </TableCell>
                <TableCell>{getStatusBadge(contract.status as ContractStatus)}</TableCell>
                <TableCell className="text-gray-500">
                  {formatDate(contract.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="link"
                      className="text-primary-600 hover:text-primary-900 h-auto p-0"
                      asChild
                    >
                      <a href={`/contracts/${contract.contractId}`}>View</a>
                    </Button>
                    
                    {contract.status === ContractStatus.DRAFT && (
                      <Button
                        variant="link"
                        className="text-gray-600 hover:text-gray-900 h-auto p-0"
                        asChild
                      >
                        <a href={`/contracts/edit/${contract.contractId}`}>Edit</a>
                      </Button>
                    )}
                    
                    {contract.status === ContractStatus.SENT && (
                      <Button
                        variant="link"
                        className="text-gray-600 hover:text-gray-900 h-auto p-0"
                      >
                        Resend
                      </Button>
                    )}
                    
                    {contract.status === ContractStatus.SIGNED && (
                      <Button
                        variant="link"
                        className="text-gray-600 hover:text-gray-900 h-auto p-0"
                      >
                        Download
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
