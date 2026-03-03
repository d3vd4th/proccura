import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Mail, Phone, Shield, Building2, Pencil, X, Check,
    Loader2, Crown, KeyRound
} from 'lucide-react';
import {
    Card, CardContent, CardHeader, CardTitle, Button, useToast,
} from '@/components/atoms';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loadUser } from '@/store/slices/authSlice';
import { usersAPI, UpdateUserData } from '@/api/users';

export const ProfilePage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const { user } = useAppSelector((state) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone: user?.phone || '',
    });

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const displayName = user.first_name
        ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`
        : user.name || user.email;

    const initials = user.first_name
        ? `${user.first_name.charAt(0)}${user.last_name ? user.last_name.charAt(0) : ''}`
        : (user.name?.charAt(0) || user.email.charAt(0));

    const handleStartEdit = () => {
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const updateData: UpdateUserData = {
                first_name: formData.first_name || undefined,
                last_name: formData.last_name || undefined,
                phone: formData.phone || undefined,
            };
            await usersAPI.update(user.id, updateData);
            toast.success('Profile updated successfully');
            setIsEditing(false);
            // Refresh user data in Redux store
            dispatch(loadUser());
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6 max-w-4xl mx-auto w-full pb-10">
            {/* Header Banner */}
            <div className="relative rounded-2xl bg-linear-to-r from-indigo-100 via-blue-50 to-sky-50 dark:from-primary/15 dark:via-primary/5 dark:to-transparent border border-indigo-200/60 dark:border-border overflow-hidden p-6 md:p-8">
                <div className="absolute top-0 right-0 p-12 opacity-[0.07] pointer-events-none">
                    <User className="w-64 h-64 text-indigo-500" />
                </div>

                <div className="flex items-center gap-5 relative z-10">
                    <Button variant="outline" size="icon" className="rounded-full bg-white/80 dark:bg-background/50 backdrop-blur shrink-0 border-indigo-200/60 dark:border-border" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-16 w-16 bg-linear-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                        {initials.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">{displayName}</h1>
                        <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                            <span className="truncate">{user.email}</span>
                            {user.is_super_admin && (
                                <>
                                    <span className="text-muted-foreground/30">•</span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30">
                                        <Crown className="h-2.5 w-2.5" />
                                        Super Admin
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Personal Information */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="dark:bg-muted/30 border-b py-4 px-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2.5 text-base">
                                <div className="h-7 w-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                Personal Information
                            </CardTitle>
                            {!isEditing ? (
                                <Button variant="outline" size="sm" onClick={handleStartEdit} className="gap-1.5">
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSaving} className="gap-1.5">
                                        <X className="h-3.5 w-3.5" />
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
                                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                        Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* First Name */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-violet-400" /> First Name
                                </p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData(p => ({ ...p, first_name: e.target.value }))}
                                        className="w-full text-sm font-medium text-foreground bg-white dark:bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Enter first name"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-foreground">{user.first_name || <span className="italic text-muted-foreground">Not set</span>}</p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-blue-400" /> Last Name
                                </p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData(p => ({ ...p, last_name: e.target.value }))}
                                        className="w-full text-sm font-medium text-foreground bg-white dark:bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Enter last name"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-foreground">{user.last_name || <span className="italic text-muted-foreground">Not set</span>}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <Phone className="h-3 w-3 text-emerald-400" /> Phone
                                </p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                        className="w-full text-sm font-medium text-foreground bg-white dark:bg-background border border-border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-foreground">{user.phone || <span className="italic text-muted-foreground">Not set</span>}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader className="dark:bg-muted/30 border-b py-4 px-6">
                        <CardTitle className="flex items-center gap-2.5 text-base">
                            <div className="h-7 w-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                <KeyRound className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                            </div>
                            Account Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {/* Email */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <Mail className="h-3 w-3 text-blue-400" /> Email Address
                                </p>
                                <p className="text-sm font-medium text-foreground">{user.email}</p>
                            </div>

                            {/* Role */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <Shield className="h-3 w-3 text-rose-400" /> Role
                                </p>
                                {user.role_name ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {user.role_name}
                                    </span>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No role assigned</p>
                                )}
                            </div>

                            {/* Tenant */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <Building2 className="h-3 w-3 text-amber-400" /> Organization
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                    {localStorage.getItem('tenant_name') || <span className="italic text-muted-foreground">Not set</span>}
                                </p>
                            </div>

                            {/* Account Status */}
                            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                    <Check className="h-3 w-3 text-emerald-400" /> Account Status
                                </p>
                                {user.is_active !== false ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        Inactive
                                    </span>
                                )}
                            </div>

                            {/* Super Admin */}
                            {user.is_super_admin && (
                                <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-muted/20 border border-slate-100 dark:border-border/30">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
                                        <Crown className="h-3 w-3 text-amber-400" /> Admin Level
                                    </p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        Super Admin
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
