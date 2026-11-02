import React from 'react';
import { LoginForm } from '../components/auth/LoginForm.jsx';

export function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <LoginForm />
    </div>
  );
}

