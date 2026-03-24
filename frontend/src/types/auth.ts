export interface User {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  role_id?: string;
  role_name?: string;
  is_active?: boolean;
  is_super_admin?: boolean;
  tenant_id?: string;
  profile_pic_url?: string;
  permissions?: string[];
  user_type?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  tenant_id?: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
