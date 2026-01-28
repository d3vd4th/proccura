import { useState } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { TenantData } from '@/types/configure';

interface TenantSwitcherProps {
    currentTenant: TenantData;
    tenants: TenantData[];
    onTenantChange: (tenant: TenantData) => void;
    isSuperAdmin?: boolean;
}

const MOCK_TENANTS: TenantData[] = [
    { id: '1', name: 'Acme Corp', isActive: true },
    { id: '2', name: 'Tech Solutions', isActive: true },
    { id: '3', name: 'Global Industries', isActive: true },
];

export const TenantSwitcher = ({
    currentTenant,
    tenants = MOCK_TENANTS,
    onTenantChange,
    isSuperAdmin = true,
}: TenantSwitcherProps) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!isSuperAdmin) {
        return (
            <div className="flex items-center border gap-2 rounded-2xl px-4 py-2">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">{currentTenant.name}</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center border gap-2 px-4 py-2 rounded-xl hover:bg-muted transition-colors"
            >  <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">{currentTenant.name}</span>
                <ChevronDown
                    className={`h-4 w-4 ml-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 bg-card border rounded-md shadow-lg z-50 min-w-[200px]">
                    {tenants.map((tenant) => (
                        <button
                            key={tenant.id}
                            onClick={() => {
                                onTenantChange(tenant);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm ${currentTenant.id === tenant.id ? 'bg-muted font-semibold' : ''
                                }`}
                        >
                            {tenant.name}
                            {currentTenant.id === tenant.id && (
                                <span className="text-primary"> ✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
