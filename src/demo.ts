import { 
    GovernanceEngine, 
    RoleLevel
} from './index.js';
import type { IUser } from './index.js';

async function demonstrateGovernance() {
    console.log('--- GOBERNANZA: VALIDACIÓN DE JERARQUÍA ---');
    
    const founder: IUser = { id: 'FOUNDER_001', role: RoleLevel.CDX, accountId: 'ADM-1', lastIp: '1.1.1.1', isSuspended: false };
    const admin: IUser = { id: 'ADMIN_002', role: RoleLevel.ADM, accountId: 'ADM-2', lastIp: '1.1.1.2', isSuspended: false };
    const support: IUser = { id: 'SUP_003', role: RoleLevel.ASR, accountId: 'SUP-1', lastIp: '1.1.1.3', isSuspended: false };

    // 1. Un Administrador intenta tocar al Fundador
    try {
        console.log(`Intento: Admin (${admin.id}) intenta suspender a Founder (${founder.id})...`);
        GovernanceEngine.validateAuthority(admin, founder);
    } catch (e: any) {
        console.error(`Resultado: ${e.message}`); // Bloqueado
    }

    // 2. Un Administrador actúa sobre un Asesor (Permitido)
    try {
        console.log(`\nIntento: Admin (${admin.id}) gestiona permisos de Soporte (${support.id})...`);
        GovernanceEngine.validateAuthority(admin, support);
        console.log('Resultado: Acción Autorizada por Jerarquía.');
    } catch (e: any) {
        console.error(e.message);
    }

    console.log('\n--- PROTOCOLO DE EMERGENCIA: ELEVACIÓN TEMPORAL ---');
    try {
        const elevation = await GovernanceEngine.elevatePermissions(
            admin, 
            RoleLevel.CDX, 
            'Crisis de seguridad en Pasarela MP'
        );
        console.log(`Elevación Exitosa. Token Temporal: ${elevation.token}`);
        console.log(`Expira en: ${new Date(elevation.expiresAt).toLocaleTimeString()}`);
    } catch (e: any) {
        console.error(e.message);
    }
}

demonstrateGovernance();
