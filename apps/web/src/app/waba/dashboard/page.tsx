'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Smartphone, FileText, Bot, Send, Calendar, CheckCircle2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WabaDashboardPage() {
  const [stats, setStats] = useState<any>({
    devicesCount: 0,
    templatesCount: 0,
    automationsCount: 0,
    campaignsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWabaStats();
  }, []);

  const fetchWabaStats = async () => {
    try {
      const [devRes, tempRes, autoRes, campRes] = await Promise.all([
        api.get('/waba/devices').catch(() => ({ data: { result: [] } })),
        api.get('/waba/templates').catch(() => ({ data: { result: [] } })),
        api.get('/waba/automation').catch(() => ({ data: { result: [] } })),
        api.get('/waba/campaigns').catch(() => ({ data: { result: [] } })),
      ]);

      setStats({
        devicesCount: devRes.data?.result?.length || 0,
        templatesCount: tempRes.data?.result?.length || 0,
        automationsCount: autoRes.data?.result?.length || 0,
        campaignsCount: campRes.data?.result?.length || 0,
      });
    } catch (err) {
      console.error('Failed to fetch WABA stats');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center space-x-4">
      <div className={`p-3.5 rounded-xl ${color} text-white shadow-sm`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-xs font-semibold uppercase">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-full">Loading WABA Dashboard...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">WhatsApp Business API Dashboard</h2>
        <p className="text-gray-600 mt-1">Official Meta Cloud API analytics, devices, and automated workflows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Meta WABA Devices" value={stats.devicesCount} icon={Smartphone} color="bg-blue-600" />
        <StatCard title="Synced Templates" value={stats.templatesCount} icon={FileText} color="bg-emerald-600" />
        <StatCard title="Active Automations" value={stats.automationsCount} icon={Bot} color="bg-purple-600" />
        <StatCard title="Scheduled Campaigns" value={stats.campaignsCount} icon={Calendar} color="bg-indigo-600" />
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center space-x-3">
          <Zap size={28} className="text-yellow-300" />
          <h3 className="text-xl font-bold">Meta Cloud API Operational Overview</h3>
        </div>
        <p className="text-sm opacity-90 max-w-2xl">
          Use the WhatsApp Business API navigation drawer on the left to add your Meta WABA credentials (Phone Number ID & Access Token), sync approved templates, run dynamic parameters broadcasts, or configure interactive flow builders.
        </p>
      </div>
    </div>
  );
}
