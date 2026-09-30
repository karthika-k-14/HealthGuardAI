import React from 'react';
import { Outlet } from 'react-router-dom';
import PharmacistSidebar from './PharmacistSidebar';

export default function PharmacistLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <PharmacistSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
