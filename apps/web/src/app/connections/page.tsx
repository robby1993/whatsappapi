'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  QrCode,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Hash,
  Plus,
  Trash2,
  Loader2,
  Star,
  Zap,
  Globe,
  Radio,
  Wifi
} from 'lucide-react';
import toast from 'react-hot-toast';
import { countries } from '@/lib/countries';

interface SessionAccount {
  phone: string;
  status: string;
  isPrimary?: boolean;
  qr?: string | null;
  pairingCode?: string | null;
  updatedAt?: string;
}

export default function ConnectionsPage() {
  const [sessions, setSessions] = useState<SessionAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // New Connection Form state
  const [showAddForm, setShowNewForm] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [newPhone, setNewPhone] = useState('');
  const [activeQr, setActiveQr] = useState<string | null>(null);
  const [activePairingCode, setActivePairingCode] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions();
    }, 4000);
    return () => clearInterval(interval);
  }, [showAddForm, newPhone, countryCode]);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/whatsapp/user-sessions');
      if (response.data?.status && Array.isArray(response.data.result)) {
        const fetchedSessions: SessionAccount[] = response.data.result;
        setSessions(fetchedSessions);

        // Auto-dismiss the Add Form when the requested phone becomes connected
        if (showAddForm && newPhone) {
          const targetNum = (countryCode.replace('+', '') + newPhone.replace(/\D/g, '')).replace(/\D/g, '');
          const newlyConnected = fetchedSessions.find(
            s => s.status === 'connected' && (
              s.phone.replace(/\D/g, '') === targetNum ||
              targetNum.endsWith(s.phone.replace(/\D/g, '')) ||
              s.phone.replace(/\D/g, '').endsWith(targetNum)
            )
          );

          if (newlyConnected) {
            toast.success(`WhatsApp (+${newlyConnected.phone}) connected successfully!`);
            setShowNewForm(false);
            setNewPhone('');
            setActiveQr(null);
            setActivePairingCode(null);
          }
        }
      }
    } catch (error) {
      // Suppress transient network log
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (phone: string) => {
    try {
      const res = await api.post('/whatsapp/set-primary', { phone });
      if (res.data?.status) {
        toast.success(`+${phone} set as Primary WhatsApp sender!`);
        fetchSessions();
      } else {
        toast.error('Failed to set primary sender');
      }
    } catch (err) {
      toast.error('Error setting primary sender');
    }
  };

  const handleConnectQR = async () => {
    if (!newPhone) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    const fullNum = countryCode.replace('+', '') + newPhone.replace(/\D/g, '');
    setActionLoading(true);
    setActivePairingCode(null);
    setActiveQr(null);
    toast.loading('Generating QR Code for +' + fullNum + '...');

    try {
      const response = await api.post('/whatsapp/connect-qr', { phone: fullNum });
      toast.dismiss();
      if (response.data?.status && response.data.result?.qr) {
        setActiveQr(response.data.result.qr);
        toast.success('QR Code generated! Scan with WhatsApp.');
      } else {
        toast.error('Failed to generate QR Code');
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to generate QR');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConnectPair = async () => {
    if (!newPhone) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    const fullNum = countryCode.replace('+', '') + newPhone.replace(/\D/g, '');
    setActionLoading(true);
    setActivePairingCode(null);
    setActiveQr(null);
    toast.loading('Generating Pairing Code for +' + fullNum + '...');

    try {
      const response = await api.post('/whatsapp/connect-pair', { phone: fullNum });
      toast.dismiss();
      if (response.data?.status && response.data.result?.pairingCode) {
        setActivePairingCode(response.data.result.pairingCode);
        toast.success('Pairing Code generated! Enter in WhatsApp.');
      } else if (response.data?.result?.status === 'connected') {
        toast.success(`WhatsApp (+${fullNum}) is already connected!`);
        setShowNewForm(false);
        setNewPhone('');
        setActiveQr(null);
        setActivePairingCode(null);
        fetchSessions();
      } else {
        toast.error('Failed to generate Pairing Code');
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to generate code');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async (phone: string) => {
    if (!confirm(`Are you sure you want to disconnect WhatsApp (+${phone})?`)) return;
    try {
      await api.post('/whatsapp/logout', { phone });
      toast.success(`Logged out +${phone}`);
      fetchSessions();
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading WhatsApp connections...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">WhatsApp Connections</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Link and manage your WhatsApp devices. Select a Primary Sender for automated broadcasts and messages.
          </p>
        </div>

        <button
          onClick={() => setShowNewForm(!showAddForm)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow flex items-center justify-center space-x-2 text-sm shrink-0"
        >
          <Plus size={18} />
          <span>Connect New Number</span>
        </button>
      </div>

      {/* CONNECT NEW WHATSAPP NUMBER FORM / MODAL */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border shadow-md space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap size={20} className="text-emerald-600" />
              Link New WhatsApp Device
            </h3>
            <button onClick={() => setShowNewForm(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
              <XCircle size={20} />
            </button>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-600" />
                Select Mobile Number
              </label>
              <div className="flex">
                <select
                  className="block w-32 px-3 py-3 border border-gray-300 rounded-l-xl border-r-0 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-xs font-semibold"
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
                  placeholder="e.g. 9876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleConnectQR}
                disabled={actionLoading}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-xs md:text-sm shadow-sm disabled:opacity-50"
              >
                <QrCode size={18} />
                <span>Connect via QR Code</span>
              </button>
              <button
                type="button"
                onClick={handleConnectPair}
                disabled={actionLoading}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 text-xs md:text-sm shadow-sm disabled:opacity-50"
              >
                <Hash size={18} />
                <span>Connect via Code</span>
              </button>
            </div>
          </div>

          {/* QR Display */}
          {activeQr && (
            <div className="pt-4 border-t flex flex-col items-center space-y-4">
              <div className="bg-white p-4 border-4 border-gray-100 rounded-xl shadow-inner">
                <QRCodeSVG value={activeQr} size={220} />
              </div>
              <p className="text-xs text-gray-500 text-center max-w-xs leading-relaxed">
                Open WhatsApp on phone &gt; Settings &gt; Linked Devices &gt; Link a Device & scan QR
              </p>
              <button onClick={handleConnectQR} className="text-emerald-600 text-xs font-bold flex items-center gap-1.5 hover:underline">
                <RefreshCcw size={14} /> Refresh QR Code
              </button>
            </div>
          )}

          {/* Pairing Code Display */}
          {activePairingCode && (
            <div className="pt-4 border-t flex flex-col items-center space-y-4">
              <div className="bg-emerald-50 px-10 py-5 border-2 border-dashed border-emerald-300 rounded-2xl shadow-inner">
                <span className="text-3xl md:text-4xl font-black tracking-widest text-emerald-700 font-mono">
                  {activePairingCode}
                </span>
              </div>
              <p className="text-xs text-gray-500 text-center max-w-xs leading-relaxed">
                Open WhatsApp on phone &gt; Linked Devices &gt; Link with Phone Number & enter this 8-digit code
              </p>
              <button onClick={handleConnectPair} className="text-emerald-600 text-xs font-bold flex items-center gap-1.5 hover:underline">
                <RefreshCcw size={14} /> Regenerate Pairing Code
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONNECTED ACCOUNTS GRID / LIST */}
      <div className="space-y-4">
        <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
          <Smartphone size={20} className="text-emerald-600" />
          Active WhatsApp Sessions ({sessions.length})
        </h3>

        {sessions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border shadow-sm space-y-3">
            <Smartphone size={48} className="mx-auto text-gray-300" />
            <h4 className="text-lg font-bold text-gray-800">No Connected Devices</h4>
            <p className="text-gray-500 text-xs md:text-sm max-w-sm mx-auto leading-relaxed">
              You haven&apos;t linked any WhatsApp numbers yet. Click &quot;Connect New Number&quot; above to link your device.
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="mt-4 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all inline-flex items-center gap-2 text-xs md:text-sm shadow"
            >
              <Plus size={18} /> Connect WhatsApp Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((s) => {
              const isConnected = s.status === 'connected';
              const isPairing = s.status === 'pairing' || s.status === 'connecting';

              return (
                <div
                  key={s.phone}
                  className={`bg-white rounded-2xl border shadow-sm p-6 flex flex-col justify-between space-y-5 transition-all relative overflow-hidden ${
                    s.isPrimary
                      ? 'border-emerald-500 ring-4 ring-emerald-50 shadow-md'
                      : 'hover:border-emerald-200 hover:shadow-md'
                  }`}
                >
                  {/* CARD TOP BAR */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        s.isPrimary
                          ? 'bg-emerald-600 text-white'
                          : isConnected
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Smartphone size={24} />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-gray-900 text-base font-mono tracking-tight">
                            +{s.phone}
                          </h4>
                          {s.isPrimary && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                              <Star size={10} className="fill-white" /> Primary
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">WhatsApp Web Session</p>
                      </div>
                    </div>
                  </div>

                  {/* STATUS PILL BADGE */}
                  <div className="flex items-center justify-between bg-gray-50/80 px-3.5 py-2.5 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                      <Wifi size={14} className={isConnected ? 'text-emerald-600' : 'text-gray-400'} />
                      Connection Status:
                    </span>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isPairing
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {isConnected && <CheckCircle2 size={13} />}
                      {isPairing && <Loader2 size={13} className="animate-spin" />}
                      {!isConnected && !isPairing && <XCircle size={13} />}
                      <span className="capitalize">{isConnected ? 'Online' : s.status}</span>
                    </span>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="pt-2 border-t flex items-center justify-between text-xs">
                    {s.isPrimary ? (
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        <Star size={14} className="fill-emerald-600 text-emerald-600" />
                        <span>Primary Active Sender</span>
                      </span>
                    ) : isConnected ? (
                      <button
                        onClick={() => handleSetPrimary(s.phone)}
                        className="text-gray-600 hover:text-emerald-700 font-bold flex items-center gap-1.5 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Star size={14} />
                        <span>Set as Primary</span>
                      </button>
                    ) : (
                      <span className="text-gray-400 font-medium italic">Device Offline</span>
                    )}

                    <button
                      onClick={() => handleLogout(s.phone)}
                      className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-all flex items-center gap-1.5 border border-red-100"
                      title="Disconnect WhatsApp Device"
                    >
                      <Trash2 size={14} />
                      <span>Disconnect</span>
                    </button>
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
