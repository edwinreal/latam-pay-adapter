import { SecurityVault } from './SecurityVault.js';
import type { IHandshake } from './SecurityVault.js';
import type { IStorage } from './IStorage.js';
import { SecurityBreachException } from '../errors/SecurityBreachException.js';

export class SecurityInterceptor {
    private vault: SecurityVault;
    private readonly IDEMPOTENCY_WINDOW_MS = 5000; // 5 segundos para reintentos de red

    constructor() {
        this.vault = SecurityVault.getInstance();
    }

    public async validateTransaction(handshake: IHandshake, sessionAccountId: string, ip: string = 'unknown'): Promise<void> {
        // 1. Verificar bloqueo de cuenta
        if (await this.vault.isLocked(sessionAccountId)) {
            throw new Error('ACCOUNT_SUSPENDED: Su cuenta está bajo investigación.');
        }

        // 2. ADN CHECK inicial (necesario para verificar la identidad antes de cualquier lógica)
        const dna = this.vault.decryptAdn(handshake.keyB);

        // 3. LOGICA DE IDEMPOTENCIA (Anti-Falsos Positivos)
        if (await this.vault.isBurned(handshake.keyA)) {
            const burnedAt = await this.vault.getBurnedTimestamp(handshake.keyA);
            
            // Si fue quemado hace muy poco Y la identidad coincide, es un reintento de red
            if (burnedAt && (Date.now() - burnedAt < this.IDEMPOTENCY_WINDOW_MS)) {
                if (dna.accountId === sessionAccountId) {
                    console.warn(`[SecurityInterceptor] Reintento de red detectado (Idempotencia). Ignorando duplicado.`);
                    return; // Permitimos pasar sin re-quemar ni bloquear
                }
            }

            // Si no cumple la ventana, es un ataque de repetición real
            await this.executeDefenseProtocol(handshake, sessionAccountId, ip, 'Replay Attack Detected (Outside Idempotency Window)');
        }

        // 4. VALIDACIÓN DE ADN FINAL
        if (dna.accountId !== sessionAccountId || dna.keyA !== handshake.keyA) {
            await this.executeDefenseProtocol(handshake, sessionAccountId, ip, 'Account ID DNA Mismatch');
        }

        // TODO OK: Incinerar llave
        await this.vault.burn(handshake.keyA);
        console.log(`[SecurityInterceptor] ADN Validado. Llave incinerada para: ${sessionAccountId}.`);
    }

    private async executeDefenseProtocol(handshake: IHandshake, accountId: string, ip: string, reason: string): Promise<void> {
        await this.vault.burn(handshake.keyA);
        await this.vault.lockAccount(accountId);
        throw new SecurityBreachException(accountId, ip, reason);
    }
}
