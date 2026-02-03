import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button, Input, Label } from '@/components/atoms';
import { TenantData } from '@/types/configure';
import { CreateTenantData, UpdateTenantData } from '@/api/tenants';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalFooter,
} from '@/components/atoms';

interface AddTenantFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateTenantData | UpdateTenantData) => void;
    tenant?: TenantData | null;
    isSubmitting?: boolean;
}

export const AddTenantForm = ({ open, onOpenChange, onSubmit, tenant, isSubmitting = false }: AddTenantFormProps) => {
    const isEditMode = !!tenant;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address_line1: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        status: 'active' as 'active' | 'inactive',
    });

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name || '',
                email: tenant.email || '',
                phone: tenant.phone || '',
                address_line1: tenant.address_line1 || '',
                city: tenant.city || '',
                state: tenant.state || '',
                country: tenant.country || '',
                postal_code: tenant.postal_code || '',
                status: tenant.status || 'active',
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address_line1: '',
                city: '',
                state: '',
                country: '',
                postal_code: '',
                status: 'active',
            });
        }
    }, [tenant, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent className="max-w-lg">
                <ModalHeader>
                    <ModalTitle>{isEditMode ? 'Edit Tenant' : 'Add New Tenant'}</ModalTitle>
                    <ModalDescription>
                        {isEditMode ? 'Update tenant information below.' : 'Fill in the details to create a new tenant.'}
                    </ModalDescription>
                </ModalHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tenant Name *</Label>
                        <Input
                            id="name"
                            placeholder="Company name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tenant@example.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address_line1">Address</Label>
                        <Input
                            id="address_line1"
                            placeholder="Street address"
                            value={formData.address_line1}
                            onChange={(e) =>
                                setFormData({ ...formData, address_line1: e.target.value })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={(e) =>
                                    setFormData({ ...formData, city: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                placeholder="State"
                                value={formData.state}
                                onChange={(e) =>
                                    setFormData({ ...formData, state: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                                id="country"
                                placeholder="Country"
                                value={formData.country}
                                onChange={(e) =>
                                    setFormData({ ...formData, country: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                                id="postal_code"
                                placeholder="Postal code"
                                value={formData.postal_code}
                                onChange={(e) =>
                                    setFormData({ ...formData, postal_code: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {isEditMode && (
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                                }
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    )}

                    <ModalFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} type="button" disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {isEditMode ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                isEditMode ? 'Update Tenant' : 'Add Tenant'
                            )}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};
