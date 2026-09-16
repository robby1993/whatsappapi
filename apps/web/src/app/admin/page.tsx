'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Users,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Settings,
  Download,
  Loader2,
  CreditCard,
  Plus,
  Zap,
  History,
  Check,
  Key,
  Save,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  id: number;
  planId: string;
  name: string;
  days: number;
  price: number;
}

interface SubHistory {
  id: number;
  userNumber: string;
  userName: string;
  planName: string;
  days: number;
  price: number;
  paymentMethod: string;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subHistory, setSubHistory] = useState<SubHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // New Plan Form State
  const [planName, setPlanName] = useState('');
  const [planDays, setPlanDays] = useState('30');
  const [planPrice, setPlanPrice] = useState('499');
  const [savingPlan, setSavingPlan] = useState(false);

  // System Config State (Razorpay & Meta WABA)
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [metaAppId, setMetaAppId] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes, plansRes, historyRes, configRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/admin/plans'),
        api.get('/admin/subscription-history'),
        api.get('/admin/config').catch(() => ({ data: { result: {} } })),
      ]);

      if (usersRes.data.status) setUsers(usersRes.data.result);
      if (statsRes.data.status) setStats(statsRes.data.result);
      if (plansRes.data.status && Array.isArray(plansRes.data.result)) setPlans(plansRes.data.result);
      if (historyRes.data?.status && Array.isArray(historyRes.data.result)) setSubHistory(historyRes.data.result);

      if (configRes.data?.result) {
        setRazorpayKeyId(configRes.data.result.razorpayKeyId || '');
        setRazorpayKeySecret(configRes.data.result.razorpayKeySecret || '');
        setMetaAppId(configRes.data.result.metaAppId || '');
        setMetaAppSecret(configRes.data.result.metaAppSecret || '');
      }
    } catch (error) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await api.post('/admin/config', {
        razorpayKeyId,
        razorpayKeySecret,
        metaAppId,
        metaAppSecret,
      });

      if (res.data?.status) {
        toast.success('System API Integration Config saved successfully!');
        fetchData();
      } else {
        toast.error('Failed to save configuration');
      }
    } catch (err: any) {
      toast.error('Error saving system configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planDays || !planPrice) {
      toast.error('Please fill in Plan Name, Days, and Price');
      return;
    }

    setSavingPlan(true);
    try {
      const days = parseInt(planDays);
      const price = parseFloat(planPrice);
      const planId = planName.toLowerCase().replace(/\s+/g, '-') + '-' + days;

      const res = await api.post('/admin/plans', {
        planId,
        name: planName,
        days,
        price,
      });

      if (res.data?.status) {
        toast.success('Subscription Plan saved successfully!');
        setPlanName('');
        fetchData();
      } else {
        toast.error('Failed to save plan');
      }
    } catch (err: any) {
      toast.error('Error saving plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await api.delete(`/admin/plans/${id}`);
      toast.success('Plan deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  const downloadBackup = async () => {
    setDownloading(true);
    try {
      const res = await api.get('/admin/backup-database');
      if (res.data?.status && res.data?.result) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(res.data.result, null, 2)
        )}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute(
          'download',
          `database_backup_${new Date().toISOString().slice(0, 10)}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success('Database backup downloaded successfully!');
      } else {
        toast.error('Failed to generate database backup');
      }
    } catch (err: any) {
      toast.error('Error downloading database backup');
    } finally {
      setDownloading(false);
    }
  };

  const toggleUserStatus = async (number: string, currentStatus: boolean, validDays: number) => {
    try {
      await api.post('/admin/update-user', {
        number,
        isActive: !currentStatus,
        validDays
      });
      toast.success('User status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const updateValidDays = async (number: string, isActive: boolean, currentDays: number) => {
    const newDays = prompt('Enter new valid days:', currentDays.toString());
    if (newDays === null) return;

    try {
      await api.post('/admin/update-user', {
        number,
        isActive,
        validDays: parseInt(newDays)
      });
      toast.success('Subscription updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading admin panel...</div>;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600">Global user management, integration settings, and system health</p>
        </div>

        {/* Database Backup Export Button */}
        <button
          onClick={downloadBackup}
          disabled={downloading}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow flex items-center space-x-2 text-sm disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Exporting Backup...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Download Database Backup</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Users</p>
          <p className="text-2xl font-black">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Active Accounts</p>
          <p className="text-2xl font-black text-green-600">{stats?.activeUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Messages</p>
          <p className="text-2xl font-black text-blue-600">{stats?.totalMessages || 0}</p>
        </div>
      </div>

      {/* ------------ SYSTEM INTEGRATIONS CONFIG (RAZORPAY & META WABA) ------------ */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Key size={20} className="text-emerald-600" />
            System API Integrations Configuration (Admin Only)
          </h3>
          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            Global Credentials
          </span>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Razorpay Keys */}
            <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-4">
              <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <CreditCard size={18} className="text-emerald-600" /> Razorpay Payment Credentials
              </h4>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  placeholder="rzp_live_..."
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Razorpay Key Secret</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Meta App Credentials */}
            <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4">
              <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                <Zap size={18} className="text-blue-600" /> Meta WhatsApp Business API App Credentials
              </h4>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Meta App ID</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012345"
                  value={metaAppId}
                  onChange={(e) => setMetaAppId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Meta App Secret</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={metaAppSecret}
                  onChange={(e) => setMetaAppSecret(e.target.value)}
                  className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingConfig}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow text-sm disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {savingConfig ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Save Integration Configurations</span>
          </button>
        </form>
      </div>

      {/* ------------ SUBSCRIPTION PLANS MANAGEMENT ------------ */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={20} className="text-emerald-600" />
            Subscription Plans Config
          </h3>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
            {plans.length} Active Plans
          </span>
        </div>

        {/* Add Plan Form */}
        <form onSubmit={handleSavePlan} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-xl border">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Plan Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Pro Monthly"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Access Days</label>
            <input
              type="number"
              required
              placeholder="e.g. 30"
              value={planDays}
              onChange={(e) => setPlanDays(e.target.value)}
              className="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Price (₹)</label>
            <input
              type="number"
              required
              placeholder="e.g. 499"
              value={planPrice}
              onChange={(e) => setPlanPrice(e.target.value)}
              className="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={savingPlan}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm shadow flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {savingPlan ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>Add / Save Plan</span>
          </button>
        </form>

        {/* Plans List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Plan ID</th>
                <th className="p-3">Plan Name</th>
                <th className="p-3">Access Days</th>
                <th className="p-3">Price</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs text-gray-500">{p.planId}</td>
                  <td className="p-3 font-bold text-gray-900">{p.name}</td>
                  <td className="p-3 font-semibold text-emerald-700">{p.days} Days</td>
                  <td className="p-3 font-black text-gray-900">₹{p.price}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeletePlan(p.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------ USER SUBSCRIPTION HISTORY LOG ------------ */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <History size={20} className="text-emerald-600" />
            User Subscription Purchase History ({subHistory.length})
          </h3>
        </div>

        {subHistory.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center italic">No subscription purchases logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Plan Purchased</th>
                  <th className="p-3">Days Added</th>
                  <th className="p-3">Price Paid</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {subHistory.map((sh) => (
                  <tr key={sh.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{sh.userName || 'User'}</span>
                        <span className="text-xs text-gray-500">+{sh.userNumber}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-gray-900">{sh.planName}</td>
                    <td className="p-3 font-medium text-emerald-700">+{sh.days} Days</td>
                    <td className="p-3 font-black text-gray-900">₹{sh.price}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono font-medium">
                        {sh.paymentMethod || 'Direct'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-gray-500">
                      {new Date(sh.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------ USER MANAGEMENT TABLE ------------ */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Users size={20} className="text-emerald-600" />
            <span>User Management</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Subscription</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{u.name}</span>
                      <span className="text-xs text-gray-500">+{u.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                      u.userType === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.userType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive ? (
                      <span className="flex items-center text-green-600 text-sm font-bold">
                        <CheckCircle2 size={14} className="mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-500 text-sm font-bold">
                        <XCircle size={14} className="mr-1" /> Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-sm font-medium">{u.validDays} Days</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleUserStatus(u.number, u.isActive, u.validDays)}
                        className={`p-2 rounded-lg transition-colors ${
                          u.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={u.isActive ? 'Block User' : 'Unblock User'}
                      >
                        <ShieldAlert size={18} />
                      </button>
                      <button
                        onClick={() => updateValidDays(u.number, u.isActive, u.validDays)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Extend Subscription"
                      >
                        <Settings size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
