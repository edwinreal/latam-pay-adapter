export * from './interfaces/IPayment.js';
export * from './interfaces/ICustomer.js';
export * from './adapters/MercadoPagoAdapter.js';
export * from './adapters/PayUAdapter.js';
export * from './adapters/KushkiAdapter.js';
export * from './constants/index.js';
export * from './utils/index.js';
export * from './security/SecurityVault.js';
export * from './security/SecurityInterceptor.js';
export * from './security/IStorage.js';
export * from './services/AdminService.js';
export * from './utils/ReportGenerator.js';
export * from './errors/PaymentError.js';
export * from './errors/SecurityBreachException.js';

import { MercadoPagoAdapter } from './adapters/MercadoPagoAdapter.js';
import { PayUAdapter } from './adapters/PayUAdapter.js';
import { KushkiAdapter } from './adapters/KushkiAdapter.js';
import type { IPaymentAdapter } from './interfaces/IPayment.js';

export type AdapterType = 'mercadopago' | 'payu' | 'kushki';

export class PaymentAdapter {
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
