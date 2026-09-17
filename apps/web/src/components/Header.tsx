'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { Shield, Phone, Clock, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

const Header = ({ onToggleMobileMenu }: HeaderProps) => {
  const { user } = useAuthStore();

  if (!user) return null;

  const validDays = user.validDays ?? 0;
  const isExpired = validDays <= 0;

  return (
    <header className="bg-white border-b px-4 md:px-8 py-3 flex items-center justify-between shadow-sm shrink-0">
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 md:hidden transition-colors"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs md:text-sm shrink-0">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="hidden sm:block">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs md:text-sm font-black text-gray-900 truncate max-w-[120px] sm:max-w-none">{user.name || 'User'}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
              user.userType === 'admin'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              <Shield size={10} />
              {user.userType || 'User'}
            </span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium">Logged in account</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* User Phone Number */}
        <div className="hidden md:flex items-center space-x-1.5 text-xs font-bold text-gray-700 bg-gray-100 border px-3 py-1.5 rounded-xl">
          <Phone size={14} className="text-gray-400" />
          <span className="font-mono">+{user.number}</span>
        </div>

        {/* Subscription Days Badge */}
        <div className={`flex items-center space-x-1.5 text-[11px] md:text-xs font-bold px-2.5 md:px-3.5 py-1.5 rounded-xl transition-all ${
          isExpired
            ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          <Clock size={13} />
          <span>{isExpired ? 'Expired' : `${validDays} Days`}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
