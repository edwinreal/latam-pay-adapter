import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
import { PaymentError, PaymentErrorCode } from '../errors/PaymentError.js';

export interface IHandshake {
    keyA: string;      // Token público
    keyB: string;      // "ADN de Llave": accountId cifrado + firma
    expiresAt: number;
}

export class SecurityVault {
    private static instance: SecurityVault;
    private usedKeys: Set<string> = new Set();
    private lockedAccounts: Set<string> = new Set();
    private readonly secret: Buffer;
    private readonly algorithm = 'aes-256-cbc';

    private constructor() {
        // Derivamos una clave de 32 bytes de nuestro secreto de entorno
        const rawSecret = process.env.LATAM_PAY_VAULT_SECRET || 'default_secret_key_32_chars_long!!';
        this.secret = createHash('sha256').update(rawSecret).digest();
    }

    public static getInstance(): SecurityVault {
        if (!SecurityVault.instance) {
            SecurityVault.instance = new SecurityVault();
        }
        return SecurityVault.instance;
    }

    /**
     * Generación de Llave con ADN Oculto (Account Identity Anchoring)
     */
    public generateSecureHandshake(accountId: string, ttlMs: number = 300000): IHandshake {
        if (this.lockedAccounts.has(accountId)) {
            throw new PaymentError(PaymentErrorCode.ACCOUNT_LOCKED, null, 'Cuenta suspendida.');
        }

        const keyA = randomBytes(16).toString('hex');
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.secret, iv);
        
        // El ADN incluye el accountId y la keyA para vinculación total
        const adnPayload = JSON.stringify({ accountId, keyA, ts: Date.now() });
        let encryptedAdn = cipher.update(adnPayload, 'utf8', 'hex');
        encryptedAdn += cipher.final('hex');

        // La keyB es el IV + el ADN cifrado (formato legible para transporte)
        const keyB = `${iv.toString('hex')}:${encryptedAdn}`;

        return {
            keyA,
            keyB,
            expiresAt: Date.now() + ttlMs
        };
    }

    /**
     * El "ADN Check": Extrae la identidad oculta en la llave
     */
    public decryptAdn(keyB: string): { accountId: string, keyA: string } {
        try {
            const [ivHex, encryptedData] = keyB.split(':');
            if (!ivHex || !encryptedData) throw new Error();

            const iv = Buffer.from(ivHex, 'hex');
            const decipher = createDecipheriv(this.algorithm, this.secret, iv);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return JSON.parse(decrypted);
        } catch (e) {
            throw new Error('FALLO_DECRIPT_ADN: Llave corrupta o manipulada.');
        }
    }

    public burn(keyA: string): void {
        this.usedKeys.add(keyA);
    }

    public isBurned(keyA: string): boolean {
        return this.usedKeys.has(keyA);
    }

    public lockAccount(accountId: string): void {
        this.lockedAccounts.add(accountId);
        console.error(`[ACTIVE DEFENSE] Cuenta ${accountId} ha sido SUSPENDIDA.`);
    }

    public isLocked(accountId: string): boolean {
        return this.lockedAccounts.has(accountId);
    }
}
