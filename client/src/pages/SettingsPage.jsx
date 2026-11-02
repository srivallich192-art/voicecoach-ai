import React from 'react';
import { ProfileForm } from '../components/settings/ProfileForm.jsx';
import { PrivacySettings } from '../components/settings/PrivacySettings.jsx';
import { DeleteDataPanel } from '../components/settings/DeleteDataPanel.jsx';
import { Settings, Shield, User } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Account & Coach Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Privacy Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your career target role, language backgrounds, audio retention, and privacy rights.
        </p>
      </div>

      {/* Profile Form */}
      <ProfileForm />

      {/* Audio Privacy Settings */}
      <PrivacySettings />

      {/* Data Deletion Danger Zone */}
      <DeleteDataPanel />
    </div>
  );
}

