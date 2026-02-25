import { useState, useEffect } from 'react';
import { Button, Input, Label, Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/atoms';
import { Questionnaire, QuestionnaireCreate, QuestionnaireUpdate } from '@/api/questionnaires';

interface QuestionnaireFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionnaire?: Questionnaire | null;
    onSubmit: (data: QuestionnaireCreate | QuestionnaireUpdate) => Promise<void>;
    isSubmitting: boolean;
}

export const QuestionnaireForm = ({ open, onOpenChange, questionnaire, onSubmit, isSubmitting }: QuestionnaireFormProps) => {
    const [formData, setFormData] = useState({
        domain: '',
        type: 'text',
        question: '',
        expected_response: '',
        attachment_required: false,
    });

    useEffect(() => {
        if (open) {
            if (questionnaire) {
                setFormData({
                    domain: questionnaire.domain || '',
                    type: questionnaire.type || 'text',
                    question: questionnaire.question || '',
                    expected_response: questionnaire.expected_response || '',
                    attachment_required: questionnaire.attachment_required || false,
                });
            } else {
                setFormData({
                    domain: '',
                    type: 'text',
                    question: '',
                    expected_response: '',
                    attachment_required: false,
                });
            }
        }
    }, [open, questionnaire]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let checked = false;
        if (e.target instanceof HTMLInputElement && type === 'checkbox') {
            checked = e.target.checked;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            // Clear expected_response if type changes away from 'yes_no'
            ...(name === 'type' && value !== 'yes_no' ? { expected_response: '' } : {})
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent>
                <form onSubmit={handleSubmit}>
                    <ModalHeader>
                        <ModalTitle>{questionnaire ? 'Edit Questionnaire' : 'Add Questionnaire'}</ModalTitle>
                    </ModalHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                name="domain"
                                value={formData.domain}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Question Type</Label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="text">Free Text</option>
                                <option value="yes_no">Yes/No</option>
                                <option value="multiple_choice">Multiple Choice</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="question">Question</Label>
                            <Input
                                id="question"
                                name="question"
                                value={formData.question}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {formData.type === 'yes_no' && (
                            <div className="space-y-2">
                                <Label htmlFor="expected_response">Expected Response</Label>
                                <select
                                    id="expected_response"
                                    name="expected_response"
                                    value={formData.expected_response}
                                    onChange={handleChange}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>Select Expected Response</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        )}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="attachment_required"
                                name="attachment_required"
                                checked={formData.attachment_required}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="attachment_required">Attachment Required</Label>
                        </div>
                    </div>
                    <ModalFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};
