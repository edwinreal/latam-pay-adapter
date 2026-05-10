export * from './interfaces/IPayment';
export * from './interfaces/ICustomer';
export * from './adapters/MercadoPagoAdapter';
export * from './adapters/PayUAdapter';
export * from './adapters/KushkiAdapter';
export * from './constants';
export * from './utils';

// Example of a Factory Pattern to get the right adapter
import { MercadoPagoAdapter } from './adapters/MercadoPagoAdapter';
import { PayUAdapter } from './adapters/PayUAdapter';
import { KushkiAdapter } from './adapters/KushkiAdapter';
import { IPaymentAdapter } from './interfaces/IPayment';

export type AdapterType = 'mercadopago' | 'payu' | 'kushki';

export class PaymentAdapterFactory {
    static getAdapter(type: AdapterType): IPaymentAdapter {
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
