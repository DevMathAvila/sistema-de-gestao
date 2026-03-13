import React from 'react';
import BellRing from 'lucide-react/dist/esm/icons/bell-ring';
import ClipboardList from 'lucide-react/dist/esm/icons/clipboard-list';
import Eye from 'lucide-react/dist/esm/icons/eye';
import HardDrive from 'lucide-react/dist/esm/icons/hard-drive';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Menu from 'lucide-react/dist/esm/icons/menu';
import Moon from 'lucide-react/dist/esm/icons/moon';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import Sun from 'lucide-react/dist/esm/icons/sun';
import User from 'lucide-react/dist/esm/icons/user';
import X from 'lucide-react/dist/esm/icons/x';
import AppBottomNav from '../../../shared/components/layout/AppBottomNav';
import CloseFailureModal from '../components/CloseFailureModal';
import FailureSectorBoard from '../components/FailureSectorBoard';
import InoperantPointsBoard from '../components/InoperantPointsBoard';
import SigaDeskOverlay from '../components/SigaDeskOverlay';
import { useVisualizarFalhasPage } from '../hooks/useVisualizarFalhasPage';

const navItems = [
  { id: 'abrir', label: 'Abrir chamado', path: '/abrir-chamado', icon: HardDrive },
  { id: 'visualizar', label: 'Visualizar Falhas', path: '/visualizar', icon: Eye, active: true },
  { id: 'siga', label: 'SIGA', icon: ClipboardList },
  { id: 'admin', label: 'Administracao', path: '/admin?tab=indicadores', icon: ShieldAlert, adminOnly: true },
  { id: 'inicio', label: 'Voltar ao inicio', path: '/dashboard', icon: LayoutDashboard },
];

