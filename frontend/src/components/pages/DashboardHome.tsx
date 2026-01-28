import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms';
import {
    FileText,
    MessageSquare,
    ShoppingCart,
    Receipt,
    TrendingUp,
    TrendingDown,
    Package,
} from 'lucide-react';

const stats = [
    {
        title: 'Total Purchase Orders',
        value: '2,345',
        change: '+12.5%',
        trend: 'up',
        icon: ShoppingCart,
    },
    {
        title: 'Pending Invoices',
        value: '87',
        change: '-8.2%',
        trend: 'down',
        icon: Receipt,
    },
    {
        title: 'Active RFQs',
        value: '34',
        change: '+23.1%',
        trend: 'up',
        icon: MessageSquare,
    },
    {
        title: 'Total Vendors',
        value: '156',
        change: '+5.4%',
        trend: 'up',
        icon: Package,
    },
];

const recentActivity = [
    {
        title: 'New Purchase Order',
        description: 'PO-2024-001 created for Office Supplies',
        time: '2 hours ago',
        icon: ShoppingCart,
    },
    {
        title: 'RFQ Submitted',
        description: 'RFQ-2024-045 sent to 5 vendors',
        time: '4 hours ago',
        icon: MessageSquare,
    },
    {
        title: 'Invoice Approved',
        description: 'INV-2024-234 approved for payment',
        time: '6 hours ago',
        icon: Receipt,
    },
    {
        title: 'New Vendor Added',
        description: 'Acme Corp added to vendor list',
        time: '1 day ago',
        icon: Package,
    },
];

export const DashboardHome = () => {
    return (
        <div className="space-y-8">
            {/* Page header */}
            {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your procurement.
        </p>
      </div> */}

            {/* Stats grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                {stat.trend === 'up' ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                )}
                                <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                                    {stat.change}
                                </span>
                                <span>from last month</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Activity */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from your procurement process</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                        <activity.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Frequently used actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <button className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent transition-colors">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium">Create PR/SR</p>
                                <p className="text-xs text-muted-foreground">New purchase requisition</p>
                            </div>
                        </button>
                        <button className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent transition-colors">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium">Send RFQ</p>
                                <p className="text-xs text-muted-foreground">Request for quotation</p>
                            </div>
                        </button>
                        <button className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent transition-colors">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium">Create PO</p>
                                <p className="text-xs text-muted-foreground">New purchase order</p>
                            </div>
                        </button>
                        <button className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent transition-colors">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium">Add Vendor</p>
                                <p className="text-xs text-muted-foreground">Register new vendor</p>
                            </div>
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
