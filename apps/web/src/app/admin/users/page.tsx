'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Users,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Settings,
  Search,
  MoreVertical,
  Clock,
  UserCheck,
  UserX,
  Sliders,
  Check,
  Zap,
  Smartphone,
  MessageSquare
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Channel Access Permission Modal State
  const [selectedUserForChannels, setSelectedUserForChannels] = useState<any | null>(null);
  const [allowWebBaileys, setAllowWebBaileys] = useState(true);
  const [allowWaba, setAllowWaba] = useState(true);
  const [allowRcs, setAllowRcs] = useState(true);
  const [savingChannels, setSavingChannels] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data?.status && Array.isArray(res.data.result)) {
        setUsers(res.data.result);
      }
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const openChannelModal = (user: any) => {
    setActiveMenuId(null);
    setSelectedUserForChannels(user);
    setAllowWebBaileys(user.allowWebBaileys !== false);
    setAllowWaba(user.allowWaba !== false);
    setAllowRcs(user.allowRcs !== false);
  };

  const handleSaveChannels = async () => {
    if (!selectedUserForChannels) return;
    setSavingChannels(true);
    try {
      const res = await api.post('/admin/update-user', {
        number: selectedUserForChannels.number,
        allowWebBaileys,
        allowWaba,
        allowRcs,
      });

      if (res.data?.status) {
        toast.success(`Channel permissions updated for ${selectedUserForChannels.name}!`);
        setSelectedUserForChannels(null);
        fetchUsers();
      } else {
        toast.error('Failed to update channel permissions');
      }
    } catch (err) {
      toast.error('Error updating permissions');
    } finally {
      setSavingChannels(false);
    }
  };

  const toggleUserStatus = async (number: string, currentStatus: boolean, validDays: number) => {
    setActiveMenuId(null);
    try {
      await api.post('/admin/update-user', {
        number,
        isActive: !currentStatus,
        validDays,
      });
      toast.success(`User ${currentStatus ? 'blocked' : 'unblocked'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const updateValidDays = async (number: string, isActive: boolean, currentDays: number) => {
    setActiveMenuId(null);
    const newDays = prompt('Enter new valid subscription days:', currentDays.toString());
    if (newDays === null) return;

    try {
      await api.post('/admin/update-user', {
        number,
        isActive,
        validDays: parseInt(newDays),
      });
      toast.success('Subscription days updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const handleDeleteUser = async (number: string, userType: string) => {
    setActiveMenuId(null);
    if (!confirm(`Are you sure you want to permanently delete user +${number}?`)) return;
    try {
      await api.delete(`/admin/users/${number}/hard?userType=${userType}`);
      toast.success('User deleted permanently');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.number?.includes(search)
  );

  if (loading) return <div className="flex items-center justify-center h-full">Loading users...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4" ref={menuRef}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage user accounts, block/unblock, and channel access permissions</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-72">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:border-purple-500 shadow-sm"
          />
        </div>
      </div>

      {/* CHANNEL ACCESS PERMISSION MODAL */}
      {selectedUserForChannels && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Channel Access Permissions</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Enable or hide messaging sections for <span className="font-bold text-gray-900">+{selectedUserForChannels.number}</span>
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-emerald-50/50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">WhatsApp Web (Baileys)</p>
                    <p className="text-[11px] text-gray-500">Enable Baileys multi-account section</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowWebBaileys}
                  onChange={(e) => setAllowWebBaileys(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-blue-50/50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">WhatsApp Business API (Meta)</p>
                    <p className="text-[11px] text-gray-500">Enable Meta Cloud API section</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowWaba}
                  onChange={(e) => setAllowWaba(e.target.checked)}
                  className="w-5 h-5 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 border rounded-xl hover:bg-indigo-50/50 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">RCS Business Messaging (Google)</p>
                    <p className="text-[11px] text-gray-500">Enable Google RCS section</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowRcs}
                  onChange={(e) => setAllowRcs(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded"
                />
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserForChannels(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChannels}
                disabled={savingChannels}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow"
              >
                {savingChannels ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm overflow-visible">
        <div className="overflow-x-visible">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Allowed Sections</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors relative">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{u.name}</span>
                        <span className="text-xs text-gray-500 font-mono">+{u.number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        u.userType === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.userType}
                      </span>
                    </td>

                    {/* ALLOWED SECTIONS BADGES */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.allowWebBaileys !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400 line-through'
                        }`}>
                          WA Web
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.allowWaba !== false ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-400 line-through'
                        }`}>
                          WABA
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.allowRcs !== false ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-100 text-gray-400 line-through'
                        }`}>
                          RCS
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className={`font-semibold ${u.validDays <= 0 ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                          {u.validDays} Days {u.validDays <= 0 && '(Expired)'}
                        </span>
                      </div>
                    </td>

                    {/* 3-DOT ACTION MENU */}
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === u.id ? null : u.id);
                        }}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors inline-flex items-center justify-center"
                        title="More Actions"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* FLOATING ACTION DROPDOWN */}
                      {activeMenuId === u.id && (
                        <div className="absolute right-6 top-12 z-50 w-56 bg-white rounded-xl shadow-xl border p-1 space-y-1 text-left">
                          <button
                            onClick={() => openChannelModal(u)}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                          >
                            <Sliders size={16} />
                            <span>Channel Access Permissions</span>
                          </button>

                          <button
                            onClick={() => toggleUserStatus(u.number, u.isActive, u.validDays)}
                            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                              u.isActive
                                ? 'text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            <span>{u.isActive ? 'Block Account' : 'Unblock Account'}</span>
                          </button>

                          <button
                            onClick={() => updateValidDays(u.number, u.isActive, u.validDays)}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                          >
                            <Clock size={16} />
                            <span>Extend Subscription Days</span>
                          </button>

                          {u.userType !== 'admin' && (
                            <div className="border-t pt-1">
                              <button
                                onClick={() => handleDeleteUser(u.number, u.userType)}
                                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                                <span>Delete User Permanently</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
