import { RoleLevel } from './IRoles.js';
import type { IUser } from './IRoles.js';

export class GovernanceEngine {
    
    /**
     * Middleware de Jerarquía: Inviolabilidad de niveles superiores
     */
    public static validateAuthority(actor: IUser, target: IUser): void {
        if (actor.role <= target.role && actor.id !== target.id) {
            throw new Error(`VIOLACIÓN_DE_JERARQUÍA: El Nivel ${actor.role} no tiene autoridad sobre el Nivel ${target.role}.`);
        }
    }

    /**
     * Protocolo de Emergencia: Elevación Temporal (2h)
     */
    public static async elevatePermissions(
        actor: IUser, 
        targetLevel: RoleLevel,
        justification: string
    ): Promise<{ token: string, expiresAt: number }> {
        if (actor.role < RoleLevel.ADM) {
            throw new Error('Permisos insuficientes para activar protocolo de emergencia.');
        }

        console.log(`[EMERGENCY] Elevando ${actor.id} a Nivel ${targetLevel}. Razón: ${justification}`);
        
        const expiresAt = Date.now() + (2 * 60 * 60 * 1000); // 2 Horas
        
        // Aquí se generaría un token de acceso temporal firmado
        return {
            token: `TEMP_ELEVATION_${Math.random().toString(36).substring(7)}`,
            expiresAt
        };
    }

    /**
     * Conciliación Forense (Webhook vs Ledger)
     */
    public static reconcile(webhookData: any, internalLedger: any): boolean {
        const isMatch = webhookData.amount === internalLedger.amount && 
                        webhookData.id === internalLedger.externalId;
        
        if (!isMatch) {
            console.error('[FORENSIC] DISCREPANCIA DETECTADA. Activando auditoría de Ledger.');
        }
        
        return isMatch;
    }
}
