import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { authAPI, TenantInfo } from '@/api/auth';
import { useToast } from '@/components/atoms';
import {
    Mail, Lock, AlertCircle, Loader2,
    ShoppingCart, Building2, ArrowLeft, ChevronRight
} from 'lucide-react';

const emailSchema = z.object({ email: z.string().email('Invalid email address') });
const passwordSchema = z.object({ password: z.string().min(6, 'Password must be at least 6 characters') });

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type LoginStep = 'email' | 'tenant' | 'password';

const STEPS: LoginStep[] = ['email', 'tenant', 'password'];

export default function LoginPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<LoginStep>('email');
    const [email, setEmail] = useState('');
    const [tenants, setTenants] = useState<TenantInfo[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<TenantInfo | null>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [mounted, setMounted] = useState(false);

    const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });
    const passwordForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

    useEffect(() => { setMounted(true); }, []);
    useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
    useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

    const onEmailSubmit = async (data: EmailFormData) => {
        setCheckingEmail(true); setEmailError(null);
        try {
            const res = await authAPI.checkEmail(data.email);
            if (!res.user_exists) { setEmailError('No account found with this email'); return; }
            setEmail(data.email); setIsSuperAdmin(res.is_super_admin); setTenants(res.tenants);
            if (res.is_super_admin) {
                if (res.tenants.length === 0) { setStep('password'); }
                else if (res.tenants.length === 1) { setSelectedTenant(res.tenants[0]); setStep('password'); }
                else { setStep('tenant'); }
            } else {
                if (!res.tenants.length) { setEmailError('No organizations assigned to this account'); return; }
                if (res.tenants.length === 1) { setSelectedTenant(res.tenants[0]); setStep('password'); }
                else { setStep('tenant'); }
            }
        } catch (e: any) { setEmailError(e.response?.data?.detail || 'Failed to check email'); }
        finally { setCheckingEmail(false); }
    };

    const onTenantSelect = (t: TenantInfo) => { setSelectedTenant(t); setStep('password'); };
    const onSkipTenant = () => { setSelectedTenant(null); setStep('password'); };

    const onPasswordSubmit = async (data: PasswordFormData) => {
        const result = await dispatch(loginUser({ email, password: data.password, tenant_id: selectedTenant?.id }));
        if (loginUser.fulfilled.match(result)) {
            selectedTenant?.id ? localStorage.setItem('tenant_id', selectedTenant.id) : localStorage.removeItem('tenant_id');
            toast.success('Welcome back!', 'Login successful');
            navigate('/dashboard');
        }
    };

    const goBack = () => {
        if (step === 'password') { tenants.length > 1 ? setStep('tenant') : (setStep('email'), setSelectedTenant(null)); }
        else if (step === 'tenant') { setStep('email'); setTenants([]); }
    };

    const stepIdx = STEPS.indexOf(step);
    const displayError = error || emailError;

    return (
        <div className="min-h-screen flex bg-background text-foreground font-sans">

            {/* Subtle dot-grid overlay */}
            <div
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.35]"
                style={{
                    backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* ════════ LEFT — Form Panel ════════ */}
            <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">

                {/* Ambient glow */}
                <div
                    className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[140px] opacity-10"
                    style={{ background: 'var(--color-primary)' }}
                />

                <div
                    className="relative w-full max-w-[400px]"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                        transition: 'opacity 0.45s ease, transform 0.45s ease',
                    }}
                >
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mb-9">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                                background: 'var(--color-primary)',
                                boxShadow: '0 4px 16px color-mix(in srgb, var(--color-primary) 40%, transparent)',
                            }}
                        >
                            <ShoppingCart size={16} className="text-white" />
                        </div>
                        <span className="text-foreground font-semibold text-[17px] tracking-tight">
                            proccura<span className="opacity-25">.</span>
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="mb-7">
                        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
                            {step === 'email' && 'Sign in to your account'}
                            {step === 'tenant' && 'Select your workspace'}
                            {step === 'password' && 'Enter your password'}
                        </h1>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {step === 'email' && 'Welcome back — enter your email to continue'}
                            {step === 'tenant' && 'Choose the organization to access'}
                            {step === 'password' && <>Signing in as <span className="text-foreground font-medium">{email}</span></>}
                        </p>
                    </div>

                    {/* Error */}
                    {displayError && (
                        <div
                            className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl text-sm"
                            style={{
                                background: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
                                border: '1px solid color-mix(in srgb, var(--color-destructive) 25%, transparent)',
                                color: 'var(--color-destructive)',
                            }}
                        >
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <span>{displayError}</span>
                        </div>
                    )}

                    {/* ─── Step 1: Email ─── */}
                    {step === 'email' && (
                        <form
                            key="email"
                            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                            className="space-y-5"
                        >
                            <FormField
                                label="Email address"
                                error={emailForm.formState.errors.email?.message}
                                icon={<Mail size={14} className="text-muted-foreground" />}
                            >
                                <input
                                    {...emailForm.register('email')}
                                    type="email"
                                    placeholder="you@company.com"
                                    className={`
                                        w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200
                                        bg-secondary text-foreground border placeholder:text-muted-foreground/40
                                        ${emailForm.formState.errors.email
                                            ? 'border-destructive'
                                            : 'border-border focus:border-primary'}
                                    `}
                                    style={{
                                        boxShadow: emailForm.formState.errors.email
                                            ? '0 0 0 3px color-mix(in srgb, var(--color-destructive) 15%, transparent)'
                                            : undefined,
                                    }}
                                    onFocus={e => {
                                        if (!emailForm.formState.errors.email)
                                            e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent)';
                                    }}
                                    onBlur={e => { e.target.style.boxShadow = ''; }}
                                />
                            </FormField>

                            <SubmitButton loading={checkingEmail} loadingText="Checking…">
                                Continue <ChevronRight size={14} />
                            </SubmitButton>
                        </form>
                    )}

                    {/* ─── Step 2: Tenant ─── */}
                    {step === 'tenant' && (
                        <div key="tenant" className="space-y-4">
                            <BackBtn onClick={goBack} />

                            <InfoBlock>
                                <InfoRow label="Signed in as" value={email} />
                            </InfoBlock>

                            <div className="space-y-2">
                                {tenants.map((tenant) => (
                                    <button
                                        key={tenant.id}
                                        onClick={() => onTenantSelect(tenant)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-secondary border border-border transition-all duration-200 group"
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'color-mix(in srgb, var(--color-primary) 40%, transparent)';
                                            (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--color-primary) 6%, var(--color-secondary))';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = '';
                                            (e.currentTarget as HTMLButtonElement).style.background = '';
                                        }}
                                    >
                                        <div className="w-9 h-9 rounded-lg border border-border bg-background flex items-center justify-center shrink-0">
                                            {tenant.logo_url
                                                ? <img src={tenant.logo_url} alt={tenant.name} className="w-5 h-5 rounded" />
                                                : <Building2 size={15} className="text-muted-foreground" />
                                            }
                                        </div>
                                        <span className="flex-1 text-sm font-medium text-foreground">{tenant.name}</span>
                                        <ChevronRight size={13} className="text-muted-foreground/40 transition-colors group-hover:text-primary" />
                                    </button>
                                ))}
                            </div>

                            {isSuperAdmin && (
                                <button
                                    onClick={onSkipTenant}
                                    className="w-full mt-1 pt-4 border-t border-border text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
                                >
                                    Skip — continue as Platform Admin →
                                </button>
                            )}
                        </div>
                    )}

                    {/* ─── Step 3: Password ─── */}
                    {step === 'password' && (
                        <form
                            key="password"
                            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                            className="space-y-5"
                        >
                            <BackBtn onClick={goBack} />

                            <InfoBlock>
                                <InfoRow label="Email" value={email} />
                                {selectedTenant && (
                                    <InfoRow
                                        label="Organization"
                                        value={selectedTenant.name}
                                        icon={<Building2 size={11} className="text-muted-foreground" />}
                                    />
                                )}
                            </InfoBlock>

                            <FormField
                                label="Password"
                                error={passwordForm.formState.errors.password?.message}
                                icon={<Lock size={14} className="text-muted-foreground" />}
                                suffix={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors px-1"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                }
                            >
                                <input
                                    {...passwordForm.register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoFocus
                                    className={`
                                        w-full pl-10 pr-14 py-2.5 rounded-xl text-sm outline-none transition-all duration-200
                                        bg-secondary text-foreground border placeholder:text-muted-foreground/40
                                        ${passwordForm.formState.errors.password
                                            ? 'border-destructive'
                                            : 'border-border focus:border-primary'}
                                    `}
                                    onFocus={e => {
                                        if (!passwordForm.formState.errors.password)
                                            e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-primary) 18%, transparent)';
                                    }}
                                    onBlur={e => { e.target.style.boxShadow = ''; }}
                                />
                            </FormField>

                            <SubmitButton loading={isLoading} loadingText="Signing in…">
                                Sign in <ChevronRight size={14} />
                            </SubmitButton>
                        </form>
                    )}

                    {/* Progress dots */}
                    <div className="flex items-center justify-center gap-1.5 mt-8">
                        {STEPS.map((s, i) => (
                            <div
                                key={s}
                                className="h-[3px] rounded-full transition-all duration-300"
                                style={{
                                    width: step === s ? '22px' : '6px',
                                    background:
                                        step === s ? 'var(--color-primary)'
                                            : stepIdx > i ? 'color-mix(in srgb, var(--color-primary) 40%, transparent)'
                                                : 'var(--color-border)',
                                }}
                            />
                        ))}
                    </div>

                    {/* Footer */}
                    <p className="mt-7 text-center text-[11px] text-muted-foreground/40 tracking-wide">
                        © {new Date().getFullYear()} <strong className="font-semibold text-muted-foreground/60">proccura.</strong> All rights reserved.
                    </p>
                </div>
            </div>

            {/* ════════ RIGHT — Brand Panel ════════ */}
            <div
                className="hidden lg:flex lg:flex-1 relative overflow-hidden items-center justify-center"
                style={{
                    background: 'linear-gradient(150deg, color-mix(in srgb, var(--color-primary) 10%, var(--color-background)) 0%, var(--color-background) 65%)',
                }}
            >
                {/* Grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-25"
                    style={{
                        backgroundImage: `
                            linear-gradient(var(--color-border) 1px, transparent 1px),
                            linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                    }}
                />

                {/* Radial glow */}
                <div
                    className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.12]"
                    style={{ background: 'var(--color-primary)' }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-sm">

                    {/* Orbital rings */}
                    <div className="relative w-44 h-44 mb-10">
                        {[
                            { size: 'inset-0', dur: '22s', dir: 'normal' as const, dotSize: 'w-3 h-3', dotTop: '-6px' },
                            { size: 'inset-5', dur: '14s', dir: 'reverse' as const, dotSize: 'w-2 h-2', dotTop: '-4px' },
                            { size: 'inset-10', dur: '9s', dir: 'normal' as const, dotSize: 'w-1.5 h-1.5', dotTop: '-3px' },
                        ].map((ring, i) => (
                            <div
                                key={i}
                                className={`absolute ${ring.size} rounded-full border`}
                                style={{
                                    borderColor: `color-mix(in srgb, var(--color-primary) ${20 + i * 10}%, transparent)`,
                                    animation: `spin ${ring.dur} linear infinite`,
                                    animationDirection: ring.dir,
                                }}
                            >
                                <div
                                    className={`absolute ${ring.dotSize} rounded-full left-1/2 -translate-x-1/2`}
                                    style={{
                                        top: ring.dotTop,
                                        background: 'var(--color-primary)',
                                        boxShadow: '0 0 10px 2px color-mix(in srgb, var(--color-primary) 55%, transparent)',
                                    }}
                                />
                            </div>
                        ))}
                        {/* Core */}
                        <div
                            className="absolute inset-[52px] rounded-full flex items-center justify-center border"
                            style={{
                                background: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-card))',
                                borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
                                boxShadow: '0 0 32px color-mix(in srgb, var(--color-primary) 18%, transparent)',
                            }}
                        >
                            <ShoppingCart size={20} style={{ color: 'var(--color-primary)' }} />
                        </div>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                        proccura<span className="opacity-25">.</span>
                    </h2>
                    <p className="mt-3 text-sm uppercase tracking-widest text-muted-foreground leading-relaxed">
                        Where procurement<br />meets intelligence
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mt-8">
                        {['Smart Sourcing', 'AI-Powered', 'Real-time'].map((tag) => (
                            <span
                                key={tag}
                                className="text-[11px] font-medium px-3 py-1 rounded-full border"
                                style={{
                                    background: 'color-mix(in srgb, var(--color-primary) 7%, var(--color-card))',
                                    borderColor: 'color-mix(in srgb, var(--color-primary) 22%, transparent)',
                                    color: 'color-mix(in srgb, var(--color-primary) 85%, var(--color-foreground))',
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom accent line */}
                <div
                    className="absolute bottom-0 left-[20%] right-[20%] h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)', opacity: 0.4 }}
                />
            </div>

            {/* Spin keyframe */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/* ── Tiny shared components ── */

function SubmitButton({ children, loading, loadingText }: {
    children: React.ReactNode; loading?: boolean; loadingText?: string;
}) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
                background: 'var(--color-primary)',
                boxShadow: '0 4px 18px color-mix(in srgb, var(--color-primary) 30%, transparent)',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = ''; }}
        >
            {loading ? <><Loader2 size={14} className="animate-spin" /> {loadingText}</> : children}
        </button>
    );
}

function BackBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-1"
        >
            <ArrowLeft size={11} /> Back
        </button>
    );
}

function FormField({ label, error, icon, suffix, children }: {
    label: string; error?: string; icon: React.ReactNode; suffix?: React.ReactNode; children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>
                {children}
                {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function InfoBlock({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-4 py-3 rounded-xl bg-secondary border border-border space-y-2.5">
            {children}
        </div>
    );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">{icon}{value}</p>
        </div>
    );
}