// src/types/configure.ts

export interface UserData {
    id: string;
    email: string;
    first_name: string;
    last_name: string | null;
    phone: string | null;
    role_id: string | null;
    is_active: boolean;
    profile_pic_url: string | null;
}

export interface RoleData {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    userCount: number;
    createdAt: string;
}

export interface Permission {
    id: string;
    code: string;
    name: string;
    description: string | null;
}

export interface FeatureWithPermissions {
    id: string;
    code: string;
    name: string;
    description: string | null;
    permissions: Permission[];
}

export interface TenantData {
    id: string;
    name: string;
    code: string | null;
    email: string;
    phone: string | null;
    logo_url: string | null;
    address_line1: string | null;
    address_line2: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postal_code: string | null;
    plan: string;
    status: 'active' | 'inactive';
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
}

export interface FilterOptions {
    search?: string;
    status?: string;
    role?: string;
}
