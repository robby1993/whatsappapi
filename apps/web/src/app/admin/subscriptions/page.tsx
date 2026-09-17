'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CreditCard, Plus, Trash2, History, Loader2, MoreVertical, Edit2 } from 'lucide-react';

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

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subHistory, setSubHistory] = useState<SubHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // New Plan Form State
  const [planName, setPlanName] = useState('');
  const [planDays, setPlanDays] = useState('30');
  const [planPrice, setPlanPrice] = useState('499');
  const [savingPlan, setSavingPlan] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, historyRes] = await Promise.all([
        api.get('/admin/plans'),
        api.get('/admin/subscription-history'),
      ]);

      if (plansRes.data?.status && Array.isArray(plansRes.data.result)) setPlans(plansRes.data.result);
      if (historyRes.data?.status && Array.isArray(historyRes.data.result)) setSubHistory(historyRes.data.result);
    } catch (err) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (p: Plan) => {
    setActiveMenuId(null);
    setPlanName(p.name);
    setPlanDays(p.days.toString());
    setPlanPrice(p.price.toString());
    toast('Editing plan details in the form above.');
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
    } catch (err) {
      toast.error('Error saving plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    setActiveMenuId(null);
    if (!confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await api.delete(`/admin/plans/${id}`);
      toast.success('Plan deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading subscription plans...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4" ref={menuRef}>
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Subscription & Plans Config</h2>
        <p className="text-gray-600 mt-1">Configure pricing plans and view real-time user subscription audit history</p>
      </div>

      {/* PLAN CONFIGURATION */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard size={20} className="text-purple-600" />
            Active Subscription Plans ({plans.length})
          </h3>
        </div>

        <form onSubmit={handleSavePlan} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-xl border">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Plan Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Pro Monthly"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
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
              className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
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
              className="w-full px-3 py-2 bg-white border rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={savingPlan}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors text-sm shadow flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {savingPlan ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>Add / Save Plan</span>
          </button>
        </form>

        <div className="overflow-x-visible">
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
                <tr key={p.id} className="hover:bg-gray-50 relative">
                  <td className="p-3 font-mono text-xs text-gray-500">{p.planId}</td>
                  <td className="p-3 font-bold text-gray-900">{p.name}</td>
                  <td className="p-3 font-semibold text-purple-700">{p.days} Days</td>
                  <td className="p-3 font-black text-gray-900">₹{p.price}</td>

                  {/* 3-DOT ACTION MENU */}
                  <td className="p-3 text-right relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === p.id ? null : p.id);
                      }}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors inline-flex items-center justify-center"
                      title="More Actions"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* FLOATING ACTION DROPDOWN */}
                    {activeMenuId === p.id && (
                      <div className="absolute right-3 top-10 z-50 w-44 bg-white rounded-xl shadow-xl border p-1 space-y-1 text-left">
                        <button
                          onClick={() => handleEditPlan(p)}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                        >
                          <Edit2 size={16} />
                          <span>Edit Plan</span>
                        </button>

                        <div className="border-t pt-1">
                          <button
                            onClick={() => handleDeletePlan(p.id)}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                            <span>Delete Plan</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUBSCRIPTION AUDIT LOG */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
          <History size={20} className="text-purple-600" />
          User Subscription Purchase Audit History ({subHistory.length})
        </h3>

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
                        <span className="text-xs text-gray-500 font-mono">+{sh.userNumber}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-gray-900">{sh.planName}</td>
                    <td className="p-3 font-medium text-purple-700">+{sh.days} Days</td>
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
    </div>
  );
}
