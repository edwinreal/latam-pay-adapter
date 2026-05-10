import { PaymentError, PaymentErrorCode } from './PaymentError.js';

export class SecurityBreachException extends PaymentError {
    public readonly timestamp: number;
    
    constructor(
        public readonly accountId: string,
        public readonly ip: string,
        public readonly reason: string,
        details?: any
    ) {
        super(PaymentErrorCode.SECURITY_VIOLATION, details, `SECURITY_BREACH: ${reason}. Token Incinerated.`);
        this.name = 'SecurityBreachException';
        this.timestamp = Date.now();
    }
}
