import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/atoms';
import { DataTable, TableFilter, AddRoleForm } from '@/components/molecules';
import { rolesAPI, CreateRoleData } from '@/api/roles';
import { RoleData } from '@/types/configure';

export const RoleManagement = () => {
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
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
            setRoles(response.roles);
            setTotalPages(Math.ceil(response.total / itemsPerPage));
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

    const handleAddRole = async (data: CreateRoleData) => {
        try {
            await rolesAPI.create(data);
            setShowAddForm(false);
            toast.success('Role created successfully!');
            fetchRoles();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create role');
            console.error('Error creating role:', err);
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;

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
        }
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
                                        <span className="text-sm">{value.length} permissions</span>
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
                                    <button className="text-blue-600 hover:text-blue-800">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                        onClick={() => handleDeleteRole(role.id)}
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

            {showAddForm && (
                <AddRoleForm
                    onSubmit={handleAddRole}
                    onClose={() => setShowAddForm(false)}
                />
            )}
        </>
    );
};
