'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Bot,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Smartphone,
  MoreVertical,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface ChatFlow {
  id: number;
  name: string;
  triggerKeywords: string[];
  botPhone?: string;
  steps: any[];
  isActive: boolean;
}

export default function BaileysAutomationPage() {
  const [flows, setFlows] = useState<ChatFlow[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [selectedPhone, setSelectedPhone] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [saving, setSaving] = useState(false);

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
      const [flowsRes, sessionsRes] = await Promise.all([
        api.get('/chatflows'),
        api.get('/whatsapp/user-sessions'),
      ]);

      if (flowsRes.data?.status && Array.isArray(flowsRes.data.result)) setFlows(flowsRes.data.result);
      if (sessionsRes.data?.status && Array.isArray(sessionsRes.data.result)) {
        setSessions(sessionsRes.data.result.filter((s: any) => s.status === 'connected'));
      }
    } catch (err) {
      toast.error('Failed to load automation flows');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !keywordsText || !replyMessage) {
      toast.error('Please fill in Rule Name, Trigger Keywords, and Reply Message');
      return;
    }

    const keywords = keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    setSaving(true);
    try {
      const res = await api.post('/chatflows', {
        name,
        triggerKeywords: keywords,
        botPhone: selectedPhone || null,
        steps: [
          {
            type: 'text',
            message: replyMessage,
          },
        ],
        isActive: true,
      });

      if (res.data?.status) {
        toast.success('WhatsApp Web Auto-Responder created!');
        setName('');
        setKeywordsText('');
        setReplyMessage('');
        setShowAddForm(false);
        fetchData();
      } else {
        toast.error('Failed to create auto-responder');
      }
    } catch (err: any) {
      toast.error('Error creating auto-responder');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    setActiveMenuId(null);
    try {
      const res = await api.put(`/chatflows/${id}/toggle`);
      if (res.data?.status) {
        toast.success('Auto-responder status updated!');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const handleDeleteFlow = async (id: number) => {
    setActiveMenuId(null);
    if (!confirm('Are you sure you want to delete this auto-responder rule?')) return;
    try {
      await api.delete(`/chatflows/${id}`);
      toast.success('Auto-responder deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading WhatsApp automations...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4" ref={menuRef}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">WhatsApp Web Automation</h2>
          <p className="text-gray-600 mt-1">Configure keyword-based automated replies & chatbots for WhatsApp Web sessions</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow flex items-center space-x-2 text-sm"
        >
          <Plus size={18} />
          <span>New Auto-Responder</span>
        </button>
      </div>

      {/* CREATE NEW AUTO-RESPONDER FORM */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border shadow-md space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Bot size={20} className="text-emerald-600" />
              Create Keyword Auto-Responder Rule
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateFlow} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Price Query Reply"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                  Target Connected WhatsApp Device
                </label>
                <select
                  value={selectedPhone}
                  onChange={(e) => setSelectedPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white"
                >
                  <option value="">All Connected WhatsApp Devices</option>
                  {sessions.map((s) => (
                    <option key={s.phone} value={s.phone}>
                      +{s.phone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Trigger Keywords (Comma Separated)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. price, pricing, rate, cost"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Automated Reply Message
              </label>
              <textarea
                rows={3}
                required
                placeholder="Type the response message that will be sent automatically when keywords match..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-sm shadow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
              <span>Save Auto-Responder Rule</span>
            </button>
          </form>
        </div>
      )}

      {/* AUTO-RESPONDERS LIST */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Bot size={20} className="text-emerald-600" />
          Active Auto-Responders ({flows.length})
        </h3>

        {flows.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border text-gray-500 shadow-sm">
            <Bot size={40} className="mx-auto mb-2 text-gray-300" />
            <h4 className="font-bold text-gray-800">No Auto-Responders Configured</h4>
            <p className="text-xs text-gray-400 mt-1">Click "New Auto-Responder" to create your first keyword rule.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {flows.map((f) => {
              const firstStepMsg = f.steps?.[0]?.message || f.steps?.[0]?.responseText || 'Auto reply message';

              return (
                <div key={f.id} className="bg-white p-6 rounded-2xl border shadow-sm flex items-start justify-between relative overflow-visible">
                  <div className="space-y-2 flex-1 pr-4">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-bold text-gray-900 text-base">{f.name}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                        f.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {f.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {f.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {f.triggerKeywords?.map((k, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md">
                          {k}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border mt-2">
                      <span className="font-bold text-gray-700">Reply:</span> &quot;{firstStepMsg}&quot;
                    </p>
                  </div>

                  {/* 3-DOT ACTION MENU */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === f.id ? null : f.id);
                      }}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                      title="More Actions"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* FLOATING ACTION DROPDOWN */}
                    {activeMenuId === f.id && (
                      <div className="absolute right-0 top-10 z-50 w-44 bg-white rounded-xl shadow-xl border p-1 space-y-1 text-left">
                        <button
                          onClick={() => handleToggleActive(f.id)}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {f.isActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                          <span>{f.isActive ? 'Disable Rule' : 'Enable Rule'}</span>
                        </button>

                        <div className="border-t pt-1">
                          <button
                            onClick={() => handleDeleteFlow(f.id)}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                            <span>Delete Rule</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
