// src/components/layout/DashboardLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {Sidebar} from './Sidebar';
import {Navbar} from './Navbar';

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
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;