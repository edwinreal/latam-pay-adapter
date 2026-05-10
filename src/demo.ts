import { PaymentAdapter, SecurityVault } from './index.js';
import type { StandardPaymentData } from './interfaces/IPayment.js';

async function demonstrateStandardizedFlow() {
    const vault = SecurityVault.getInstance();
    
    // 1. Iniciamos con Mercado Pago
    console.log('--- TEST 1: MERCADO PAGO ---');
    const handshakeMP = vault.generateHandshake();
    const adapterMP = PaymentAdapter.use('mercadopago');

    const paymentData: StandardPaymentData = {
        amount: 250000,
        currency: 'COP',
        description: 'Pago de Consultoría',
        handshake: handshakeMP,
        customer: {
            email: 'edwin@latam.com',
            firstName: 'Edwin',
            lastName: 'Real',
            document: '123456789'
        }
    };

    const responseMP = await adapterMP.createPayment(paymentData);
    console.log(`Resultado MP: ${responseMP.status} | ID: ${responseMP.id}`);

    // 2. Cambiamos a PayU (Mismo código, diferente adaptador)
    console.log('\n--- TEST 2: PAYU (Conversión a centavos interna) ---');
    const handshakePayU = vault.generateHandshake();
    
    // API FLUIDA
    const responsePayU = await PaymentAdapter.use('payu').createPayment({
        ...paymentData,
        handshake: handshakePayU
    });
    
    console.log(`Resultado PayU: ${responsePayU.status} | ID: ${responsePayU.id}`);
}

demonstrateStandardizedFlow().catch(console.error);