export default function VisualizarFalhasPage() {
  const vm = useVisualizarFalhasPage();

  if (vm.loading) {
    return (
      <div className={`min-h-screen ${vm.styles.bg} flex flex-col items-center justify-center`}>
        <div className="w-8 h-8 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-4" />
        <span className="text-red-600 font-black tracking-widest text-[9px] uppercase">Sincronizando</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${vm.styles.bg} ${vm.styles.text} flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500`}>
      <header className={`md:hidden sticky top-0 z-40 px-4 py-3.5 border-b backdrop-blur-2xl ${vm.theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/70 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-black text-sm text-white">L</div>
            <div>
              <p className="text-sm font-black italic leading-none">LENOVO LIVE</p>
              <p className={`text-[9px] font-black uppercase tracking-widest ${vm.styles.subtext}`}>Monitor</p>
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
          <aside className={`absolute right-0 top-0 h-full w-[88%] max-w-sm border-l p-6 flex flex-col shadow-2xl ${vm.theme === 'dark' ? 'bg-[#080808]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Navegacao</p>
              <button type="button" onClick={() => vm.setMobileMenuOpen(false)} className={`p-2 rounded-lg ${vm.theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}><X size={16} /></button>
            </div>
            <nav className="space-y-3">
              {navItems.filter((item) => !item.adminOnly || vm.isAdmin).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'siga') {
                      vm.setMobileMenuOpen(false);
                      vm.openSigaDesk();
                      return;
                    }
                    vm.navigateAndCloseMobile(item.path);
                  }}
                  className={`w-full min-h-12 flex items-center gap-3 p-4 rounded-2xl font-black text-[11px] tracking-widest uppercase text-left ${
                    item.active ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : `${vm.styles.subtext} hover:text-red-600`
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <aside className={`hidden md:flex w-60 border-r ${vm.styles.sidebar} p-4 flex-col z-20 transition-all duration-300`}>
        <div className="mb-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl text-white">L</div>
            <div><h1 className="text-xl font-black tracking-tighter italic leading-none">LENOVO</h1><span className="text-[8px] font-bold tracking-[0.2em] text-red-600 uppercase">Live Monitor</span></div>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.filter((item) => !item.adminOnly || vm.isAdmin).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'siga') {
                  vm.openSigaDesk();
                  return;
                }
                vm.navigate(item.path);
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl group font-black text-[10px] tracking-widest uppercase text-left ${
                item.active ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : `${vm.styles.subtext} hover:text-red-600`
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
          <button onClick={vm.toggleTheme} className={`w-full p-3 rounded-xl border flex items-center justify-between ${vm.theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
            <span className="text-[10px] font-black uppercase">Tema</span>
            {vm.theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
          </button>
          <div className={`flex items-center gap-4 p-4 rounded-2xl ${vm.theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600"><User size={20} /></div>
            <div className="overflow-hidden"><p className={`text-[8px] font-black uppercase ${vm.styles.subtext}`}>Usuario:</p><p className="text-sm font-black truncate italic leading-none">{vm.user.username}</p></div>
          </div>
          <button onClick={vm.handleLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl uppercase text-xs">
            <LogOut size={16} /> Encerrar Sessao
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto z-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Visualizar <span className="text-red-600">Falhas</span></h2>
            <p className={`${vm.styles.subtext} text-xs`}>
              {vm.abaFalhas === 'abertas'
                ? 'Monitoramento em tempo real de falhas abertas.'
                : 'Lista dedicada de pontos em aberto marcados como inoperantes.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => vm.setShowNotifications((v) => !v)}
                className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all ${
                  vm.theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-white hover:bg-slate-100'
                } ${vm.alertasCriticos.some((a) => a.isTraveToda) ? 'animate-pulse ring-2 ring-purple-500/40' : ''}`}
              >
                <BellRing size={18} className={vm.alertasCriticos.some((a) => a.isTraveToda) ? 'text-purple-400' : 'text-red-600'} />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-600 text-white">
                  {vm.alertasCriticos.length}
                </span>
              </button>

              {vm.showNotifications && (
                <div className={`fixed left-3 right-3 top-[78px] md:absolute md:left-auto md:right-0 md:top-auto md:mt-3 md:w-[320px] md:max-w-[85vw] z-30 rounded-2xl border shadow-2xl p-3 ${
                  vm.theme === 'dark' ? 'bg-[#0b0b0b] border-white/10' : 'bg-white border-slate-200'
                }`}>
                  <div className="mb-2 px-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Notificacoes</p>
                    <p className={`text-[10px] ${vm.styles.subtext}`}>Falhas recorrentes e trave parada</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {vm.alertasCriticos.length === 0 ? (
                      <p className={`${vm.styles.subtext} text-xs px-2 py-3`}>Nenhum alerta critico no momento.</p>
                    ) : (
                      vm.alertasCriticos.map((a) => (
                        <button
                          key={`${a.setor}-${a.trave}`}
                          type="button"
                          onClick={() => vm.irParaTraveRecorrente(a.setor, a.trave)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            a.isTraveToda
                              ? 'bg-purple-600/15 border-purple-500/40 animate-pulse'
                              : 'bg-red-600/10 border-red-600/20 hover:bg-red-600/15'
                          }`}
                        >
                          <p className={`text-xs font-black uppercase ${a.isTraveToda ? 'text-purple-300' : 'text-red-600'}`}>
                            {a.setor} - Trave {a.trave}
                          </p>
                          <p className="text-[11px] opacity-80">
                            {a.isTraveToda ? 'TRAVE PARADA - acao imediata' : `${a.count} falhas acumuladas`}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className={`relative overflow-hidden px-3 py-2 rounded-xl border min-w-[108px] ${
              vm.theme === 'dark'
                ? 'border-red-500/30 bg-gradient-to-br from-red-600/20 to-transparent'
                : 'border-red-200 bg-gradient-to-br from-red-50 to-white'
            }`}>
              <span className="absolute top-1.5 right-2.5 h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <p className="text-[9px] font-black uppercase tracking-widest text-red-600">Ativas Hoje</p>
              <p className="text-base font-black animate-pulse">{vm.falhasAtivasHoje}</p>
            </div>
          </div>
        </header>

        <div className="mb-6 inline-flex rounded-2xl border p-1.5 gap-1.5 bg-black/5">
          <button
            type="button"
            onClick={() => vm.setAbaFalhas('abertas')}
            className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              vm.abaFalhas === 'abertas'
                ? 'bg-red-600 text-white'
                : vm.theme === 'dark'
                  ? 'text-white/70 hover:bg-white/10'
                  : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Visualizar falhas ({vm.falhasAtivasHoje})
          </button>
          <button
            type="button"
            onClick={() => vm.setAbaFalhas('inoperantes')}
            className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              vm.abaFalhas === 'inoperantes'
                ? 'bg-amber-500 text-white'
                : vm.theme === 'dark'
                  ? 'text-white/70 hover:bg-white/10'
                  : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Pontos inoperantes ({vm.falhasInoperantes.length})
          </button>
        </div>

        {vm.abaFalhas === 'abertas' ? (
          <FailureSectorBoard
            setors={vm.setors}
            falhasPorSetor={vm.falhasPorSetor}
            setorAberto={vm.setorAberto}
            setSetorAberto={vm.setSetorAberto}
            traveAberta={vm.traveAberta}
            setTraveAberta={vm.setTraveAberta}
            getTravesDoSetor={vm.getTravesDoSetor}
            getPontosDoSetor={vm.getPontosDoSetor}
            getTraveChamados={vm.getTraveChamados}
            getMesaTrabalhoTrave={vm.getMesaTrabalhoTrave}
            getMesaTrabalhoSetor={vm.getMesaTrabalhoSetor}
            getTotalFalhasSetor={vm.getTotalFalhasSetor}
            getTotalInoperantesSetor={vm.getTotalInoperantesSetor}
            getStatusTrave={vm.getStatusTrave}
            getDadosPonto={vm.getDadosPonto}
            abrirModalPonto={vm.abrirModalPonto}
            abrirModalLote={vm.abrirModalLote}
            isColaborador={vm.isColaborador}
            styles={vm.styles}
            theme={vm.theme}
          />
        ) : (
          <InoperantPointsBoard
            inoperantesPorSetor={vm.inoperantesPorSetor}
            theme={vm.theme}
            styles={vm.styles}
            isColaborador={vm.isColaborador}
            onReativar={vm.handleReativarInoperante}
            onFinalizar={vm.handleFinalizarInoperante}
            onEditar={vm.handleAtualizarInoperante}
            enviando={vm.enviando}
            formatDateTime={vm.formatDateTime}
          />
        )}
      </main>

      <CloseFailureModal
        theme={vm.theme}
        styles={vm.styles}
        modalData={vm.modalData}
        etapaFechamento={vm.etapaFechamento}
        setEtapaFechamento={vm.setEtapaFechamento}
        solucaoTexto={vm.solucaoTexto}
        setSolucaoTexto={vm.setSolucaoTexto}
        enviando={vm.enviando}
        isColaborador={vm.isColaborador}
        falhasSelecionadas={vm.falhasSelecionadas}
        toggleFalhaSelecionada={vm.toggleFalhaSelecionada}
        inoperantePresets={vm.inoperantePresets}
        novoPresetInoperante={vm.novoPresetInoperante}
        setNovoPresetInoperante={vm.setNovoPresetInoperante}
        addCustomInoperantePreset={vm.addCustomInoperantePreset}
        inoperanteSelecionadas={vm.inoperanteSelecionadas}
        toggleInoperanteSelecionada={vm.toggleInoperanteSelecionada}
        inoperanteDescricao={vm.inoperanteDescricao}
        setInoperanteDescricao={vm.setInoperanteDescricao}
        handleFinalizarChamado={vm.handleFinalizarChamado}
        handleMarcarInoperante={vm.handleMarcarInoperante}
        handleEnviarParaSiga={vm.handleEnviarParaSiga}
        fecharModal={vm.fecharModal}
        historicoPonto={vm.historicoPonto}
        historicoVisivel={vm.historicoVisivel}
        loadingHistoricoPonto={vm.loadingHistoricoPonto}
        formatDateTime={vm.formatDateTime}
        isMobileView={vm.isMobileView}
        mostrarHistoricoCompleto={vm.mostrarHistoricoCompleto}
        setMostrarHistoricoCompleto={vm.setMostrarHistoricoCompleto}
      />

      <SigaDeskOverlay
        open={vm.showSigaDesk}
        onClose={vm.closeSigaDesk}
        theme={vm.theme}
        styles={vm.styles}
        activeTab={vm.sigaTab}
        setActiveTab={vm.setSigaTab}
        aguardando={vm.sigaAguardando}
        finalizados={vm.sigaFinalizados}
        drafts={vm.sigaDrafts}
        updateDraft={vm.updateSigaDraft}
        saveSigaItem={vm.saveSigaItem}
        finalizeSigaItem={vm.finalizeSigaItem}
        submittingId={vm.sigaSubmittingId}
        savingId={vm.sigaSavingId}
        loading={vm.sigaLoading}
      />

      <AppBottomNav isAdmin={vm.isAdmin} />
    </div>
  );
}
