'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FileText, Plus, Trash2, CheckCircle2, Image } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  cardType: string;
  title: string;
  description: string;
  mediaUrl?: string;
}

export default function RcsTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState('');
  const [cardType, setCardType] = useState('STANDALONE_RICH_CARD');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/rcs/templates');
      if (res.data?.status && Array.isArray(res.data.result)) setTemplates(res.data.result);
    } catch (err) {
      toast.error('Failed to load RCS templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title) {
      toast.error('Please enter Template Name and Card Title');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/rcs/templates', {
        name,
        cardType,
        title,
        description,
        mediaUrl,
      });

      if (res.data?.status) {
        toast.success('RCS Rich Card Template created!');
        setName('');
        setTitle('');
        setDescription('');
        setMediaUrl('');
        setShowAdd(false);
        fetchTemplates();
      } else {
        toast.error('Failed to create template');
      }
    } catch (err) {
      toast.error('Error creating RCS template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/rcs/templates/${id}`);
      toast.success('RCS template deleted');
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading RCS templates...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">RCS Rich Templates & Cards</h2>
          <p className="text-gray-600 mt-1">Design Standalone and Carousel Rich Cards with CTA buttons</p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow flex items-center space-x-2 text-sm"
        >
          <Plus size={18} />
          <span>New Rich Card Template</span>
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border shadow-md space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Create RCS Rich Card Template</h3>
          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Offer Card"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Card Type</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm bg-white"
                >
                  <option value="STANDALONE_RICH_CARD">Standalone Rich Card</option>
                  <option value="CAROUSEL_CARD">Carousel Multi-Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Card Title</label>
              <input
                type="text"
                required
                placeholder="e.g. 🎉 Get 50% Off Today!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Card Description</label>
              <textarea
                rows={3}
                placeholder="Type rich card body description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Header Media Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/banner.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-sm shadow disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Save RCS Template'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border text-gray-500 shadow-sm">
            <FileText size={40} className="mx-auto mb-2 text-gray-300" />
            <h4 className="font-bold text-gray-800">No RCS Templates Created</h4>
            <p className="text-xs text-gray-400 mt-1">Click "New Rich Card Template" to create one.</p>
          </div>
        ) : (
          templates.map((t) => (
            <div key={t.id} className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  {t.cardType}
                </span>
                <h4 className="font-bold text-gray-900 text-base">{t.title}</h4>
                <p className="text-xs text-gray-600 line-clamp-2">{t.description}</p>
              </div>

              <div className="pt-3 border-t flex items-center justify-between text-xs">
                <span className="font-mono text-gray-400">{t.name}</span>
                <button onClick={() => handleDeleteTemplate(t.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
