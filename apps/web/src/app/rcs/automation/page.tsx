'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Bot, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface Automation {
  id: number;
  triggerKeyword: string;
  cardTitle: string;
  replyText: string;
  isActive: boolean;
}

export default function RcsAutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [triggerKeyword, setTriggerKeyword] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const res = await api.get('/rcs/automation');
      if (res.data?.status && Array.isArray(res.data.result)) setAutomations(res.data.result);
    } catch (err) {
      toast.error('Failed to load RCS automations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerKeyword || !cardTitle) {
      toast.error('Please enter Trigger Keyword and Card Title');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/rcs/automation', {
        triggerKeyword,
        cardTitle,
        replyText,
      });

      if (res.data?.status) {
        toast.success('RCS Auto-responder rule created!');
        setTriggerKeyword('');
        setCardTitle('');
        setReplyText('');
        setShowAdd(false);
        fetchAutomations();
      } else {
        toast.error('Failed to create rule');
      }
    } catch (err) {
      toast.error('Error creating RCS automation');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAutomation = async (id: number) => {
    try {
      await api.delete(`/rcs/automation/${id}`);
      toast.success('RCS automation deleted');
      fetchAutomations();
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading RCS automations...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Google RCS Automations</h2>
          <p className="text-gray-600 mt-1">Configure keyword triggers and automated Rich Card replies for Google RCS</p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow flex items-center space-x-2 text-sm"
        >
          <Plus size={18} />
          <span>Add Auto-Responder</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border shadow-md space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">New RCS Keyword Auto-Responder</h3>
          <form onSubmit={handleCreateAutomation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Trigger Keyword</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. price, offers, help"
                  value={triggerKeyword}
                  onChange={(e) => setTriggerKeyword(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Response Card Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Our Latest Offers"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Card Body Message</label>
              <textarea
                rows={3}
                placeholder="Type response text..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-sm shadow disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save RCS Automation'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {automations.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border text-gray-500 shadow-sm">
            <Bot size={40} className="mx-auto mb-2 text-gray-300" />
            <h4 className="font-bold text-gray-800">No RCS Automations Configured</h4>
            <p className="text-xs text-gray-400 mt-1">Click "Add Auto-Responder" to create one.</p>
          </div>
        ) : (
          automations.map((a) => (
            <div key={a.id} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase">
                  Keyword: {a.triggerKeyword}
                </span>
                <h4 className="font-bold text-gray-900 text-base mt-2">{a.cardTitle}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{a.replyText}</p>
              </div>

              <button onClick={() => handleDeleteAutomation(a.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
