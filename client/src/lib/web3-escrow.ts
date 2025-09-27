import { InvoiceService } from '../services/invoiceService'
import { createOnchainInvoice } from '../actions/createOnchainInvoice'
import { FirebaseInvoice, FirebaseContract } from '../../../shared/schema'
import { generateId } from './utils'
import { WPYUSD, idFromInvoice } from './paystream'

export interface EscrowConfig {
    tokenAddress: string;
    decimals: number;
    chainId: number;
    payeeWallet: string;
}

export interface EscrowInvoice {
    invoiceId: string;
    contractId: string;
    amount: number;
    currency: string;
    escrowAddress?: string;
    transactionHash?: string;
    status: 'created' | 'funded' | 'released' | 'disputed';
}

export class Web3EscrowService {
    static async createInvoiceFromContract(contract: FirebaseContract): Promise<string> {
        const invoiceId = generateId()
        const payLinkToken = generateId()

        // Auto-release after 30 days
        const autoReleaseAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)

        // Create invoice in Firestore first to get the actual invoice ID
        const tempInvoice: Omit<FirebaseInvoice, 'invoiceId' | 'createdAt' | 'updatedAt' | 'audit'> = {
            contractId: contract.contractId,
            userId: contract.userId,
            clientId: contract.clientInfo.clientId || 'unknown',
            currency: contract.paymentTerms.currency,
            amount: contract.paymentTerms.amount,
            status: 'sent',
            payLinkToken,
            onchain: {
                chainId: Number(import.meta.env.VITE_CHAIN_ID),
                escrow: import.meta.env.VITE_ESCROW_ADDRESS,
                idHex: '', // Will be set after we get the actual invoice ID
                token: WPYUSD,
                amount: (contract.paymentTerms.amount * 1_000_000).toString(), // Convert to 6 decimals
                state: 'created',
                payee: contract.paymentTerms.payeeWallet || '0x0000000000000000000000000000000000000000'
            }
        }

        const createdInvoiceId = await InvoiceService.createInvoice(tempInvoice)
        
        // Now calculate the correct idHex using the actual invoice ID
        const correctIdHex = idFromInvoice(createdInvoiceId)
        
        // Update the invoice with the correct idHex
        await InvoiceService.updateOnchainData(createdInvoiceId, {
            idHex: correctIdHex
        })

        // Create invoice on-chain
        try {
            const { txHash } = await createOnchainInvoice({
                invoiceId: createdInvoiceId,
                payee: tempInvoice.onchain.payee as `0x${string}`,
                amountUsd: tempInvoice.amount,
                autoReleaseAt,
                metaURI: `Invoice for contract ${contract.contractId}`
            })

            // Update invoice with transaction hash
            await InvoiceService.updateOnchainData(createdInvoiceId, {
                state: 'created'
            })

            console.log('Invoice created on-chain:', txHash)
        } catch (error) {
            console.error('Failed to create invoice on-chain:', error)
            // Continue with Firestore-only invoice for now
        }

        return createdInvoiceId
    }

    static async createEscrow(config: EscrowConfig, amount: number): Promise<string> {
        // Legacy method - kept for compatibility
        console.log('Creating escrow with config:', config, 'amount:', amount);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return '0x' + Math.random().toString(16).substring(2, 42);
    }

    static async fundEscrow(escrowAddress: string, amount: number): Promise<string> {
        // Legacy method - kept for compatibility
        console.log('Funding escrow:', escrowAddress, 'amount:', amount);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return '0x' + Math.random().toString(16).substring(2, 66);
    }

    static async releaseEscrow(escrowAddress: string): Promise<string> {
        // Legacy method - kept for compatibility
        console.log('Releasing escrow:', escrowAddress);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return '0x' + Math.random().toString(16).substring(2, 66);
    }

    static async getEscrowStatus(escrowAddress: string): Promise<'created' | 'funded' | 'released' | 'disputed'> {
        // Legacy method - kept for compatibility
        const statuses = ['created', 'funded', 'released', 'disputed'] as const;
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    static getPaymentConfig(currency: string, payeeWallet?: string): EscrowConfig {
        if (currency === 'USD') {
            return {
                tokenAddress: WPYUSD,
                decimals: 6,
                chainId: Number(import.meta.env.VITE_CHAIN_ID),
                payeeWallet: payeeWallet || '0x0000000000000000000000000000000000000000'
            };
        }

        throw new Error(`Unsupported currency: ${currency}`);
    }
}

// PYUSD Configuration for Citrea Testnet
export const PYUSD_CONFIG = {
    address: WPYUSD,
    decimals: 6,
    symbol: 'wPYUSD',
    chainId: Number(import.meta.env.VITE_CHAIN_ID),
};

// Hook for using Web3 escrow in components
export const useWeb3Escrow = () => {
    return {
        escrowService: Web3EscrowService,
        PYUSD_CONFIG,
        ESCROW_CONTRACT_ADDRESS: import.meta.env.VITE_ESCROW_ADDRESS,
    };
};