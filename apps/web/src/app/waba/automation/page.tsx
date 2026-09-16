'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Bot, Plus, Trash2, CheckCircle2, MessageSquare } from 'lucide-react';

interface Automation {
  id: number;
  triggerKeyword: string;
  responseType: string;
  messageText: string;
  templateName?: string;
  isActive: boolean;
}

export default function WabaAutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const res = await api.get('/waba/automation');
      if (res.data?.status && Array.isArray(res.data.result)) {
        setAutomations(res.data.result);
      }
    } catch (err) {
      toast.error('Failed to load WABA automations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !message) {
      toast.error('Please enter a keyword and response message');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/waba/automation', {
        triggerKeyword: keyword,
        messageText: message,
        responseType: 'text',
      });

      if (res.data?.status) {
        toast.success('WABA Auto-responder rule created!');
        setKeyword('');
        setMessage('');
        setShowAdd(false);
        fetchAutomations();
      } else {
        toast.error('Failed to create auto-responder');
      }
    } catch (err: any) {
      toast.error('Error creating automation');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAutomation = async (id: number) => {
    try {
      await api.delete(`/waba/automation/${id}`);
      toast.success('Automation rule deleted');
      fetchAutomations();
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading WABA automations...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Meta WABA Automations</h2>
          <p className="text-gray-600 mt-1">Configure automated keyword triggers & auto-responders for Meta Cloud API</p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow flex items-center space-x-2 text-sm"
        >
          <Plus size={18} />
          <span>Add Auto-Responder</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border shadow-md space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">New Keyword Auto-Responder</h3>
          <form onSubmit={handleCreateAutomation} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Trigger Keyword</label>
              <input
                type="text"
                required
                placeholder="e.g. price, hello, help"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Automated Response Message</label>
              <textarea
                rows={3}
                required
                placeholder="Type automated response message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all text-sm shadow disabled:opacity-50"
            >
              {saving ? 'Saving Rule...' : 'Save Automation Rule'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {automations.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border text-gray-500 shadow-sm">
            <Bot size={40} className="mx-auto mb-2 text-gray-300" />
            <h4 className="font-bold text-gray-800">No WABA Automation Rules</h4>
            <p className="text-xs text-gray-400 mt-1">Click "Add Auto-Responder" to create your first keyword trigger.</p>
          </div>
        ) : (
          automations.map((a) => (
            <div key={a.id} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full uppercase">
                  Keyword: {a.triggerKeyword}
                </span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{a.messageText}</p>
              </div>
              <button
                onClick={() => handleDeleteAutomation(a.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
