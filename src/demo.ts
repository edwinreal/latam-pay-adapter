import { PaymentAdapter, SecurityVault, PaymentErrorCode } from './index.js';

// Simulamos la configuración del servidor / variable de entorno
process.env.LATAM_PAY_VAULT_SECRET = 'super_secret_key_for_audit_compliance_32_chars';

async function demonstrateOffensiveSecurity() {
    const vault = SecurityVault.getInstance();
    
    console.log('--- ESCENARIO: INTENTO DE USO DE TOKEN ROBADO (ADN CHECK) ---');
    
    // 1. Generamos un handshake legítimo para el Cliente A
    const legitimateAccountId = 'CLIENTE_LEGITIMO_001';
    const stolenHandshake = vault.generateSecureHandshake(legitimateAccountId);
    console.log(`Token generado con ADN oculto de: ${legitimateAccountId}`);

    // 2. El atacante intenta usar ese token en su propia sesión (Cuenta B)
    const attackerAccountId = 'ATACANTE_HACKER_999';
    const attackerIp = '192.168.1.666';

    console.log(`\nAtacante intenta pagar en la sesión: ${attackerAccountId}...`);

    try {
        await PaymentAdapter.use('mercadopago').createPayment({
            amount: 5000,
            currency: 'USD',
            description: 'Compra Fraudulenta',
            handshake: stolenHandshake,
            sessionContext: {
                accountId: attackerAccountId, // DISCREPANCIA DE ADN
                ip: attackerIp
            },
            customer: {
                email: 'hacker@darkweb.com',
                firstName: 'Malicious',
                lastName: 'User',
                document: '666666'
            }
        });
    } catch (error: any) {
        if (error.code === PaymentErrorCode.SECURITY_VIOLATION) {
            console.error('\n!!! ALERTA DE SEGURIDAD DISPARADA POR INTERCEPTOR !!!');
            console.error('Mensaje:', error.message);
            
            console.log('\n--- VERIFICANDO DEFENSA ACTIVA ---');
            console.log(`¿Cuenta del atacante bloqueada?: ${vault.isLocked(attackerAccountId)}`);
            console.log(`¿Token quemado?: ${vault.isBurned(stolenHandshake.keyA)}`);
        } else {
            console.error('Error inesperado:', error);
        }
    }
}

demonstrateOffensiveSecurity();
