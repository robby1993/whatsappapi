'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  templateName: string;
  numbers: string[];
  scheduledTime: number;
  status: string;
}

export default function WabaCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [numbersText, setNumbersText] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campRes, tempRes] = await Promise.all([
        api.get('/waba/campaigns'),
        api.get('/waba/templates'),
      ]);

      if (campRes.data?.status && Array.isArray(campRes.data.result)) setCampaigns(campRes.data.result);
      if (tempRes.data?.status && Array.isArray(tempRes.data.result)) {
        setTemplates(tempRes.data.result);
        if (tempRes.data.result.length > 0) setTemplateName(tempRes.data.result[0].name);
      }
    } catch (err) {
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const numbers = numbersText.split(/[\n,]/)
      .map(n => n.trim().replace(/\D/g, ''))
      .filter(n => n.length >= 10);

    if (!name || numbers.length === 0 || !scheduledTime) {
      toast.error('Please fill in campaign name, numbers, and schedule date/time');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/waba/campaigns', {
        name,
        templateName,
        numbers,
        scheduledTime: new Date(scheduledTime).getTime(),
      });

      if (res.data?.status) {
        toast.success('WABA Campaign scheduled!');
        setName('');
        setNumbersText('');
        setScheduledTime('');
        setShowAdd(false);
        fetchData();
      } else {
        toast.error('Failed to schedule campaign');
      }
    } catch (err) {
      toast.error('Error scheduling campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    try {
      await api.delete(`/waba/campaigns/${id}`);
      toast.success('Campaign deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete campaign');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading WABA campaigns...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Meta WABA Scheduled Campaigns</h2>
          <p className="text-gray-600 mt-1">Schedule Meta Cloud API broadcast campaigns for target audiences</p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow flex items-center space-x-2 text-sm"
        >
          <Plus size={18} />
          <span>New Scheduled Campaign</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border shadow-md space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Schedule WABA Campaign</h3>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Offer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Approved Template</label>
                <select
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white"
                >
                  {templates.map((t) => (
                    <option key={t.id || t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Schedule Date & Time</label>
              <input
                type="datetime-local"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Recipient Numbers</label>
              <textarea
                rows={4}
                required
                placeholder="919876543210, 919988776655..."
                value={numbersText}
                onChange={(e) => setNumbersText(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm resize-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-sm shadow disabled:opacity-50"
            >
              {saving ? 'Scheduling...' : 'Schedule Campaign'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border text-gray-500 shadow-sm">
            <Calendar size={40} className="mx-auto mb-2 text-gray-300" />
            <h4 className="font-bold text-gray-800">No Scheduled WABA Campaigns</h4>
            <p className="text-xs text-gray-400 mt-1">Click "New Scheduled Campaign" to create one.</p>
          </div>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-gray-900 text-base">{c.name}</h4>
                  <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
                    {c.templateName}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  Target: {c.numbers?.length || 0} Contacts | Schedule: {new Date(Number(c.scheduledTime)).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold capitalize px-3 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center gap-1">
                  <Clock size={12} /> {c.status}
                </span>
                <button onClick={() => handleDeleteCampaign(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
