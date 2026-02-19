import { ChevronDown } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/atoms';

interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    totalPages: number;
    currentPage: number;
    total?: number;
    pageSize?: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    onRowClick?: (row: T) => void;
    actions?: (row: T) => React.ReactNode;
}

export const DataTable = <T extends { id: string }>({
    columns,
    data,
    totalPages,
    currentPage,
    total,
    pageSize = 10,
    pageSizeOptions = [10, 20, 30, 50],
    onPageChange,
    onPageSizeChange,
    onRowClick,
    actions,
}: DataTableProps<T>) => {

    const getVisiblePages = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];
        if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, 'ellipsis-end', totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, 'ellipsis-start', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages);
        }
        return pages;
    };

    const startItem = total ? (currentPage - 1) * pageSize + 1 : 0;
    const endItem = total ? Math.min(currentPage * pageSize, total) : data.length;

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Table with internal scroll */}
            <div className="border rounded-lg flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Sticky header */}
                <table className="w-full">
                    <thead className="bg-muted border-b">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground"
                                >
                                    {col.label}
                                </th>
                            ))}
                            {actions && (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                </table>

                <div className="flex-1 overflow-y-auto ">
                    <table className="w-full">
                        <tbody>
                            {!data || data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + (actions ? 1 : 0)}
                                        className="px-4 py-16 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <svg
                                                className="h-12 w-12 text-muted-foreground/50"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                />
                                            </svg>
                                            <p className="text-muted-foreground font-medium">No data found</p>
                                            <p className="text-sm text-muted-foreground/70">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={String(col.key)}
                                                className="px-4 py-3 text-sm text-foreground"
                                            >
                                                {col.render
                                                    ? col.render(row[col.key], row)
                                                    : String(row[col.key])}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td
                                                className="px-4 py-3 text-sm"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {actions(row)}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Footer — always visible at bottom */}
            <div className="flex items-center justify-between pt-4 shrink-0">
                {/* Left: Showing X-Y of Z */}
                <div className="text-sm text-muted-foreground min-w-[150px]">
                    {total !== undefined && total > 0 ? (
                        <>Showing {startItem}-{endItem} of {total}</>
                    ) : data.length > 0 ? (
                        <>{data.length} items</>
                    ) : null}
                </div>

                {/* Center: Shadcn Pagination */}

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>

                        {getVisiblePages().map((page, idx) =>
                            typeof page === 'string' ? (
                                <PaginationItem key={`${page}-${idx}`}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            ) : (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => onPageChange(page)}
                                        isActive={page === currentPage}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        )}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>

                {/* Right: Page Size Selector */}
                <div className="flex items-center gap-2 min-w-[150px] justify-end">
                    {onPageSizeChange && (
                        <>
                            <span className="text-sm text-muted-foreground">Rows</span>
                            <div className="relative">
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        onPageSizeChange(Number(e.target.value));
                                        onPageChange(1);
                                    }}
                                    className="appearance-none border rounded-md px-3 py-1.5 pr-8 text-sm bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {pageSizeOptions.map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
