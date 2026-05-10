export enum PaymentErrorCode {
    INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
    CARD_EXPIRED = 'CARD_EXPIRED',
    INVALID_CARD = 'INVALID_CARD',
    FRAUD_DETECTION = 'FRAUD_DETECTION',
    GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    REFUND_FAILED = 'REFUND_FAILED',
    SECURITY_VIOLATION = 'SECURITY_VIOLATION',
    ACCOUNT_LOCKED = 'ACCOUNT_LOCKED'
}

export class PaymentError extends Error {
    constructor(
        public readonly code: PaymentErrorCode,
        public readonly originalError?: any,
        message?: string
    ) {
        super(message || `Payment failed with code: ${code}`);
        this.name = 'PaymentError';
    }
}

export class ErrorMapper {
    /**
     * Traduce errores crípticos a nuestro lenguaje estándar
     */
    static mapMercadoPagoError(error: any): PaymentError {
        // Simulación de mapeo real de MP
        const mpCode = error?.status || error?.code;
        switch (mpCode) {
            case 4002: return new PaymentError(PaymentErrorCode.INVALID_CARD, error, 'La tarjeta es inválida');
            case 'cc_rejected_insufficient_amount': return new PaymentError(PaymentErrorCode.INSUFFICIENT_FUNDS, error);
            default: return new PaymentError(PaymentErrorCode.UNKNOWN_ERROR, error);
        }
    }

    static mapPayUError(error: any): PaymentError {
        // Simulación de mapeo real de PayU
        const payuCode = error?.responseCode;
        switch (payuCode) {
            case 'ANTIFRAUD_REJECTED': return new PaymentError(PaymentErrorCode.FRAUD_DETECTION, error);
            case 'EXPIRED_CARD': return new PaymentError(PaymentErrorCode.CARD_EXPIRED, error);
            default: return new PaymentError(PaymentErrorCode.UNKNOWN_ERROR, error);
        }
    }
}
