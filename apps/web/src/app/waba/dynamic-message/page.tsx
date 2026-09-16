'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Sliders, Send, FileText, Smartphone, Plus, Trash2, Loader2 } from 'lucide-react';

export default function WabaDynamicMessagePage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recipient, setRecipient] = useState('');
  const [parameters, setParameters] = useState<string[]>(['']);
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

  const addParam = () => setParameters(prev => [...prev, '']);
  const removeParam = (index: number) => setParameters(prev => prev.filter((_, i) => i !== index));
  const updateParam = (index: number, val: string) => {
    const updated = [...parameters];
    updated[index] = val;
    setParameters(updated);
  };

  const handleSendDynamic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) {
      toast.error('Please enter a recipient phone number');
      return;
    }
    if (!selectedTemplate) {
      toast.error('Please select an approved Meta template');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/waba/dynamic-message', {
        deviceId: selectedDevice ? parseInt(selectedDevice) : undefined,
        to: recipient,
        templateName: selectedTemplate,
        parameters: parameters.filter(p => p.trim() !== ''),
      });

      if (res.data?.status) {
        toast.success('Dynamic template message sent via Meta API!');
        setRecipient('');
        setParameters(['']);
      } else {
        toast.error(res.data?.message || 'Failed to send message');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error sending dynamic message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dynamic Template Message</h2>
        <p className="text-gray-600 mt-1">
          Send Meta Cloud API template messages with dynamic body variables (&apos;&#123;&#123;1&#125;&#125;&apos;, &apos;&#123;&#123;2&#125;&#125;&apos;)
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border shadow-sm">
        <form onSubmit={handleSendDynamic} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
              <Smartphone size={16} className="text-blue-600" />
              Select WABA Device
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-white text-sm"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>+{d.phone} ({d.phoneNumberId})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1.5">
              <FileText size={16} className="text-blue-600" />
              Approved Template Name
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-white text-sm"
            >
              {templates.map((t) => (
                <option key={t.id || t.name} value={t.name}>{t.name} ({t.language})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Recipient Phone Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 919876543210"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl text-sm"
            />
          </div>

          {/* Dynamic Variables Section */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-600 uppercase">
                Dynamic Parameters (&apos;&#123;&#123;1&#125;&#125;&apos;, &apos;&#123;&#123;2&#125;&#125;&apos;...)
              </label>
              <button
                type="button"
                onClick={addParam}
                className="text-xs text-blue-600 font-bold flex items-center gap-1"
              >
                <Plus size={14} /> Add Variable
              </button>
            </div>

            {parameters.map((param, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-gray-400 w-12">&#123;&#123;{i + 1}&#125;&#125;:</span>
                <input
                  type="text"
                  placeholder={`Value for parameter ${i + 1}`}
                  value={param}
                  onChange={(e) => updateParam(i, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                {parameters.length > 1 && (
                  <button type="button" onClick={() => removeParam(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Dynamic Message</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
