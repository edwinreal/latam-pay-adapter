export interface ICustomer {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    identification?: {
        type: string;
        number: string;
    };
    phone?: string;
}
