'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Send,
  Users,
  Clock,
  ShieldAlert,
  CreditCard,
  Zap,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    totalSent: 0,
    pendingScheduled: 0,
    totalScheduled: 0,
    isExpired: false,
    daysRemaining: 0,
    plans: [],
    recentLogs: [],
    profile: null
  });
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/users/dashboard');
      if (response.data?.status) {
        setStats(response.data.result);
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBuySubscription = async (planId: number | string) => {
    setBuyingId(planId);
    try {
      const res = await api.post('/users/buy-subscription', { planId });
      if (res.data?.status) {
        toast.success('Subscription activated successfully!');
        fetchDashboardData();
      } else {
        toast.error(res.data?.message || 'Subscription failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to purchase subscription');
    } finally {
      setBuyingId(null);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Overview of your WhatsApp automation activity</p>
      </div>

      {/* EXPIRED SUBSCRIPTION BANNER & PLANS */}
      {stats.isExpired && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-red-800">
              <div className="p-3 bg-red-600 text-white rounded-xl">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Your Subscription Has Expired</h3>
                <p className="text-xs text-red-700 mt-0.5">
                  Your valid days have ended. Choose a plan below to reactivate messaging and features.
                </p>
              </div>
            </div>
            <Link
              href="/subscription"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow"
            >
              View Subscription Page
            </Link>
          </div>

          {/* Admin Created Plans List */}
          {stats.plans && stats.plans.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-red-200">
              {stats.plans.map((p: any) => (
                <div key={p.id || p.planId} className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {p.days} Days Access
                      </span>
                      <Zap size={16} className="text-emerald-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">{p.name}</h4>
                    <p className="text-2xl font-black text-gray-900 mt-2">₹{p.price}</p>
                  </div>
                  <button
                    onClick={() => handleBuySubscription(p.id || p.planId)}
                    disabled={buyingId === (p.id || p.planId)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors shadow flex items-center justify-center space-x-2"
                  >
                    {buyingId === (p.id || p.planId) ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Renew Now</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sent"
          value={stats.totalSent || 0}
          icon={Send}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Scheduled"
          value={stats.pendingScheduled || 0}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title="Total Scheduled"
          value={stats.totalScheduled || 0}
          icon={Clock}
          color="bg-emerald-500"
        />
        <StatCard
          title="Account Days Left"
          value={stats.isExpired ? 'Expired (0 Days)' : `${stats.daysRemaining || 0} Days`}
          icon={Users}
          color={stats.isExpired ? 'bg-red-500' : 'bg-indigo-500'}
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">Recent Message Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-600">Receiver</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-600">Message</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-600">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.recentLogs.map((log: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">+{log.receiver}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{log.message}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(Number(log.timestamp)).toLocaleString()}
                  </td>
                </tr>
              ))}
              {stats.recentLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                    No recent logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
