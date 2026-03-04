import React from 'react';
import {
  BarChart3,
  Calendar,
  Loader2,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sun,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardKPI from '../../dashboard/components/DashboardKPI';
import AppBottomNav from '../../../shared/components/layout/AppBottomNav';
import { getAdminScrollbarCss } from '../styles/adminTheme';
import { useAdminPage } from '../hooks/useAdminPage';
import AdminUsersTab from '../components/AdminUsersTab';
import AdminStatsTab from '../components/AdminStatsTab';
import AdminHistoryTab from '../components/AdminHistoryTab';

const iconByTab = {
  indicadores: TrendingUp,
  usuarios: Users,
  estatisticas: BarChart3,
  historico: Calendar,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const {
    s,
    theme,
    loading,
    isMaster,
    roleOptions,
    activeTab,
    setActiveTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleTheme,
    navItems,
    novoUser,
    setNovoUser,
    usuarios,
    handleCreateUser,
    handleRemoveUser,
    setorFiltro,
    setSetorFiltro,
    falhasStats,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    intervaloInvalido,
    historicoSubAba,
    setHistoricoSubAba,
    historico,
    historicoAbertas,
    loadingHistorico,
    loadingHistoricoAbertas,
    handleExportHistorico,
    handleExportAbertas,
  } = useAdminPage();

  if (loading) {
    return (
      <div className={`min-h-screen ${s.bg} flex items-center justify-center`}>
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${s.bg} ${s.text} flex flex-col md:flex-row font-sans transition-colors duration-500`}>
      <header className={`md:hidden sticky top-0 z-40 px-4 py-3.5 border-b backdrop-blur-2xl ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/70 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-600">
            <ShieldCheck size={22} strokeWidth={2.5} />
            <div>
              <p className="text-sm font-black italic leading-none">ADMIN</p>
              <p className={`text-[9px] font-black uppercase tracking-widest ${s.sub}`}>Privileged Access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className={`p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Fechar menu" />
          <aside className={`absolute left-0 top-0 h-full w-[88%] max-w-sm border-r p-6 flex flex-col shadow-2xl ${theme === 'dark' ? 'bg-[#080808]/95 border-white/10 backdrop-blur-2xl' : 'bg-white/95 border-slate-200 backdrop-blur-2xl'}`}>
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Menu Admin</p>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                <X size={16} />
              </button>
            </div>
            <nav className="space-y-3">
              {navItems.map((item) => {
                const Icon = iconByTab[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full min-h-12 p-3 rounded-xl border font-black text-[10px] uppercase tracking-wider flex items-center gap-3 text-left transition-all ${
                      activeTab === item.id
                        ? 'bg-red-600 text-white border-red-500'
                        : theme === 'dark'
                          ? 'border-white/10 text-white bg-white/5'
                          : 'border-slate-200 text-slate-900 bg-white'
                    }`}
                  >
                    <Icon size={16} className={activeTab === item.id ? 'text-white' : 'text-red-600'} />
                    {item.label}
                  </button>
                );
              })}
              <button onClick={toggleTheme} className={`w-full min-h-12 p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-[11px] font-black uppercase">Tema</span>
                {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
              </button>
            </nav>
          </aside>
        </div>
      )}

      <aside className={`hidden md:flex ${sidebarCollapsed ? 'w-24' : 'w-72'} ${s.sidebar} border-r p-6 flex-col z-20 transition-all duration-300 relative`}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3 text-red-600 overflow-hidden">
            <ShieldCheck size={32} strokeWidth={2.5} />
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-black tracking-tighter text-red-600 italic leading-none">ADMIN</h1>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${s.sub}`}>Privileged Access</span>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarCollapsed((v) => !v)} className={`p-2 rounded-xl border ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => {
            const Icon = iconByTab[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-wider text-left ${
                  activeTab === item.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : `${s.sub} hover:bg-red-600/5 hover:text-red-600`
                }`}
              >
                <Icon size={20} className={activeTab === item.id ? 'text-white' : ''} />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
          <button onClick={toggleTheme} className={`w-full min-h-12 p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
            {!sidebarCollapsed && <span className="text-[11px] font-black uppercase">Tema</span>}
            {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-12 pb-24 md:pb-12 overflow-y-auto">
        <div className="mb-5 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={`h-11 px-4 rounded-2xl border flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
              theme === 'dark'
                ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            Voltar ao inicio
          </button>
        </div>
        <div className="md:hidden mb-5 flex gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`h-11 px-4 rounded-2xl whitespace-nowrap font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : `${s.card} ${s.sub}`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeTab === 'usuarios' && (
          <AdminUsersTab
            s={s}
            theme={theme}
            isMaster={isMaster}
            usuarios={usuarios}
            novoUser={novoUser}
            setNovoUser={setNovoUser}
            roleOptions={roleOptions}
            onCreateUser={handleCreateUser}
            onRemoveUser={handleRemoveUser}
          />
        )}

        {activeTab === 'estatisticas' && (
          <AdminStatsTab
            s={s}
            theme={theme}
            setorFiltro={setorFiltro}
            setSetorFiltro={setSetorFiltro}
            falhasStats={falhasStats}
          />
        )}

        {activeTab === 'historico' && (
          <AdminHistoryTab
            s={s}
            theme={theme}
            dataInicio={dataInicio}
            dataFim={dataFim}
            setDataInicio={setDataInicio}
            setDataFim={setDataFim}
            intervaloInvalido={intervaloInvalido}
            historicoSubAba={historicoSubAba}
            setHistoricoSubAba={setHistoricoSubAba}
            historico={historico}
            historicoAbertas={historicoAbertas}
            loadingHistorico={loadingHistorico}
            loadingHistoricoAbertas={loadingHistoricoAbertas}
            onExportHistorico={handleExportHistorico}
            onExportAbertas={handleExportAbertas}
          />
        )}

        {activeTab === 'indicadores' && (
          <DashboardKPI
            dataInicio={dataInicio}
            dataFim={dataFim}
            setDataInicio={setDataInicio}
            setDataFim={setDataFim}
            theme={theme}
            s={s}
          />
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: getAdminScrollbarCss(theme) }} />
      <AppBottomNav isAdmin />
    </div>
  );
}
