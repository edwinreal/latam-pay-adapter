import { SecurityVault } from '../src/security/SecurityVault.js';
import { PaymentErrorCode } from '../src/errors/PaymentError.js';
describe('SecurityVault', () => {
    let vault;
    beforeEach(() => {
        // Reset singleton instance if necessary or just get it
        vault = SecurityVault.getInstance();
    });
    test('should generate a valid linked handshake', () => {
        const accountId = 'USER_123';
        const handshake = vault.generateHandshake(accountId);
        expect(handshake.accountId).toBe(accountId);
        expect(handshake.keyA).toBeDefined();
        expect(handshake.keyB).toBeDefined();
    });
    test('should validate and burn a correct handshake', () => {
        const accountId = 'USER_123';
        const handshake = vault.generateHandshake(accountId);
        const isValid = vault.validateAndBurn(handshake, accountId, '127.0.0.1');
        expect(isValid).toBe(true);
    });
    test('should block account on account mismatch (Circuit Breaker)', () => {
        const legitimateId = 'USER_LEGIT';
        const attackerId = 'USER_ATTACKER';
        const handshake = vault.generateHandshake(legitimateId);
        // Intentamos usar el token del legítimo con el ID del atacante
        try {
            vault.validateAndBurn(handshake, attackerId, '6.6.6.6');
        }
        catch (error) {
            expect(error.code).toBe(PaymentErrorCode.SECURITY_VIOLATION);
        }
        // Verificar que la cuenta del atacante quedó bloqueada
        try {
            vault.generateHandshake(attackerId);
        }
        catch (error) {
            expect(error.code).toBe(PaymentErrorCode.ACCOUNT_LOCKED);
        }
    });
    test('should prevent token reuse (Burned Key)', () => {
        const accountId = 'USER_456';
        const handshake = vault.generateHandshake(accountId);
        // Primer uso: OK
        vault.validateAndBurn(handshake, accountId);
        // Segundo uso: Falla
        const isSecondValid = vault.validateAndBurn(handshake, accountId);
        expect(isSecondValid).toBe(false);
    });
});
//# sourceMappingURL=SecurityVault.test.js.map