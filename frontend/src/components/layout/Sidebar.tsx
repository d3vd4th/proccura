import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  FileSpreadsheet,
  ShoppingCart,
  Receipt,
  Users,
  CreditCard,
  HelpCircle,
  BarChart3,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: any;
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'PR & SR',
    href: '/dashboard/pr-sr',
    icon: FileText,
  },
  {
    title: 'RFQ & RFP',
    href: '/dashboard/rfq-rfp',
    icon: MessageSquare,
  },
  {
    title: 'Quotations',
    href: '/dashboard/quotations',
    icon: FileSpreadsheet,
  },
  {
    title: 'Purchase Orders',
    href: '/dashboard/purchase-orders',
    icon: ShoppingCart,
  },
  {
    title: 'Invoices',
    href: '/dashboard/invoices',
    icon: Receipt,
  },
  {
    title: 'Vendors',
    href: '/dashboard/vendors',
    icon: Users,
  },
  {
    title: 'Payments',
    href: '/dashboard/payments',
    icon: CreditCard,
  },
  {
    title: 'Queries',
    href: '/dashboard/queries',
    icon: HelpCircle,
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">P</span>
            </div> */}
            <span className="text-2xl font-semibold">proccura.</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ',
                    isActive
                      ? 'bg-[#e8e8e8] text-black shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                AD
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">Admin User</p>
                <p className="truncate text-xs text-muted-foreground">admin@proccura.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};