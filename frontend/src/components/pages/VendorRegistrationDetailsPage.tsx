import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Building2, User, Mail, Phone, MapPin, Briefcase, FileText, CheckCircle2, Circle, ChevronRight, ChevronDown, UserPlus, Trash2, Shield } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    useToast
} from '@/components/atoms';
import { vendorRegistrationsAPI, VendorRegistration, VendorUser } from '@/api/vendorRegistrations';
import { questionnaireApi } from '@/api/questionnaires';

export const VendorRegistrationDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [vendor, setVendor] = useState<VendorRegistration | null>(null);
    const [groupedQuestionnaires, setGroupedQuestionnaires] = useState<Record<string, any[]>>({});
    const [selectedQuestionnaireIds, setSelectedQuestionnaireIds] = useState<string[]>([]);
    const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Vendor Users state
    const [vendorUsers, setVendorUsers] = useState<VendorUser[]>([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserFirstName, setNewUserFirstName] = useState('');
    const [newUserLastName, setNewUserLastName] = useState('');
    const [isProvisioning, setIsProvisioning] = useState(false);

    const fetchDetails = useCallback(async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const vendorData = await vendorRegistrationsAPI.getById(id);
            setVendor(vendorData);

            // Fetch all questionnaires and group by domain
            const questionnairesData = await questionnaireApi.getAll({ limit: 1000 });
            const grouped: Record<string, any[]> = {};
            questionnairesData.items.forEach(q => {
                if (!grouped[q.domain]) grouped[q.domain] = [];
                grouped[q.domain].push(q);
            });
            setGroupedQuestionnaires(grouped);

            // Fetch assigned questionnaire IDs
            const assignedData = await vendorRegistrationsAPI.getAssignedQuestionnaires(id);
            setSelectedQuestionnaireIds(assignedData.map(a => a.questionnaire_id));

            // Fetch vendor users
            const usersData = await vendorRegistrationsAPI.listUsers(id);
            setVendorUsers(usersData);
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

    const handleQuestionnaireToggle = (qId: string) => {
        setSelectedQuestionnaireIds(prev =>
            prev.includes(qId)
                ? prev.filter(id => id !== qId)
                : [...prev, qId]
        );
    };

    const handleDomainToggle = (domainQuestions: any[]) => {
        const domainIds = domainQuestions.map(q => q.id);
        const allSelected = domainIds.every(id => selectedQuestionnaireIds.includes(id));
        setSelectedQuestionnaireIds(prev =>
            allSelected
                ? prev.filter(id => !domainIds.includes(id))
                : [...new Set([...prev, ...domainIds])]
        );
    };

    const handleSaveAssignments = async () => {
        if (!id) return;
        try {
            setIsSaving(true);
            await vendorRegistrationsAPI.assignQuestionnaires(id, { questionnaire_ids: selectedQuestionnaireIds });
            toast.success('Questionnaires assigned successfully');
            fetchDetails(); // Refetch to get updated status
        } catch (error) {
            console.error('Failed to assign questionnaires:', error);
            toast.error('Failed to assign questionnaires');
        } finally {
            setIsSaving(false);
        }
    };

    const handleProvisionUser = async (isPrimary = false) => {
        if (!id) return;
        if (!newUserEmail || !newUserFirstName) {
            toast.error('Email and first name are required');
            return;
        }
        try {
            setIsProvisioning(true);
            await vendorRegistrationsAPI.provisionUser(id, {
                email: newUserEmail,
                first_name: newUserFirstName,
                last_name: newUserLastName || undefined,
                is_primary: isPrimary,
            });
            toast.success(`User ${newUserEmail} provisioned successfully`);
            setNewUserEmail('');
            setNewUserFirstName('');
            setNewUserLastName('');
            setShowAddUser(false);
            // Refresh users list
            const usersData = await vendorRegistrationsAPI.listUsers(id);
            setVendorUsers(usersData);
        } catch (error: any) {
            const msg = error?.response?.data?.detail || 'Failed to provision user';
            toast.error(msg);
        } finally {
            setIsProvisioning(false);
        }
    };

    const handleDeleteUser = async (userId: string, email: string) => {
        if (!id) return;
        if (!confirm(`Remove vendor user ${email}?`)) return;
        try {
            await vendorRegistrationsAPI.deleteUser(id, userId);
            toast.success(`User ${email} removed`);
            setVendorUsers(prev => prev.filter(u => u.id !== userId));
        } catch {
            toast.error('Failed to remove user');
        }
    };

    const handleAddContactPerson = () => {
        if (vendor) {
            const nameParts = vendor.contact_person.split(' ');
            setNewUserFirstName(nameParts[0] || '');
            setNewUserLastName(nameParts.slice(1).join(' ') || '');
            setNewUserEmail(vendor.contact_person_email || vendor.email);
            setShowAddUser(true);
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

    const totalQuestions = Object.values(groupedQuestionnaires).reduce((sum, qs) => sum + qs.length, 0);

    return (
        <div className="flex flex-col space-y-6 max-w-6xl mx-auto w-full pb-10">
            {/* Header / Banner */}
            <div className="relative rounded-2xl bg-linear-to-r from-indigo-100 via-blue-50 to-sky-50 dark:from-primary/15 dark:via-primary/5 dark:to-transparent border border-indigo-200/60 dark:border-border overflow-hidden p-6 md:p-8">
                <div className="absolute top-0 right-0 p-12 opacity-[0.07] pointer-events-none">
                    <Building2 className="w-64 h-64 text-indigo-500" />
                </div>

                <div className="flex items-center gap-5 relative z-10">
                    <Button variant="outline" size="icon" className="rounded-full bg-white/80 dark:bg-background/50 backdrop-blur shrink-0 border-indigo-200/60 dark:border-border" onClick={() => navigate('/pre-registrations')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-14 w-14 bg-linear-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                        {vendor.business_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">{vendor.business_name}</h1>
                        <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                            <span className="truncate">{vendor.city}, {vendor.country}</span>
                            <span className="text-muted-foreground/30">•</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${vendor.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30'
                                : vendor.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30'
                                    : vendor.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30'
                                        : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30'
                                }`}>
                                {vendor.status?.replace(/_/g, ' ') || 'PENDING'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Vendor Details */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="dark:bg-muted/30 border-b py-4 px-6">
                        <CardTitle className="flex items-center gap-2.5 text-base">
                            <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            Business Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-violet-400" /> Contact Person
                                </p>
                                <p className="text-sm font-medium text-foreground">{vendor.contact_person}</p>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <Mail className="h-3 w-3 text-indigo-400" /> Contact Person Email
                                </p>
                                <p className="text-sm font-medium text-foreground">{vendor.contact_person_email || <span className="italic text-muted-foreground">Not provided</span>}</p>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <Mail className="h-3 w-3 text-blue-400" /> Email
                                </p>
                                <p className="text-sm font-medium text-foreground">{vendor.email}</p>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <Phone className="h-3 w-3 text-emerald-400" /> Phone
                                </p>
                                <p className="text-sm font-medium text-foreground">{vendor.phone}</p>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3 text-rose-400" /> Location
                                </p>
                                <p className="text-sm font-medium text-foreground">{vendor.city}, {vendor.state} — {vendor.country}</p>
                            </div>
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <Briefcase className="h-3 w-3 text-amber-400" /> Business Type
                                </p>
                                {vendor.business_type ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {vendor.business_type}
                                    </span>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Not specified</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vendor Users */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="dark:bg-muted/30 border-b py-4 px-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2.5 text-base">
                                <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                Vendor Users
                                {vendorUsers.length > 0 && (
                                    <span className="text-xs text-muted-foreground font-normal">({vendorUsers.length})</span>
                                )}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                {vendor.contact_person_email && vendorUsers.length === 0 && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleAddContactPerson}
                                    >
                                        <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                                        Add Contact Person
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant={showAddUser ? 'secondary' : 'default'}
                                    onClick={() => setShowAddUser(!showAddUser)}
                                >
                                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                                    {showAddUser ? 'Cancel' : 'Add User'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Add User Form */}
                        {showAddUser && (
                            <div className="mb-6 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Email *</label>
                                        <input
                                            type="email"
                                            value={newUserEmail}
                                            onChange={(e) => setNewUserEmail(e.target.value)}
                                            placeholder="vendor@company.com"
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            value={newUserFirstName}
                                            onChange={(e) => setNewUserFirstName(e.target.value)}
                                            placeholder="John"
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={newUserLastName}
                                            onChange={(e) => setNewUserLastName(e.target.value)}
                                            placeholder="Doe"
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        />
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleProvisionUser(false)}
                                    disabled={isProvisioning || !newUserEmail || !newUserFirstName}
                                >
                                    {isProvisioning ? (
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {isProvisioning ? 'Provisioning...' : 'Provision User'}
                                </Button>
                            </div>
                        )}

                        {/* Users List */}
                        {vendorUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <User className="h-8 w-8 opacity-20 mb-2" />
                                <p className="text-sm">No vendor users provisioned yet.</p>
                                <p className="text-xs mt-1">Add users to allow them to log in and complete questionnaires.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {vendorUsers.map((vu) => (
                                    <div key={vu.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-bold">
                                                {vu.first_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                                    {vu.first_name} {vu.last_name || ''}
                                                    {vu.is_primary && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">
                                                            Primary
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{vu.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteUser(vu.id, vu.email)}
                                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Remove user"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Questionnaire Assignment */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="dark:bg-primary/5 border-b py-4 px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="flex items-center gap-2.5 text-base">
                                    <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                        <FileText className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    Assign Questionnaires
                                </CardTitle>
                                {totalQuestions > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                        {selectedQuestionnaireIds.length} of {totalQuestions} selected
                                    </span>
                                )}
                            </div>
                            <Button
                                size="sm"
                                onClick={handleSaveAssignments}
                                disabled={isSaving || totalQuestions === 0}
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                )}
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {totalQuestions === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                <FileText className="h-8 w-8 opacity-20 mb-2" />
                                <p className="text-sm">No questionnaires available to assign.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {Object.entries(groupedQuestionnaires).map(([domain, questions]) => {
                                    const domainSelectedCount = questions.filter(q => selectedQuestionnaireIds.includes(q.id)).length;
                                    return (
                                        <div key={domain} className="px-6 py-4">
                                            <div
                                                className="flex items-center justify-between cursor-pointer select-none"
                                                onClick={() => setExpandedDomains(prev => {
                                                    const next = new Set(prev);
                                                    next.has(domain) ? next.delete(domain) : next.add(domain);
                                                    return next;
                                                })}
                                            >
                                                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                                                    {expandedDomains.has(domain) ? (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    {domain}
                                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                        {questions.length}
                                                    </span>
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    {domainSelectedCount > 0 && (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                            {domainSelectedCount} selected
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="text-xs text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors"
                                                        onClick={(e) => { e.stopPropagation(); handleDomainToggle(questions); }}
                                                    >
                                                        {domainSelectedCount === questions.length ? 'Deselect all' : 'Select all'}
                                                    </button>
                                                </div>
                                            </div>
                                            {expandedDomains.has(domain) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                    {questions.map((q) => {
                                                        const isSelected = selectedQuestionnaireIds.includes(q.id);
                                                        return (
                                                            <div
                                                                key={q.id}
                                                                className={`group flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${isSelected
                                                                    ? 'bg-primary/5 border-primary/40'
                                                                    : 'bg-background hover:bg-muted/50 border-border/60 hover:border-border'
                                                                    }`}
                                                                onClick={() => handleQuestionnaireToggle(q.id)}
                                                            >
                                                                <div className="pt-0.5 shrink-0">
                                                                    {isSelected ? (
                                                                        <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                                                                    ) : (
                                                                        <Circle className="h-4.5 w-4.5 text-muted-foreground/40 group-hover:text-muted-foreground/60" />
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col gap-1 min-w-0">
                                                                    <span className={`text-sm leading-snug transition-colors ${isSelected ? 'text-foreground font-medium' : 'text-foreground/70 group-hover:text-foreground'
                                                                        }`}>
                                                                        {q.question}
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] text-muted-foreground capitalize">
                                                                            {q.type.replace('_', ' ')}
                                                                        </span>
                                                                        {q.attachment_required && (
                                                                            <>
                                                                                <span className="text-muted-foreground/30">•</span>
                                                                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                                                                    Attachment
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
