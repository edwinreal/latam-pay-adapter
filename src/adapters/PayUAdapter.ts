import type { IPaymentAdapter, IPaymentRequest, IPaymentResponse } from '../interfaces/IPayment.js';

export class PayUAdapter implements IPaymentAdapter {
    name = 'PayU';

    async createPayment(request: IPaymentRequest): Promise<IPaymentResponse> {
        console.log(`[${this.name}] Processing payment for ${request.amount} ${request.currency}`);
        return {
            id: `payu_${Math.random().toString(36).substr(2, 9)}`,
            status: 'pending',
            amount: request.amount,
            currency: request.currency,
            externalReference: request.externalReference,
            rawResponse: { source: 'PayU Mock' }
        };
    }

    async getPaymentStatus(paymentId: string): Promise<IPaymentResponse> {
        return {
            id: paymentId,
            status: 'approved',
            amount: 0,
            currency: 'USD',
            rawResponse: { source: 'PayU Mock' }
        };
    }
}
