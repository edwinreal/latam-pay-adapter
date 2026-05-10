import { PaymentAdapter, SecurityVault, PaymentErrorCode } from './index.js';

process.env.LATAM_PAY_VAULT_SECRET = 'super_secret_key_for_audit_compliance_32_chars';

async function demonstrateAdvancedFeatures() {
    const vault = SecurityVault.getInstance();
    
    console.log('--- ESCENARIO 1: REINTENTO LEGÍTIMO (VENTANA DE IDEMPOTENCIA) ---');
    const accountId = 'CLIENTE_IDEMPOTENTE_001';
    const handshake = await vault.generateSecureHandshake(accountId);

    const paymentParams = {
        amount: 100,
        currency: 'USD',
        description: 'Pago con reintento',
        handshake: handshake,
        sessionContext: { accountId: accountId, ip: '1.1.1.1' },
        customer: { email: 'e@e.com', firstName: 'E', lastName: 'R', document: '1' }
    };

    // Primera llamada
    console.log('Petición 1...');
    await PaymentAdapter.use('mercadopago').createPayment(paymentParams);

    // Segunda llamada inmediata (Falso Positivo evitado)
    console.log('Petición 2 (Inmediata)...');
    try {
        await PaymentAdapter.use('mercadopago').createPayment(paymentParams);
        console.log('Resultado: Permitido por ventana de idempotencia.');
    } catch (e: any) {
        console.error('Error (No debería ocurrir):', e.message);
    }

    console.log('\n--- ESCENARIO 2: ATAQUE DE REPETICIÓN (FUERA DE VENTANA) ---');
    console.log('Esperando 6 segundos...');
    await new Promise(resolve => setTimeout(resolve, 6000));

    try {
        console.log('Petición 3 (Fuera de ventana)...');
        await PaymentAdapter.use('mercadopago').createPayment(paymentParams);
    } catch (e: any) {
        console.log('Bloqueado con éxito:', e.message);
    }
}

demonstrateAdvancedFeatures();
