export enum RoleLevel {
    CLT = 1, // Empresa Cliente
    CNT = 2, // Contador
    ASR = 3, // Asesor de Soporte
    ADM = 4, // Administrador
    CDX = 5  // Super Admin (Chief Digital Officer / Founder)
}

export interface IUser {
    id: string;
    role: RoleLevel;
    accountId: string;
    lastIp: string;
    isSuspended: boolean;
}

/**
 * Reporte del Fundador (R38)
 */
export interface IFounderReportR38 {
    weekRange: string;
    totalProcessed: number;
    successRate: number;
    fraudAttemptsBlocked: number;
    systemHealth: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
    gatewayPerformance: Record<string, { uptime: number, conversion: number }>;
}

/**
 * Gestión de Tickets con SLA
 */
export enum TicketPriority {
    CRITICAL = '1h', // Fraude / Hackeo
    HIGH = '6h',     // Fallo de Pago
    MEDIUM = '24h'   // Error Técnico
}

export interface ITicket {
    id: string;
    priority: TicketPriority;
    subject: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    assignedTo?: string;
    createdAt: number;
}
