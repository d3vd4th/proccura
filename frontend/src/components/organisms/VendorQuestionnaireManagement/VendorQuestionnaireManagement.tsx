import { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit, Loader2, Upload as UploadIcon, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/atoms';
import { DataTable, TableFilter } from '@/components/molecules';
import { questionnaireApi, Questionnaire, QuestionnaireCreate, QuestionnaireUpdate } from '@/api/questionnaires';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/atoms';
import { QuestionnaireForm } from './QuestionnaireForm';
import { QuestionnaireUpload } from './QuestionnaireUpload';

export const VendorQuestionnaireManagement = () => {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Questionnaire | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const { toast } = useToast();

    const itemsPerPage = 10;

    const fetchQuestionnaires = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await questionnaireApi.getAll({
                page: currentPage,
                limit: itemsPerPage,
                search: search || undefined,
            });
            setQuestionnaires(response.items);
            setTotalPages(response.total_pages || Math.ceil(response.total / itemsPerPage));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch questionnaires');
            console.error('Error fetching questionnaires:', err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, search]);

    useEffect(() => {
        fetchQuestionnaires();
    }, [fetchQuestionnaires]);

    const handleAdd = async (data: QuestionnaireCreate | QuestionnaireUpdate) => {
        setIsSubmitting(true);
        try {
            await questionnaireApi.create(data as QuestionnaireCreate);
            setShowAddForm(false);
            toast.success('Questionnaire created successfully!');
            fetchQuestionnaires();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create questionnaire');
            console.error('Error creating questionnaire:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async (data: QuestionnaireCreate | QuestionnaireUpdate) => {
        if (!editingItem) return;
        setIsSubmitting(true);
        try {
            await questionnaireApi.update(editingItem.id, data as QuestionnaireUpdate);
            setEditingItem(null);
            toast.success('Questionnaire updated successfully!');
            fetchQuestionnaires();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update questionnaire');
            console.error('Error updating questionnaire:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            await questionnaireApi.delete(id);
            toast.success('Questionnaire deleted successfully!');
            fetchQuestionnaires();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete questionnaire');
            console.error('Error deleting questionnaire:', err);
        } finally {
            setIsDeleting(null);
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
        }
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        try {
            await questionnaireApi.uploadExcel(file);
            setShowUploadForm(false);
            toast.success('Questionnaires uploaded successfully!');
            setCurrentPage(1);
            fetchQuestionnaires();
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || err.response?.data?.message || 'Failed to upload questionnaires';
            toast.error(errorMsg);
            console.error('Error uploading questionnaires:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const openDeleteConfirm = (id: string) => {
        setItemToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearch('');
        setCurrentPage(1);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Vendor Questionnaire Management</CardTitle>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setShowUploadForm(true)}>
                            <UploadIcon className="h-4 w-4 mr-2" /> Upload Excel
                        </Button>
                        <Button onClick={() => setShowAddForm(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Add Question
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TableFilter
                        searchPlaceholder="Search by domain or question..."
                        onSearchChange={handleSearchChange}
                        onClear={handleClearFilters}
                    />

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <DataTable
                            columns={[
                                { key: 'domain', label: 'Domain' },
                                {
                                    key: 'type',
                                    label: 'Type',
                                    render: (value: string) => value === 'yes_no' ? 'Yes/No' : value === 'multiple_choice' ? 'Multiple Choice' : 'Free Text'
                                },
                                { key: 'question', label: 'Question' },
                                {
                                    key: 'expected_response',
                                    label: 'Expected Response',
                                    render: (value: string | null) => value || '-'
                                },
                                {
                                    key: 'attachment_required',
                                    label: 'Attachment',
                                    render: (value: boolean) => (
                                        <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {value ? 'Yes' : 'No'}
                                        </span>
                                    ),
                                },
                                { key: 'created_at', label: 'Created', render: (val) => new Date(val).toLocaleDateString() },
                            ]}
                            data={questionnaires}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            actions={(item) => (
                                <div className="flex gap-2">
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => setEditingItem(item)}
                                    >
                                        <Edit className="h-4 w-4 border-primary" />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                        onClick={() => openDeleteConfirm(item.id)}
                                        disabled={isDeleting === item.id}
                                    >
                                        {isDeleting === item.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            )}
                        />
                    )}
                </CardContent>
            </Card>

            <QuestionnaireForm
                open={showAddForm}
                onOpenChange={setShowAddForm}
                onSubmit={handleAdd}
                isSubmitting={isSubmitting}
            />

            <QuestionnaireForm
                open={!!editingItem}
                onOpenChange={(open) => !open && setEditingItem(null)}
                questionnaire={editingItem}
                onSubmit={handleEdit}
                isSubmitting={isSubmitting}
            />

            <QuestionnaireUpload
                open={showUploadForm}
                onOpenChange={setShowUploadForm}
                onUpload={handleUpload}
                isUploading={isUploading}
            />

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the question.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => itemToDelete && handleDelete(itemToDelete)}
                            disabled={isDeleting !== null}
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
        </>
    );
};
