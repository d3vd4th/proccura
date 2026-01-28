import { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/atoms';
import { DataTable, TableFilter, AddUserForm } from '@/components/molecules';
import { UserData } from '@/types/configure';

const MOCK_USERS: UserData[] = [
    {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'admin',
        tenant: 'Acme Corp',
        status: 'active',
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        email: 'jane@example.com',
        name: 'Jane Smith',
        role: 'user',
        tenant: 'Acme Corp',
        status: 'active',
        createdAt: '2024-01-20',
    },
];

export const UserManagement = () => {
    const [users, setUsers] = useState<UserData[]>(MOCK_USERS);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(
        (user) =>
            user.email.toLowerCase().includes(search.toLowerCase()) ||
            user.name.toLowerCase().includes(search.toLowerCase())
    );

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleAddUser = (data: any) => {
        const newUser: UserData = {
            id: String(users.length + 1),
            ...data,
            tenant: 'Acme Corp',
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers([...users, newUser]);
        setShowAddForm(false);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        {/* <CardDescription>Manage users and their roles</CardDescription> */}
                    </div>
                    <Button onClick={() => setShowAddForm(true)}>Add User</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TableFilter
                        searchPlaceholder="Search users..."
                        onSearchChange={setSearch}
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
                        onClear={() => setSearch('')}
                    />

                    <DataTable
                        columns={[
                            { key: 'email', label: 'Email' },
                            { key: 'name', label: 'Name' },
                            { key: 'role', label: 'Role' },
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
                            { key: 'createdAt', label: 'Created' },
                        ]}
                        data={paginatedUsers}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        actions={(user) => (
                            <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() =>
                                        setUsers(users.filter((u) => u.id !== user.id))
                                    }
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    />
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
