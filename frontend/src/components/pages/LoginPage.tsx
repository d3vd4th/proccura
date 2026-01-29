import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { Button, Input, Label, Alert, AlertDescription, AlertTitle, useToast } from '@/components/atoms';
import { Mail, Lock, AlertCircle, Loader2, Zap, ShoppingCart } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard');
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const onSubmit = async (data: LoginFormData) => {
        const result = await dispatch(loginUser({ email: data.email, password: data.password }));
        if (loginUser.fulfilled.match(result)) {
            toast.success('Welcome back!', 'Login successful');
            navigate('/dashboard');
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
                        <p className="mt-2 text-sm text-muted-foreground">Sign in to your Proccura account</p>
                    </div>
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Login failed</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    {...register('email')}
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    {...register('password')}
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={`pl-10 pr-20 ${errors.password ? 'border-destructive' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" size="lg" disabled={isLoading} className="w-full bg-[#0B1D51] hover:bg-[#0A1A45]">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign in
                        </Button>
                    </form>
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
