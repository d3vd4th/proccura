// src/types/configure.ts

export interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
    tenant: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface RoleData {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    userCount: number;
    createdAt: string;
}

export interface TenantData {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    logo?: string;
    status?: 'active' | 'inactive';
    isActive?: boolean;
    createdAt?: string;
}

export interface FilterOptions {
    search?: string;
    status?: string;
    role?: string;
}
