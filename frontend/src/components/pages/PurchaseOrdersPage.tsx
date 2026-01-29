import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import { ShoppingCart } from 'lucide-react';

export const PurchaseOrdersPage = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                <p className="text-muted-foreground">
                    Create and manage purchase orders
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Purchase Orders Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        This page is under construction. Purchase orders management features coming soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
