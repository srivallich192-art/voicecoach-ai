import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} VoiceCoach AI. Designed for spoken confidence & articulation.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Accent is never penalized • Privacy by default</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

