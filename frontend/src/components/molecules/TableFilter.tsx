import { Search, X, ChevronDown } from 'lucide-react';
import { Button, Input } from '@/components/atoms';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/atoms';

interface FilterProps {
    searchPlaceholder?: string;
    onSearchChange: (value: string) => void;
    onFilterChange?: (key: string, value: string) => void;
    filterOptions?: Array<{
        key: string;
        label: string;
        options: Array<{ value: string; label: string }>;
    }>;
    onClear: () => void;
}

export const TableFilter = ({
    searchPlaceholder = 'Search...',
    onSearchChange,
    onFilterChange,
    filterOptions = [],
    onClear,
}: FilterProps) => {
    return (
        <div className="flex justify-between gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 max-w-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        className="pl-9"
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Filters */}
            {filterOptions.length > 0 && (
                <div className="flex gap-3 flex-wrap items-center">
                    {filterOptions.map((filter) => (
                        <DropdownMenu key={filter.key}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    {filter.label}
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuItem
                                    onClick={() =>
                                        onFilterChange?.(filter.key, '')
                                    }
                                    className="cursor-pointer"
                                >
                                    All {filter.label}
                                </DropdownMenuItem>
                                {filter.options.map((opt) => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() =>
                                            onFilterChange?.(filter.key, opt.value)
                                        }
                                        className="cursor-pointer"
                                    >
                                        {opt.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClear}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </Button>
                </div>
            )}
        </div>
    );
};
