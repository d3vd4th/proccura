import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Building2, User, Mail, Phone, MapPin, Briefcase, FileText } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    useToast
} from '@/components/atoms';
import { preRegistrationsAPI, VendorPreRegistration } from '@/api/preRegistrations';
import { questionnaireApi } from '@/api/questionnaires';

export const PreRegistrationDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [vendor, setVendor] = useState<VendorPreRegistration | null>(null);
    const [availableDomains, setAvailableDomains] = useState<string[]>([]);
    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const vendorData = await preRegistrationsAPI.getById(id);
            setVendor(vendorData);

            // Fetch available domains (by getting all questionnaires and extracting distinct domains)
            const questionnairesData = await questionnaireApi.getAll({ limit: 1000 });
            const domains = Array.from(new Set(questionnairesData.items.map(q => q.domain)));
            setAvailableDomains(domains);

            // Fetch assigned domains
            const assignedData = await preRegistrationsAPI.getAssignedQuestionnaires(id);
            setSelectedDomains(assignedData.map(a => a.domain));
        } catch (error) {
            console.error('Failed to fetch details:', error);
            toast.error('Failed to load vendor details');
        } finally {
            setIsLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        fetchDetails();
    }, []);

    const handleDomainToggle = (domain: string) => {
        setSelectedDomains(prev =>
            prev.includes(domain)
                ? prev.filter(d => d !== domain)
                : [...prev, domain]
        );
    };

    const handleSaveAssignments = async () => {
        if (!id) return;
        try {
            setIsSaving(true);
            await preRegistrationsAPI.assignQuestionnaires(id, { domains: selectedDomains });
            toast.success('Questionnaires assigned successfully');
            fetchDetails(); // Refetch to get updated status
        } catch (error) {
            console.error('Failed to assign questionnaires:', error);
            toast.error('Failed to assign questionnaires');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-muted-foreground">Vendor not found</p>
                <Button variant="outline" onClick={() => navigate('/pre-registrations')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/pre-registrations')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{vendor.business_name}</h1>
                        <p className="text-muted-foreground">Pre-Registration Details & Questionnaire Assignment</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vendor Details Form/Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Business Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <User className="h-4 w-4" /> Contact Person
                                </p>
                                <p className="font-medium">{vendor.contact_person}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Email
                                </p>
                                <p className="font-medium">{vendor.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Phone
                                </p>
                                <p className="font-medium">{vendor.phone}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" /> Business Type
                                </p>
                                <p className="font-medium">{vendor.business_type || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="space-y-1 pt-4 border-t">
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Location
                            </p>
                            <p className="font-medium">
                                {vendor.city}, {vendor.state}, {vendor.country}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Questionnaire Assignment Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Assign Questionnaires
                        </CardTitle>
                        <CardDescription>
                            Select domains to assign to this vendor.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {availableDomains.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No questionnaires available to assign.</p>
                        ) : (
                            <div className="space-y-3">
                                {availableDomains.map(domain => {
                                    const isSelected = selectedDomains.includes(domain);
                                    return (
                                        <div
                                            key={domain}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-primary' : 'bg-background hover:bg-muted'}`}
                                            onClick={() => handleDomainToggle(domain)}
                                        >
                                            <span className="font-medium select-none">{domain}</span>
                                            {isSelected && (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                                                    Assigned
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <Button
                            className="w-full"
                            onClick={handleSaveAssignments}
                            disabled={isSaving || availableDomains.length === 0}
                        >
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Assignments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
