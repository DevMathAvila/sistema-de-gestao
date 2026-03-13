import React from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  Eye,
  HardDrive,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Shield,
  ShieldAlert,
  Sun,
  User,
  X,
  Zap,
} from 'lucide-react';
import AppBottomNav from '../../../shared/components/layout/AppBottomNav';
import { useFabricaStatusPage } from '../hooks/useFabricaStatusPage';

const linkIcon = {
  abrir: HardDrive,
  visualizar: Eye,
  assistente: Bot,
  admin: ShieldAlert,
  inicio: LayoutDashboard,
};

export default function FabricaStatusPage() {
  const {
    user,
    isAdmin,
    theme,
    toggleTheme,
    mobileMenuOpen,
    setMobileMenuOpen,
    setoresComFalha,
    styles,
    sidebarLinks,
    setores,
    handleLogout,
    navigateAndCloseMobile,
    navigate,
  } = useFabricaStatusPage();

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500`}>
      <header className={`md:hidden sticky top-0 z-40 px-4 py-3.5 border-b backdrop-blur-2xl ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/70 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-black text-sm text-white">L</div>
            <div>
              <p className="text-sm font-black italic leading-none">LENOVO</p>
              <p className={`text-[9px] font-black uppercase tracking-wider ${styles.subtext}`}>Core Dashboard</p>
            </div>
          </div>
          <button type="button" onClick={() => setMobileMenuOpen((v) => !v)} className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className={`absolute right-0 top-0 h-full w-[88%] max-w-sm border-l p-6 flex flex-col shadow-2xl ${theme === 'dark' ? 'bg-[#060606]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Navegacao</p>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}><X size={16} /></button>
            </div>
            <nav className="space-y-3">
              {sidebarLinks.map((item) => {
                const Icon = linkIcon[item.id];
                const active = item.id === 'abrir';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateAndCloseMobile(item.path)}
                    className={`w-full min-h-12 flex items-start gap-3 p-4 rounded-2xl font-black text-[11px] tracking-widest uppercase text-left ${
                      active ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : `${styles.subtext} hover:text-red-600`
                    }`}
                  >
                    <Icon size={18} />
                    <span>
                      <span className="block">{item.label}</span>
                      {item.helper && <span className="block text-[9px] tracking-wide normal-case opacity-70">{item.helper}</span>}
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
              <button onClick={toggleTheme} className={`w-full min-h-12 p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-[11px] font-black uppercase">Tema</span>
                {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
              </button>
              <button onClick={handleLogout} className="w-full min-h-12 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest">
                Encerrar Sessao
              </button>
            </div>
          </aside>
        </div>
      )}

      <aside className={`hidden md:flex w-60 border-r ${styles.sidebar} p-4 flex-col z-20 transition-all duration-300`}>
        <div className="mb-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl text-white">L</div>
            <div>
              <h1 className="text-xl font-black tracking-tighter italic leading-none">LENOVO</h1>
              <span className="text-[8px] font-bold tracking-[0.2em] text-red-600 uppercase">Core Dashboard</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarLinks.map((item) => {
            const Icon = linkIcon[item.id];
            const active = item.id === 'abrir';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all group font-black text-[10px] tracking-widest uppercase text-left ${
                  active ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : `${styles.subtext} hover:text-red-600`
                }`}
              >
                <Icon size={18} />
                <span className="leading-tight">
                  <span className="block">{item.label}</span>
                  {item.helper && <span className="block text-[8px] tracking-wide normal-case opacity-60">{item.helper}</span>}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
          <button onClick={toggleTheme} className={`w-full p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
            <span className="text-[10px] font-black uppercase">Tema</span>
            {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
          </button>
          <div className={`flex items-center gap-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600"><User size={20} /></div>
            <div className="overflow-hidden"><p className={`text-[8px] font-black uppercase ${styles.subtext}`}>Usuario:</p><p className="text-sm font-black truncate italic leading-none">{user.username}</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase text-xs">
            <LogOut size={16} /> Encerrar Sessao
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto z-10">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[2px] w-8 bg-red-600" />
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">Operational Status</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
              Fabrica <span className="text-red-600">Status</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'} flex items-center gap-2`}>
              <Activity size={14} className="text-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider">Telemetria Ativa</span>
            </div>
            <button type="button" onClick={() => navigate('/alterar-senha')} className={`h-10 w-10 rounded-xl border flex items-center justify-center ${theme === 'dark' ? 'border-red-600/40 bg-red-600/10 text-red-500' : 'border-red-200 bg-red-50 text-red-600'}`}>
              <Shield size={15} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {setores.map((setorNome) => {
            const temFalha = setoresComFalha.includes(setorNome);
            return (
              <button
                key={setorNome}
                onClick={() => navigate('/registrar', { state: { setor: setorNome } })}
                className={`p-6 rounded-[2.5rem] border transition-all duration-500 text-left group relative h-48 flex flex-col justify-between overflow-hidden ${
                  temFalha ? 'bg-red-600 border-red-500 text-white shadow-2xl shadow-red-600/30' : `${styles.card} hover:border-red-600/40`
                }`}
              >
                <div className={`absolute -right-6 -bottom-6 opacity-[0.05] ${temFalha ? 'text-white' : 'text-red-600'}`}><Zap size={140} /></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className={`p-3 rounded-2xl ${temFalha ? 'bg-white/20 text-white' : 'bg-red-600 text-white'}`}><HardDrive size={24} /></div>
                  {temFalha && <div className="bg-white text-red-600 p-1.5 rounded-full"><AlertTriangle size={18} fill="currentColor" /></div>}
                </div>
                <div className="relative z-10">
                  <span className="block font-black text-2xl tracking-tighter uppercase italic">{setorNome}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${temFalha ? 'bg-white animate-ping' : 'bg-green-500'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${temFalha ? 'text-white/80' : styles.subtext}`}>
                      {temFalha ? 'Alerta Critico' : 'Sistema OK'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <AppBottomNav isAdmin={isAdmin} />
    </div>
  );
}
