import React, { useState } from 'react';
import { DraftsPanel } from '../drafts/DraftsPanel';
import { DraftForm } from '../drafts/DraftForm';
import { LogsFilters } from './LogsFilters';
import { LogsTable } from './LogsTable';

type Tab = 'form' | 'logs';

export const ServiceLogsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('form');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        {(['form', 'logs'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'form' ? 'Drafts & Form' : 'Service Logs'}
          </button>
        ))}
      </div>

      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <DraftsPanel />
          </aside>
          <main className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <DraftForm />
          </main>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="flex flex-col gap-4">
          <LogsFilters />
          <LogsTable />
        </div>
      )}
    </div>
  );
};
