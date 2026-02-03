import { useState, useEffect } from 'react';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Input, Label } from '@/components/atoms';
import { RoleData, FeatureWithPermissions } from '@/types/configure';
import { CreateRoleData, UpdateRoleData, rolesAPI } from '@/api/roles';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/atoms';

interface AddRoleFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateRoleData | UpdateRoleData) => void;
    role?: RoleData | null;
    isSubmitting?: boolean;
}

export const AddRoleForm = ({ open, onOpenChange, onSubmit, role, isSubmitting = false }: AddRoleFormProps) => {
    const isEditMode = !!role;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] as string[],
    });

    const [features, setFeatures] = useState<FeatureWithPermissions[]>([]);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
    const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());

    // Fetch permissions grouped by features
    useEffect(() => {
        if (open) {
            const fetchPermissions = async () => {
                try {
                    const data = await rolesAPI.getPermissionsGrouped();
                    setFeatures(data);
                    // Expand all features by default
                    // setExpandedFeatures(new Set(data.map(f => f.id)));
                } catch (error) {
                    console.error('Failed to fetch permissions:', error);
                } finally {
                    setIsLoadingPermissions(false);
                }
            };
            fetchPermissions();
        }
    }, [open]);

    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name || '',
                description: role.description || '',
                permissions: role.permissions || [],
            });
        } else {
            setFormData({
                name: '',
                description: '',
                permissions: [],
            });
        }
    }, [role, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const togglePermission = (permCode: string) => {
        setFormData({
            ...formData,
            permissions: formData.permissions.includes(permCode)
                ? formData.permissions.filter((p) => p !== permCode)
                : [...formData.permissions, permCode],
        });
    };

    const toggleFeature = (featureId: string) => {
        const newExpanded = new Set(expandedFeatures);
        if (newExpanded.has(featureId)) {
            newExpanded.delete(featureId);
        } else {
            newExpanded.add(featureId);
        }
        setExpandedFeatures(newExpanded);
    };

    const toggleAllFeaturePermissions = (feature: FeatureWithPermissions) => {
        const featurePermCodes = feature.permissions.map(p => p.code);
        const allSelected = featurePermCodes.every(code => formData.permissions.includes(code));

        if (allSelected) {
            // Deselect all permissions in this feature
            setFormData({
                ...formData,
                permissions: formData.permissions.filter(p => !featurePermCodes.includes(p)),
            });
        } else {
            // Select all permissions in this feature
            const newPermissions = new Set([...formData.permissions, ...featurePermCodes]);
            setFormData({
                ...formData,
                permissions: Array.from(newPermissions),
            });
        }
    };

    const isFeatureFullySelected = (feature: FeatureWithPermissions) => {
        return feature.permissions.every(p => formData.permissions.includes(p.code));
    };

    const isFeaturePartiallySelected = (feature: FeatureWithPermissions) => {
        const selectedCount = feature.permissions.filter(p => formData.permissions.includes(p.code)).length;
        return selectedCount > 0 && selectedCount < feature.permissions.length;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>{isEditMode ? 'Edit Role' : 'Add New Role'}</SheetTitle>
                    <SheetDescription>
                        {isEditMode ? 'Update role information and permissions.' : 'Create a new role with specific permissions.'}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-4 p-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Role Name *</Label>
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
                                className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-none"
                                rows={3}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Permissions</Label>
                                {features.length > 0 && (
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        {formData.permissions.length} selected
                                    </span>
                                )}
                            </div>
                            {isLoadingPermissions ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                            ) : features.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg">
                                    <p className="text-sm text-muted-foreground">No permissions available</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {features.map((feature) => {
                                        const selectedCount = feature.permissions.filter(p => formData.permissions.includes(p.code)).length;
                                        const isExpanded = expandedFeatures.has(feature.id);

                                        return (
                                            <div
                                                key={feature.id}
                                                className="border rounded-lg overflow-hidden bg-card"
                                            >
                                                {/* Feature Header */}
                                                <div
                                                    className="flex items-center gap-3 p-3 bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors"
                                                    onClick={() => toggleFeature(feature.id)}
                                                >
                                                    <div className="flex-shrink-0">
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <label
                                                        className="flex items-center gap-2 cursor-pointer flex-1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isFeatureFullySelected(feature)}
                                                            ref={(el) => {
                                                                if (el) el.indeterminate = isFeaturePartiallySelected(feature);
                                                            }}
                                                            onChange={() => toggleAllFeaturePermissions(feature)}
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        />
                                                        <span className="text-sm font-medium">{feature.name}</span>
                                                    </label>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCount === feature.permissions.length
                                                            ? 'bg-primary/10 text-primary'
                                                            : selectedCount > 0
                                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                                : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {selectedCount}/{feature.permissions.length}
                                                    </span>
                                                </div>

                                                {/* Permissions List */}
                                                {isExpanded && (
                                                    <div className="p-3 pt-2 grid gap-2">
                                                        {feature.permissions.map((perm) => {
                                                            const isChecked = formData.permissions.includes(perm.code);
                                                            return (
                                                                <label
                                                                    key={perm.id}
                                                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isChecked
                                                                            ? 'bg-primary/5 border border-primary/20'
                                                                            : 'hover:bg-muted/50 border border-transparent'
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => togglePermission(perm.code)}
                                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="text-sm block truncate">
                                                                            {perm.description || perm.name}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground font-mono">
                                                                            {perm.code}
                                                                        </span>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <SheetFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)} type="button" disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {isEditMode ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                isEditMode ? 'Update Role' : 'Add Role'
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
};
