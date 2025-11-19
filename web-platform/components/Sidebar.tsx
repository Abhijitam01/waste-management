'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Upload,
  BarChart3,
  HelpCircle,
  Menu,
  X,
  Waves,
  LogOut,
} from 'lucide-react';
import ModeToggle from './ModeToggle';

interface SidebarProps {
  userEmail?: string;
  onLogout?: () => void;
}

export default function Sidebar({ userEmail, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Upload, label: 'Report Waste', href: '/report' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg border border-border text-foreground shadow-sm"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 h-screen w-72 bg-sidebar border-r border-sidebar-border z-40 flex flex-col"
          >
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border">
              <Link href="/" className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Waves className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-sidebar-foreground">OceanCleanup</h1>
                  <p className="text-xs text-muted-foreground">Connect</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={index} href={item.href}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className={`group relative p-3 rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-sidebar-border space-y-3">
              <div className="flex items-center justify-center">
                <ModeToggle />
              </div>
              {userEmail && (
                <div className="p-3 bg-sidebar-accent rounded-lg border border-sidebar-border">
                  <p className="text-xs text-muted-foreground mb-1">Logged in as</p>
                  <p className="text-sm text-sidebar-foreground truncate font-medium">{userEmail}</p>
                </div>
              )}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 p-3 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 dark:bg-black/60 z-30"
        />
      )}
    </>
  );
}
