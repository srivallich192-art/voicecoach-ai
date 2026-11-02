import React from 'react';
import { OnboardingWizard } from '../components/auth/OnboardingWizard.jsx';

export function OnboardingPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <OnboardingWizard />
    </div>
  );
}

