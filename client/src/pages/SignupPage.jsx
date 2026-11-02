import React from 'react';
import { SignupForm } from '../components/auth/SignupForm.jsx';

export function SignupPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <SignupForm />
    </div>
  );
}

