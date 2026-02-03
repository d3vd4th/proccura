import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/atoms';
import { DataTable, TableFilter, AddTenantForm } from '@/components/molecules';
import { tenantsAPI, CreateTenantData, UpdateTenantData } from '@/api/tenants';
import { TenantData } from '@/types/configure';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/atoms';

export const TenantManagement = () => {
    const [tenants, setTenants] = useState<TenantData[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingTenant, setEditingTenant] = useState<TenantData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);
    const { toast } = useToast();

    const itemsPerPage = 10;

    const fetchTenants = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await tenantsAPI.getAll({
                page: currentPage,
                limit: itemsPerPage,
                search: search || undefined,
                status: statusFilter || undefined,
            });
            setTenants(response);
            setTotalPages(Math.ceil(response.length / itemsPerPage));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch tenants');
            console.error('Error fetching tenants:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, search, statusFilter]);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    const handleAddTenant = async (data: CreateTenantData | UpdateTenantData) => {
        setIsSubmitting(true);
        try {
            await tenantsAPI.create(data as CreateTenantData);
            setShowAddForm(false);
            toast.success('Tenant created successfully!');
            fetchTenants();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create tenant');
            console.error('Error creating tenant:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditTenant = async (data: CreateTenantData | UpdateTenantData) => {
        if (!editingTenant) return;
        setIsSubmitting(true);
        try {
            await tenantsAPI.update(editingTenant.id, data as UpdateTenantData);
            setEditingTenant(null);
            toast.success('Tenant updated successfully!');
            fetchTenants();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update tenant');
            console.error('Error updating tenant:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTenant = async (tenantId: string) => {
        setIsDeleting(tenantId);
        try {
            await tenantsAPI.delete(tenantId);
            toast.success('Tenant deleted successfully!');
            fetchTenants();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete tenant');
            console.error('Error deleting tenant:', err);
        } finally {
            setIsDeleting(null);
            setDeleteConfirmOpen(false);
            setTenantToDelete(null);
        }
    };

    const openDeleteConfirm = (tenantId: string) => {
        setTenantToDelete(tenantId);
        setDeleteConfirmOpen(true);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'status') {
            setStatusFilter(value);
        }
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Tenant Management</CardTitle>
                    </div>
                    <Button onClick={() => setShowAddForm(true)}>Add Tenant</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TableFilter
                        searchPlaceholder="Search tenants..."
                        onSearchChange={handleSearchChange}
                        filterOptions={[
                            {
                                key: 'status',
                                label: 'Status',
                                options: [
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                ],
                            },
                        ]}
                        onFilterChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Tenant Name' },
                                { key: 'email', label: 'Email' },
                                { key: 'phone', label: 'Phone' },
                                {
                                    key: 'status',
                                    label: 'Status',
                                    render: (value) => (
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {value}
                                        </span>
                                    ),
                                },
                                { key: 'created_at', label: 'Created' },
                            ]}
                            data={tenants}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            actions={(tenant) => (
                                <div className="flex gap-2">
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => setEditingTenant(tenant)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                        onClick={() => openDeleteConfirm(tenant.id)}
                                        disabled={isDeleting === tenant.id}
                                    >
                                        {isDeleting === tenant.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            )}
                        />
                    )}
                </CardContent>
            </Card>

            <AddTenantForm
                open={showAddForm}
                onOpenChange={setShowAddForm}
                onSubmit={handleAddTenant}
                isSubmitting={isSubmitting}
            />

            <AddTenantForm
                open={!!editingTenant}
                onOpenChange={(open) => !open && setEditingTenant(null)}
                tenant={editingTenant}
                onSubmit={handleEditTenant}
                isSubmitting={isSubmitting}
            />

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the tenant
                            and all associated data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => tenantToDelete && handleDeleteTenant(tenantToDelete)}
                            disabled={isDeleting !== null}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
