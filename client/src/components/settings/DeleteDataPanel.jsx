import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { Trash2, AlertTriangle } from 'lucide-react';

export function DeleteDataPanel() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      await api.deleteAccountData();
      setShowConfirm(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to delete interview data.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-rose-100">
        <AlertTriangle className="w-5 h-5 text-rose-600" />
        <h3 className="text-lg font-bold text-slate-900">Danger Zone: Purge All Interview Data</h3>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Permanently purge all your past mock interview sessions, audio recordings, coaching reports, and speech metrics from the database. This action is immediate and cannot be undone.
      </p>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={deleting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          <span>{deleting ? 'Purging All Data...' : 'Purge All Interview Data'}</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Permanently Delete All Interview Data?"
        message="This will delete every mock interview session, audio recording file in storage, and coach feedback report associated with your account. You will start with a fresh slate."
        confirmLabel="Yes, Delete Everything"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

