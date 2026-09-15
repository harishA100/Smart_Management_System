import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  TrendingUp,
  Truck,
  ShoppingCart,
  Brain,
  BarChart3,
  Settings,
  Store,
  User,
  LogOut,
  X,
  ChevronLeft,
  Menu,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Inventory', path: '/inventory', icon: Warehouse },
  { name: 'Sales', path: '/sales', icon: TrendingUp },
  { name: 'Suppliers', path: '/suppliers', icon: Truck },
  { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
  { name: 'AI Insights', path: '/ai-insights', icon: Brain },
  { name: 'Forecasts', path: '/forecasts', icon: BarChart3 },
];

const bottomNavigation = [
  { name: 'User Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  expanded,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Logo Header */}
      <div className="h-[72px] flex items-center px-7 shrink-0">
        <div className={`flex items-center min-w-0 transition-all duration-300 ${expanded ? 'gap-3.5' : 'gap-0'}`}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#6366f1] text-white">
            <Store className="w-4 h-4" />
          </div>
          <div
            className={`flex items-baseline min-w-0 transition-all duration-300 ease-in-out overflow-hidden ${
              expanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'
            }`}
          >
            <span className="text-[16px] font-bold text-surface-900 whitespace-nowrap tracking-tight">
              Supermarket AI
            </span>
          </div>
        </div>
        
        {/* Toggle button (desktop only) */}
        <button
          onClick={onToggle}
          className="hidden lg:flex ml-auto w-8 h-8 items-center justify-center rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden ml-auto flex w-8 h-8 items-center justify-center rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col justify-between">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `group relative flex items-center h-[48px] pl-7 transition-all duration-300 overflow-hidden ${
                    expanded ? 'w-full gap-3.5' : 'w-full gap-0'
                  } ${
                    isActive
                      ? 'bg-[#f0f7ff] text-blue-600 border-l-4 border-blue-600'
                      : 'text-surface-500 hover:bg-surface-50 hover:text-surface-900 border-l-4 border-transparent'
                  }`
                }
                title={!expanded ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      strokeWidth={1.75}
                      className={`w-[18px] h-[18px] shrink-0 transition-colors duration-300 ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-surface-400 group-hover:text-surface-600'
                      }`}
                    />
                    <div
                      className={`flex items-center whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden ${
                        expanded
                          ? 'opacity-100 max-w-[200px]'
                          : 'opacity-0 max-w-0'
                      }`}
                    >
                      <span className={`text-[14px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                        {item.name}
                      </span>
                    </div>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom Actions */}
        <div className="pb-4">
          <div className="w-full h-px bg-surface-100 my-4" />
          <ul className="space-y-1">
            {bottomNavigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `group relative flex items-center h-[48px] pl-7 transition-all duration-300 overflow-hidden ${
                      expanded ? 'w-full gap-3.5' : 'w-full gap-0'
                    } ${
                      isActive
                        ? 'bg-[#f0f7ff] text-blue-600 border-l-4 border-blue-600'
                        : 'text-surface-500 hover:bg-surface-50 hover:text-surface-900 border-l-4 border-transparent'
                    }`
                  }
                  title={!expanded ? item.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        strokeWidth={1.75}
                        className={`w-[18px] h-[18px] shrink-0 transition-colors duration-300 ${
                          isActive
                            ? 'text-blue-600'
                            : 'text-surface-400 group-hover:text-surface-600'
                        }`}
                      />
                      <div
                        className={`flex items-center whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden ${
                          expanded
                            ? 'opacity-100 max-w-[200px]'
                            : 'opacity-0 max-w-0'
                        }`}
                      >
                        <span className={`text-[14px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                          {item.name}
                        </span>
                      </div>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            
            {/* Logout button */}
            <li>
              <button
                className={`w-full group relative flex items-center h-[48px] pl-7 transition-all duration-300 overflow-hidden text-surface-500 hover:bg-surface-50 hover:text-surface-900 border-l-4 border-transparent ${
                  expanded ? 'w-full gap-3.5' : 'w-full gap-0'
                }`}
                title={!expanded ? 'Logout' : undefined}
              >
                <LogOut strokeWidth={1.75} className="w-[18px] h-[18px] shrink-0 transition-colors duration-300 text-surface-400 group-hover:text-surface-600" />
                <div
                  className={`flex items-center whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden ${
                    expanded
                      ? 'opacity-100 max-w-[200px]'
                      : 'opacity-0 max-w-0'
                  }`}
                >
                  <span className="text-[14px] font-semibold">
                    Logout
                  </span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop sidebar: sticky positioned inside flex container */}
      <aside
        className={`hidden lg:block sticky top-0 h-screen border-r border-surface-200 z-30 transition-all duration-300 ease-in-out bg-white shrink-0 ${
          expanded ? 'w-52' : 'w-[72px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar: fixed slide-out drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-52 border-r border-surface-200 z-50 transition-transform duration-300 ease-in-out shadow-2xl bg-white ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
