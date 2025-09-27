import { nanoid } from "nanoid";
import { 
  User, InsertUser, 
  Client, InsertClient, 
  Contract, InsertContract,
  ContractStatus
} from "@shared/schema";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUserId(userId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: string, user: Partial<User>): Promise<User | undefined>;
  
  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  getClientByClientId(clientId: string): Promise<Client | undefined>;
  getClientsByUserId(userId: string): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(clientId: string, client: Partial<Client>): Promise<Client | undefined>;
  deleteClient(clientId: string): Promise<boolean>;
  
  // Contract operations
  getContract(id: number): Promise<Contract | undefined>;
  getContractByContractId(contractId: string): Promise<Contract | undefined>;
  getContractsByUserId(userId: string): Promise<Contract[]>;
  getContractsByStatus(userId: string, status: ContractStatus): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(contractId: string, contract: Partial<Contract>): Promise<Contract | undefined>;
  deleteContract(contractId: string): Promise<boolean>;
  getPublicContract(accessToken: string): Promise<Contract | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userIdToId: Map<string, number>;
  private clients: Map<number, Client>;
  private clientIdToId: Map<string, number>;
  private contracts: Map<number, Contract>;
  private contractIdToId: Map<string, number>;
  private contractAccessTokens: Map<string, string>;
  
  private userId: number;
  private clientId: number;
  private contractId: number;

  constructor() {
    this.users = new Map();
    this.userIdToId = new Map();
    this.clients = new Map();
    this.clientIdToId = new Map();
    this.contracts = new Map();
    this.contractIdToId = new Map();
    this.contractAccessTokens = new Map();
    
    this.userId = 1;
    this.clientId = 1;
    this.contractId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUserId(userId: string): Promise<User | undefined> {
    const id = this.userIdToId.get(userId);
    if (id) {
      return this.users.get(id);
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    
    this.users.set(id, user);
    this.userIdToId.set(user.userId, id);
    
    return user;
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User | undefined> {
    const id = this.userIdToId.get(userId);
    if (!id) return undefined;
    
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { 
      ...user, 
      ...userData, 
      updatedAt: new Date() 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByClientId(clientId: string): Promise<Client | undefined> {
    const id = this.clientIdToId.get(clientId);
    if (id) {
      return this.clients.get(id);
    }
    return undefined;
  }

  async getClientsByUserId(userId: string): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(client => client.userId === userId);
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const now = new Date();
    
    const client: Client = {
      ...clientData,
      id,
      createdAt: now
    };
    
    this.clients.set(id, client);
    this.clientIdToId.set(client.clientId, id);
    
    return client;
  }

  async updateClient(clientId: string, clientData: Partial<Client>): Promise<Client | undefined> {
    const id = this.clientIdToId.get(clientId);
    if (!id) return undefined;
    
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient: Client = {
      ...client,
      ...clientData
    };
    
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(clientId: string): Promise<boolean> {
    const id = this.clientIdToId.get(clientId);
    if (!id) return false;
    
    return this.clients.delete(id) && this.clientIdToId.delete(clientId);
  }

  // Contract operations
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getContractByContractId(contractId: string): Promise<Contract | undefined> {
    const id = this.contractIdToId.get(contractId);
    if (id) {
      return this.contracts.get(id);
    }
    return undefined;
  }

  async getContractsByUserId(userId: string): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(contract => contract.userId === userId);
  }

  async getContractsByStatus(userId: string, status: ContractStatus): Promise<Contract[]> {
    return (await this.getContractsByUserId(userId)).filter(contract => contract.status === status);
  }

  async createContract(contractData: InsertContract): Promise<Contract> {
    const id = this.contractId++;
    const now = new Date();
    
    const contract: Contract = {
      ...contractData,
      id,
      createdAt: now,
      updatedAt: now,
      sentAt: null,
      signedAt: null
    };
    
    this.contracts.set(id, contract);
    this.contractIdToId.set(contract.contractId, id);
    
    if (contract.accessToken) {
      this.contractAccessTokens.set(contract.accessToken, contract.contractId);
    }
    
    return contract;
  }

  async updateContract(contractId: string, contractData: Partial<Contract>): Promise<Contract | undefined> {
    const id = this.contractIdToId.get(contractId);
    if (!id) return undefined;
    
    const contract = this.contracts.get(id);
    if (!contract) return undefined;
    
    // If we're updating the access token, update our mapping
    if (contractData.accessToken && contractData.accessToken !== contract.accessToken) {
      if (contract.accessToken) {
        this.contractAccessTokens.delete(contract.accessToken);
      }
      this.contractAccessTokens.set(contractData.accessToken, contractId);
    }
    
    const updatedContract: Contract = {
      ...contract,
      ...contractData,
      updatedAt: new Date()
    };
    
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }

  async deleteContract(contractId: string): Promise<boolean> {
    const id = this.contractIdToId.get(contractId);
    if (!id) return false;
    
    const contract = this.contracts.get(id);
    if (contract && contract.accessToken) {
      this.contractAccessTokens.delete(contract.accessToken);
    }
    
    return this.contracts.delete(id) && this.contractIdToId.delete(contractId);
  }

  async getPublicContract(accessToken: string): Promise<Contract | undefined> {
    const contractId = this.contractAccessTokens.get(accessToken);
    if (!contractId) return undefined;
    
    return this.getContractByContractId(contractId);
  }
}

export const storage = new MemStorage();
