import React from 'react';
import { ROLE_DOMAINS } from '@shared/constants.js';
import { Briefcase } from 'lucide-react';

export function RoleDomainPicker({ selectedDomain, onSelectDomain, selectedRole, onSelectRole }) {
  const currentDomainObj = ROLE_DOMAINS.find(d => d.id === selectedDomain) || ROLE_DOMAINS[0];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">
          Target Domain / Field
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {ROLE_DOMAINS.map((domain) => {
            const isSelected = domain.id === selectedDomain;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => {
                  onSelectDomain(domain.id);
                  onSelectRole(domain.roles[0]);
                }}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500 font-semibold shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="text-xs uppercase font-bold tracking-wider">{domain.name}</span>
                </div>
                <span className="text-xs text-slate-500 font-normal truncate">
                  {domain.roles.length} role presets
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-800 mb-1.5" htmlFor="role-select">
          Select Role Title
        </label>
        <div className="space-y-2">
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => onSelectRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          >
            {currentDomainObj.roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Or type a specialized role (e.g. Next.js Full Stack Engineer)..."
            value={selectedRole}
            onChange={(e) => onSelectRole(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>
    </div>
  );
}

