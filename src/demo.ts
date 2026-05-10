import { PaymentAdapter, SecurityVault } from './index.js';
import { PaymentErrorCode } from './errors/PaymentError.js';

async function demonstrateOffensiveSecurity() {
    const vault = SecurityVault.getInstance();
    const adapter = PaymentAdapter.use('mercadopago');

    console.log('--- ESCENARIO: INTENTO DE USO DE TOKEN ROBADO ---');
    
    // 1. Un atacante roba un handshake generado legítimamente para la Cuenta A
    const legitimateAccountId = 'CLIENTE_LEGITIMO_001';
    const stolenHandshake = vault.generateHandshake(legitimateAccountId);
    console.log(`Token robado de la cuenta: ${legitimateAccountId}`);

    // 2. El atacante intenta usar ese token en su propia sesión (Cuenta B)
    const attackerAccountId = 'ATACANTE_HACKER_999';
    const attackerIp = '192.168.1.666';

    console.log(`\nAtacante intenta pagar en la sesión: ${attackerAccountId}...`);

    try {
        await adapter.createPayment({
            amount: 5000,
            currency: 'USD',
            description: 'Compra Fraudulenta',
            handshake: stolenHandshake,
            sessionContext: {
                accountId: attackerAccountId, // DISCREPANCIA DETECTADA AQUÍ
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
            console.error('\n!!! ALERTA DE SEGURIDAD !!!');
            console.error('Mensaje:', error.message);
            
            // 3. Verificar que las cuentas están bloqueadas
            console.log('\n--- ESTADO DEL SISTEMA TRAS EL ATAQUE ---');
            const logs = vault.getAuditLogs();
            console.log('Logs de Auditoría Generados:', JSON.stringify(logs, null, 2));
            
            try {
                console.log('\nIntentando generar un nuevo handshake para el atacante...');
                vault.generateHandshake(attackerAccountId);
            } catch (e: any) {
                console.log('Resultado:', e.message); // Debería decir que la cuenta está bloqueada
            }
        } else {
            console.error('Error inesperado:', error);
        }
    }
}

demonstrateOffensiveSecurity();
