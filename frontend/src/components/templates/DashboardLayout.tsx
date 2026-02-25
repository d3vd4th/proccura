import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/organisms';
import { Navbar } from '@/components/organisms';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex h-screen">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onMenuClick={toggleSidebar} />
                <main className="flex-1 overflow-y-auto bg-background-secondary p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
