import React from 'react';
import { ServiceLogsPage } from './features/logs/ServiceLogsPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Roslin Service Logs
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage service logs with drafts, autosave, search and filters.
        </p>
      </header>
      <ServiceLogsPage />
    </div>
  );
};

export default App;
