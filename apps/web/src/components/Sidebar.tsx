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
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const webBaileysItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Connections', path: '/connections', icon: Zap },
    { name: 'Send Message', path: '/send-message', icon: Send },
    { name: 'Schedule Message', path: '/schedule-message', icon: Clock },
    { name: 'Broadcast', path: '/broadcast', icon: Radio },
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

  return (
    <div className="w-64 bg-white h-screen border-r flex flex-col shadow-sm">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-600">MsgPilot</h1>
          <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">WhatsApp Automation</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* SECTION 1: WHATSAPP WEB (BAILEYS) */}
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

        {/* SECTION 2: WHATSAPP BUSINESS API (META CLOUD) */}
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

        {/* ADMIN SECTION */}
        {user?.userType === 'admin' && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              System Admin
            </div>
            <Link
              href="/admin"
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === '/admin'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ShieldCheck size={18} />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="p-4 border-t bg-gray-50">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
