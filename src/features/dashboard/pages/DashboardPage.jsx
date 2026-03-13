import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Eye, HardDrive, LogOut, Menu, Moon, Settings, Shield, Sparkles, Sun, User, X } from 'lucide-react';
import AppBottomNav from '@/shared/components/layout/AppBottomNav';
import { NEWS_DATA } from '@/features/news/constants/newsData';
import { useNews } from '@/features/news/hooks/useNews';
import { useDashboardPage } from '@/features/dashboard/hooks/useDashboardPage';

const navItems = [
  { id: 'abrir', label: 'Abrir chamado', path: '/abrir-chamado', icon: HardDrive },
  { id: 'visualizar', label: 'Visualizar Falhas', path: '/visualizar', icon: Eye },
  { id: 'admin', label: 'Administracao', path: '/admin?tab=indicadores', icon: Settings, helper: 'Dashboard KPI | Gestao de equipe', adminOnly: true },
  { id: 'senha', label: 'Seguranca', path: '/alterar-senha', icon: Shield },
];

const TYPE_META = {
  feature: {
    label: 'Feature',
    line: 'bg-[#E2231A]',
    pill: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  improvement: {
    label: 'Melhoria',
    line: 'bg-emerald-500',
    pill: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  fix: {
    label: 'Correcao',
    line: 'bg-amber-500',
    pill: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  security: {
    label: 'Seguranca',
    line: 'bg-red-600',
    pill: 'bg-red-600/10 text-red-600 border-red-600/20',
  },
};

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default function DashboardPage() {
  const vm = useDashboardPage();
  const { hasUnread, markAsRead } = useNews(vm.user.id);
  const [selectedNews, setSelectedNews] = useState(null);
  const visibleNav = navItems.filter((item) => !item.adminOnly || vm.isAdmin);
  const newsItems = useMemo(() => NEWS_DATA.slice(0, 2), []);

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

      <aside className={`hidden md:flex w-60 border-r ${vm.styles.sidebar} p-4 flex-col z-20 transition-all duration-300`}>
        <div className="mb-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl text-white">L</div>
            <div><h1 className="text-xl font-black tracking-tighter italic leading-none">LENOVO</h1><span className="text-[8px] font-bold tracking-[0.2em] text-red-600 uppercase">Welcome Hub</span></div>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {visibleNav.map((item) => (
            <button key={item.id} type="button" onClick={() => vm.navigate(item.path)} className={`w-full flex items-center gap-3 p-4 ${vm.styles.subtext} hover:text-red-600 rounded-2xl font-black text-[10px] tracking-widest uppercase text-left`}>
              <item.icon size={18} />
              <span className="leading-tight">
                <span className="block">{item.label}</span>
                {item.helper && <span className="block text-[8px] tracking-wide normal-case opacity-60">{item.helper}</span>}
              </span>
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

      <main className="z-10 flex-1 overflow-y-auto p-4 pb-24 sm:p-6 md:p-10 md:pb-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-red-600/20 bg-gradient-to-br from-red-600/10 via-transparent to-transparent p-5 sm:p-6 md:rounded-[2.5rem] md:p-10">
          <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-500">Bem-vindo ao Centro Lenovo</p>
                <h2 className="mt-3 text-3xl font-black uppercase italic tracking-tighter leading-none sm:text-4xl md:text-6xl">
                  Ambiente principal de <span className="text-red-600">operacao</span>
                </h2>
                <p className={`mt-4 max-w-2xl text-sm md:text-base ${vm.styles.subtext}`}>
                  Acompanhe as ultimas entregas do sistema e acesse rapido os fluxos operacionais mais importantes logo apos o login.
                </p>
              </div>
              <div className={`w-full rounded-[1.5rem] border px-4 py-4 sm:w-auto sm:rounded-[2rem] sm:px-5 ${vm.theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white/80'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${vm.styles.subtext}`}>Usuario</p>
                <p className="mt-2 text-xl font-black italic">{vm.user.username}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={() => vm.navigate('/abrir-chamado')} className="min-h-11 w-full rounded-2xl bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-red-700 sm:w-auto">
                Abrir chamado
              </button>
              <button type="button" onClick={() => vm.navigate('/visualizar')} className={`min-h-11 w-full rounded-2xl border px-6 py-3 text-xs font-black uppercase tracking-widest sm:w-auto ${vm.theme === 'dark' ? 'border-white/15 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-100'}`}>
                Visualizar falhas
              </button>
            </div>

            <section id="lenovo-news-section" className={`rounded-[1.75rem] border p-4 sm:p-5 md:rounded-[2.2rem] md:p-8 ${vm.theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-white/85'}`}>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-600/25 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500">
                  <Sparkles size={12} /> Lenovo News
                </div>
                <h3 className="mt-4 max-w-4xl text-2xl font-black uppercase italic tracking-tighter sm:text-3xl md:text-5xl">Acompanhe as ultimas atualizacoes do sistema</h3>
              </div>

              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
                {newsItems.map((item, index) => {
                  const meta = TYPE_META[item.type] || TYPE_META.feature;
                  return (
                    <article key={item.version} className={`mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border ${vm.theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white shadow-xl shadow-slate-200/20'}`}>
                      <div className={`h-1.5 w-full ${meta.line}`} />
                      <div className="flex h-full flex-col p-4 sm:p-5 md:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {index === 0 && (
                            <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                              Mais recente
                            </span>
                          )}
                          {index === 0 && hasUnread && (
                            <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900 animate-pulse">
                              New
                            </span>
                          )}
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${meta.pill}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className={`mt-4 text-sm font-black ${vm.styles.subtext}`}>v{item.version} · {formatDate(item.date)}</p>
                        <h4 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">{item.title}</h4>
                        <p className={`mt-3 text-sm leading-6 ${vm.styles.subtext}`}>{item.summary}</p>
                        <div className="mt-5 space-y-2.5">
                          {item.items.slice(0, 3).map((entry) => (
                            <div key={entry} className="flex items-start gap-3">
                              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                                <Check size={14} />
                              </span>
                              <p className="text-sm">{entry}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (index === 0) markAsRead();
                            setSelectedNews(item);
                          }}
                          className="mt-6 min-h-11 self-start text-left text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400"
                        >
                          Ler mais -&gt;
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </main>

      <AppBottomNav isAdmin={vm.isAdmin} />

      {selectedNews && (
        <div className="fixed inset-0 z-[9996] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedNews(null)}
            aria-label="Fechar detalhes da novidade"
          />
          <div className={`relative h-auto max-h-[85vh] w-[calc(100vw-32px)] max-w-4xl overflow-y-auto rounded-[2rem] border p-5 shadow-[0_30px_90px_rgba(15,23,42,0.35)] sm:p-6 md:p-8 ${vm.theme === 'dark' ? 'border-white/10 bg-[#080808] text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
            <button
              type="button"
              onClick={() => setSelectedNews(null)}
              className={`absolute right-4 top-4 min-h-11 min-w-11 rounded-xl p-2 ${vm.theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
            >
              <X size={16} />
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">v{selectedNews.version}</span>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${(TYPE_META[selectedNews.type] || TYPE_META.feature).pill}`}>
                {(TYPE_META[selectedNews.type] || TYPE_META.feature).label}
              </span>
            </div>
            <h3 className="mt-5 pr-12 text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">{selectedNews.title}</h3>
            <div className={`mt-5 rounded-2xl border p-4 ${vm.theme === 'dark' ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-slate-50'}`}>
              <p className="text-sm leading-6">{selectedNews.summary}</p>
            </div>
            <div className={`prose mt-6 max-w-none ${vm.theme === 'dark' ? 'prose-invert' : ''}`}>
              <ReactMarkdown>{selectedNews.details}</ReactMarkdown>
            </div>
            <div className="mt-6 space-y-3">
              {selectedNews.items.map((entry) => (
                <div key={entry} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check size={14} />
                  </span>
                  <p className="text-sm">{entry}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
