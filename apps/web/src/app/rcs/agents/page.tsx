'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Smartphone, Plus, Trash2, CheckCircle2, ShieldCheck, Sparkles, Sliders, Zap, Loader2 } from 'lucide-react';

interface Agent {
  id: number;
  agentName: string;
  agentId: string;
  status: string;
}

export default function RcsAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');

  // Auto Provisioning State
  const [brandName, setBrandName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [category, setCategory] = useState('RETAIL');
  const [logoUrl, setLogoUrl] = useState('');
  const [provisioning, setProvisioning] = useState(false);

  // Manual Setup State
  const [agentName, setAgentName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [serviceAccountJson, setServiceAccountJson] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/rcs/agents');
      if (res.data?.status && Array.isArray(res.data.result)) setAgents(res.data.result);
    } catch (err) {
      toast.error('Failed to load RCS agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !businessPhone) {
      toast.error('Please enter Brand Name and Business Phone');
      return;
    }

    setProvisioning(true);
    try {
      const res = await api.post('/rcs/agents/auto-provision', {
        brandName,
        phone: businessPhone,
        category,
        logoUrl,
      });

      if (res.data?.status) {
        toast.success('RCS Agent provisioned automatically via Google Partner API!');
        setBrandName('');
        setBusinessPhone('');
        setLogoUrl('');
        fetchAgents();
      } else {
        toast.error('Auto provisioning failed');
      }
    } catch (err: any) {
      toast.error('Error auto provisioning RCS agent');
    } finally {
      setProvisioning(false);
    }
  };

  const handleAddManualAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName || !agentId) {
      toast.error('Please enter Agent Name and Agent ID');
      return;
    }

    setAdding(true);
    try {
      const res = await api.post('/rcs/agents', {
        agentName,
        agentId,
        serviceAccountJson,
      });

      if (res.data?.status) {
        toast.success('Google RCS Agent added successfully!');
        setAgentName('');
        setAgentId('');
        setServiceAccountJson('');
        fetchAgents();
      } else {
        toast.error('Failed to add agent');
      }
    } catch (err) {
      toast.error('Error adding RCS agent');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteAgent = async (id: number) => {
    if (!confirm('Are you sure you want to remove this RCS agent?')) return;
    try {
      await api.delete(`/rcs/agents/${id}`);
      toast.success('RCS Agent removed');
      fetchAgents();
    } catch (err) {
      toast.error('Failed to delete agent');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading RCS agents...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Google RCS Business Agents</h2>
        <p className="text-gray-600 mt-1">Manage official Google RCS Business Messaging agents & auto-provisioning</p>
      </div>

      {/* SETUP SELECTION TABS */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab('auto')}
            className={`pb-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'auto'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sparkles size={18} />
            <span>1-Click Auto Provisioning [Recommended]</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sliders size={18} />
            <span>Manual Service Account Upload</span>
          </button>
        </div>

        {/* TAB 1: AUTO PROVISIONING (RECOMMENDED) */}
        {activeTab === 'auto' && (
          <form onSubmit={handleAutoProvision} className="p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-200 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm">
              <Zap size={18} />
              <span>Google RCS Partner Auto-Provisioning Engine</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Brand / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Business Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 919876543210"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Business Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white"
                >
                  <option value="RETAIL">Retail & E-commerce</option>
                  <option value="FINANCE">Banking & Finance</option>
                  <option value="HEALTHCARE">Healthcare & Services</option>
                  <option value="TRAVEL">Travel & Logistics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Brand Logo Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={provisioning}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-sm shadow disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {provisioning ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              <span>Provision Google RCS Agent Automatically</span>
            </button>
          </form>
        )}

        {/* TAB 2: MANUAL SETUP */}
        {activeTab === 'manual' && (
          <form onSubmit={handleAddManualAgent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brand Official Agent"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">RCS Agent ID / Phone</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. brand_rcs_agent_123"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Google Service Account JSON (Optional)
              </label>
              <textarea
                rows={3}
                placeholder='{"type": "service_account", "project_id": "..."}'
                value={serviceAccountJson}
                onChange={(e) => setServiceAccountJson(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-sm shadow disabled:opacity-50"
            >
              {adding ? 'Adding Agent...' : 'Link RCS Agent Manually'}
            </button>
          </form>
        )}
      </div>

      {/* ACTIVE AGENTS LIST */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Smartphone size={20} className="text-indigo-600" />
          Active RCS Agents ({agents.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.length === 0 ? (
            <div className="md:col-span-2 bg-white p-12 text-center rounded-2xl border text-gray-500 shadow-sm">
              <Smartphone size={40} className="mx-auto mb-2 text-gray-300" />
              <h4 className="font-bold text-gray-800">No RCS Agents Connected</h4>
              <p className="text-xs text-gray-400 mt-1">Use 1-Click Auto Provisioning above to link your RCS agent.</p>
            </div>
          ) : (
            agents.map((a) => (
              <div key={a.id} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">{a.agentName}</h4>
                      <p className="text-xs text-gray-400 font-mono">ID: {a.agentId}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 font-bold text-xs rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>

                <div className="pt-2 text-right border-t">
                  <button
                    onClick={() => handleDeleteAgent(a.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove Agent
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
