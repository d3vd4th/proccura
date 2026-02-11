import { useState, useEffect, useCallback } from 'react';
import { Trash2, Send, Loader2, Mail, Building2, RefreshCw, Plus } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Label,
    useToast,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalFooter,
    CardDescription,
} from '@/components/atoms';
import { DataTable, TableFilter } from '@/components/molecules';
import { invitationsAPI, CreateInvitationData, InvitationData } from '@/api/invitations';

export const InvitationsPage = () => {
    const [invitations, setInvitations] = useState<InvitationData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isResending, setIsResending] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [invitationToDelete, setInvitationToDelete] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState<CreateInvitationData>({
        email: '',
        business_name: '',
    });

    const fetchInvitations = useCallback(async () => {
        try {
            const data = await invitationsAPI.getAll({
                page: currentPage,
                limit: pageSize,
                search: search || undefined,
                status: statusFilter || undefined,
            });
            setInvitations(data.items);
            setTotalPages(data.total_pages);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch invitations:', error);
        }
    }, [currentPage, pageSize, search, statusFilter]);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.business_name) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            await invitationsAPI.create(formData);
            toast.success('Invitation sent successfully!');
            setFormData({ email: '', business_name: '' });
            setShowInviteModal(false);
            fetchInvitations();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to send invitation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setInvitationToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!invitationToDelete) return;

        try {
            setIsDeleting(invitationToDelete);
            await invitationsAPI.delete(invitationToDelete);
            toast.success('Invitation deleted successfully!');
            fetchInvitations();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to delete invitation');
        } finally {
            setIsDeleting(null);
            setDeleteConfirmOpen(false);
            setInvitationToDelete(null);
        }
    };

    const handleResend = async (id: string) => {
        try {
            setIsResending(id);
            await invitationsAPI.resend(id);
            toast.success('Invitation resent successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to resend invitation'); // TODO: better error message
        } finally {
            setIsResending(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'border text-amber-800 border-amber-500',
            PRE_REGISTERED: 'border border-green-500 text-green-800',
            EXPIRED: 'border border-red-500 text-red-800',
        };
        const labels = {
            PENDING: 'Pending',
            PRE_REGISTERED: 'Pre-Registered',
            EXPIRED: 'Expired',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.PENDING}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const columns = [
        {
            key: 'id',
            label: 'Invitation ID',
            render: (_: any, invitation: InvitationData) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {invitation.id.slice(0, 8)}...
                </span>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            render: (_: any, invitation: InvitationData) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{invitation.email}</span>
                </div>
            ),
        },
        {
            key: 'business_name',
            label: 'Business Name',
            render: (_: any, invitation: InvitationData) => (
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{invitation.business_name}</span>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (status: string) => getStatusBadge(status),
        },
        {
            key: 'actions' as keyof InvitationData,
            label: 'Actions',
            render: (_: any, invitation: InvitationData) => (
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(invitation.id)}
                        disabled={isDeleting === invitation.id}
                        className="text-destructive hover:text-destructive"
                    >
                        {isDeleting === invitation.id ? (
                            <Loader2 className="h-2 w-2 animate-spin" />
                        ) : (
                            <Trash2 className="h-2 w-2" />
                        )}
                    </Button>
                    {invitation.status === 'PENDING' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResend(invitation.id)}
                            disabled={isResending === invitation.id}
                            title="Resend Invitation"
                        >
                            {isResending === invitation.id ? (
                                <Loader2 className="h-2 w-2 animate-spin" />
                            ) : (
                                <RefreshCw className="h-2 w-2" />
                            )}
                        </Button>
                    )}
                </div>
            ),
        },
    ] as any;

    return (
        <div className="flex flex-col h-full">
            {/* Invitations Table */}
            <Card className="flex flex-col flex-1 min-h-0">
                <CardHeader className="flex flex-row items-center justify-between shrink-0">
                    <div>
                        <CardTitle>Invitations</CardTitle>
                        <CardDescription>Manage your invitations</CardDescription>
                    </div>
                    <Button onClick={() => setShowInviteModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Send Invite
                    </Button>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 min-h-0 gap-4">
                    <div className="shrink-0">
                        <TableFilter
                            onSearchChange={(val) => { setSearch(val); setCurrentPage(1); }}
                            searchPlaceholder="Search by email or business name..."
                            filterOptions={[
                                {
                                    key: 'status',
                                    label: 'Status',
                                    options: [
                                        { value: 'PENDING', label: 'Pending' },
                                        { value: 'PRE_REGISTERED', label: 'Pre-Registered' },
                                        { value: 'EXPIRED', label: 'Expired' },
                                    ],
                                },
                            ]}
                            onFilterChange={(_key, value) => { setStatusFilter(value); setCurrentPage(1); }}
                            onClear={() => { setSearch(''); setStatusFilter(''); setCurrentPage(1); }}
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        data={invitations}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        total={total}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                </CardContent>
            </Card>

            {/* Send Invitation Modal */}
            <Modal open={showInviteModal} onOpenChange={setShowInviteModal}>
                <ModalContent>
                    <form onSubmit={handleSubmit}>
                        <ModalHeader>
                            <ModalTitle>Send Invitation</ModalTitle>

                        </ModalHeader>

                        <div className="space-y-4 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="business@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="business_name">Business Name *</Label>
                                <Input
                                    id="business_name"
                                    placeholder="Acme Corporation"
                                    value={formData.business_name}
                                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <ModalFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowInviteModal(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Invitation
                                    </>
                                )}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this invitation? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
