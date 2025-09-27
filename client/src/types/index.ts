import {
  User,
  Client,
  Contract,
  TemplateType,
  ContractStatus,
  PaymentType,
  ClientInfo,
  ProjectDetails,
  Deliverable,
  PaymentTerms,
  Signature,
  Signatures
} from "@shared/schema";

// Re-export the types from schema
export type {
  User,
  Client,
  Contract,
  ClientInfo,
  ProjectDetails,
  Deliverable,
  PaymentTerms,
  Signature,
  Signatures
};

// Re-export the enums
export { TemplateType, ContractStatus, PaymentType };

// Additional frontend-specific types
export interface ContractFormData {
  templateType: TemplateType;
  clientInfo: ClientInfo;
  projectDetails: ProjectDetails;
  deliverables: Deliverable[];
  paymentTerms: PaymentTerms;
  legalClauses: Record<string, string>;
  signatures?: {
    freelancer?: Signature;
  };
}

export interface StatsData {
  totalContracts: number;
  pendingSignatures: number;
  completedContracts: number;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  hasProfile?: boolean;
}

export interface TemplateOption {
  id: TemplateType;
  title: string;
  description: string;
  bestFor: string;
}

export interface ActivityItem {
  id: string;
  type: 'signed' | 'sent' | 'created' | 'clientAdded';
  title: string;
  timestamp: Date;
  entity?: {
    id: string;
    name: string;
  };
}

export interface UserProfile {
  userId: string;
  organizationName: string;
  logoUrl: string;
  description?: string;
  phone?: string;
  address?: string;
}
