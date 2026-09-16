'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Smartphone, Plus, Trash2, CheckCircle2, ShieldCheck, Zap, Sparkles, Sliders, ExternalLink, Facebook } from 'lucide-react';

interface Device {
  id: number;
  phone: string;
  phoneNumberId: string;
  wabaAccountId: string;
  status: string;
  qualityRating: string;
}

export default function WabaDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'embedded' | 'manual'>('embedded');
  const [systemMetaAppId, setSystemMetaAppId] = useState('');

  // Manual Form State
  const [phone, setPhone] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaAccountId, setWabaAccountId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchDevices();
    fetchSystemMetaConfig();

    // Check if returning from Meta OAuth redirect code
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        handleProcessMetaCode(code);
      }
    }
  }, []);

  const fetchSystemMetaConfig = async () => {
    try {
      const res = await api.get('/waba/public-config');
      if (res.data?.result?.metaAppId) {
        setSystemMetaAppId(res.data.result.metaAppId);
      }
    } catch (err) {
      console.error('Failed to fetch system WABA config');
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await api.get('/waba/devices');
      if (res.data?.status && Array.isArray(res.data.result)) {
        setDevices(res.data.result);
      }
    } catch (err) {
      toast.error('Failed to fetch WABA devices');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessMetaCode = async (code: string) => {
    toast.loading('Exchanging Meta code and linking WABA account...');
    try {
      const res = await api.post('/waba/embedded-signup', { code });
      toast.dismiss();
      if (res.data?.status) {
        toast.success('Meta WABA device linked successfully!');
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        fetchDevices();
      } else {
        toast.error('Failed to link WABA account from Meta');
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.response?.data?.message || 'Error processing Meta Embedded Signup code');
    }
  };

  // Launch Meta Embedded Signup OAuth Flow (using Admin Configured Meta App ID)
  const handleLaunchEmbeddedSignup = () => {
    const appIdToUse = systemMetaAppId.trim() || process.env.NEXT_PUBLIC_META_APP_ID || '';

    if (!appIdToUse || appIdToUse === '100000000000000') {
      toast.error('Meta App ID is not configured by Administrator. Please contact admin or use Manual Entry.');
      return;
    }

    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/waba/devices` : '';
    const extras = JSON.stringify({ feature: 'whatsapp_embedded_signup' });
    const metaAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appIdToUse}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=whatsapp_business_management,whatsapp_business_messaging&response_type=code&extras=${encodeURIComponent(extras)}`;

    const popup = window.open(metaAuthUrl, 'MetaEmbeddedSignup', 'width=650,height=750,top=100,left=100');

    if (popup) {
      toast('Meta Embedded Signup window opened. Please complete login.');
    } else {
      toast.error('Popup blocked. Please allow popups for localhost.');
    }
  };

  const handleManualAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !phoneNumberId || !wabaAccountId || !accessToken) {
      toast.error('Please fill in all Meta WABA credentials');
      return;
    }

    setAdding(true);
    try {
      const res = await api.post('/waba/devices', {
        phone,
        phoneNumberId,
        wabaAccountId,
        accessToken,
      });

      if (res.data?.status) {
        toast.success('WABA Device connected successfully!');
        setPhone('');
        setPhoneNumberId('');
        setWabaAccountId('');
        setAccessToken('');
        fetchDevices();
      } else {
        toast.error('Failed to add WABA device');
      }
    } catch (err: any) {
      toast.error('Error adding WABA device');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteDevice = async (id: number) => {
    if (!confirm('Are you sure you want to remove this Meta WABA device?')) return;
    try {
      await api.delete(`/waba/devices/${id}`);
      toast.success('WABA Device removed');
      fetchDevices();
    } catch (err) {
      toast.error('Failed to delete WABA device');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading WABA devices...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Meta WABA Devices</h2>
        <p className="text-gray-600 mt-1">Connect and manage official Meta WhatsApp Business API accounts</p>
      </div>

      {/* SETUP SELECTION TABS */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setActiveTab('embedded')}
            className={`pb-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'embedded'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sparkles size={18} />
            <span>Embedded Signup (Coexistence) [Recommended]</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sliders size={18} />
            <span>Manual Credentials Entry</span>
          </button>
        </div>

        {/* TAB 1: EMBEDDED SIGNUP (RECOMMENDED) */}
        {activeTab === 'embedded' && (
          <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-6 text-center">
            <div className="max-w-xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                <Zap size={12} /> Recommended Multiple Signup
              </span>
              <h3 className="text-2xl font-black text-gray-900">Quick Setup using Meta Business Integration</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Connect your WhatsApp Business numbers instantly without copy-pasting API tokens.
                Meta Embedded Signup automatically provisions your WABA Account ID, Phone Number ID, and Access Tokens.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleLaunchEmbeddedSignup}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center space-x-3 text-sm"
              >
                <Facebook size={20} />
                <span>Continue with Meta (Embedded Signup)</span>
                <ExternalLink size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-200 text-left text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                <span>Supports Coexistence with WhatsApp App</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                <span>Link Multiple Phone Numbers</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                <span>Automated Meta Token Exchange</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL CREDENTIALS */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualAddDevice} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Display Phone Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone Number ID</label>
              <input
                type="text"
                required
                placeholder="e.g. 10482759283719"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">WABA Account ID</label>
              <input
                type="text"
                required
                placeholder="e.g. 1093847291823"
                value={wabaAccountId}
                onChange={(e) => setWabaAccountId(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Permanent Access Token</label>
              <input
                type="text"
                required
                placeholder="EAAG..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={adding}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow text-sm disabled:opacity-50"
              >
                {adding ? 'Connecting Device...' : 'Connect WABA Device Manually'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ACTIVE DEVICES LIST */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Smartphone size={20} className="text-blue-600" />
          Active WABA Devices ({devices.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {devices.length === 0 ? (
            <div className="md:col-span-2 bg-white p-12 text-center rounded-2xl border text-gray-500 shadow-sm">
              <Smartphone size={40} className="mx-auto mb-2 text-gray-300" />
              <h4 className="font-bold text-gray-800">No WABA Devices Linked</h4>
              <p className="text-xs text-gray-400 mt-1">Use Embedded Signup above to link your WhatsApp Business API Accounts.</p>
            </div>
          ) : (
            devices.map((d) => (
              <div key={d.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-base">+{d.phone}</h4>
                      <p className="text-xs text-gray-400 font-mono">ID: {d.phoneNumberId}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 font-bold text-xs rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>
                <div className="pt-3 border-t text-xs text-gray-500 space-y-1">
                  <p><span className="font-semibold">WABA Account ID:</span> {d.wabaAccountId}</p>
                  <p><span className="font-semibold">Quality Rating:</span> <span className="text-emerald-600 font-bold">{d.qualityRating}</span></p>
                </div>
                <div className="pt-2 text-right">
                  <button
                    onClick={() => handleDeleteDevice(d.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Remove Device
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
