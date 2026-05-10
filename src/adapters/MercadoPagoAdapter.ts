import { SecurityVault } from '../security/SecurityVault.js';
import { ErrorMapper, PaymentError } from '../errors/PaymentError.js';
import type { 
    IPaymentAdapter, 
    StandardPaymentData, 
    IPaymentResponse, 
    IRefundRequest, 
    IRefundResponse 
} from '../interfaces/IPayment.js';

export class MercadoPagoAdapter implements IPaymentAdapter {
    name = 'MercadoPago';

    async createPayment(request: StandardPaymentData): Promise<IPaymentResponse> {
        const vault = SecurityVault.getInstance();
        
        if (!vault.validateAndBurn(request.handshake)) {
            throw new Error('[Security] Transacción rechazada: Token ya utilizado.');
        }

        try {
            // "TRADUCCIÓN" al formato de Mercado Pago
            const mpPayload = {
                transaction_amount: request.amount, // No necesita centavos
                description: request.description,
                payer: {
                    email: request.customer.email,
                    first_name: request.customer.firstName,
                    last_name: request.customer.lastName,
                    identification: {
                        type: 'CC',
                        number: request.customer.document
                    }
                }
            };

            console.log(`[${this.name}] Enviando payload traducido:`, JSON.stringify(mpPayload));
            
            // Simulación de respuesta exitosa
            return {
                id: `mp_${Math.random().toString(36).substr(2, 9)}`,
                status: 'approved',
                amount: request.amount,
                currency: request.currency,
                rawResponse: { mp_status: 'approved' }
            };
        } catch (error) {
            throw ErrorMapper.mapMercadoPagoError(error);
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
        console.log(`[${this.name}] Reembolsando pago ${request.paymentId}`);
        return {
            id: `ref_${request.paymentId}`,
            status: 'completed',
            amount: request.amount || 0,
            rawResponse: {}
        };
    }
}
