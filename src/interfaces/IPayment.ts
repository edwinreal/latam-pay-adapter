import type { ICustomer } from './ICustomer.js';
import type { IHandshake } from '../security/SecurityVault.js';

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

/**
 * El Modelo Único de Datos (Idioma Estándar)
 */
export interface StandardPaymentData {
    amount: number;
    currency: string;
    description: string;
    customer: ICustomer;
    handshake: IHandshake;
    sessionContext: {
        accountId: string;
        ip: string;
    };
    externalReference?: string;
    metadata?: Record<string, any>;
}

export interface IPaymentResponse {
    id: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    externalReference?: string;
    rawResponse: any;
}

export interface IRefundRequest {
    paymentId: string;
    amount?: number;
    reason?: string;
}

export interface IRefundResponse {
    id: string;
    status: 'completed' | 'failed';
    amount: number;
    rawResponse: any;
}

/**
 * La Interfaz Estándar que deben implementar todos los "Traductores"
 */
export interface IPaymentAdapter {
    name: string;
    createPayment(request: StandardPaymentData): Promise<IPaymentResponse>;
    getPaymentStatus(paymentId: string): Promise<IPaymentResponse>;
    refundPayment(request: IRefundRequest): Promise<IRefundResponse>;
}
