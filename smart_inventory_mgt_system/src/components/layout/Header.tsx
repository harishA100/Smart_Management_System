import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
} from 'lucide-react';
// Mock data removed
const mockNotifications: any[] = [];

interface HeaderProps {
  pageTitle: string;
  onMobileMenuOpen: () => void;
}

export default function Header({
  pageTitle,
  onMobileMenuOpen,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifTypeStyles: Record<string, string> = {
    error: 'bg-rose-50 text-rose-600',
    warning: 'bg-amber-50 text-amber-600',
    info: 'bg-blue-50 text-blue-600',
    success: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20">
      {/* Left: Mobile menu + Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-900 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-surface-900 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:block flex-1 max-w-lg mx-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search products, suppliers, orders..."
            className="w-full h-9 pl-10 pr-4 rounded-lg border border-surface-200 bg-surface-50/80 text-[13px] text-surface-800 placeholder:text-surface-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-surface-200 overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-surface-900">Notifications</h3>
                <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-surface-50 hover:bg-surface-50/80 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-primary-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          notifTypeStyles[notif.type]
                        }`}
                      >
                        {notif.type}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-surface-900">{notif.title}</p>
                        <p className="text-[11px] text-surface-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-surface-200 hidden sm:block" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-[11px] font-bold">
            AA
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[13px] font-semibold text-surface-900 leading-tight">Anjali Arora</span>
            <span className="text-[11px] text-surface-500 leading-tight">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
