import { createHmac, randomBytes } from 'node:crypto';
import { PaymentError, PaymentErrorCode } from '../errors/PaymentError.js';

export interface IHandshake {
    keyA: string;      // Public Token
    keyB: string;      // Signature (Linked to keyA + accountId)
    accountId: string; // Inmutable Account Identifier
    expiresAt: number;
}

export interface AuditLog {
    timestamp: number;
    accountId: string;
    action: string;
    details: any;
    severity: 'LOW' | 'HIGH' | 'CRITICAL';
}

export class SecurityVault {
    private static instance: SecurityVault;
    private usedKeys: Set<string> = new Set();
    private lockedAccounts: Set<string> = new Set();
    private auditLogs: AuditLog[] = [];
    private readonly secret: string;

    private constructor() {
        this.secret = process.env.LATAM_PAY_VAULT_SECRET || randomBytes(32).toString('hex');
    }

    public static getInstance(): SecurityVault {
        if (!SecurityVault.instance) {
            SecurityVault.instance = new SecurityVault();
        }
        return SecurityVault.instance;
    }

    /**
     * Generación de Llave con Hash Vinculado a la Cuenta
     */
    public generateHandshake(accountId: string, ttlMs: number = 300000): IHandshake {
        if (this.lockedAccounts.has(accountId)) {
            throw new PaymentError(PaymentErrorCode.ACCOUNT_LOCKED, null, 'Esta cuenta ha sido bloqueada por violaciones de seguridad.');
        }

        const keyA = randomBytes(16).toString('hex');
        const keyB = this.signKey(keyA, accountId);
        
        return {
            keyA,
            keyB,
            accountId,
            expiresAt: Date.now() + ttlMs
        };
    }

    /**
     * Protocolo de Bloqueo (Circuit Breaker) e Integridad de Cuenta
     */
    public validateAndBurn(handshake: IHandshake, sessionAccountId: string, ip: string = 'unknown'): boolean {
        // 1. Verificar si la cuenta ya está bloqueada
        if (this.lockedAccounts.has(sessionAccountId)) {
            throw new PaymentError(PaymentErrorCode.ACCOUNT_LOCKED);
        }

        // 2. Validador de Integridad de Cuenta (IAB)
        // El accountID del token DEBE coincidir con el de la sesión activa
        if (handshake.accountId !== sessionAccountId) {
            this.triggerCircuitBreaker(handshake, sessionAccountId, ip, 'ACCOUNT_MISMATCH');
            return false;
        }

        // 3. Verificar caducidad y re-uso
        if (Date.now() > handshake.expiresAt || this.usedKeys.has(handshake.keyA)) {
            this.usedKeys.add(handshake.keyA); // Aseguramos que se queme
            return false;
        }

        // 4. Verificar firma matemática vinculada
        const expectedKeyB = this.signKey(handshake.keyA, handshake.accountId);
        if (handshake.keyB !== expectedKeyB) {
            this.triggerCircuitBreaker(handshake, sessionAccountId, ip, 'SIGNATURE_VIOLATION');
            return false;
        }

        // TODO OK: Quemar llave y permitir acceso
        this.usedKeys.add(handshake.keyA);
        return true;
    }

    private triggerCircuitBreaker(handshake: IHandshake, sessionAccountId: string, ip: string, reason: string): void {
        // A. Quemar la llave de inmediato
        this.usedKeys.add(handshake.keyA);

        // B. BLOQUEAR CUENTA DEL CLIENTE
        this.lockedAccounts.add(sessionAccountId);
        this.lockedAccounts.add(handshake.accountId);

        // C. GENERAR LOG DE AUDITORÍA FORENSE
        const log: AuditLog = {
            timestamp: Date.now(),
            accountId: sessionAccountId,
            action: 'SECURITY_LOCKOUT',
            severity: 'CRITICAL',
            details: {
                reason,
                attemptedAccountId: handshake.accountId,
                ipAddress: ip,
                tokenKeyA: handshake.keyA
            }
        };
        this.auditLogs.push(log);
        
        console.error(`[CIRCUIT BREAKER] Violación de Seguridad Detectada: ${reason}. Cuentas bloqueadas y auditoría generada.`);
        
        throw new PaymentError(PaymentErrorCode.SECURITY_VIOLATION, log, 'Protocolo de seguridad activado. Su acceso ha sido revocado.');
    }

    private signKey(key: string, accountId: string): string {
        return createHmac('sha256', this.secret)
            .update(`${key}:${accountId}`) // Vinculamos la llave con el ID de cuenta
            .digest('hex');
    }

    public getAuditLogs(): AuditLog[] {
        return [...this.auditLogs];
    }
}
