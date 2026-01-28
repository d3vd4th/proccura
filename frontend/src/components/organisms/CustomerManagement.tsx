import { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { Card, CardContent,  CardHeader, CardTitle, Button } from '@/components/atoms';
import { DataTable, TableFilter, AddCustomerForm } from '@/components/molecules';
import { CustomerData } from '@/types/configure';

const MOCK_CUSTOMERS: CustomerData[] = [
    {
        id: '1',
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business St, New York, NY 10001',
        status: 'active',
        createdAt: '2024-01-05',
    },
    {
        id: '2',
        name: 'Tech Solutions Inc',
        email: 'info@techsolutions.com',
        phone: '+1 (555) 987-6543',
        address: '456 Tech Ave, San Francisco, CA 94102',
        status: 'active',
        createdAt: '2024-01-10',
    },
];

export const CustomerManagement = () => {
    const [customers, setCustomers] = useState<CustomerData[]>(MOCK_CUSTOMERS);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(search.toLowerCase()) ||
            customer.email.toLowerCase().includes(search.toLowerCase())
    );

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleAddCustomer = (data: any) => {
        const newCustomer: CustomerData = {
            id: String(customers.length + 1),
            ...data,
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
        };
        setCustomers([...customers, newCustomer]);
        setShowAddForm(false);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Customer Management</CardTitle>
                        {/* <CardDescription>Manage customers and their information</CardDescription> */}
                    </div>
                    <Button onClick={() => setShowAddForm(true)}>Add Customer</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TableFilter
                        searchPlaceholder="Search customers..."
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
                        ]}
                        onClear={() => setSearch('')}
                    />

                    <DataTable
                        columns={[
                            { key: 'name', label: 'Customer Name' },
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
                            { key: 'createdAt', label: 'Created' },
                        ]}
                        data={paginatedCustomers}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        actions={(customer) => (
                            <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() =>
                                        setCustomers(
                                            customers.filter((c) => c.id !== customer.id)
                                        )
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
                <AddCustomerForm
                    onSubmit={handleAddCustomer}
                    onClose={() => setShowAddForm(false)}
                />
            )}
        </>
    );
};
