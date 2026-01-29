import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { FileSpreadsheet } from 'lucide-react';

export const QuotationsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
                <p className="text-muted-foreground">
                    View and manage vendor quotations
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Quotations Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page is under construction. Quotations management features coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
