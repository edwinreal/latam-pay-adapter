import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto';
import { PaymentError, PaymentErrorCode } from '../errors/PaymentError.js';
import { InMemoryStorage } from './IStorage.js';
import type { IStorage } from './IStorage.js';

export interface IHandshake {
    keyA: string;      
    keyB: string;      
    expiresAt: number;
}

export class SecurityVault {
    private static instance: SecurityVault;
    private storage: IStorage;
    private readonly secret: Buffer;
    private readonly algorithm = 'aes-256-gcm';

    private constructor() {
        const rawSecret = process.env.LATAM_PAY_VAULT_SECRET;
        if (!rawSecret || rawSecret.length < 32) {
            throw new Error('[FATAL] LATAM_PAY_VAULT_SECRET insuficiente.');
        }
        this.secret = createHash('sha256').update(rawSecret).digest();
        this.storage = new InMemoryStorage();
    }

    public static getInstance(): SecurityVault {
        if (!SecurityVault.instance) {
            SecurityVault.instance = new SecurityVault();
        }
        return SecurityVault.instance;
    }

    public async generateSecureHandshake(accountId: string, ttlMs: number = 300000): Promise<IHandshake> {
        if (await this.isLocked(accountId)) {
            throw new PaymentError(PaymentErrorCode.ACCOUNT_LOCKED, null, 'Cuenta suspendida.');
        }

        const keyA = randomBytes(16).toString('hex');
        const iv = randomBytes(12);
        const cipher = createCipheriv(this.algorithm, this.secret, iv) as any;
        
        const adnPayload = JSON.stringify({ accountId, keyA, ts: Date.now() });
        let encryptedAdn = cipher.update(adnPayload, 'utf8', 'hex');
        encryptedAdn += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        const keyB = `${iv.toString('hex')}:${authTag}:${encryptedAdn}`;

        return { keyA, keyB, expiresAt: Date.now() + ttlMs };
    }

    public decryptAdn(keyB: string): { accountId: string, keyA: string } {
        try {
            const [ivHex, tagHex, encryptedData] = keyB.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            const decipher = createDecipheriv(this.algorithm, this.secret, iv) as any;
            decipher.setAuthTag(tag);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return JSON.parse(decrypted);
        } catch (e) {
            throw new Error('FALLO_INTEGRIDAD_ADN');
        }
    }

    public async burn(keyA: string): Promise<void> {
        await this.storage.set(`burned:${keyA}`, Date.now().toString());
        await this.storage.add(keyA);
    }

    public async getBurnedTimestamp(keyA: string): Promise<number | null> {
        const ts = await this.storage.get(`burned:${keyA}`);
        return ts ? parseInt(ts, 10) : null;
    }

    public async isBurned(keyA: string): Promise<boolean> {
        return await this.storage.has(keyA);
    }

    public async lockAccount(accountId: string): Promise<void> {
        await this.storage.add(`lock:${accountId}`);
        console.error(`[ACTIVE DEFENSE] Cuenta ${accountId} SUSPENDIDA.`);
    }

    public async isLocked(accountId: string): Promise<boolean> {
        return await this.storage.has(`lock:${accountId}`);
    }
}
