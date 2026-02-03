import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/atoms';
import { DataTable, TableFilter, AddRoleForm } from '@/components/molecules';
import { rolesAPI, CreateRoleData, UpdateRoleData } from '@/api/roles';
import { RoleData } from '@/types/configure';
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

export const RoleManagement = () => {
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
    const { toast } = useToast();

    const itemsPerPage = 10;

    const fetchRoles = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await rolesAPI.getAll({
                page: currentPage,
                limit: itemsPerPage,
                search: search || undefined,
            });
            setRoles(response);
            setTotalPages(Math.ceil(response.length / itemsPerPage));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch roles');
            console.error('Error fetching roles:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, search]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleAddRole = async (data: CreateRoleData | UpdateRoleData) => {
        setIsSubmitting(true);
        try {
            await rolesAPI.create(data as CreateRoleData);
            setShowAddForm(false);
            toast.success('Role created successfully!');
            fetchRoles();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create role');
            console.error('Error creating role:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditRole = async (data: CreateRoleData | UpdateRoleData) => {
        if (!editingRole) return;
        setIsSubmitting(true);
        try {
            await rolesAPI.update(editingRole.id, data as UpdateRoleData);
            setEditingRole(null);
            toast.success('Role updated successfully!');
            fetchRoles();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update role');
            console.error('Error updating role:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        setIsDeleting(roleId);
        try {
            await rolesAPI.delete(roleId);
            toast.success('Role deleted successfully!');
            fetchRoles();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete role');
            console.error('Error deleting role:', err);
        } finally {
            setIsDeleting(null);
            setDeleteConfirmOpen(false);
            setRoleToDelete(null);
        }
    };

    const openDeleteConfirm = (roleId: string) => {
        setRoleToDelete(roleId);
        setDeleteConfirmOpen(true);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearch('');
        setCurrentPage(1);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Role Management</CardTitle>
                    </div>
                    <Button onClick={() => setShowAddForm(true)}>Add Role</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TableFilter
                        searchPlaceholder="Search roles..."
                        onSearchChange={handleSearchChange}
                        onClear={handleClearFilters}
                    />

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <DataTable
                            columns={[
                                { key: 'name', label: 'Role Name' },
                                { key: 'description', label: 'Description' },
                                {
                                    key: 'userCount',
                                    label: 'Users',
                                    render: (value) => <span>{value} users</span>,
                                },
                                {
                                    key: 'permissions',
                                    label: 'Permissions',
                                    render: (value: string[]) => (
                                        <span className="text-sm">{value?.length} permissions</span>
                                    ),
                                },
                                { key: 'createdAt', label: 'Created' },
                            ]}
                            data={roles}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            actions={(role) => (
                                <div className="flex gap-2">
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => setEditingRole(role)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                        onClick={() => openDeleteConfirm(role.id)}
                                        disabled={isDeleting === role.id}
                                    >
                                        {isDeleting === role.id ? (
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

            <AddRoleForm
                open={showAddForm}
                onOpenChange={setShowAddForm}
                onSubmit={handleAddRole}
                isSubmitting={isSubmitting}
            />

            <AddRoleForm
                open={!!editingRole}
                onOpenChange={(open) => !open && setEditingRole(null)}
                role={editingRole}
                onSubmit={handleEditRole}
                isSubmitting={isSubmitting}
            />

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the role
                            and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => roleToDelete && handleDeleteRole(roleToDelete)}
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
