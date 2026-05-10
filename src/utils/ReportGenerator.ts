import type { IPaymentResponse } from '../interfaces/IPayment.js';
import type { AdapterType } from '../index.js';

export interface TransactionRecord {
    id: string;
    gateway: AdapterType;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    externalReference: string;
}

export class ReportGenerator {
    /**
     * Genera un CSV de conciliación contable
     */
    public static generateTransactionCSV(records: TransactionRecord[]): string {
        const header = 'ID,Pasarela,Monto,Moneda,Estado,Fecha,Referencia\n';
        
        const rows = records.map(r => {
            return `${r.id},${r.gateway},${r.amount},${r.currency},${r.status},${r.createdAt},${r.externalReference}`;
        }).join('\n');

        return header + rows;
    }
}
