'use client';

import React, { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { useAuthStore } from '@/store/authStore';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { init, user, initialized } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);
  const isChatPage = pathname === '/chats';

  useEffect(() => {
    if (initialized && !user && !isAuthPage) {
      router.push('/login');
    }
  }, [user, pathname, router, initialized, isAuthPage]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" />
        {!initialized ? (
          <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : isAuthPage ? (
          children
        ) : (
          <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar
              isOpenMobile={isMobileOpen}
              onCloseMobile={() => setIsMobileOpen(false)}
            />
            <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
              <Header onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)} />
              <main className={isChatPage ? 'flex-1 overflow-hidden bg-[#efeae2]' : 'flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50'}>
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
