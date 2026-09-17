'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Layers, Send, FileText, Smartphone, Users, Loader2 } from 'lucide-react';

export default function RcsBulkMessagesPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [numbersText, setNumbersText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agRes, tempRes] = await Promise.all([
        api.get('/rcs/agents'),
        api.get('/rcs/templates'),
      ]);

      if (agRes.data?.status && Array.isArray(agRes.data.result)) {
        setAgents(agRes.data.result);
        if (agRes.data.result.length > 0) setSelectedAgent(agRes.data.result[0].id);
      }
      if (tempRes.data?.status && Array.isArray(tempRes.data.result)) {
        setTemplates(tempRes.data.result);
        if (tempRes.data.result.length > 0) setSelectedTemplate(tempRes.data.result[0].name);
      }
    } catch (err) {
      toast.error('Failed to load RCS data');
    }
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    const numbersList = numbersText.split(/[\n,]/)
      .map(n => n.trim().replace(/\D/g, ''))
      .filter(n => n.length >= 10);

    if (numbersList.length === 0) {
      toast.error('Please enter recipient phone numbers');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/rcs/bulk-messages', {
        agentId: selectedAgent ? parseInt(selectedAgent) : undefined,
        numbers: numbersList,
        templateName: selectedTemplate || 'RCS Rich Card',
      });

      if (res.data?.status) {
        toast.success(`RCS Bulk broadcast initiated for ${numbersList.length} recipients!`);
        setNumbersText('');
      } else {
        toast.error('Failed to send RCS bulk messages');
      }
    } catch (err) {
      toast.error('Error sending bulk RCS messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">RCS Bulk Broadcast</h2>
        <p className="text-gray-600 mt-1">Send mass Google RCS Rich Card messages to target mobile numbers</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border shadow-sm">
        <form onSubmit={handleSendBulk} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
              <Smartphone size={16} className="text-indigo-600" />
              Select Google RCS Agent Sender
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-white text-sm"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.agentName} ({a.agentId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
              <FileText size={16} className="text-indigo-600" />
              Select RCS Rich Card Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-white text-sm"
            >
              {templates.map((t) => (
                <option key={t.id || t.name} value={t.name}>{t.name} ({t.cardType})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
              <Users size={16} className="text-indigo-600" />
              Recipient Phone Numbers (Comma or Newline Separated)
            </label>
            <textarea
              rows={6}
              required
              placeholder="919876543210, 919988776655..."
              value={numbersText}
              onChange={(e) => setNumbersText(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Broadcasting RCS Cards...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Bulk RCS Broadcast</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
