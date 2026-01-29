import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { MessageSquare } from 'lucide-react';

export const RfqRfpPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">RFQ & RFP</h1>
                <p className="text-muted-foreground">
                    Manage Request for Quotations and Request for Proposals
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Request for Quotations & Proposals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page is under construction. RFQ & RFP management features coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
