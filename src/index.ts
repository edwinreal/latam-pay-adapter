export * from './interfaces/IPayment.js';
export * from './interfaces/ICustomer.js';
export * from './adapters/MercadoPagoAdapter.js';
export * from './adapters/PayUAdapter.js';
export * from './adapters/KushkiAdapter.js';
export * from './constants/index.js';
export * from './utils/index.js';
export * from './security/SecurityVault.js';
export * from './errors/PaymentError.js';

import { MercadoPagoAdapter } from './adapters/MercadoPagoAdapter.js';
import { PayUAdapter } from './adapters/PayUAdapter.js';
import { KushkiAdapter } from './adapters/KushkiAdapter.js';
import type { IPaymentAdapter } from './interfaces/IPayment.js';

export type AdapterType = 'mercadopago' | 'payu' | 'kushki';

/**
 * El Gestor de Adaptadores (Fábrica con API Fluida)
 */
export class PaymentAdapter {
    /**
     * Permite una sintaxis fluida: PaymentAdapter.use('payu').createPayment(...)
     */
    static use(type: AdapterType): IPaymentAdapter {
        switch (type) {
            case 'mercadopago':
                return new MercadoPagoAdapter();
            case 'payu':
                return new PayUAdapter();
            case 'kushki':
                return new KushkiAdapter();
            default:
                throw new Error(`Adapter ${type} not supported`);
        }
    }
}
