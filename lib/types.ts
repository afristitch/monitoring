export interface User {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ORG_ADMIN" | "STAFF";
    organizationId?: string;
    photoUrl?: string;
    isEmailVerified?: boolean;
}

export interface Organization {
    id?: string;
    _id?: string;
    name: string;
    email?: string;
    phone?: string;
    logoUrl?: string;
    subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'trialing';
    subscriptionEndsAt?: string;
    createdAt?: string;
    updatedAt?: string;
    clientsCount?: number;
    measurementsCount?: number;
}

export interface Client {
    _id: string;
    name: string;
    email?: string;
    phone: string;
    photoUrl?: string;
    organizationId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Order {
    _id: string;
    orderNumber: string;
    client: Client | string;
    organizationId: string;
    status: "pending" | "in-progress" | "fitting" | "completed" | "delivered" | "cancelled";
    amount: number;
    amountPaid: number;
    dueDate: string;
    clothImageUrl?: string;
    clothSize?: string;
    createdAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    total?: number;
    message?: string;
}

export interface PaginationOptions {
    page: number;
    limit: number;
    skip?: number;
}
