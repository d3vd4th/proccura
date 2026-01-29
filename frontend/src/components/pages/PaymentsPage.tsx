import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { CreditCard } from 'lucide-react';

export const PaymentsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                <p className="text-muted-foreground">
                    Track and manage payments
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payments Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page is under construction. Payment management features coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
