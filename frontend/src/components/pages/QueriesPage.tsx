import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { HelpCircle } from 'lucide-react';

export const QueriesPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Queries</h1>
                <p className="text-muted-foreground">
                    View and respond to queries
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Queries Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page is under construction. Query management features coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
