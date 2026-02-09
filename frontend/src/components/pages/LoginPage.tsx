import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { authAPI, TenantInfo } from '@/api/auth';
import { Button, Input, Label, Alert, AlertDescription, AlertTitle, useToast } from '@/components/atoms';
import { Mail, Lock, AlertCircle, Loader2, Zap, ShoppingCart, Building2, ArrowLeft } from 'lucide-react';

// Step 1: Email schema
const emailSchema = z.object({
    email: z.string().email('Invalid email address'),
});

// Step 3: Password schema
const passwordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type LoginStep = 'email' | 'tenant' | 'password';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    // Multi-step state
    const [step, setStep] = useState<LoginStep>('email');
    const [email, setEmail] = useState('');
    const [tenants, setTenants] = useState<TenantInfo[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<TenantInfo | null>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
    });

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
    });

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard');
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Step 1: Check email
    const onEmailSubmit = async (data: EmailFormData) => {
        setCheckingEmail(true);
        setEmailError(null);
        try {
            const response = await authAPI.checkEmail(data.email);
            if (!response.user_exists) {
                setEmailError('No account found with this email');
                return;
            }

            setEmail(data.email);
            setIsSuperAdmin(response.is_super_admin);
            setTenants(response.tenants);

            // Super admin can skip tenant selection
            if (response.is_super_admin) {
                if (response.tenants.length === 0) {
                    // Super admin with no tenants - go directly to password
                    setStep('password');
                } else if (response.tenants.length === 1) {
                    // Auto-select the only tenant
                    setSelectedTenant(response.tenants[0]);
                    setStep('password');
                } else {
                    // Show tenant selection (optional for super admin)
                    setStep('tenant');
                }
            } else {
                // Regular user - must have tenants
                if (response.tenants.length === 0) {
                    setEmailError('No organizations assigned to this account');
                    return;
                }
                if (response.tenants.length === 1) {
                    setSelectedTenant(response.tenants[0]);
                    setStep('password');
                } else {
                    setStep('tenant');
                }
            }
        } catch (error: any) {
            setEmailError(error.response?.data?.detail || 'Failed to check email');
        } finally {
            setCheckingEmail(false);
        }
    };

    // Step 2: Select tenant
    const onTenantSelect = (tenant: TenantInfo) => {
        setSelectedTenant(tenant);
        setStep('password');
    };

    // Super admin can skip tenant selection
    const onSkipTenantSelection = () => {
        setSelectedTenant(null);
        setStep('password');
    };

    // Step 3: Submit password
    const onPasswordSubmit = async (data: PasswordFormData) => {
        const result = await dispatch(loginUser({
            email,
            password: data.password,
            tenant_id: selectedTenant?.id  // Optional for super admins
        }));
        if (loginUser.fulfilled.match(result)) {
            // Store selected tenant_id in localStorage for X-Tenant-ID header
            if (selectedTenant?.id) {
                localStorage.setItem('tenant_id', selectedTenant.id);
            } else {
                localStorage.removeItem('tenant_id');
            }
            toast.success('Welcome back!', 'Login successful');
            navigate('/dashboard');
        }
    };

    // Go back to previous step
    const goBack = () => {
        if (step === 'password') {
            if (tenants.length > 1) {
                setStep('tenant');
            } else {
                setStep('email');
                setSelectedTenant(null);
            }
        } else if (step === 'tenant') {
            setStep('email');
            setTenants([]);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <ShoppingCart className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {step === 'email' && 'Enter your email to continue'}
                            {step === 'tenant' && 'Select your organization'}
                            {step === 'password' && 'Enter your password to sign in'}
                        </p>
                    </div>

                    {/* Error display */}
                    {(error || emailError) && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error || emailError}</AlertDescription>
                        </Alert>
                    )}

                    {/* Step 1: Email Form */}
                    {step === 'email' && (
                        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        {...emailForm.register('email')}
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className={`pl-10 ${emailForm.formState.errors.email ? 'border-destructive' : ''}`}
                                    />
                                </div>
                                {emailForm.formState.errors.email && (
                                    <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
                                )}
                            </div>
                            <Button type="submit" size="lg" disabled={checkingEmail} className="w-full bg-[#0B1D51] hover:bg-[#0A1A45]">
                                {checkingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Tenant Selection */}
                    {step === 'tenant' && (
                        <div className="space-y-4">
                            <button
                                onClick={goBack}
                                className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </button>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Signing in as</p>
                                <p className="font-medium">{email}</p>
                            </div>
                            <div className="space-y-2">
                                {tenants.map((tenant) => (
                                    <button
                                        key={tenant.id}
                                        onClick={() => onTenantSelect(tenant)}
                                        className="w-full flex items-center p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                            {tenant.logo_url ? (
                                                <img src={tenant.logo_url} alt={tenant.name} className="w-8 h-8 rounded-full" />
                                            ) : (
                                                <Building2 className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <span className="font-medium">{tenant.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Super admin can skip tenant selection */}
                            {isSuperAdmin && (
                                <div className="pt-4 border-t">
                                    <button
                                        onClick={onSkipTenantSelection}
                                        className="w-full p-3 text-sm text-muted-foreground hover:text-foreground text-center"
                                    >
                                        Skip and continue as Platform Admin
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Password Form */}
                    {step === 'password' && (
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                            <button
                                type="button"
                                onClick={goBack}
                                className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </button>

                            {/* Email display (disabled) */}
                            <div className="p-3 bg-muted rounded-lg space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="font-medium">{email}</p>
                                </div>
                                {selectedTenant && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Organization</p>
                                        <p className="font-medium flex items-center">
                                            <Building2 className="mr-2 h-4 w-4" />
                                            {selectedTenant.name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        {...passwordForm.register('password')}
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className={`pl-10 pr-20 ${passwordForm.formState.errors.password ? 'border-destructive' : ''}`}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {passwordForm.formState.errors.password && (
                                    <p className="text-sm text-destructive">{passwordForm.formState.errors.password.message}</p>
                                )}
                            </div>

                            <Button type="submit" size="lg" disabled={isLoading} className="w-full bg-[#0B1D51] hover:bg-[#0A1A45]">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign in
                            </Button>
                        </form>
                    )}

                    {/* Progress indicator */}
                    <div className="flex justify-center space-x-2">
                        {['email', 'tenant', 'password'].map((s, i) => (
                            <div
                                key={s}
                                className={`w-2 h-2 rounded-full transition-colors ${step === s ? 'bg-primary' :
                                    (['email', 'tenant', 'password'].indexOf(step) > i ? 'bg-primary/50' : 'bg-muted')
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="text-center text-xs text-muted-foreground mt-6">
                        Copyright &copy; {new Date().getFullYear()} | <b>proccura.</b> | All rights reserved.
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#0B1D51] to-[#0B1D51]/80 items-center justify-center p-12">
                <div className="max-w-md text-center">
                    <div className="mb-8">
                        <div className="w-64 h-64 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center">
                                <Zap className="w-24 h-24 text-white" />
                            </div>
                        </div>
                    </div>
                    <h2 className="text-3xl text-white">proccura.</h2>
                    <p className="text-md text-primary-foreground/80 mt-4">
                        Where procurement meets intelligence
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
