import type { IPaymentAdapter, IPaymentRequest, IPaymentResponse } from '../interfaces/IPayment.js';

export class KushkiAdapter implements IPaymentAdapter {
    name = 'Kushki';

    async createPayment(request: IPaymentRequest): Promise<IPaymentResponse> {
        console.log(`[${this.name}] Executing payment for ${request.amount} ${request.currency}`);
        return {
            id: `kushki_${Math.random().toString(36).substr(2, 9)}`,
            status: 'approved',
            amount: request.amount,
            currency: request.currency,
            externalReference: request.externalReference,
            rawResponse: { source: 'Kushki Mock' }
        };
    }

    async getPaymentStatus(paymentId: string): Promise<IPaymentResponse> {
        return {
            id: paymentId,
            status: 'approved',
            amount: 0,
            currency: 'USD',
            rawResponse: { source: 'Kushki Mock' }
        };
    }
}
