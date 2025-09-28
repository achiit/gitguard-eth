import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  orderBy,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { firestore } from './firebase';
import { 
  User, 
  Client, 
  Contract, 
  ContractStatus,
  Invoice,
  AuditEntry,
} from '@/types';

// Collections
const USERS_COLLECTION = 'users';
const CLIENTS_COLLECTION = 'clients';
const CONTRACTS_COLLECTION = 'contracts';
const INVOICES_COLLECTION = 'invoices';

// User operations
export const createUserProfile = async (userData: Partial<User>) => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userData.userId as string);
    await setDoc(userRef, {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { data: userSnap.data() as User, error: null };
    } else {
      return { data: null, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { data: null, error };
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now()
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
};

// Client operations
export const createClient = async (clientData: Partial<Client>) => {
  try {
    console.log("Creating client in Firestore:", clientData);
    const clientRef = doc(collection(firestore, CLIENTS_COLLECTION));
    const clientId = clientRef.id;
    const now = Timestamp.now();
    
    const newClient = {
      ...clientData,
      clientId,
      createdAt: now
    };
    
    console.log("Setting client document with ID:", clientId);
    await setDoc(clientRef, newClient);
    
    // Convert Firestore timestamp to regular date for the return value
    const returnData = { 
      ...clientData, 
      clientId, 
      createdAt: now.toDate() 
    } as Client;
    
    console.log("Client created successfully:", returnData);
    return { data: returnData, error: null };
  } catch (error) {
    console.error('Error creating client:', error);
    return { data: null, error };
  }
};

export const getClientsByUserId = async (userId: string) => {
  try {
    console.log("Getting clients for user:", userId);
    // First try with orderBy if indexes are set up
    try {
      console.log("Attempting query with orderBy");
      const clientsQuery = query(
        collection(firestore, CLIENTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const clientsSnap = await getDocs(clientsQuery);
      console.log("Query returned", clientsSnap.size, "clients");
      
      const clients: Client[] = [];
      
      clientsSnap.forEach((doc) => {
        // Convert Firestore timestamps to regular dates
        const data = doc.data();
        const client = {
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date()
        } as Client;
        
        clients.push(client);
      });
      
      console.log("Processed clients:", clients.length);
      return { data: clients, error: null };
    } catch (indexError) {
      // Fallback without orderBy if indexes aren't set up
      console.warn('Using fallback query without orderBy due to missing indexes:', indexError);
      const clientsQuery = query(
        collection(firestore, CLIENTS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const clientsSnap = await getDocs(clientsQuery);
      console.log("Fallback query returned", clientsSnap.size, "clients");
      
      const clients: Client[] = [];
      
      clientsSnap.forEach((doc) => {
        // Convert Firestore timestamps to regular dates
        const data = doc.data();
        const client = {
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date()
        } as Client;
        
        clients.push(client);
      });
      
      // Sort manually since we couldn't use orderBy
      clients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log("Processed and sorted clients:", clients.length);
      return { data: clients, error: null };
    }
  } catch (error) {
    console.error('Error getting clients:', error);
    return { data: [], error };
  }
};

export const getClientById = async (clientId: string) => {
  try {
    const clientsQuery = query(
      collection(firestore, CLIENTS_COLLECTION),
      where('clientId', '==', clientId)
    );
    
    const clientsSnap = await getDocs(clientsQuery);
    
    if (!clientsSnap.empty) {
      return { data: clientsSnap.docs[0].data() as Client, error: null };
    } else {
      return { data: null, error: 'Client not found' };
    }
  } catch (error) {
    console.error('Error getting client:', error);
    return { data: null, error };
  }
};

export const updateClient = async (clientId: string, clientData: Partial<Client>) => {
  try {
    console.log("Updating client:", clientId, clientData);
    const clientsQuery = query(
      collection(firestore, CLIENTS_COLLECTION),
      where('clientId', '==', clientId)
    );
    
    const clientsSnap = await getDocs(clientsQuery);
    console.log("Found", clientsSnap.size, "clients with ID:", clientId);
    
    if (!clientsSnap.empty) {
      const clientRef = clientsSnap.docs[0].ref;
      const currentData = clientsSnap.docs[0].data();
      console.log("Current client data:", currentData);
      
      // Prepare update data
      const updateData = {
        ...clientData,
        updatedAt: Timestamp.now()
      };
      
      console.log("Updating with data:", updateData);
      await updateDoc(clientRef, updateData);
      
      // Return the updated client data
      const updatedClient = {
        ...currentData,
        ...clientData,
        updatedAt: new Date()
      } as Client;
      
      console.log("Client updated successfully:", updatedClient);
      return { 
        success: true, 
        data: updatedClient,
        error: null 
      };
    } else {
      console.error("Client not found with ID:", clientId);
      return { 
        success: false, 
        data: null,
        error: 'Client not found' 
      };
    }
  } catch (error) {
    console.error('Error updating client:', error);
    return { 
      success: false, 
      data: null,
      error 
    };
  }
};

export const deleteClient = async (clientId: string) => {
  try {
    console.log("Deleting client with ID:", clientId);
    const clientsQuery = query(
      collection(firestore, CLIENTS_COLLECTION),
      where('clientId', '==', clientId)
    );
    
    const clientsSnap = await getDocs(clientsQuery);
    console.log("Found", clientsSnap.size, "clients with ID:", clientId);
    
    if (!clientsSnap.empty) {
      console.log("Deleting document with path:", clientsSnap.docs[0].ref.path);
      await deleteDoc(clientsSnap.docs[0].ref);
      console.log("Client deleted successfully");
      return { success: true, error: null };
    } else {
      console.error("Client not found for deletion with ID:", clientId);
      return { success: false, error: 'Client not found' };
    }
  } catch (error) {
    console.error('Error deleting client:', error);
    return { success: false, error };
  }
};

// Contract operations
export const createContract = async (contractData: Partial<Contract>) => {
  try {
    const contractRef = doc(collection(firestore, CONTRACTS_COLLECTION));
    const contractId = contractRef.id;
    const now = Timestamp.now();
    
    await setDoc(contractRef, {
      ...contractData,
      contractId,
      createdAt: now,
      updatedAt: now,
      sentAt: null,
      signedAt: null
    });
    
    return { data: { ...contractData, contractId }, error: null };
  } catch (error) {
    console.error('Error creating contract:', error);
    return { data: null, error };
  }
};

export const getContractsByUserId = async (userId: string) => {
  try {
    // First try with orderBy if indexes are set up
    try {
      const contractsQuery = query(
        collection(firestore, CONTRACTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const contractsSnap = await getDocs(contractsQuery);
      const contracts: Contract[] = [];
      
      contractsSnap.forEach((doc) => {
        // Convert Firestore timestamps to regular dates
        const data = doc.data();
        const contract = {
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          sentAt: data.sentAt?.toDate?.() || null,
          signedAt: data.signedAt?.toDate?.() || null
        } as Contract;
        
        contracts.push(contract);
      });
      
      return { data: contracts, error: null };
    } catch (indexError) {
      // Fallback without orderBy if indexes aren't set up
      console.warn('Using fallback query without orderBy due to missing indexes:', indexError);
      const contractsQuery = query(
        collection(firestore, CONTRACTS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const contractsSnap = await getDocs(contractsQuery);
      const contracts: Contract[] = [];
      
      contractsSnap.forEach((doc) => {
        // Convert Firestore timestamps to regular dates
        const data = doc.data();
        const contract = {
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          sentAt: data.sentAt?.toDate?.() || null,
          signedAt: data.signedAt?.toDate?.() || null
        } as Contract;
        
        contracts.push(contract);
      });
      
      // Sort manually since we couldn't use orderBy
      contracts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return { data: contracts, error: null };
    }
  } catch (error) {
    console.error('Error getting contracts:', error);
    return { data: [], error };
  }
};

export const getContractsByStatus = async (userId: string, status: ContractStatus) => {
  try {
    const contractsQuery = query(
      collection(firestore, CONTRACTS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const contractsSnap = await getDocs(contractsQuery);
    const contracts: Contract[] = [];
    
    contractsSnap.forEach((doc) => {
      // Convert Firestore timestamps to regular dates
      const data = doc.data();
      const contract = {
        ...data,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
        sentAt: data.sentAt || null,
        signedAt: data.signedAt || null
      } as Contract;
      
      contracts.push(contract);
    });
    
    return { data: contracts, error: null };
  } catch (error) {
    console.error('Error getting contracts by status:', error);
    return { data: [], error };
  }
};

export const getContractById = async (contractId: string) => {
  try {
    const contractsQuery = query(
      collection(firestore, CONTRACTS_COLLECTION),
      where('contractId', '==', contractId)
    );
    
    const contractsSnap = await getDocs(contractsQuery);
    
    if (!contractsSnap.empty) {
      // Convert Firestore timestamps to regular dates
      const data = contractsSnap.docs[0].data();
      const contract = {
        ...data,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
        sentAt: data.sentAt || null,
        signedAt: data.signedAt || null
      } as Contract;
      
      return { data: contract, error: null };
    } else {
      return { data: null, error: 'Contract not found' };
    }
  } catch (error) {
    console.error('Error getting contract:', error);
    return { data: null, error };
  }
};

export const updateContract = async (contractId: string, contractData: Partial<Contract>) => {
  try {
    const contractsQuery = query(
      collection(firestore, CONTRACTS_COLLECTION),
      where('contractId', '==', contractId)
    );
    
    const contractsSnap = await getDocs(contractsQuery);
    
    if (!contractsSnap.empty) {
      const contractRef = contractsSnap.docs[0].ref;
      
      // Handle special status updates
      if (contractData.status) {
        // If changing to sent status, set sentAt
        if (contractData.status === ContractStatus.SENT) {
          (contractData as any).sentAt = Timestamp.now();
        }
        
        // If changing to signed status, set signedAt
        if (contractData.status === ContractStatus.SIGNED) {
          (contractData as any).signedAt = Timestamp.now();
        }
      }
      
      // Always update the updatedAt timestamp
      (contractData as any).updatedAt = Timestamp.now();
      
      await updateDoc(contractRef, contractData);
      return { success: true, error: null };
    } else {
      return { success: false, error: 'Contract not found' };
    }
  } catch (error) {
    console.error('Error updating contract:', error);
    return { success: false, error };
  }
};

export const deleteContract = async (contractId: string) => {
  try {
    const contractsQuery = query(
      collection(firestore, CONTRACTS_COLLECTION),
      where('contractId', '==', contractId)
    );
    
    const contractsSnap = await getDocs(contractsQuery);
    
    if (!contractsSnap.empty) {
      await deleteDoc(contractsSnap.docs[0].ref);
      return { success: true, error: null };
    } else {
      return { success: false, error: 'Contract not found' };
    }
  } catch (error) {
    console.error('Error deleting contract:', error);
    return { success: false, error };
  }
};

export const getPublicContract = async (accessToken: string) => {
  try {
    const contractsQuery = query(
      collection(firestore, CONTRACTS_COLLECTION),
      where('accessToken', '==', accessToken)
    );
    
    const contractsSnap = await getDocs(contractsQuery);
    
    if (!contractsSnap.empty) {
      // Convert Firestore timestamps to regular dates
      const data = contractsSnap.docs[0].data();
      const contract = {
        ...data,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
        sentAt: data.sentAt || null,
        signedAt: data.signedAt || null
      } as Contract;
      
      return { data: contract, error: null };
    } else {
      return { data: null, error: 'Contract not found' };
    }
  } catch (error) {
    console.error('Error getting public contract:', error);
    return { data: null, error };
  }
};