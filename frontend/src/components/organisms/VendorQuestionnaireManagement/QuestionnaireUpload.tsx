import { useState } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/atoms';
import { Upload } from 'lucide-react';

interface QuestionnaireUploadProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpload: (file: File) => Promise<void>;
    isUploading: boolean;
}

export const QuestionnaireUpload = ({ open, onOpenChange, onUpload, isUploading }: QuestionnaireUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        await onUpload(selectedFile);
        setSelectedFile(null); // Reset after upload
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Upload Questionnaires</ModalTitle>
                </ModalHeader>
                <div className="py-6 space-y-4">
                    <p className="text-sm text-gray-500">
                        Upload an Excel file (.xls, .xlsx) containing your questionnaires. Required columns are 'Domain' and 'Question'. Optional columns are 'Expected Response' and 'Attachment'.
                    </p>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">XLS, XLSX (MAX. 10MB)</p>
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" accept=".xls,.xlsx" onChange={handleFileChange} />
                        </label>
                    </div>
                    {selectedFile && (
                        <p className="text-sm font-medium text-gray-900">Selected file: {selectedFile.name}</p>
                    )}
                </div>
                <ModalFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload Excel'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
