import { createHmac, randomBytes } from 'node:crypto';

export interface IHandshake {
    keyA: string;      // Public Token (Client side)
    keyB: string;      // Linked Signature (Adapter side)
    expiresAt: number;
}

export class SecurityVault {
    private static instance: SecurityVault;
    private usedKeys: Set<string> = new Set(); // Simulación de caché (Redis en prod)
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
     * Handshake de Doble Canal: Genera un vínculo matemático entre dos llaves
     */
    public generateHandshake(ttlMs: number = 300000): IHandshake {
        const keyA = randomBytes(16).toString('hex');
        const keyB = this.signKey(keyA);
        
        return {
            keyA,
            keyB,
            expiresAt: Date.now() + ttlMs
        };
    }

    /**
     * Validador de Vínculo + Lógica de Autodestrucción
     * Valida que las llaves encajen y las "quema" (incinera) de inmediato.
     */
    public validateAndBurn(handshake: IHandshake): boolean {
        // 1. Verificar caducidad
        if (Date.now() > handshake.expiresAt) return false;

        // 2. Verificar si ya fue usada (Llave Quemada)
        if (this.usedKeys.has(handshake.keyA)) {
            console.error('[SecurityVault] Intento de Re-uso detectado! Llave incinerada.');
            return false;
        }

        // 3. Validador de Vínculo Matemático (HMAC)
        const expectedKeyB = this.signKey(handshake.keyA);
        const isValid = handshake.keyB === expectedKeyB;

        if (isValid) {
            // INCINERADOR: Marcar como usada para siempre
            this.usedKeys.add(handshake.keyA);
            return true;
        }

        return false;
    }

    private signKey(key: string): string {
        return createHmac('sha256', this.secret).update(key).digest('hex');
    }
}
