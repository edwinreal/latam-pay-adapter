import { SecurityVault } from './SecurityVault.js';
import type { IHandshake } from './SecurityVault.js';
import { SecurityBreachException } from '../errors/SecurityBreachException.js';

export class SecurityInterceptor {
    private vault: SecurityVault;

    constructor() {
        this.vault = SecurityVault.getInstance();
    }

    /**
     * El Corazón de la Validación (ADN Check)
     */
    public validateTransaction(handshake: IHandshake, sessionAccountId: string, ip: string = 'unknown'): void {
        // 1. Verificamos si la cuenta ya está suspendida
        if (this.vault.isLocked(sessionAccountId)) {
            throw new Error('ACCOUNT_SUSPENDED: Su cuenta está bajo investigación de seguridad.');
        }

        // 2. Verificamos si el token ya fue quemado
        if (this.vault.isBurned(handshake.keyA)) {
            throw new Error('TOKEN_ALREADY_BURNED: Intento de reuso detectado.');
        }

        try {
            // 3. EXTRAER ADN OCULTO (Decodificación)
            const dna = this.vault.decryptAdn(handshake.keyB);

            // 4. LA TRAMPA: Verificamos si el ADN de la llave coincide con la cuenta activa
            if (dna.accountId !== sessionAccountId || dna.keyA !== handshake.keyA) {
                // FALLO DE IDENTIDAD: Ejecutamos Protocolo de Defensa Activa
                this.executeDefenseProtocol(handshake, sessionAccountId, ip, 'Account ID DNA Mismatch');
            }

            // Si todo está bien, la llave se quema inmediatamente tras este uso
            this.vault.burn(handshake.keyA);
            console.log(`[SecurityInterceptor] ADN Validado para la cuenta: ${sessionAccountId}. Llave incinerada.`);

        } catch (error: any) {
            if (error instanceof SecurityBreachException) throw error;
            
            // Error en decodificación = Llave manipulada
            this.executeDefenseProtocol(handshake, sessionAccountId, ip, 'Token Tampering Detected');
        }
    }

    private executeDefenseProtocol(handshake: IHandshake, accountId: string, ip: string, reason: string): void {
        // 1. Quemamos la llave inmediatamente
        this.vault.burn(handshake.keyA);
        
        // 2. Bloqueamos la cuenta original por seguridad (Defensa Activa)
        this.vault.lockAccount(accountId);
        
        // 3. Reportamos el intento de robo con excepción personalizada
        throw new SecurityBreachException(accountId, ip, reason);
    }
}
