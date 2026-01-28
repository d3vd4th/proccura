import { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input, Label } from '@/components/atoms';

interface AddRoleFormProps {
    onSubmit: (data: any) => void;
    onClose: () => void;
}

export const AddRoleForm = ({ onSubmit, onClose }: AddRoleFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[],
    });

    const availablePermissions = [
        'read_users',
        'create_users',
        'edit_users',
        'delete_users',
        'read_roles',
        'create_roles',
        'edit_roles',
        'delete_roles',
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({ name: '', description: '', permissions: [] });
    };

    const togglePermission = (perm: string) => {
        setFormData({
            ...formData,
            permissions: formData.permissions.includes(perm)
                ? formData.permissions.filter((p) => p !== perm)
                : [...formData.permissions, perm],
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Add New Role</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Editor"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            placeholder="Describe this role"
                            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Permissions</Label>
                        <div className="space-y-2">
                            {availablePermissions.map((perm) => (
                                <label
                                    key={perm}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.permissions.includes(perm)}
                                        onChange={() => togglePermission(perm)}
                                        className="rounded"
                                    />
                                    <span className="text-sm capitalize">
                                        {perm.replace(/_/g, ' ')}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="outline" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button type="submit">Add Role</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
