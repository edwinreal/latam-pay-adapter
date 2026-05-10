import { 
    AdminService, 
    ReportGenerator, 
    PaymentAdapter, 
    SecurityVault
} from './index.js';
import type { TransactionRecord } from './index.js';

process.env.LATAM_PAY_VAULT_SECRET = 'super_secret_key_for_audit_compliance_32_chars';

async function demonstrateOperations() {
    const admin = new AdminService();
    const vault = SecurityVault.getInstance();

    console.log('--- SOPORTE: PROCESANDO REEMBOLSO UNIVERSAL ---');
    const refund = await admin.processUniversalRefund('payu', 'payu_12345', 50000);
    console.log(`Estado del Reembolso: ${refund.status} | ID: ${refund.id}\n`);

    console.log('--- AUDITORÍA: RECIBIENDO WEBHOOK DE PASARELA ---');
    admin.logWebhook('mercadopago', { action: 'payment.created', data: { id: 'mp_555' } });

    console.log('\n--- CONTABILIDAD: GENERANDO REPORTE DE CONCILIACIÓN ---');
    const transactions: TransactionRecord[] = [
        { id: '1', gateway: 'mercadopago', amount: 250.50, currency: 'USD', status: 'approved', createdAt: '2026-05-10', externalReference: 'REF-001' },
        { id: '2', gateway: 'payu', amount: 50000, currency: 'COP', status: 'approved', createdAt: '2026-05-10', externalReference: 'REF-002' }
    ];

    const csv = ReportGenerator.generateTransactionCSV(transactions);
    console.log('CSV Contable Generado:');
    console.log(csv);

    console.log('\n--- SOPORTE: CONSOLA DE INCIDENTES ---');
    admin.trackIncident('mercadopago', { code: 'INVALID_CREDENTIALS', message: 'Token de acceso expirado' });
    admin.trackIncident('mercadopago', { code: 'INVALID_CREDENTIALS', message: 'Token de acceso expirado' }); 
    
    console.log('Incidentes detectados:', JSON.stringify(admin.getIncidents(), null, 2));
}

demonstrateOperations();
