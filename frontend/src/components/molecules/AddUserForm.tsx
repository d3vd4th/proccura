import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button, Input, Label } from '@/components/atoms';
import { rolesAPI } from '@/api/roles';
import { CreateUserData, UpdateUserData } from '@/api/users';
import { UserData } from '@/types/configure';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalDescription,
    ModalFooter,
} from '@/components/atoms';

interface Role {
    id: string;
    name: string;
}

interface AddUserFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateUserData | UpdateUserData) => void;
    user?: UserData | null;
    isSubmitting?: boolean;
}

export const AddUserForm = ({ open, onOpenChange, onSubmit, user, isSubmitting = false }: AddUserFormProps) => {
    const isEditMode = !!user;

    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        role_id: '',
        status: 'ACTIVE',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);

    useEffect(() => {
        if (open) {
            const fetchRoles = async () => {
                try {
                    const response = await rolesAPI.getAll({ limit: 100 });
                    setRoles(response || []);
                } catch (error) {
                    console.error('Failed to fetch roles:', error);
                } finally {
                    setIsLoadingRoles(false);
                }
            };
            fetchRoles();
        }
    }, [open]);

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                password: '',
                role_id: user.role_id || '',
                status: user.status || 'ACTIVE',
            });
        } else {
            setFormData({
                email: '',
                first_name: '',
                last_name: '',
                phone: '',
                password: '',
                role_id: '',
                status: 'ACTIVE',
            });
        }
    }, [user, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            const updateData: UpdateUserData = {
                first_name: formData.first_name,
                last_name: formData.last_name || undefined,
                phone: formData.phone || undefined,
                status: formData.status,
                role_id: formData.role_id || undefined,
            };
            onSubmit(updateData);
        } else {
            onSubmit(formData as CreateUserData);
        }
    };

    return (
        <Modal open={open} onOpenChange={onOpenChange}>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>{isEditMode ? 'Edit User' : 'Add New User'}</ModalTitle>
                    <ModalDescription>
                        {isEditMode ? 'Update user information below.' : 'Fill in the details to create a new user.'}
                    </ModalDescription>
                </ModalHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email {!isEditMode && '*'}</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required={!isEditMode}
                            disabled={isEditMode}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                            id="first_name"
                            placeholder="John"
                            value={formData.first_name}
                            onChange={(e) =>
                                setFormData({ ...formData, first_name: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                            id="last_name"
                            placeholder="Doe"
                            value={formData.last_name}
                            onChange={(e) =>
                                setFormData({ ...formData, last_name: e.target.value })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                        />
                    </div>

                    {!isEditMode && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="role_id">Role *</Label>
                        {isLoadingRoles ? (
                            <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">Loading roles...</span>
                            </div>
                        ) : (
                            <select
                                id="role_id"
                                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                                value={formData.role_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, role_id: e.target.value })
                                }
                                required
                            >
                                <option value="">Select a role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {isEditMode && (
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({ ...formData, status: e.target.value })
                                }
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SUSPENDED">Suspended</option>
                                <option value="INVITED">Invited</option>
                            </select>
                        </div>
                    )}

                    <ModalFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} type="button" disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoadingRoles || isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {isEditMode ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                isEditMode ? 'Update User' : 'Add User'
                            )}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};
