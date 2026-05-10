import { PaymentAdapter } from '../index.js';
import type { AdapterType } from '../index.js';
import type { IRefundRequest, IRefundResponse } from '../interfaces/IPayment.js';

export interface WebhookLog {
    gateway: AdapterType;
    payload: any;
    receivedAt: number;
    status: 'PROCESSED' | 'FAILED' | 'RETRYING';
}

export interface IncidentReport {
    code: string;
    message: string;
    count: number;
    lastOccurrence: number;
    affectedGateways: Set<AdapterType>;
}

export class AdminService {
    private webhookLogs: WebhookLog[] = [];
    private incidents: Map<string, IncidentReport> = new Map();

    public async processUniversalRefund(
        gateway: AdapterType, 
        paymentId: string, 
        amount?: number
    ): Promise<IRefundResponse> {
        console.log(`[Admin] Iniciando reembolso universal en ${gateway} para ID: ${paymentId}`);
        const adapter = PaymentAdapter.use(gateway);
        
        const request: IRefundRequest = {
            paymentId,
            amount,
            reason: 'Soporte Administrativo / Customer Request'
        };

        return await adapter.refundPayment(request);
    }

    public logWebhook(gateway: AdapterType, payload: any): void {
        const log: WebhookLog = {
            gateway,
            payload,
            receivedAt: Date.now(),
            status: 'PROCESSED'
        };
        this.webhookLogs.push(log);
        console.log(`[WebhookAudit] Notificación de ${gateway} registrada para auditoría.`);
    }

    public trackIncident(gateway: AdapterType, error: any): void {
        const code = error.code || 'UNKNOWN_ERROR';
        const existing = this.incidents.get(code);

        if (existing) {
            existing.count++;
            existing.lastOccurrence = Date.now();
            existing.affectedGateways.add(gateway);
        } else {
            this.incidents.set(code, {
                code,
                message: error.message,
                count: 1,
                lastOccurrence: Date.now(),
                affectedGateways: new Set([gateway])
            });
        }
    }

    public getIncidents(): IncidentReport[] {
        return Array.from(this.incidents.values());
    }

    public getWebhookHistory(): WebhookLog[] {
        return [...this.webhookLogs];
    }
}
