import { SecurityInterceptor } from '../security/SecurityInterceptor.js';
import type { 
    IPaymentAdapter, 
    StandardPaymentData, 
    IPaymentResponse, 
    IRefundRequest, 
    IRefundResponse 
} from '../interfaces/IPayment.js';

export class KushkiAdapter implements IPaymentAdapter {
    name = 'Kushki';

    async createPayment(request: StandardPaymentData): Promise<IPaymentResponse> {
        const interceptor = new SecurityInterceptor();
        
        await interceptor.validateTransaction(request.handshake, request.sessionContext.accountId, request.sessionContext.ip);

        console.log(`[${this.name}] Procesando transacción para ${request.amount} ${request.currency}`);
        return {
            id: `kushki_${Math.random().toString(36).substr(2, 9)}`,
            status: 'approved',
            amount: request.amount,
            currency: request.currency,
            rawResponse: { source: 'Kushki Mock' }
        };
    }

    async getPaymentStatus(paymentId: string): Promise<IPaymentResponse> {
        return {
            id: paymentId,
            status: 'approved',
            amount: 0,
            currency: 'USD',
            rawResponse: {}
        };
    }

    async refundPayment(request: IRefundRequest): Promise<IRefundResponse> {
        console.log(`[${this.name}] Ejecutando reembolso Kushki para ${request.paymentId}`);
        return {
            id: `ref_kushki_${request.paymentId}`,
            status: 'completed',
            amount: request.amount || 0,
            rawResponse: {}
        };
    }
}
