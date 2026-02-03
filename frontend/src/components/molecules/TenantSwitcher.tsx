import { useState, useEffect } from 'react';
import { Building2, ChevronDown, Loader2 } from 'lucide-react';
import { tenantsAPI } from '@/api/tenants';

interface Tenant {
    id: string;
    name: string;
}

interface TenantSwitcherProps {
    currentTenant: Tenant | null;
    onTenantChange: (tenant: Tenant) => void;
    isSuperAdmin?: boolean;
}

export const TenantSwitcher = ({
    currentTenant,
    onTenantChange,
    isSuperAdmin = false,
}: TenantSwitcherProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);

    // Load tenant from localStorage on mount if currentTenant is null
    useEffect(() => {
        const loadTenantFromStorage = async () => {
            const storedTenantId = localStorage.getItem('tenant_id');
            if (storedTenantId && !currentTenant) {
                setIsLoadingCurrent(true);
                try {
                    const tenant = await tenantsAPI.getById(storedTenantId);
                    onTenantChange({ id: tenant.id, name: tenant.name });
                } catch (error) {
                    console.error('Failed to fetch tenant from storage:', error);
                    // Clear invalid tenant_id from storage
                    localStorage.removeItem('tenant_id');
                    // Fetch tenants and auto-select first one if super admin
                    if (isSuperAdmin) {
                        fetchTenants(true);
                    }
                } finally {
                    setIsLoadingCurrent(false);
                }
            } else if (!storedTenantId && !currentTenant && isSuperAdmin) {
                // No stored tenant, fetch and auto-select first one
                fetchTenants(true);
            }
        };
        loadTenantFromStorage();
    }, []);

    // Fetch tenants when super admin opens dropdown
    useEffect(() => {
        if (isSuperAdmin && isOpen && tenants.length === 0) {
            fetchTenants();
        }
    }, [isSuperAdmin, isOpen]);

    const fetchTenants = async (autoSelectFirst = false) => {
        setIsLoading(true);
        try {
            const response = await tenantsAPI.getAll({ limit: 100, status: 'active' });
            const tenantList = response.map((tenant) => ({
                id: tenant.id,
                name: tenant.name,
            }));
            setTenants(tenantList);

            // Auto-select first tenant if requested and no tenant is currently selected
            if (autoSelectFirst && tenantList.length > 0 && !currentTenant) {
                localStorage.setItem('tenant_id', tenantList[0].id);
                onTenantChange(tenantList[0]);
            }
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTenantSelect = (tenant: Tenant) => {
        // Store tenant_id in localStorage
        localStorage.setItem('tenant_id', tenant.id);
        onTenantChange(tenant);
        setIsOpen(false);
    };

    // Non-super admin view - just show current tenant
    if (!isSuperAdmin) {
        return (
            <div className="flex items-center border gap-2 rounded-2xl px-4 py-2">
                <Building2 className="h-4 w-4" />
                {isLoadingCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <span className="text-sm font-medium">{currentTenant?.name || 'No Tenant'}</span>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center border gap-2 px-4 py-2 rounded-xl hover:bg-muted transition-colors"
            >
                <Building2 className="h-4 w-4" />
                {isLoadingCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <span className="text-sm font-medium">{currentTenant?.name || 'Select Tenant'}</span>
                )}
                <ChevronDown
                    className={`h-4 w-4 ml-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 bg-card border rounded-md shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    ) : tenants.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                            No tenants found
                        </div>
                    ) : (
                        tenants.map((tenant) => (
                            <button
                                key={tenant.id}
                                onClick={() => handleTenantSelect(tenant)}
                                className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm ${currentTenant?.id === tenant.id ? 'bg-muted font-semibold' : ''
                                    }`}
                            >
                                {tenant.name}
                                {currentTenant?.id === tenant.id && (
                                    <span className="text-primary ml-2">✓</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
