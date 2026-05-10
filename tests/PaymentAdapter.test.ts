import { PaymentAdapter, SecurityVault } from '../src/index.js';

describe('PaymentAdapter & Factory', () => {
    const vault = SecurityVault.getInstance();

    test('should return correct adapter from factory', () => {
        const adapter = PaymentAdapter.use('mercadopago');
        expect(adapter.name).toBe('MercadoPago');
    });

    test('PayUAdapter should translate amount to cents', async () => {
        const adapter = PaymentAdapter.use('payu');
        const handshake = vault.generateHandshake('TEST_USER');
        
        // Espiamos el console.log para verificar la traducción (ya que es un mock)
        const consoleSpy = jest.spyOn(console, 'log');

        await adapter.createPayment({
            amount: 100.50,
            currency: 'USD',
            description: 'Test',
            customer: {
                email: 't@t.com',
                firstName: 'A',
                lastName: 'B',
                document: '123'
            },
            handshake,
            sessionContext: { accountId: 'TEST_USER', ip: '127.0.0.1' }
        });

        // Verificamos que el payload enviado contiene 10050 (centavos)
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('[PayU]'),
            expect.stringContaining('"amount":10050')
        );

        consoleSpy.mockRestore();
    });

    test('MercadoPagoAdapter should maintain decimal amount', async () => {
        const adapter = PaymentAdapter.use('mercadopago');
        const handshake = vault.generateHandshake('TEST_USER_2');
        const consoleSpy = jest.spyOn(console, 'log');

        await adapter.createPayment({
            amount: 100.50,
            currency: 'USD',
            description: 'Test',
            customer: {
                email: 't@t.com',
                firstName: 'A',
                lastName: 'B',
                document: '123'
            },
            handshake,
            sessionContext: { accountId: 'TEST_USER_2', ip: '127.0.0.1' }
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('[MercadoPago]'),
            expect.stringContaining('"transaction_amount":100.5')
        );

        consoleSpy.mockRestore();
    });
});
