import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/atoms';
import { DataTable, TableFilter, AddUserForm } from '@/components/molecules';
import { usersAPI, CreateUserData, UpdateUserData } from '@/api/users';
import { rolesAPI } from '@/api/roles';
import { UserData, RoleData } from '@/types/configure';
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

export const UserManagement = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<RoleData[]>([]);
    const { toast } = useToast();

    const itemsPerPage = 10;

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await rolesAPI.getAll({ limit: 100 });
                setRoles(response || []);
            } catch (error) {
                console.error('Failed to fetch roles:', error);
            }
        };
        fetchRoles();
    }, []);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await usersAPI.getAll({
                page: currentPage,
                limit: itemsPerPage,
                search: search || undefined,
                status: statusFilter || undefined,
                role: roleFilter || undefined,
            });
            setUsers(response);
            setTotalPages(Math.ceil(response.length / itemsPerPage));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch users');
            console.error('Error fetching users:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, search, statusFilter, roleFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAddUser = async (data: CreateUserData | UpdateUserData) => {
        setIsSubmitting(true);
        try {
            await usersAPI.create(data as CreateUserData);
            setShowAddForm(false);
            toast.success('User created successfully!');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create user');
            console.error('Error creating user:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditUser = async (data: CreateUserData | UpdateUserData) => {
        if (!editingUser) return;
        setIsSubmitting(true);
        try {
            await usersAPI.update(editingUser.id, data as UpdateUserData);
            setEditingUser(null);
            toast.success('User updated successfully!');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update user');
            console.error('Error updating user:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        setIsDeleting(userId);
        try {
            await usersAPI.delete(userId);
            toast.success('User deleted successfully!');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
            console.error('Error deleting user:', err);
        } finally {
            setIsDeleting(null);
            setUserToDelete(null);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'status') {
            setStatusFilter(value);
        } else if (key === 'role') {
            setRoleFilter(value);
        }
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setRoleFilter('');
        setCurrentPage(1);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>User Management</CardTitle>
                    </div>
                    <Button onClick={() => setShowAddForm(true)}>Add User</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TableFilter
                        searchPlaceholder="Search users..."
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
                            {
                                key: 'role',
                                label: 'Role',
                                options: roles.map((role) => ({
                                    value: role.id,
                                    label: role.name,
                                })),
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
                                { key: 'email', label: 'Email' },
                                {
                                    key: 'first_name',
                                    label: 'Name',
                                    render: (value, row) => (
                                        <span>{value} {row.last_name || ''}</span>
                                    ),
                                },
                                {
                                    key: 'is_active',
                                    label: 'Status',
                                    render: (value) => (
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${value
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                        >
                                            {value ? 'Active' : 'Inactive'}
                                        </span>
                                    ),
                                },
                            ]}
                            data={users}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            actions={(user) => (
                                <div className="flex gap-2">
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => setEditingUser(user)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                        onClick={() => setUserToDelete(user.id)}
                                        disabled={isDeleting === user.id}
                                    >
                                        {isDeleting === user.id ? (
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

            <AddUserForm
                open={showAddForm}
                onOpenChange={setShowAddForm}
                onSubmit={handleAddUser}
                isSubmitting={isSubmitting}
            />

            <AddUserForm
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                user={editingUser}
                onSubmit={handleEditUser}
                isSubmitting={isSubmitting}
            />

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => userToDelete && handleDeleteUser(userToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
