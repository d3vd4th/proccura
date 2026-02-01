import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms';
import {
    ShoppingCart,
    Receipt,
    FileText,
    Users,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

// Stats data - Procurement focused
const stats = [
    {
        title: 'Purchase Orders',
        value: '156',
        change: '+12%',
        trend: 'up',
        icon: ShoppingCart,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        title: 'Pending Invoices',
        value: '43',
        change: '-8%',
        trend: 'down',
        icon: Receipt,
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-600',
    },
    {
        title: 'Active RFQs',
        value: '28',
        change: '+23%',
        trend: 'up',
        icon: FileText,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
    },
    {
        title: 'Active Vendors',
        value: '89',
        change: '+5%',
        trend: 'up',
        icon: Users,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
    },
];

// Recent Purchase Orders
const recentPOs = [
    {
        poNumber: 'PO-2026-001',
        vendor: 'Acme Supplies Ltd',
        amount: '$12,450',
        status: 'Approved',
        date: '28 Jan 2026',
    },
    {
        poNumber: 'PO-2026-002',
        vendor: 'Global Tech Inc',
        amount: '$8,320',
        status: 'Pending',
        date: '27 Jan 2026',
    },
    {
        poNumber: 'PO-2026-003',
        vendor: 'Prime Materials',
        amount: '$15,780',
        status: 'Approved',
        date: '26 Jan 2026',
    },
    {
        poNumber: 'PO-2026-004',
        vendor: 'FastShip Logistics',
        amount: '$5,200',
        status: 'Draft',
        date: '25 Jan 2026',
    },
    {
        poNumber: 'PO-2026-005',
        vendor: 'Quality Parts Co',
        amount: '$22,100',
        status: 'Approved',
        date: '24 Jan 2026',
    },
];

// Pending Actions
const pendingActions = [
    {
        title: 'RFQ-2026-045 needs approval',
        type: 'RFQ',
        priority: 'high',
        time: '2 hours ago',
    },
    {
        title: 'Invoice INV-2026-112 due tomorrow',
        type: 'Invoice',
        priority: 'medium',
        time: '5 hours ago',
    },
    {
        title: '3 quotations pending review',
        type: 'Quotation',
        priority: 'medium',
        time: '1 day ago',
    },
    {
        title: 'Vendor registration: ABC Corp',
        type: 'Vendor',
        priority: 'low',
        time: '2 days ago',
    },
];

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        Approved: 'bg-green-100 text-green-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Draft: 'bg-gray-100 text-gray-700',
        Rejected: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.Draft}`}>
            {status}
        </span>
    );
};

// Priority icon component
const PriorityIcon = ({ priority }: { priority: string }) => {
    if (priority === 'high') return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (priority === 'medium') return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
};

export const DashboardHome = () => {
    // Procurement Spend Trend - Area Chart
    const spendTrendOption = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: { color: '#374151' },
            formatter: (params: any) => {
                return `<div style="font-weight: 600">${params[0].name}</div>
                        <div style="color: #3B82F6">PO Amount: $${params[0].value.toLocaleString()}</div>
                        <div style="color: #10B981">Invoice Paid: $${params[1].value.toLocaleString()}</div>`;
            },
        },
        legend: {
            data: ['PO Amount', 'Invoice Paid'],
            bottom: 0,
            textStyle: { color: '#6B7280' },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '10%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#9CA3AF' },
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: '#F3F4F6' } },
            axisLabel: {
                color: '#9CA3AF',
                formatter: (value: number) => `$${value / 1000}k`,
            },
        },
        series: [
            {
                name: 'PO Amount',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: { width: 3, color: '#3B82F6' },
                itemStyle: { color: '#3B82F6' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(59, 130, 246, 0.25)' },
                            { offset: 1, color: 'rgba(59, 130, 246, 0.02)' },
                        ],
                    },
                },
                data: [45000, 52000, 48000, 61000, 55000, 72000],
            },
            {
                name: 'Invoice Paid',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: { width: 3, color: '#10B981' },
                itemStyle: { color: '#10B981' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
                            { offset: 1, color: 'rgba(16, 185, 129, 0.02)' },
                        ],
                    },
                },
                data: [38000, 45000, 42000, 55000, 48000, 65000],
            },
        ],
    };

    // PO Status Distribution - Donut Chart
    const poStatusOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
        },
        legend: {
            orient: 'horizontal',
            bottom: 0,
            textStyle: { color: '#6B7280', fontSize: 12 },
        },
        series: [
            {
                type: 'pie',
                radius: ['50%', '75%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#fff',
                    borderWidth: 2,
                },
                label: {
                    show: true,
                    position: 'center',
                    formatter: () => '156\nTotal POs',
                    fontSize: 16,
                    fontWeight: 'bold',
                    lineHeight: 22,
                    color: '#374151',
                },
                emphasis: {
                    label: { show: true, fontSize: 18, fontWeight: 'bold' },
                },
                data: [
                    { value: 98, name: 'Approved', itemStyle: { color: '#10B981' } },
                    { value: 32, name: 'Pending', itemStyle: { color: '#F59E0B' } },
                    { value: 18, name: 'Draft', itemStyle: { color: '#6B7280' } },
                    { value: 8, name: 'Rejected', itemStyle: { color: '#EF4444' } },
                ],
            },
        ],
    };

    // Top Vendors by Spend - Bar Chart
    const topVendorsOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params: any) => `${params[0].name}<br/>Spend: $${params[0].value.toLocaleString()}`,
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true,
        },
        xAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: '#F3F4F6' } },
            axisLabel: {
                color: '#9CA3AF',
                formatter: (value: number) => `$${value / 1000}k`,
            },
        },
        yAxis: {
            type: 'category',
            data: ['FastShip', 'Prime Mat.', 'Global Tech', 'Quality Parts', 'Acme Supplies'],
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#374151', fontSize: 12 },
        },
        series: [
            {
                type: 'bar',
                barWidth: 16,
                itemStyle: {
                    borderRadius: [0, 4, 4, 0],
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 1, y2: 0,
                        colorStops: [
                            { offset: 0, color: '#7cadf7' },
                            { offset: 1, color: '#4991fe' },
                        ],
                    },
                },
                data: [15000, 28000, 35000, 42000, 58000],
            },
        ],
    };

    // Monthly RFQ/Quotation Stats - Bar Chart
    const rfqStatsOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
        },
        legend: {
            data: ['RFQs Sent', 'Quotations Received'],
            bottom: 0,
            textStyle: { color: '#6B7280' },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '10%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#9CA3AF' },
        },
        yAxis: {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: '#F3F4F6' } },
            axisLabel: { color: '#9CA3AF' },
        },
        series: [
            {
                name: 'RFQs Sent',
                type: 'bar',
                barWidth: 12,
                itemStyle: { color: '#8B5CF6', borderRadius: [4, 4, 0, 0] },
                data: [18, 22, 15, 28, 24, 32],
            },
            {
                name: 'Quotations Received',
                type: 'bar',
                barWidth: 12,
                itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] },
                data: [45, 58, 42, 72, 65, 89],
            },
        ],
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-0  hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm mt-1 flex items-center gap-1">
                                        {stat.trend === 'up' ? (
                                            <TrendingUp className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 text-red-500" />
                                        )}
                                        <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                                            {stat.change}
                                        </span>
                                        <span className="text-gray-400">vs last month</span>
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Procurement Spend Trend */}
                <Card className="lg:col-span-2 border-0 ">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Procurement Spend Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts option={spendTrendOption} style={{ height: '300px' }} />
                    </CardContent>
                </Card>

                {/* PO Status Distribution */}
                <Card className="border-0 ">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">PO Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts option={poStatusOption} style={{ height: '300px' }} />
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Vendors */}
                <Card className="border-0 ">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Top Vendors by Spend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts option={topVendorsOption} style={{ height: '280px' }} />
                    </CardContent>
                </Card>

                {/* RFQ Stats */}
                <Card className="border-0 ">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">RFQ & Quotation Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts option={rfqStatsOption} style={{ height: '280px' }} />
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Purchase Orders */}
                <Card className="lg:col-span-2 border-0 ">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Recent Purchase Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-gray-500 border-b">
                                        <th className="pb-3 font-medium">PO Number</th>
                                        <th className="pb-3 font-medium">Vendor</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPOs.map((po) => (
                                        <tr key={po.poNumber} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3.5 text-sm font-medium text-blue-600">{po.poNumber}</td>
                                            <td className="py-3.5 text-sm text-gray-900">{po.vendor}</td>
                                            <td className="py-3.5 text-sm font-medium text-gray-900">{po.amount}</td>
                                            <td className="py-3.5">
                                                <StatusBadge status={po.status} />
                                            </td>
                                            <td className="py-3.5 text-sm text-gray-500">{po.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Actions */}
                <Card className="border-0 ">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Pending Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingActions.map((action, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                            >
                                <PriorityIcon priority={action.priority} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{action.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                            {action.type}
                                        </span>
                                        <span className="text-xs text-gray-400">{action.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};