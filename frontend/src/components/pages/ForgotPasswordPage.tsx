import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Input } from '@/components/atoms/input';
import { useToast } from '@/components/atoms/toast';
import { authAPI } from '@/api/auth';
import { Mail, ArrowLeft } from 'lucide-react';

export function ForgotPasswordPage() {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(searchParams.get('sent') === 'true');
    const isSetup = searchParams.get('setup') === 'true';
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter your email address', 'Error');
            return;
        }

        try {
            setLoading(true);
            await authAPI.requestPasswordReset(email);
            setSubmitted(true);
            toast.success('If an account exists, a reset link will be sent to your email.', 'Success');
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to request password reset', 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        {isSetup ? 'Account Setup' : 'Forgot Password'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isSetup 
                            ? "We'll send you a secure link to set up your password."
                            : "Enter your email address and we'll send you a link to reset your password."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send reset link'}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                <Mail className="h-6 w-6 text-green-600 dark:text-green-500" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                We've sent an email to <strong>{email}</strong> with instructions to {isSetup ? 'set' : 'reset'} your password.
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Link to="/login" className="flex items-center text-sm text-primary hover:underline hover:text-primary/80">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
