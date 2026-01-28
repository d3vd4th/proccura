import { Search } from 'lucide-react';
import { Input } from '@/components/atoms';

interface SearchFieldProps {
    placeholder?: string;
    className?: string;
}

export const SearchField = ({
    placeholder = 'Search...',
    className = ''
}: SearchFieldProps) => {
    return (
        <div className={`flex-1 max-w-[300px] ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={placeholder}
                    className="pl-9 bg-background"
                />
            </div>
        </div>
    );
};
