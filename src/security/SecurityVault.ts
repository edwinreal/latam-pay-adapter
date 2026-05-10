import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
import { PaymentError, PaymentErrorCode } from '../errors/PaymentError.js';

export interface IHandshake {
    keyA: string;      
    keyB: string;      
    expiresAt: number;
}

export class SecurityVault {
    private static instance: SecurityVault;
    private usedKeys: Map<string, number> = new Map(); // keyA -> timestamp (para idempotencia)
    private lockedAccounts: Set<string> = new Set();
    private readonly secret: Buffer;
    private readonly algorithm = 'aes-256-gcm'; // CAMBIO A GCM (Cifrado Autenticado)

    private constructor() {
        const rawSecret = process.env.LATAM_PAY_VAULT_SECRET;
        
        // AUDITORÍA: Prohibir secretos por defecto en producción
        if (!rawSecret || rawSecret.length < 32) {
            throw new Error('[FATAL] LATAM_PAY_VAULT_SECRET no definido o muy corto. La seguridad no puede ser comprometida.');
        }
        
        this.secret = createHash('sha256').update(rawSecret).digest();
    }

    public static getInstance(): SecurityVault {
        if (!SecurityVault.instance) {
            SecurityVault.instance = new SecurityVault();
        }
        return SecurityVault.instance;
    }

    public generateSecureHandshake(accountId: string, ttlMs: number = 300000): IHandshake {
        if (this.lockedAccounts.has(accountId)) {
            throw new PaymentError(PaymentErrorCode.ACCOUNT_LOCKED, null, 'Cuenta suspendida.');
        }

        const keyA = randomBytes(16).toString('hex');
        const iv = randomBytes(12); // GCM recomienda 12 bytes de IV
        const cipher = createCipheriv(this.algorithm, this.secret, iv) as any;
        
        const adnPayload = JSON.stringify({ accountId, keyA, ts: Date.now() });
        let encryptedAdn = cipher.update(adnPayload, 'utf8', 'hex');
        encryptedAdn += cipher.final('hex');
        
        // Obtenemos el Authentication Tag (Solo en GCM)
        const authTag = cipher.getAuthTag().toString('hex');

        // Formato: IV : TAG : DATA
        const keyB = `${iv.toString('hex')}:${authTag}:${encryptedAdn}`;

        return {
            keyA,
            keyB,
            expiresAt: Date.now() + ttlMs
        };
    }

    public decryptAdn(keyB: string): { accountId: string, keyA: string } {
        try {
            const [ivHex, tagHex, encryptedData] = keyB.split(':');
            if (!ivHex || !tagHex || !encryptedData) throw new Error();

            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            const decipher = createDecipheriv(this.algorithm, this.secret, iv) as any;
            
            decipher.setAuthTag(tag); // Validamos la integridad del mensaje
            
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return JSON.parse(decrypted);
        } catch (e) {
            throw new Error('FALLO_INTEGRIDAD_ADN: La llave ha sido manipulada o el secreto es incorrecto.');
        }
    }

    public burn(keyA: string): void {
        this.usedKeys.set(keyA, Date.now());
    }

    public isBurned(keyA: string): boolean {
        return this.usedKeys.has(keyA);
    }

    public lockAccount(accountId: string): void {
        this.lockedAccounts.add(accountId);
    }

    public isLocked(accountId: string): boolean {
        return this.lockedAccounts.has(accountId);
    }
}
