import React, { Suspense } from 'react';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import LoaderCircle from 'lucide-react/dist/esm/icons/loader-circle';
import Menu from 'lucide-react/dist/esm/icons/menu';
import Moon from 'lucide-react/dist/esm/icons/moon';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Sun from 'lucide-react/dist/esm/icons/sun';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Users from 'lucide-react/dist/esm/icons/users';
import X from 'lucide-react/dist/esm/icons/x';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '../../../shared/components/layout/AppBottomNav';
import { getAdminScrollbarCss } from '../styles/adminTheme';
import { useAdminPage } from '../hooks/useAdminPage';

const DashboardKPI = React.lazy(() => import('../../dashboard/components/DashboardKPI'));
const AdminUsersTab = React.lazy(() => import('../components/AdminUsersTab'));
const AdminStatsTab = React.lazy(() => import('../components/AdminStatsTab'));
const AdminHistoryTab = React.lazy(() => import('../components/AdminHistoryTab'));

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
    toggleTheme,
    navItems,
    novoUser,
    setNovoUser,
    usuarios,
    salvandoUsuario,
    removendoUsuario,
    usuarioPendenteRemocao,
    userActionFeedback,
    handleCreateUser,
    handleAskRemoveUser,
    handleCancelRemoveUser,
    handleConfirmRemoveUser,
    setorFiltro,
    setSetorFiltro,
    falhasStats,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    historicoSetorFiltro,
    setHistoricoSetorFiltro,
    historicoSetores,
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
        <LoaderCircle className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  const tabFallback = (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className={`${s.card} rounded-[2.5rem] flex items-center justify-center py-32`}>
        <LoaderCircle className="animate-spin text-red-600" size={48} />
      </div>
    </section>
  );

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
              <button
                type="button"
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full min-h-12 p-3 rounded-xl border font-black text-[10px] uppercase tracking-wider flex items-center gap-3 text-left transition-all ${
                  theme === 'dark'
                    ? 'border-white/10 text-white bg-white/5'
                    : 'border-slate-200 text-slate-900 bg-white'
                }`}
              >
                <LayoutDashboard size={16} className="text-red-600" />
                Voltar ao inicio
              </button>
              <button onClick={toggleTheme} className={`w-full min-h-12 p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-[11px] font-black uppercase">Tema</span>
                {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
              </button>
            </nav>
          </aside>
        </div>
      )}

      <aside className={`hidden md:flex w-60 ${s.sidebar} border-r p-6 flex-col z-20 transition-all duration-300 relative`}>
        <div className="mb-12">
          <div className="flex items-center gap-3 text-red-600 overflow-hidden">
            <ShieldCheck size={32} strokeWidth={2.5} />
            <div>
              <h1 className="text-xl font-black tracking-tighter text-red-600 italic leading-none">ADMIN</h1>
              <span className={`text-[8px] font-bold uppercase tracking-widest ${s.sub}`}>Privileged Access</span>
            </div>
          </div>
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
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-wider text-left ${s.sub} hover:bg-red-600/5 hover:text-red-600`}
          >
            <LayoutDashboard size={20} />
            Voltar ao inicio
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
          <button onClick={toggleTheme} className={`w-full min-h-12 p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
            <span className="text-[11px] font-black uppercase">Tema</span>
            {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-12 pb-24 md:pb-12 overflow-y-auto">
        {activeTab === 'usuarios' && (
          <Suspense fallback={tabFallback}>
            <AdminUsersTab
              s={s}
              theme={theme}
              isMaster={isMaster}
              usuarios={usuarios}
              novoUser={novoUser}
              setNovoUser={setNovoUser}
              roleOptions={roleOptions}
              salvandoUsuario={salvandoUsuario}
              removendoUsuario={removendoUsuario}
              usuarioPendenteRemocao={usuarioPendenteRemocao}
              userActionFeedback={userActionFeedback}
              onCreateUser={handleCreateUser}
              onAskRemoveUser={handleAskRemoveUser}
              onCancelRemoveUser={handleCancelRemoveUser}
              onConfirmRemoveUser={handleConfirmRemoveUser}
            />
          </Suspense>
        )}

        {activeTab === 'estatisticas' && (
          <Suspense fallback={tabFallback}>
            <AdminStatsTab
              s={s}
              theme={theme}
              setorFiltro={setorFiltro}
              setSetorFiltro={setSetorFiltro}
              falhasStats={falhasStats}
            />
          </Suspense>
        )}

        {activeTab === 'historico' && (
          <Suspense fallback={tabFallback}>
            <AdminHistoryTab
              s={s}
              theme={theme}
              dataInicio={dataInicio}
              dataFim={dataFim}
              setDataInicio={setDataInicio}
              setDataFim={setDataFim}
              historicoSetorFiltro={historicoSetorFiltro}
              setHistoricoSetorFiltro={setHistoricoSetorFiltro}
              historicoSetores={historicoSetores}
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
          </Suspense>
        )}

        {activeTab === 'indicadores' && (
          <Suspense
            fallback={tabFallback}
          >
            <DashboardKPI
              dataInicio={dataInicio}
              dataFim={dataFim}
              setDataInicio={setDataInicio}
              setDataFim={setDataFim}
              theme={theme}
              s={s}
            />
          </Suspense>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: getAdminScrollbarCss(theme) }} />
      <AppBottomNav isAdmin />
    </div>
  );
}
