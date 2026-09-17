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
  UserX
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

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
          <p className="text-gray-600 mt-1">Manage user accounts, block/unblock, and extend plan validity</p>
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

      <div className="bg-white rounded-2xl border shadow-sm overflow-visible">
        <div className="overflow-x-visible">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
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
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center text-green-600 text-xs font-bold bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={14} className="mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-500 text-xs font-bold bg-red-50 px-2.5 py-1 rounded-full">
                          <XCircle size={14} className="mr-1" /> Blocked
                        </span>
                      )}
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
                        <div className="absolute right-6 top-12 z-50 w-52 bg-white rounded-xl shadow-xl border p-1 space-y-1 text-left">
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
