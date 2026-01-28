import { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { Card, CardContent,  CardHeader, CardTitle, Button } from '@/components/atoms';
import { DataTable, TableFilter, AddRoleForm } from '@/components/molecules';
import { RoleData } from '@/types/configure';

const MOCK_ROLES: RoleData[] = [
    {
        id: '1',
        name: 'Admin',
        description: 'Full access to system',
        permissions: ['read_users', 'create_users', 'edit_users', 'delete_users'],
        userCount: 5,
        createdAt: '2024-01-10',
    },
    {
        id: '2',
        name: 'Editor',
        description: 'Can create and edit content',
        permissions: ['read_users', 'create_users', 'edit_users'],
        userCount: 12,
        createdAt: '2024-01-12',
    },
];

export const RoleManagement = () => {
    const [roles, setRoles] = useState<RoleData[]>(MOCK_ROLES);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');

    const filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(search.toLowerCase())
    );

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
    const paginatedRoles = filteredRoles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleAddRole = (data: any) => {
        const newRole: RoleData = {
            id: String(roles.length + 1),
            ...data,
            userCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
        };
        setRoles([...roles, newRole]);
        setShowAddForm(false);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Role Management</CardTitle>
                        {/* <CardDescription>Create and manage user roles</CardDescription> */}
                    </div>
                    <Button onClick={() => setShowAddForm(true)}>Add Role</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TableFilter
                        searchPlaceholder="Search roles..."
                        onSearchChange={setSearch}
                        onClear={() => setSearch('')}
                    />

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
                        data={paginatedRoles}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        actions={(role) => (
                            <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => setRoles(roles.filter((r) => r.id !== role.id))}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    />
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
