'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FileText, RefreshCw, Plus, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  language: string;
  category: string;
  status: string;
  components: any;
}

export default function WabaTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tempRes, devRes] = await Promise.all([
        api.get('/waba/templates'),
        api.get('/waba/devices'),
      ]);

      if (tempRes.data?.status && Array.isArray(tempRes.data.result)) setTemplates(tempRes.data.result);
      if (devRes.data?.status && Array.isArray(devRes.data.result)) {
        setDevices(devRes.data.result);
        if (devRes.data.result.length > 0) setSelectedDevice(devRes.data.result[0].id);
      }
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromMeta = async () => {
    if (!selectedDevice) {
      toast.error('Please select a WABA Device');
      return;
    }

    setSyncing(true);
    try {
      const res = await api.post('/waba/templates/sync', { deviceId: parseInt(selectedDevice) });
      if (res.data?.status) {
        toast.success('Synced message templates from Meta!');
        fetchData();
      } else {
        toast.error('Failed to sync templates');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error syncing templates from Meta Graph API');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading WABA templates...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Meta Message Templates</h2>
          <p className="text-gray-600 mt-1">Manage and sync Meta-approved WhatsApp Business templates</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="px-3 py-2 border rounded-xl bg-white text-xs"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>+{d.phone}</option>
            ))}
          </select>
          <button
            onClick={handleSyncFromMeta}
            disabled={syncing || !selectedDevice}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow flex items-center space-x-2 text-xs disabled:opacity-50"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            <span>Sync From Meta API</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border text-gray-500 shadow-sm">
            <FileText size={40} className="mx-auto mb-2 text-gray-300" />
            <h4 className="font-bold text-gray-800">No Meta Templates Synced</h4>
            <p className="text-xs text-gray-400 mt-1">Select a WABA device above and click "Sync From Meta API".</p>
          </div>
        ) : (
          templates.map((t) => (
            <div key={t.id || t.name} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {t.category}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{t.language}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">{t.name}</h4>
              </div>

              <div className="pt-3 border-t flex items-center justify-between text-xs">
                <span className="text-gray-500">Meta Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={14} /> {t.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
