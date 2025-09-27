import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import { 
  insertUserSchema, 
  insertClientSchema, 
  insertContractSchema,
  ContractStatus
} from "@shared/schema";
import { z } from "zod";
import { uploadSignature } from "./imagekit"; // Import the uploadSignature function

// Helper function to generate unique IDs
const generateId = () => nanoid(10);

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route("/api");
  
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse({
        ...req.body,
        userId: req.body.userId || generateId()
      });
      
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Failed to create user" });
    }
  });
  
  app.get("/api/users/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUserByUserId(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: "Failed to get user" });
    }
  });
  
  app.patch("/api/users/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUserByUserId(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      return res.json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  // Client routes
  app.post("/api/clients", async (req: Request, res: Response) => {
    try {
      const clientData = insertClientSchema.parse({
        ...req.body,
        clientId: req.body.clientId || generateId()
      });
      
      const client = await storage.createClient(clientData);
      return res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Failed to create client" });
    }
  });
  
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const clients = await storage.getClientsByUserId(userId);
      return res.json(clients);
    } catch (error) {
      return res.status(500).json({ error: "Failed to get clients" });
    }
  });
  
  app.get("/api/clients/:clientId", async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const client = await storage.getClientByClientId(clientId);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      return res.json(client);
    } catch (error) {
      return res.status(500).json({ error: "Failed to get client" });
    }
  });
  
  app.patch("/api/clients/:clientId", async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const client = await storage.getClientByClientId(clientId);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      const updatedClient = await storage.updateClient(clientId, req.body);
      return res.json(updatedClient);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update client" });
    }
  });
  
  app.delete("/api/clients/:clientId", async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const success = await storage.deleteClient(clientId);
      
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete client" });
    }
  });
  
  // Contract routes
  app.post("/api/contracts", async (req: Request, res: Response) => {
    try {
      const contractData = insertContractSchema.parse({
        ...req.body,
        contractId: req.body.contractId || generateId(),
        status: req.body.status || ContractStatus.DRAFT,
        accessToken: req.body.accessToken || generateId()
      });
      
      const contract = await storage.createContract(contractData);
      return res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Failed to create contract" });
    }
  });
  
  app.get("/api/contracts", async (req: Request, res: Response) => {
    try {
      const { userId, status } = req.query;
      
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      // If status is provided, filter by status
      if (status && typeof status === "string") {
        const validStatus = Object.values(ContractStatus).includes(status as ContractStatus);
        
        if (!validStatus) {
          return res.status(400).json({ error: "Invalid status" });
        }
        
        const contracts = await storage.getContractsByStatus(userId, status as ContractStatus);
        return res.json(contracts);
      }
      
      // Otherwise, get all contracts for the user
      const contracts = await storage.getContractsByUserId(userId);
      return res.json(contracts);
    } catch (error) {
      return res.status(500).json({ error: "Failed to get contracts" });
    }
  });
  
  app.get("/api/contracts/:contractId", async (req: Request, res: Response) => {
    try {
      const { contractId } = req.params;
      const contract = await storage.getContractByContractId(contractId);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      return res.json(contract);
    } catch (error) {
      return res.status(500).json({ error: "Failed to get contract" });
    }
  });
  
  app.patch("/api/contracts/:contractId", async (req: Request, res: Response) => {
    try {
      const { contractId } = req.params;
      const contract = await storage.getContractByContractId(contractId);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Handle special status updates
      if (req.body.status) {
        // If changing to sent status, set sentAt
        if (req.body.status === ContractStatus.SENT && contract.status !== ContractStatus.SENT) {
          req.body.sentAt = new Date();
        }
        
        // If changing to signed status, set signedAt
        if (req.body.status === ContractStatus.SIGNED && contract.status !== ContractStatus.SIGNED) {
          req.body.signedAt = new Date();
        }
      }
      
      const updatedContract = await storage.updateContract(contractId, req.body);
      return res.json(updatedContract);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update contract" });
    }
  });
  
  app.delete("/api/contracts/:contractId", async (req: Request, res: Response) => {
    try {
      const { contractId } = req.params;
      const success = await storage.deleteContract(contractId);
      
      if (!success) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete contract" });
    }
  });
  
  // Public contract route for client viewing
  app.get("/api/public-contract/:accessToken", async (req: Request, res: Response) => {
    try {
      const { accessToken } = req.params;
      const contract = await storage.getPublicContract(accessToken);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      return res.json(contract);
    } catch (error) {
      return res.status(500).json({ error: "Failed to get public contract" });
    }
  });
  
  // Sign contract as client
  app.post("/api/public-contract/:accessToken/sign", async (req: Request, res: Response) => {
    try {
      const { accessToken } = req.params;
      const { signature } = req.body;
      
      if (!signature) {
        return res.status(400).json({ error: "Signature is required" });
      }
      
      const contract = await storage.getPublicContract(accessToken);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }

      // Upload signature to ImageKit
      const { url, error: uploadError } = await uploadSignature(contract.userId, signature);
      
      if (uploadError || !url) {
        return res.status(500).json({ error: "Failed to upload signature" });
      }
      
      // Update signatures and status with the ImageKit URL
      const signatures = contract.signatures || {};
      const clientSignature = {
        signature: url, // Use the ImageKit URL
        date: new Date().toISOString()
      };
      
      const updatedContract = await storage.updateContract(contract.contractId, {
        signatures: { ...signatures, client: clientSignature },
        status: ContractStatus.SIGNED,
        signedAt: new Date()
      });
      
      return res.json(updatedContract);
    } catch (error) {
      return res.status(500).json({ error: "Failed to sign contract" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
