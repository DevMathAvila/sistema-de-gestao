import React from 'react';
import { Eye, HardDrive, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Settings, Shield, Sparkles, Sun, User, X } from 'lucide-react';
import AppBottomNav from '../../../shared/components/layout/AppBottomNav';
import { useDashboardPage } from '../hooks/useDashboardPage';

const navItems = [
  { id: 'abrir', label: 'Abrir chamado', path: '/abrir-chamado', icon: HardDrive },
  { id: 'visualizar', label: 'Visualizar Falhas', path: '/visualizar', icon: Eye },
  { id: 'admin', label: 'Administracao', path: '/admin?tab=indicadores', icon: Settings, helper: 'Dashboard KPI | Gestao de equipe', adminOnly: true },
  { id: 'senha', label: 'Seguranca', path: '/alterar-senha', icon: Shield },
];

export default function DashboardPage() {
  const vm = useDashboardPage();
  const visibleNav = navItems.filter((item) => !item.adminOnly || vm.isAdmin);

  return (
    <div className={`min-h-screen ${vm.styles.bg} ${vm.styles.text} flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500`}>
      <header className={`md:hidden sticky top-0 z-40 px-4 py-3.5 border-b backdrop-blur-2xl ${vm.theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/70 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-black text-sm text-white">L</div>
            <div>
              <p className="text-sm font-black italic leading-none">LENOVO</p>
              <p className={`text-[9px] font-black uppercase tracking-wider ${vm.styles.subtext}`}>Welcome Hub</p>
            </div>
          </div>
          <button type="button" onClick={() => vm.setMobileMenuOpen((v) => !v)} className={`p-2.5 rounded-xl border ${vm.theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
            {vm.mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {vm.mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button type="button" onClick={() => vm.setMobileMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className={`absolute right-0 top-0 h-full w-[88%] max-w-sm border-l p-6 flex flex-col shadow-2xl ${vm.theme === 'dark' ? 'bg-[#060606]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Navegacao</p>
              <button type="button" onClick={() => vm.setMobileMenuOpen(false)} className={`p-2 rounded-lg ${vm.theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}><X size={16} /></button>
            </div>
            <nav className="space-y-3">
              {visibleNav.map((item) => (
                <button key={item.id} type="button" onClick={() => vm.navigateAndCloseMobile(item.path)} className={`w-full min-h-12 flex items-start gap-3 p-4 ${vm.styles.subtext} hover:text-red-600 rounded-2xl font-black text-[11px] tracking-widest uppercase text-left`}>
                  <item.icon size={18} className="mt-0.5" />
                  <span>
                    <span className="block">{item.label}</span>
                    {item.helper && <span className="block text-[9px] tracking-wide normal-case opacity-70">{item.helper}</span>}
                  </span>
                </button>
              ))}
            </nav>
            <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
              <button onClick={vm.toggleTheme} className={`w-full min-h-12 p-3 rounded-xl border flex items-center justify-between ${vm.theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-[11px] font-black uppercase">Tema</span>
                {vm.theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
              </button>
              <button onClick={vm.handleLogout} className="w-full min-h-12 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest">Encerrar Sessao</button>
            </div>
          </aside>
        </div>
      )}

      <aside className={`hidden md:flex ${vm.sidebarCollapsed ? 'w-24' : 'w-64'} border-r ${vm.styles.sidebar} p-4 flex-col z-20 transition-all duration-300`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl text-white">L</div>
            {!vm.sidebarCollapsed && <div><h1 className="text-xl font-black tracking-tighter italic leading-none">LENOVO</h1><span className="text-[8px] font-bold tracking-[0.2em] text-red-600 uppercase">Welcome Hub</span></div>}
          </div>
          <button onClick={() => vm.setSidebarCollapsed((v) => !v)} className={`p-2 rounded-lg border ${vm.theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
            {vm.sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          {visibleNav.map((item) => (
            <button key={item.id} type="button" onClick={() => vm.navigate(item.path)} className={`w-full flex items-center gap-3 p-4 ${vm.styles.subtext} hover:text-red-600 rounded-2xl font-black text-[10px] tracking-widest uppercase text-left`}>
              <item.icon size={18} />
              {!vm.sidebarCollapsed && (
                <span className="leading-tight">
                  <span className="block">{item.label}</span>
                  {item.helper && <span className="block text-[8px] tracking-wide normal-case opacity-60">{item.helper}</span>}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
          <button onClick={vm.toggleTheme} className={`w-full p-3 rounded-xl border flex items-center justify-between ${vm.theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
            {!vm.sidebarCollapsed && <span className="text-[10px] font-black uppercase">Tema</span>}
            {vm.theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
          </button>
          <div className={`flex items-center gap-4 p-4 rounded-2xl ${vm.theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600"><User size={20} /></div>
            {!vm.sidebarCollapsed && <div className="overflow-hidden"><p className={`text-[8px] font-black uppercase ${vm.styles.subtext}`}>Usuario:</p><p className="text-sm font-black truncate italic leading-none">{vm.user.username}</p></div>}
          </div>
          <button onClick={vm.handleLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase text-xs">
            <LogOut size={16} /> {!vm.sidebarCollapsed && 'Encerrar Sessao'}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto z-10">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-red-600/20 p-8 md:p-12 bg-gradient-to-br from-red-600/10 via-transparent to-transparent">
          <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-600/30 text-red-500 mb-6 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} /> Painel de Boas-vindas
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Bem-vindo ao <span className="text-red-600">Centro Lenovo</span>
            </h2>
            <p className={`mt-6 text-sm md:text-base max-w-2xl ${vm.styles.subtext}`}>
              Ambiente principal de operacao. Use os atalhos diretos para abrir chamados e acompanhar falhas em tempo real.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => vm.navigate('/abrir-chamado')} className="px-6 py-3 rounded-2xl bg-red-600 text-white font-black uppercase text-xs tracking-widest hover:bg-red-700">Abrir chamado</button>
              <button type="button" onClick={() => vm.navigate('/visualizar')} className={`px-6 py-3 rounded-2xl border font-black uppercase text-xs tracking-widest ${vm.theme === 'dark' ? 'border-white/15 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-100'}`}>Visualizar falhas</button>
            </div>
          </div>
        </div>
      </main>

      <AppBottomNav isAdmin={vm.isAdmin} />
    </div>
  );
}
