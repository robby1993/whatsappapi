'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  LogOut,
  Zap,
  ShieldCheck,
  Send,
  Radio,
  CreditCard,
  Smartphone,
  Layers,
  FileText,
  Sliders,
  Bot,
  Calendar,
  GitFork,
  Users,
  Settings,
  Database,
  Key,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar = ({ isOpenMobile = false, onCloseMobile }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const webBaileysItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Connections', path: '/connections', icon: Zap },
    { name: 'Chats', path: '/chats', icon: MessageSquare },
    { name: 'Send Message', path: '/send-message', icon: Send },
    { name: 'Schedule Message', path: '/schedule-message', icon: Clock },
    { name: 'Broadcast', path: '/broadcast', icon: Radio },
    { name: 'Automation', path: '/automation', icon: Bot },
    { name: 'Subscription', path: '/subscription', icon: CreditCard },
  ];

  const wabaItems = [
    { name: 'Dashboard', path: '/waba/dashboard', icon: LayoutDashboard },
    { name: 'Devices', path: '/waba/devices', icon: Smartphone },
    { name: 'Bulk Messages', path: '/waba/bulk-messages', icon: Layers },
    { name: 'Templates', path: '/waba/templates', icon: FileText },
    { name: 'Dynamic Message', path: '/waba/dynamic-message', icon: Sliders },
    { name: 'Automation', path: '/waba/automation', icon: Bot },
    { name: 'Campaigns', path: '/waba/campaigns', icon: Calendar },
    { name: 'Flow Builder', path: '/waba/flow-builder', icon: GitFork },
  ];

  const rcsItems = [
    { name: 'Dashboard', path: '/rcs/dashboard', icon: LayoutDashboard },
    { name: 'RCS Agents', path: '/rcs/agents', icon: Smartphone },
    { name: 'Bulk Messages', path: '/rcs/bulk-messages', icon: Layers },
    { name: 'Rich Templates', path: '/rcs/templates', icon: FileText },
    { name: 'Dynamic Card', path: '/rcs/dynamic-card', icon: Sliders },
    { name: 'Automation', path: '/rcs/automation', icon: Bot },
    { name: 'Campaigns', path: '/rcs/campaigns', icon: Calendar },
    { name: 'Flow Builder', path: '/rcs/flow-builder', icon: GitFork },
  ];

  const adminItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Subscriptions & Plans', path: '/admin/subscriptions', icon: CreditCard },
    { name: 'Configuration & Keys', path: '/admin/settings', icon: Key },
    { name: 'Database Backup', path: '/admin/backup', icon: Database },
  ];

  const showWebBaileys = user?.allowWebBaileys !== false;
  const showWaba = user?.allowWaba !== false;
  const showRcs = user?.allowRcs !== false;

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR DRAWER */}
      <div
        className={`w-64 bg-white h-screen border-r flex flex-col shadow-xl md:shadow-sm z-50 fixed md:static inset-y-0 left-0 transform transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-600">MsgPilot</h1>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">Omnichannel Messaging</p>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-gray-400 hover:text-gray-600 md:hidden rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* SECTION 1: WHATSAPP WEB (BAILEYS) */}
          {showWebBaileys && (
            <div>
              <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span>WhatsApp Web (Baileys)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="space-y-1">
                {webBaileysItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onCloseMobile}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: WHATSAPP BUSINESS API (META CLOUD) */}
          {showWaba && (
            <div>
              <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span>WhatsApp Business API</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div className="space-y-1">
                {wabaItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onCloseMobile}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: RCS BUSINESS MESSAGING API */}
          {showRcs && (
            <div>
              <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span>RCS Business Messaging</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              </div>
              <div className="space-y-1">
                {rcsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onCloseMobile}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: SYSTEM ADMIN SECTION */}
          {user?.userType === 'admin' && (
            <div>
              <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                <span>System Admin</span>
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              </div>
              <div className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onCloseMobile}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={() => {
              onCloseMobile?.();
              logout();
            }}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
