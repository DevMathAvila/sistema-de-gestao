import React from 'react';
import { Outlet } from 'react-router-dom';
import TopHeaderNav from './TopHeaderNav';
import { useThemeMode } from '../lib/theme.jsx';

export default function AppShell() {
  const { shellClass, isBlack } = useThemeMode();

  return (
    <div className={`relative min-h-screen ${shellClass}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -left-24 top-20 h-72 w-72 rounded-full blur-3xl ${isBlack ? 'bg-red-700/15' : 'bg-red-600/20'}`} />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <TopHeaderNav />

      <main className="relative z-10 px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl fade-slide-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

