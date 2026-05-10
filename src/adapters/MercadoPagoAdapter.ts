import type { IPaymentAdapter, IPaymentRequest, IPaymentResponse } from '../interfaces/IPayment.js';

export class MercadoPagoAdapter implements IPaymentAdapter {
    name = 'MercadoPago';

    async createPayment(request: IPaymentRequest): Promise<IPaymentResponse> {
        console.log(`[${this.name}] Creating payment for ${request.amount} ${request.currency}`);
        // Here would go the actual logic for MercadoPago API
        return {
            id: `mp_${Math.random().toString(36).substr(2, 9)}`,
            status: 'approved',
            amount: request.amount,
            currency: request.currency,
            externalReference: request.externalReference,
            rawResponse: { source: 'MercadoPago Mock' }
        };
    }

    async getPaymentStatus(paymentId: string): Promise<IPaymentResponse> {
        console.log(`[${this.name}] Fetching status for ${paymentId}`);
        return {
            id: paymentId,
            status: 'approved',
            amount: 0,
            currency: 'USD',
            rawResponse: { source: 'MercadoPago Mock' }
        };
    }
}
