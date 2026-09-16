'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Layers, Send, FileText, Smartphone, Users, Loader2 } from 'lucide-react';

export default function WabaBulkMessagesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [numbersText, setNumbersText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [devRes, tempRes] = await Promise.all([
        api.get('/waba/devices'),
        api.get('/waba/templates'),
      ]);

      if (devRes.data?.status && Array.isArray(devRes.data.result)) {
        setDevices(devRes.data.result);
        if (devRes.data.result.length > 0) setSelectedDevice(devRes.data.result[0].id);
      }
      if (tempRes.data?.status && Array.isArray(tempRes.data.result)) {
        setTemplates(tempRes.data.result);
        if (tempRes.data.result.length > 0) setSelectedTemplate(tempRes.data.result[0].name);
      }
    } catch (err) {
      toast.error('Failed to load WABA data');
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
    if (!selectedTemplate) {
      toast.error('Please select an approved Meta template');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/waba/bulk-messages', {
        deviceId: selectedDevice ? parseInt(selectedDevice) : undefined,
        numbers: numbersList,
        templateName: selectedTemplate,
      });

      if (res.data?.status) {
        toast.success(`Bulk broadcast initiated for ${numbersList.length} numbers!`);
        setNumbersText('');
      } else {
        toast.error(res.data?.message || 'Failed to start bulk broadcast');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error sending bulk messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">WABA Bulk Broadcast</h2>
        <p className="text-gray-600 mt-1">Send mass WhatsApp messages using Meta approved templates</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border shadow-sm">
        <form onSubmit={handleSendBulk} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
              <Smartphone size={16} className="text-blue-600" />
              Select WABA Device Sender
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-white text-sm"
            >
              {devices.length === 0 ? (
                <option value="">No WABA Devices Linked (Go to WABA Devices)</option>
              ) : (
                devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    +{d.phone} ({d.phoneNumberId})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
              <FileText size={16} className="text-blue-600" />
              Select Approved Meta Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-white text-sm"
            >
              {templates.length === 0 ? (
                <option value="">No templates synced (Go to WABA Templates)</option>
              ) : (
                templates.map((t) => (
                  <option key={t.id || t.name} value={t.name}>
                    {t.name} ({t.language}) [{t.status}]
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
              <Users size={16} className="text-blue-600" />
              Recipient Phone Numbers (Comma or Newline Separated)
            </label>
            <textarea
              rows={6}
              required
              placeholder="919876543210, 919988776655..."
              value={numbersText}
              onChange={(e) => setNumbersText(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Broadcasting via Meta API...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Bulk WABA Broadcast</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
