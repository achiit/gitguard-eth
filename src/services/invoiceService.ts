import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  getDocs,
  orderBy 
} from 'firebase/firestore'
import { firestore } from '../lib/firebase'
import { FirebaseInvoice, AuditEntry } from '../../../shared/schema'
import { generateId } from '../lib/utils'

export class InvoiceService {
  private static collection = 'invoices'

  static async createInvoice(invoice: Omit<FirebaseInvoice, 'invoiceId' | 'createdAt' | 'updatedAt' | 'audit'>): Promise<string> {
    const invoiceId = generateId()
    const now = new Date().toISOString()
    
    const newInvoice: FirebaseInvoice = {
      ...invoice,
      invoiceId,
      audit: [{
        action: 'invoice_created',
        timestamp: now,
        details: { amount: invoice.amount, currency: invoice.currency }
      }],
      createdAt: now,
      updatedAt: now
    }

    await setDoc(doc(firestore, this.collection, invoiceId), newInvoice)
    return invoiceId
  }

  static async getInvoice(invoiceId: string): Promise<FirebaseInvoice | null> {
    const docRef = doc(firestore, this.collection, invoiceId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data() as FirebaseInvoice
    }
    return null
  }

  static async getInvoiceByPayLink(payLinkToken: string): Promise<FirebaseInvoice | null> {
    const q = query(
      collection(firestore, this.collection),
      where('payLinkToken', '==', payLinkToken)
    )
    
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as FirebaseInvoice
    }
    return null
  }

  static async getUserInvoices(userId: string): Promise<FirebaseInvoice[]> {
    const q = query(
      collection(firestore, this.collection),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as FirebaseInvoice)
  }

  static async getAllInvoices(): Promise<FirebaseInvoice[]> {
    const q = query(
      collection(firestore, this.collection),
      orderBy('updatedAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => doc.data() as FirebaseInvoice)
  }

  static async updateInvoiceStatus(
    invoiceId: string, 
    status: 'sent' | 'funded' | 'paid',
    updates: Partial<FirebaseInvoice> = {}
  ): Promise<void> {
    const now = new Date().toISOString()
    const docRef = doc(firestore, this.collection, invoiceId)
    
    // Get current invoice to append to audit trail
    const currentDoc = await getDoc(docRef)
    const currentInvoice = currentDoc.data() as FirebaseInvoice
    
    const auditEntry: AuditEntry = {
      action: `invoice_${status}`,
      timestamp: now,
      details: updates
    }

    const updateData: Partial<FirebaseInvoice> = {
      ...updates,
      status,
      updatedAt: now,
      audit: [...(currentInvoice?.audit || []), auditEntry]
    }

    // Add timestamp fields based on status
    if (status === 'funded') {
      updateData.fundedAt = now
    } else if (status === 'paid') {
      updateData.paidAt = now
    }

    await updateDoc(docRef, updateData)
  }

  static async updateOnchainData(
    invoiceId: string,
    onchainUpdates: Partial<FirebaseInvoice['onchain']>
  ): Promise<void> {
    const docRef = doc(firestore, this.collection, invoiceId)
    const currentDoc = await getDoc(docRef)
    const currentInvoice = currentDoc.data() as FirebaseInvoice
    
    const updatedOnchain = {
      ...currentInvoice.onchain,
      ...onchainUpdates
    }

    await updateDoc(docRef, {
      onchain: updatedOnchain,
      updatedAt: new Date().toISOString()
    })
  }

  static async deleteInvoice(invoiceId: string): Promise<void> {
    const docRef = doc(firestore, this.collection, invoiceId)
    await deleteDoc(docRef)
  }
}