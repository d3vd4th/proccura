import { useState, useEffect, useCallback } from 'react';
import { Loader2, Mail, Building2, User, Phone, MapPin } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    useToast,
} from '@/components/atoms';
import { DataTable, TableFilter } from '@/components/molecules';
import { preRegistrationsAPI, VendorPreRegistration } from '@/api/preRegistrations';

export const PreRegistrationsPage = () => {
    const [registrations, setRegistrations] = useState<VendorPreRegistration[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchRegistrations = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await preRegistrationsAPI.list({
                page: currentPage,
                limit: pageSize,
                search: search || undefined,
            });
            setRegistrations(data.items);
            setTotalPages(data.total_pages);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
            toast.error('Failed to load registrations');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, search, toast]);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const columns = [
        {
            key: 'business_name',
            label: 'Business Name',
            render: (_: any, item: VendorPreRegistration) => (
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.business_name}</span>
                </div>
            ),
        },
        {
            key: 'contact_person',
            label: 'Contact Person',
            render: (_: any, item: VendorPreRegistration) => (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{item.contact_person}</span>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            render: (_: any, item: VendorPreRegistration) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{item.email}</span>
                </div>
            ),
        },
        {
            key: 'phone',
            label: 'Phone',
            render: (_: any, item: VendorPreRegistration) => (
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{item.phone}</span>
                </div>
            ),
        },
        {
            key: 'city',
            label: 'Location',
            render: (_: any, item: VendorPreRegistration) => (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{item.city}, {item.state}</span>
                </div>
            ),
        },
        {
            key: 'created_at',
            label: 'Submitted At',
            render: (_: any, item: VendorPreRegistration) => (
                <span className="text-muted-foreground text-xs">
                    {new Date(item.created_at).toLocaleDateString()}
                </span>
            ),
        },
    ] as any;

    return (
        <div className="flex flex-col h-full space-y-4">
            <Card className="flex flex-col flex-1 min-h-0">
                <CardHeader className="flex flex-row items-center justify-between shrink-0">
                    <div>
                        <CardTitle>Pre Registrations</CardTitle>
                        <CardDescription>Vendors who have completed the initial registration form.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 min-h-0 gap-4">
                    <div className="shrink-0">
                        <TableFilter
                            onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }}
                            searchPlaceholder="Search by business name or email..."
                            onClear={() => { setSearch(''); setCurrentPage(1); }}
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center flex-1 h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={registrations}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
