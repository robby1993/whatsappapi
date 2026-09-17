'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Database, Download, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AdminBackupPage() {
  const [downloading, setDownloading] = useState(false);

  const downloadBackup = async () => {
    setDownloading(true);
    try {
      const res = await api.get('/admin/backup-database');
      if (res.data?.status && res.data?.result) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(res.data.result, null, 2)
        )}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute(
          'download',
          `database_backup_${new Date().toISOString().slice(0, 10)}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success('Database backup exported successfully!');
      } else {
        toast.error('Failed to generate database backup');
      }
    } catch (err) {
      toast.error('Error exporting database backup');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Database Backup & Maintenance</h2>
        <p className="text-gray-600 mt-1">Export full database JSON backups and view database health status</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-purple-100 text-purple-700 rounded-2xl">
            <Database size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">1-Click Full Database Backup</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Exports all users, session tokens, subscription plans, message logs, and WABA configurations into a JSON file.
            </p>
          </div>
        </div>

        <button
          onClick={downloadBackup}
          disabled={downloading}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Generating Database Backup...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Export Full Database Backup (.JSON)</span>
            </>
          )}
        </button>

        <div className="pt-4 border-t space-y-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Includes User Accounts & Validity Logs</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Includes WhatsApp Baileys & Meta WABA Devices</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Includes Subscription Plans & Purchase History</span>
          </div>
        </div>
      </div>
    </div>
  );
}
