import { InvoiceService } from '../services/invoiceService'
import { idFromInvoice } from '../lib/paystream'

/**
 * Fix existing invoices that have incorrect idHex stored
 */
export async function fixInvoiceIds() {
  try {
    console.log('Starting invoice ID fix...')
    
    // Get all invoices
    const invoices = await InvoiceService.getAllInvoices()
    
    let fixedCount = 0
    let totalCount = invoices.length
    
    for (const invoice of invoices) {
      const correctIdHex = idFromInvoice(invoice.invoiceId)
      
      if (invoice.onchain?.idHex && invoice.onchain.idHex !== correctIdHex) {
        console.log(`Fixing invoice ${invoice.invoiceId}:`)
        console.log(`  Old idHex: ${invoice.onchain.idHex}`)
        console.log(`  New idHex: ${correctIdHex}`)
        
        // Update the invoice with correct idHex
        await InvoiceService.updateOnchainData(invoice.invoiceId, {
          idHex: correctIdHex
        })
        
        fixedCount++
      }
    }
    
    console.log(`Fixed ${fixedCount} out of ${totalCount} invoices`)
    return { fixedCount, totalCount }
    
  } catch (error) {
    console.error('Error fixing invoice IDs:', error)
    throw error
  }
}

/**
 * Fix a single invoice ID if it's incorrect
 */
export async function fixSingleInvoiceId(invoiceId: string): Promise<boolean> {
  try {
    const invoice = await InvoiceService.getInvoice(invoiceId)
    if (!invoice) {
      console.error('Invoice not found:', invoiceId)
      return false
    }
    
    const correctIdHex = idFromInvoice(invoiceId)
    
    if (invoice.onchain?.idHex !== correctIdHex) {
      console.log(`Fixing invoice ${invoiceId}:`)
      console.log(`  Old idHex: ${invoice.onchain?.idHex}`)
      console.log(`  New idHex: ${correctIdHex}`)
      
      await InvoiceService.updateOnchainData(invoiceId, {
        idHex: correctIdHex
      })
      
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error fixing single invoice ID:', error)
    return false
  }
}