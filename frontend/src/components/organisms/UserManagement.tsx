import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/atoms';
import { DataTable, TableFilter, AddUserForm } from '@/components/molecules';
import { usersAPI, CreateUserData } from '@/api/users';
import { UserData } from '@/types/configure';

export const UserManagement = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const { toast } = useToast();

    const itemsPerPage = 10;

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

    const handleAddUser = async (data: CreateUserData) => {
        try {
            await usersAPI.create(data);
            setShowAddForm(false);
            toast.success('User created successfully!');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create user');
            console.error('Error creating user:', err);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

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
                                options: [
                                    { value: 'admin', label: 'Admin' },
                                    { value: 'user', label: 'User' },
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
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
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
                                    <button className="text-blue-600 hover:text-blue-800">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                        onClick={() => handleDeleteUser(user.id)}
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

            {showAddForm && (
                <AddUserForm
                    onSubmit={handleAddUser}
                    onClose={() => setShowAddForm(false)}
                />
            )}
        </>
    );
};
