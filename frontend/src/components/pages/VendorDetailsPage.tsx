import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/atoms';
import { useToast } from '@/components/atoms/toast';
import { 
    Loader2, ArrowLeft, Building2, User, Mail, Phone, 
    MapPin, CheckCircle2 
} from 'lucide-react';
import { vendorsAPI, Vendor } from '@/api/vendors';

export const VendorDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchVendor = async () => {
            try {
                setIsLoading(true);
                const data = await vendorsAPI.getById(id);
                setVendor(data);
            } catch (error) {
                toast.error('Failed to load vendor details');
                navigate('/vendors');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVendor();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <p className="text-xl font-semibold text-muted-foreground">Vendor not found</p>
                <Button variant="outline" onClick={() => navigate('/vendors')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Vendors
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate('/vendors')}
                        className="h-10 w-10 shrink-0 border border-transparent hover:border-border hover:bg-muted"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{vendor.business_name}</h1>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                vendor.status === 'ACTIVE' 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                                {vendor.status}
                            </span>
                        </div>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {vendor.city}, {vendor.country}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Business & Contact Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="bg-muted/10 border-b">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Building2 className="h-5 w-5 text-primary" />
                                Business Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Entity Name</span>
                                    <p className="font-medium text-foreground">{vendor.business_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Business Type</span>
                                    <p className="font-medium text-foreground">{vendor.business_type || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Tax ID (PAN)</span>
                                    <p className="font-medium text-foreground whitespace-pre-wrap">{vendor.pan_number || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Tax ID (GST)</span>
                                    <p className="font-medium text-foreground">{vendor.gst_number || 'N/A'}</p>
                                </div>
                                <div className="col-span-1 sm:col-span-2 space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Products/Services Provided</span>
                                    <div className="bg-muted/30 p-3 rounded-md mt-1 border border-border/30">
                                        <p className="text-sm text-foreground">{vendor.products_services || 'No details provided.'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="bg-muted/10 border-b">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-5 w-5 text-primary" />
                                Location & Registration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                <div className="space-y-1 col-span-1 sm:col-span-2">
                                    <span className="text-sm font-medium text-muted-foreground">Vetted On</span>
                                    <p className="font-medium text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        {new Date(vendor.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="space-y-1 col-span-1 sm:col-span-2 md:col-span-1">
                                    <span className="text-sm font-medium text-muted-foreground">Address</span>
                                    <p className="font-medium text-foreground">
                                        {vendor.address_line1}
                                        {vendor.address_line2 && <><br />{vendor.address_line2}</>}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">City & State</span>
                                    <p className="font-medium text-foreground">{vendor.city}, {vendor.state}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Postal Code</span>
                                    <p className="font-medium text-foreground">{vendor.postal_code}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Country</span>
                                    <p className="font-medium text-foreground">{vendor.country}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Key Contacts */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-border/50 sticky top-6">
                        <CardHeader className="bg-muted/10 border-b">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5 text-primary" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col space-y-5">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Primary Contact</p>
                                        <p className="font-medium text-foreground">{vendor.contact_person}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Mail className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-muted-foreground">Company Email</p>
                                        <p className="font-medium text-foreground break-all">
                                            <a href={`mailto:${vendor.email}`} className="hover:text-primary transition-colors hover:underline">
                                                {vendor.email}
                                            </a>
                                        </p>
                                        {vendor.contact_person_email && vendor.contact_person_email !== vendor.email && (
                                            <p className="text-sm font-medium text-muted-foreground mt-2 break-all">
                                                Direct: <a href={`mailto:${vendor.contact_person_email}`} className="text-foreground hover:underline">{vendor.contact_person_email}</a>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                                        <p className="font-medium text-foreground break-all">
                                            <a href={`tel:${vendor.phone}`} className="hover:text-primary transition-colors hover:underline">
                                                {vendor.phone}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
