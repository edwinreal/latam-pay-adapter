# LATAM Pay Adapter

A unified interface for processing payments across different Latin American gateways.

## Supported Adapters
- [x] MercadoPago
- [x] PayU
- [x] Kushki

## Structure
- `src/interfaces/`: Core language and contracts (IPayment, ICustomer).
- `src/adapters/`: Gateway-specific implementations (Translators).
- `src/constants/`: Currencies and country codes.
- `src/utils/`: Formatting and helper functions.

## Installation
```bash
npm install
```

## Usage
```typescript
import { PaymentAdapterFactory, IPaymentRequest } from './src';

const adapter = PaymentAdapterFactory.getAdapter('mercadopago');

const paymentData: IPaymentRequest = {
    amount: 50000,
    currency: 'COP',
    description: 'Product Purchase',
    customer: {
        email: 'user@example.com',
        firstName: 'Edwin',
        lastName: 'Real'
    }
};

adapter.createPayment(paymentData).then(console.log);
```
