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
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
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
            setIsLoading(true);
            const data = await invitationsAPI.getAll({
                page: currentPage,
                limit: 10,
                search: search || undefined,
                status: statusFilter || undefined,
            });
            setInvitations(data);
            setTotalPages(Math.ceil(data.length / 10) || 1);
        } catch (error) {
            console.error('Failed to fetch invitations:', error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, search, statusFilter, toast]);

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
            pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            pre_registered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        const labels = {
            pending: 'Pending',
            pre_registered: 'Pre-Registered',
            expired: 'Expired',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const columns = [
        {
            key: 'id',
            label: 'Invitation ID',
            render: (invitation: InvitationData) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {invitation.id.slice(0, 8)}...
                </span>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            render: (invitation: InvitationData) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{invitation.email}</span>
                </div>
            ),
        },
        {
            key: 'business_name',
            label: 'Business Name',
            render: (invitation: InvitationData) => (
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{invitation.business_name}</span>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (invitation: InvitationData) => getStatusBadge(invitation.status),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (invitation: InvitationData) => (
                <div className="flex items-center gap-2">
                    {invitation.status === 'pending' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResend(invitation.id)}
                            disabled={isResending === invitation.id}
                            title="Resend Invitation"
                        >
                            {isResending === invitation.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(invitation.id)}
                        disabled={isDeleting === invitation.id}
                        className="text-destructive hover:text-destructive"
                    >
                        {isDeleting === invitation.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            ),
        },
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'pre_registered', label: 'Pre-Registered' },
        { value: 'expired', label: 'Expired' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between">
            </div>

            {/* Invitations Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                    <CardTitle>Invitations</CardTitle>
                    <CardDescription>Manage your invitations</CardDescription>
                    </div>
                <Button onClick={() => setShowInviteModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Send Invite
                </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TableFilter
                        searchValue={search}
                        onSearchChange={setSearch}
                        searchPlaceholder="Search by email or business name..."
                        filters={[
                            {
                                value: statusFilter,
                                onChange: setStatusFilter,
                                options: statusOptions,
                            },
                        ]}
                    />

                    <DataTable
                        columns={columns}
                        data={invitations}
                        isLoading={isLoading}
                        emptyMessage="No invitations found"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
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
