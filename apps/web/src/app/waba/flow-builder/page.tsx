'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { GitFork, Plus, Trash2, Layers, Play, CheckCircle2 } from 'lucide-react';

interface Flow {
  id: number;
  name: string;
  triggerKeyword: string;
  flowData: any;
  isActive: boolean;
}

export default function WabaFlowBuilderPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState('');
  const [triggerKeyword, setTriggerKeyword] = useState('');
  const [stepText, setStepText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      const res = await api.get('/waba/flows');
      if (res.data?.status && Array.isArray(res.data.result)) setFlows(res.data.result);
    } catch (err) {
      toast.error('Failed to load WABA flows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !triggerKeyword || !stepText) {
      toast.error('Please enter flow name, trigger keyword, and step response');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/waba/flows', {
        name,
        triggerKeyword,
        flowData: {
          steps: [
            { type: 'text', message: stepText }
          ]
        }
      });

      if (res.data?.status) {
        toast.success('Interactive WABA Flow created!');
        setName('');
        setTriggerKeyword('');
        setStepText('');
        setShowAdd(false);
        fetchFlows();
      } else {
        toast.error('Failed to create flow');
      }
    } catch (err) {
      toast.error('Error creating flow');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFlow = async (id: number) => {
    try {
      await api.delete(`/waba/flows/${id}`);
      toast.success('Flow deleted');
      fetchFlows();
    } catch (err) {
      toast.error('Failed to delete flow');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading WABA flows...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Meta WABA Flow Builder</h2>
          <p className="text-gray-600 mt-1">Build interactive multi-step chatbot flows for Meta Cloud API</p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow flex items-center space-x-2 text-sm"
        >
          <Plus size={18} />
          <span>New Interactive Flow</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border shadow-md space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Create WABA Interactive Flow</h3>
          <form onSubmit={handleCreateFlow} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Flow Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Qualification Bot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Trigger Keyword</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. start, info, quote"
                  value={triggerKeyword}
                  onChange={(e) => setTriggerKeyword(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Step 1 Message Content</label>
              <textarea
                rows={3}
                required
                placeholder="Type response for Step 1..."
                value={stepText}
                onChange={(e) => setStepText(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all text-sm shadow disabled:opacity-50"
            >
              {saving ? 'Creating Flow...' : 'Create Flow'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {flows.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border text-gray-500 shadow-sm">
            <GitFork size={40} className="mx-auto mb-2 text-gray-300" />
            <h4 className="font-bold text-gray-800">No Interactive WABA Flows</h4>
            <p className="text-xs text-gray-400 mt-1">Click "New Interactive Flow" to create your first flow.</p>
          </div>
        ) : (
          flows.map((f) => (
            <div key={f.id} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-gray-900 text-base">{f.name}</h4>
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                    Trigger: {f.triggerKeyword}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  Steps: {f.flowData?.steps?.length || 1} Interactive Step(s)
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Active
                </span>
                <button onClick={() => handleDeleteFlow(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
