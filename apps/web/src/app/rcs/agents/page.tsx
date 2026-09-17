'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Smartphone, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Agent {
  id: number;
  agentName: string;
  agentId: string;
  status: string;
}

export default function RcsAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

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

  const handleAddAgent = async (e: React.FormEvent) => {
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
        setShowAdd(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Google RCS Agents</h2>
          <p className="text-gray-600 mt-1">Manage official Google RCS Business Messaging agents & service account keys</p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow flex items-center space-x-2 text-sm"
        >
          <Plus size={18} />
          <span>Add Google RCS Agent</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border shadow-md space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Link Google RCS Business Agent</h3>
          <form onSubmit={handleAddAgent} className="space-y-4">
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
              {adding ? 'Adding Agent...' : 'Link RCS Agent'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.length === 0 ? (
          <div className="md:col-span-2 bg-white p-12 text-center rounded-2xl border text-gray-500 shadow-sm">
            <Smartphone size={40} className="mx-auto mb-2 text-gray-300" />
            <h4 className="font-bold text-gray-800">No RCS Agents Connected</h4>
            <p className="text-xs text-gray-400 mt-1">Click "Add Google RCS Agent" to link your RCS agent.</p>
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
  );
}
