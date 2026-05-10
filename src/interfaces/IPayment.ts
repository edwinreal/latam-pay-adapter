import { ICustomer } from './ICustomer';

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface IPaymentRequest {
    amount: number;
    currency: string;
    description: string;
    customer: ICustomer;
    externalReference?: string;
    metadata?: Record<string, any>;
}

export interface IPaymentResponse {
    id: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    externalReference?: string;
    rawResponse: any; // Original response from the gateway
}

export interface IPaymentAdapter {
    name: string;
    createPayment(request: IPaymentRequest): Promise<IPaymentResponse>;
    getPaymentStatus(paymentId: string): Promise<IPaymentResponse>;
}
