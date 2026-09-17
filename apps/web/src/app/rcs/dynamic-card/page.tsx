'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Sliders, Send, Loader2 } from 'lucide-react';

export default function RcsDynamicCardPage() {
  const [recipient, setRecipient] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [buttonLabel, setButtonLabel] = useState('Claim Offer');
  const [loading, setLoading] = useState(false);

  const handleSendDynamicCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !cardTitle) {
      toast.error('Please enter recipient number and card title');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/rcs/dynamic-card', {
        to: recipient,
        title: cardTitle,
        description,
        mediaUrl,
        parameters: { buttonLabel },
      });

      if (res.data?.status) {
        toast.success('RCS Dynamic Rich Card sent successfully!');
        setRecipient('');
        setCardTitle('');
        setDescription('');
      } else {
        toast.error('Failed to send dynamic card');
      }
    } catch (err) {
      toast.error('Error sending RCS card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">RCS Dynamic Rich Card</h2>
        <p className="text-gray-600 mt-1">Send personalized Google RCS Rich Cards with custom title, media, and action buttons</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border shadow-sm">
        <form onSubmit={handleSendDynamicCard} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Recipient Mobile Number
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

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Card Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Special Discount for You!"
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Card Body Description
            </label>
            <textarea
              rows={3}
              placeholder="Type description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Image / Banner Media URL
            </label>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              CTA Action Button Label
            </label>
            <input
              type="text"
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl text-sm"
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
                <span>Sending Card...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Dynamic RCS Card</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
