'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, CreditCard, Sparkles } from 'lucide-react';

export default function SubscriptionLock() {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-red-600 text-white rounded-xl">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-900">Subscription Expired</h3>
          <p className="text-xs text-red-700 mt-0.5">
            Your messaging features are locked. Please choose a subscription plan to reactivate messaging.
          </p>
        </div>
      </div>
      <Link
        href="/subscription"
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow flex items-center gap-2 shrink-0"
      >
        <CreditCard size={16} />
        <span>Renew Subscription</span>
      </Link>
    </div>
  );
}
