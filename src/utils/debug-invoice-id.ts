import { idFromInvoice } from '../lib/paystream'

/**
 * Debug utility to check if stored invoice ID matches calculated ID
 */
export function debugInvoiceId(invoiceId: string, storedIdHex?: string) {
  const calculatedIdHex = idFromInvoice(invoiceId)
  
  console.log('=== Invoice ID Debug ===')
  console.log('Invoice ID:', invoiceId)
  console.log('Calculated idHex:', calculatedIdHex)
  console.log('Stored idHex:', storedIdHex)
  console.log('Match:', calculatedIdHex === storedIdHex)
  console.log('========================')
  
  return {
    invoiceId,
    calculatedIdHex,
    storedIdHex,
    match: calculatedIdHex === storedIdHex
  }
}