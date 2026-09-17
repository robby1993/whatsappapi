'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Smartphone, FileText, Bot, Calendar, Zap, MessageSquare } from 'lucide-react';

export default function RcsDashboardPage() {
  const [stats, setStats] = useState<any>({
    agentsCount: 0,
    templatesCount: 0,
    automationsCount: 0,
    campaignsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [agRes, tempRes, autoRes, campRes] = await Promise.all([
        api.get('/rcs/agents').catch(() => ({ data: { result: [] } })),
        api.get('/rcs/templates').catch(() => ({ data: { result: [] } })),
        api.get('/rcs/automation').catch(() => ({ data: { result: [] } })),
        api.get('/rcs/campaigns').catch(() => ({ data: { result: [] } })),
      ]);

      setStats({
        agentsCount: agRes.data?.result?.length || 0,
        templatesCount: tempRes.data?.result?.length || 0,
        automationsCount: autoRes.data?.result?.length || 0,
        campaignsCount: campRes.data?.result?.length || 0,
      });
    } catch (err) {
      console.error('Failed to fetch RCS stats');
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

  if (loading) return <div className="flex items-center justify-center h-full">Loading RCS Dashboard...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">RCS Business Messaging API Dashboard</h2>
        <p className="text-gray-600 mt-1">Google RCS Rich Messaging, Agent management, Rich Cards, and interactive flow bots</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active RCS Agents" value={stats.agentsCount} icon={Smartphone} color="bg-indigo-600" />
        <StatCard title="Rich Card Templates" value={stats.templatesCount} icon={FileText} color="bg-emerald-600" />
        <StatCard title="RCS Automations" value={stats.automationsCount} icon={Bot} color="bg-purple-600" />
        <StatCard title="Scheduled Campaigns" value={stats.campaignsCount} icon={Calendar} color="bg-blue-600" />
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center space-x-3">
          <MessageSquare size={28} className="text-yellow-300" />
          <h3 className="text-xl font-bold">Google RCS Rich Communication Overview</h3>
        </div>
        <p className="text-sm opacity-90 max-w-2xl">
          Use the RCS Business Messaging drawer items to configure Google RCS Business Agents, design Standalone or Carousel Rich Cards with Call-to-Action buttons, send dynamic parameter cards, and create automated interactive bot flows.
        </p>
      </div>
    </div>
  );
}
