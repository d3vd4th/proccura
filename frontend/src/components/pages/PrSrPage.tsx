import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { FileText } from 'lucide-react';

export const PrSrPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">PR & SR</h1>
                <p className="text-muted-foreground">
                    Manage Purchase Requisitions and Service Requests
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Purchase Requisitions & Service Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page is under construction. PR & SR management features coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
