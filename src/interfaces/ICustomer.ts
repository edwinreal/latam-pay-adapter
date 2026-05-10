export interface ICustomer {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    document: string; // Documento de identidad (DNI, CC, RFC)
    identification?: {
        type: string;
        number: string;
    };
    phone?: string;
}
