import { useState, useEffect, useCallback } from 'react';
import { Loader2, Mail, Building2, User, Phone, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/atoms';
import { useToast } from '@/components/atoms/toast';
import { DataTable, TableFilter } from '@/components/molecules';
import { vendorsAPI, Vendor } from '@/api/vendors';

export const VendorsPage = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchVendors = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await vendorsAPI.list({
                page: currentPage,
                limit: pageSize,
                search: search || undefined,
            });
            setVendors(data.items);
            setTotalPages(data.total_pages);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
            toast.error('Failed to load vendors');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, search, toast]);

    useEffect(() => {
        fetchVendors();
    }, []);

    const columns = [
        {
            key: 'business_name',
            label: 'Business Name',
            render: (_: any, item: Vendor) => (
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.business_name}</span>
                </div>
            ),
        },
        {
            key: 'contact_person',
            label: 'Contact Person',
            render: (_: any, item: Vendor) => (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{item.contact_person}</span>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            render: (_: any, item: Vendor) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{item.email}</span>
                </div>
            ),
        },
        {
            key: 'phone',
            label: 'Phone',
            render: (_: any, item: Vendor) => (
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{item.phone}</span>
                </div>
            ),
        },
        {
            key: 'city',
            label: 'Location',
            render: (_: any, item: Vendor) => (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{item.city}, {item.country}</span>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (_: any, item: Vendor) => (
                <span className={`px-2 py-1 text-[11px] font-medium rounded-full ${
                    item.status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                    {item.status}
                </span>
            ),
        },
    ] as any;

    return (
        <div className="flex flex-col h-full space-y-4">
            <Card className="flex flex-col flex-1 min-h-0">
                <CardHeader className="flex flex-row items-center justify-between shrink-0">
                    <div>
                        <CardTitle>Active Vendors</CardTitle>
                        <CardDescription>Manage your active corporate vendor relationships and performance.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 min-h-0 gap-4">
                    <div className="shrink-0">
                        <TableFilter
                            onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }}
                            searchPlaceholder="Search vendors by business name..."
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
                            data={vendors}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            total={total}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                            actions={(item) => (
                                <button
                                    className="text-primary hover:text-primary/80 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/vendors/${item.id}`);
                                    }}
                                    title="View Vendor Details"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                            )}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
