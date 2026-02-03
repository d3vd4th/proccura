import {
    Pagination,
    PaginationContent,
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
    onPageChange: (page: number) => void;
    onRowClick?: (row: T) => void;
    actions?: (row: T) => React.ReactNode;
}

export const DataTable = <T extends { id: string }>({
    columns,
    data,
    totalPages,
    currentPage,
    onPageChange,
    onRowClick,
    actions,
}: DataTableProps<T>) => {
    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
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

            {/* Pagination */}
            <div className="flex justify-center">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                                className={currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    onClick={() => onPageChange(page)}
                                    isActive={page === currentPage}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                                className={currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};
