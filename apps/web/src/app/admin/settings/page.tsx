'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Key, CreditCard, Zap, Save, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
  const [metaAppId, setMetaAppId] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/admin/config');
      if (res.data?.result) {
        setRazorpayKeyId(res.data.result.razorpayKeyId || '');
        setRazorpayKeySecret(res.data.result.razorpayKeySecret || '');
        setMetaAppId(res.data.result.metaAppId || '');
        setMetaAppSecret(res.data.result.metaAppSecret || '');
      }
    } catch (err) {
      toast.error('Failed to load system config');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/admin/config', {
        razorpayKeyId,
        razorpayKeySecret,
        metaAppId,
        metaAppSecret,
      });

      if (res.data?.status) {
        toast.success('System API Integration Config saved!');
        fetchConfig();
      } else {
        toast.error('Failed to save config');
      }
    } catch (err) {
      toast.error('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">System Integration Settings</h2>
        <p className="text-gray-600 mt-1">Configure system-wide payment gateway keys and Meta Cloud API credentials</p>
      </div>

      <form onSubmit={handleSaveConfig} className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Razorpay Credentials */}
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
                className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Razorpay Key Secret</label>
              <input
                type="password"
                placeholder="••••••••"
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          {/* Meta App Credentials */}
          <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4">
            <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
              <Zap size={18} className="text-blue-600" /> Meta WABA App Credentials
            </h4>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Meta App ID</label>
              <input
                type="text"
                placeholder="e.g. 123456789012345"
                value={metaAppId}
                onChange={(e) => setMetaAppId(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Meta App Secret</label>
              <input
                type="password"
                placeholder="••••••••"
                value={metaAppSecret}
                onChange={(e) => setMetaAppSecret(e.target.value)}
                className="w-full px-3 py-2 bg-white border rounded-lg text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow text-sm disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Save System Integration Keys</span>
        </button>
      </form>
    </div>
  );
}
