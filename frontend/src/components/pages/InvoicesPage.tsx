import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { Receipt } from 'lucide-react';

export const InvoicesPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                <p className="text-muted-foreground">
                    View and manage invoices
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Invoices Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page is under construction. Invoice management features coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
