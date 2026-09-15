'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { countries } from '@/lib/countries';

export default function LoginPage() {
  const [countryCode, setCountryCode] = useState('+91');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullNumber = countryCode.replace('+', '') + number.replace(/\D/g, '');
      const response = await api.post('/users/login', {
        number: fullNumber,
        password,
        userType,
      });

      if (response.data.status) {
        const loggedInUser = response.data.result.user;
        const token = response.data.result.token;
        setAuth(loggedInUser, token);

        toast.success('Login successful!');

        if (loggedInUser.userType !== 'admin' && (loggedInUser.validDays <= 0 || !loggedInUser.isActive)) {
          toast('Subscription expired. Select a plan to renew.', { icon: '⚠️' });
          router.push('/subscription');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg border">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-1 text-sm">Login to MsgPilot WhatsApp Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
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
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 pr-12 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6 bg-gray-50 p-3 rounded-xl border">
            <span className="text-xs font-semibold text-gray-500 uppercase">Role:</span>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                checked={userType === 'user'}
                onChange={() => setUserType('user')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">User</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="userType"
                checked={userType === 'admin'}
                onChange={() => setUserType('admin')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50 text-sm"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 pt-2 border-t">
          Don't have an account?{' '}
          <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
