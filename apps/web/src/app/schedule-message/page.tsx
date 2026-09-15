'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Clock, Smartphone, MessageSquare, Image as ImageIcon, X, Loader2, Calendar, Trash2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { countries } from '@/lib/countries';

interface ScheduledMsg {
  id: number;
  sender: string;
  receiver: string;
  message: string;
  mediaUrl?: string;
  mediaType?: string;
  scheduleTime: number;
  status: string;
  createdAt: string;
}

export default function ScheduleMessagePage() {
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [sessions, setSessions] = useState<{ phone: string; status: string }[]>([]);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState('image');
  const [loading, setLoading] = useState(false);
  const [scheduledList, setScheduledList] = useState<ScheduledMsg[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchScheduledMessages = async () => {
    try {
      const res = await api.get('/whatsapp/scheduled-messages');
      if (res.data?.result) {
        setScheduledList(res.data.result);
      }
    } catch (err: any) {
      console.error('Failed to fetch scheduled messages:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get('/whatsapp/user-sessions');
      if (res.data?.status && Array.isArray(res.data.result)) {
        setSessions(res.data.result);
        const connected = res.data.result.find((s: any) => s.status === 'connected');
        if (connected) {
          setFromNumber(connected.phone);
        } else if (res.data.result.length > 0) {
          setFromNumber(res.data.result[0].phone);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sessions');
    }
  };

  useEffect(() => {
    fetchScheduledMessages();
    fetchSessions();
    const interval = setInterval(fetchScheduledMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const type = file.type.split('/')[0];
      setMediaType(type === 'application' ? 'document' : type);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setMediaPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setMediaPreview(null);
      }
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScheduleMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || (!message && !mediaFile) || !scheduleDateTime) {
      toast.error('Please fill in recipient number, message, and target schedule time');
      return;
    }

    const selectedTime = new Date(scheduleDateTime).getTime();
    if (isNaN(selectedTime) || selectedTime <= Date.now()) {
      toast.error('Please select a future date and time');
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = null;
      if (mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);
        const uploadRes = await api.post('/whatsapp/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mediaUrl = uploadRes.data.result?.url;
      }

      const fullNumber = countryCode.replace('+', '') + phoneNumber.replace(/\D/g, '');
      const response = await api.post('/whatsapp/schedule-message', {
        from: fromNumber || undefined,
        phone: fullNumber,
        message: message,
        scheduleTime: selectedTime,
        mediaUrl,
        mediaType: mediaFile ? mediaType : null
      });

      if (response.data.status) {
        toast.success('Message scheduled successfully!');
        setPhoneNumber('');
        setMessage('');
        setScheduleDateTime('');
        removeMedia();
        fetchScheduledMessages();
      } else {
        toast.error(response.data.message || 'Failed to schedule message');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelScheduled = async (id: number) => {
    try {
      const res = await api.delete(`/whatsapp/scheduled-messages/${id}`);
      if (res.data.status) {
        toast.success('Scheduled message cancelled');
        fetchScheduledMessages();
      }
    } catch (err: any) {
      toast.error('Failed to cancel scheduled message');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Schedule WhatsApp Message</h2>
        <p className="text-gray-600 mt-1">Set a future date and time to automatically send messages</p>
      </div>

      {/* Schedule Form */}
      <div className="bg-white p-8 rounded-2xl border shadow-sm">
        <form onSubmit={handleScheduleMessage} className="space-y-6">
          {/* Sender Account Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Zap size={16} className="text-emerald-600" />
              Send From (WhatsApp Account)
            </label>
            <select
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
              value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)}
            >
              {sessions.length === 0 ? (
                <option value="">No connected devices (Go to Connections)</option>
              ) : (
                sessions.map((s) => (
                  <option key={s.phone} value={s.phone}>
                    +{s.phone} ({s.status})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Smartphone size={16} className="text-emerald-600" />
                Recipient Number
              </label>
              <div className="flex">
                <select
                  className="block w-32 px-3 py-3 border border-gray-300 rounded-l-xl border-r-0 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  {countries.map((c) => (
                    <option key={c.name + c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  placeholder="Mobile Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" />
                Select Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={scheduleDateTime}
                onChange={(e) => setScheduleDateTime(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-600" />
              Message Content
            </label>
            <textarea
              rows={4}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm"
              placeholder="Type your scheduled message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon size={16} className="text-emerald-600" />
              Add Media Attachment (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 border rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                {mediaFile ? 'Change Attachment' : 'Choose File'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*,audio/*,application/*"
              />
              {mediaFile && (
                <button
                  type="button"
                  onClick={removeMedia}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {mediaPreview && (
              <div className="mt-4 relative max-w-sm aspect-video bg-gray-100 rounded-xl overflow-hidden border">
                <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50 text-sm"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Scheduling...</span>
              </>
            ) : (
              <>
                <Clock size={20} />
                <span>Schedule Message</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Scheduled Messages List Table */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-emerald-600" />
            Scheduled Queue
          </h3>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
            {scheduledList.filter(s => s.status === 'pending').length} Pending
          </span>
        </div>

        {scheduledList.length === 0 ? (
          <div className="p-8 text-center text-gray-500 border border-dashed rounded-xl">
            <Clock size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No scheduled messages found</p>
            <p className="text-xs text-gray-400 mt-1">Scheduled messages will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-xs uppercase text-gray-500 bg-gray-50/50">
                  <th className="p-3">Sender</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Target Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {scheduledList.map((item) => {
                  const targetDate = new Date(Number(item.scheduleTime));
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-xs text-gray-600">+{item.sender}</td>
                      <td className="p-3 font-semibold text-gray-900">+{item.receiver}</td>
                      <td className="p-3 text-gray-700 max-w-xs truncate">
                        {item.mediaType ? `[${item.mediaType}] ${item.message || ''}` : item.message}
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-600">
                        {targetDate.toLocaleString()}
                      </td>
                      <td className="p-3">
                        {item.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 font-medium px-2.5 py-1 rounded-full">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                        {item.status === 'sent' && (
                          <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={12} /> Sent
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 font-medium px-2.5 py-1 rounded-full">
                            <AlertCircle size={12} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleCancelScheduled(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Scheduled Message"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
