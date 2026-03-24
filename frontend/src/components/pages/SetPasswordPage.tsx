import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Input } from '@/components/atoms/input';
import { useToast } from '@/components/atoms/toast';
import { authAPI } from '@/api/auth';
import { Key } from 'lucide-react';

export function SetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { toast } = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('Invalid or missing reset token. Please request a new link.', 'Error');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match', 'Error');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long', 'Error');
            return;
        }

        try {
            setLoading(true);
            await authAPI.resetPassword(token, password);
            toast.success('Your password has been successfully reset. You can now log in.', 'Success');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.detail || 'Failed to reset password', 'Error');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold tracking-tight text-center text-red-600">
                            Invalid Request
                        </CardTitle>
                        <CardDescription className="text-center">
                            The password reset link is invalid or expired. Please request a new link from the forgot password page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button variant="outline" onClick={() => navigate('/forgot-password')}>
                            Request New Reset Link
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        Set Password
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter a new secure password for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-9"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Setting Password...' : 'Set Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
