import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/inventory': 'Inventory',
  '/sales': 'Sales',
  '/suppliers': 'Suppliers',
  '/purchase-orders': 'Purchase Orders',
  '/ai-insights': 'AI Insights',
  '/forecasts': 'Forecasts',
  '/settings': 'Settings',
};

export default function MainLayout() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Supermarket AI';

  return (
    <div className="flex min-h-screen bg-surface-50 font-sans text-surface-900 selection:bg-primary-500/30">
      <Sidebar
        expanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        <Header
          pageTitle={pageTitle}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-8 lg:p-10 w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
