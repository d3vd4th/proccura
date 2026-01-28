import { useState } from 'react';
import { Menu, Bell, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/atoms';
import { SearchField, TenantSwitcher } from '@/components/molecules';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { TenantData } from '@/types/configure';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/atoms';

interface NavbarProps {
    onMenuClick: () => void;
}

const DEFAULT_TENANT: TenantData = {
    id: '1',
    name: 'Acme Corp',
    isActive: true,
};

export const Navbar = ({ onMenuClick }: NavbarProps) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [currentTenant, setCurrentTenant] = useState<TenantData>(DEFAULT_TENANT);
    const isSuperAdmin = user?.is_super_admin === true;

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Tenant Switcher */}
                <div className="hidden sm:block pr-4">
                    <TenantSwitcher
                        currentTenant={currentTenant}
                        tenants={[
                            { id: '1', name: 'Acme Corp', isActive: true },
                            { id: '2', name: 'Tech Solutions', isActive: true },
                        ]}
                        onTenantChange={setCurrentTenant}
                        isSuperAdmin={isSuperAdmin}
                    />
                </div>
            </div>

            {/* Center - Search */}

            {/* Right side */}
            <div className="flex items-center gap-2">
                <SearchField />
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                </Button>

                {/* Settings */}
                {/* <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                </Button> */}

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'NA'}
                            </div>
                            <span className="hidden sm:inline-block text-sm font-medium">
                                {user?.name || user?.email || 'N/A'} 
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
