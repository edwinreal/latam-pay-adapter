import { SecurityVault } from '../security/SecurityVault.js';
import { ErrorMapper } from '../errors/PaymentError.js';
import { toCents } from '../utils/index.js';
import type { 
    IPaymentAdapter, 
    StandardPaymentData, 
    IPaymentResponse, 
    IRefundRequest, 
    IRefundResponse 
} from '../interfaces/IPayment.js';

export class PayUAdapter implements IPaymentAdapter {
    name = 'PayU';

    async createPayment(request: StandardPaymentData): Promise<IPaymentResponse> {
        const vault = SecurityVault.getInstance();
        
        if (!vault.validateAndBurn(request.handshake, request.sessionContext.accountId, request.sessionContext.ip)) {
            throw new Error('[Security] Transacción rechazada: Token ya utilizado.');
        }

        try {
            // "TRADUCCIÓN" al formato de PayU (Ejemplo: usa centavos)
            const payuPayload = {
                transaction: {
                    order: {
                        amount: toCents(request.amount), // TRADUCCIÓN A CENTAVOS
                        currency: request.currency,
                        buyer: {
                            fullName: `${request.customer.firstName} ${request.customer.lastName}`,
                            emailAddress: request.customer.email,
                            dniNumber: request.customer.document
                        }
                    }
                }
            };

            console.log(`[${this.name}] Enviando payload traducido (en centavos):`, JSON.stringify(payuPayload));

            return {
                id: `payu_${Math.random().toString(36).substr(2, 9)}`,
                status: 'pending',
                amount: request.amount,
                currency: request.currency,
                rawResponse: { payu_code: 'SUCCESS' }
            };
        } catch (error) {
            throw ErrorMapper.mapPayUError(error);
        }
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
        console.log(`[${this.name}] Ejecutando reembolso PayU para ${request.paymentId}`);
        return {
            id: `ref_payu_${request.paymentId}`,
            status: 'completed',
            amount: request.amount || 0,
            rawResponse: {}
        };
    }
}
