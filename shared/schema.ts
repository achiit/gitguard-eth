import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Profile Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  organizationName: text("organization_name").notNull(),
  logoUrl: text("logo_url").notNull(),
  description: text("description"),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Client Schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  userId: text("user_id").notNull(), // Reference to freelancer user_id
  name: text("name").notNull(),
  companyName: text("company_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Contract Schema
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  contractId: text("contract_id").notNull().unique(),
  userId: text("user_id").notNull(), // Reference to freelancer user_id
  templateType: text("template_type").notNull(), // 'service' | 'project' | 'nda' | 'sow'
  status: text("status").notNull(), // 'draft' | 'sent' | 'signed' | 'completed' | 'expired'
  clientInfo: jsonb("client_info").notNull(),
  projectDetails: jsonb("project_details").notNull(),
  deliverables: jsonb("deliverables").notNull(),
  paymentTerms: jsonb("payment_terms").notNull(),
  legalClauses: jsonb("legal_clauses").notNull(),
  signatures: jsonb("signatures"),
  accessToken: text("access_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  sentAt: timestamp("sent_at"),
  signedAt: timestamp("signed_at"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  sentAt: true,
  signedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

// Enums and specific types
export enum TemplateType {
  SERVICE = 'service',
  PROJECT = 'project',
  NDA = 'nda',
  SOW = 'sow'
}

export enum ContractStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  SIGNED = 'signed',
  COMPLETED = 'completed',
  EXPIRED = 'expired'
}

export enum PaymentType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  MILESTONE = 'milestone'
}

// Type definitions matching the jsonb columns
export type ClientInfo = {
  clientId?: string;
  name: string;
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
};

export type ProjectDetails = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  scope: string;
  outOfScope?: string;
};

export type Deliverable = {
  name: string;
  description: string;
  dueDate?: string;
};

export type PaymentTerms = {
  type: PaymentType;
  amount: number;
  currency: string;
  schedule?: string;
  deposit?: number;
};

export type Signature = {
  signature: string; // base64 image
  date: string;
};

export type Signatures = {
  freelancer?: Signature;
  client?: Signature;
};
// Firebase/Firestore specific types for Web3 integration
export interface Milestone {
  name: string;
  description: string;
  amount: number;
  dueDate?: string;
}

export interface OnchainData {
  chainId: number;
  escrow: string;
  idHex: string;
  token: string;
  autoReleaseAt: number;
}

export interface InvoiceOnchainData {
  chainId: number;
  escrow: string;
  idHex: string;
  token: string;
  amount: string;
  state: 'created' | 'funded' | 'paid';
  fundTx?: string;
  releaseTx?: string;
  payer?: string;
  payee: string;
}

export interface AuditEntry {
  action: string;
  timestamp: string;
  details?: any;
}

export interface InvoiceItem {
  name: string;
  description: string;
  amount: number;
  status: 'pending' | 'funded' | 'paid';
}

export interface FirebaseInvoice {
  invoiceId: string;
  contractId: string;
  userId: string;
  clientId: string;
  currency: string;
  amount: number;
  status: 'sent' | 'funded' | 'paid';
  payLinkToken: string;
  onchain: InvoiceOnchainData;
  items?: InvoiceItem[];
  audit: AuditEntry[];
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  fundedAt?: string;
  paidAt?: string;
}

export interface FirebaseContract {
  contractId: string;
  userId: string;
  templateType: string;
  status: string;
  clientInfo: ClientInfo;
  projectDetails: ProjectDetails;
  deliverables: Deliverable[];
  paymentTerms: PaymentTerms & {
    tokenAddress?: string;
    decimals?: number;
    chainId?: number;
    payeeWallet?: string;
    milestones?: Milestone[];
  };
  legalClauses: any;
  signatures?: Signatures;
  accessToken?: string;
  onchain?: OnchainData;
  audit?: AuditEntry[];
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  signedAt?: string;
}