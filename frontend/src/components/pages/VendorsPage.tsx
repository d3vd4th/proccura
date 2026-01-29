import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { Users } from 'lucide-react';

export const VendorsPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
                <p className="text-muted-foreground">
                    Manage your vendor relationships
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Vendors Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page is under construction. Vendor management features coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
