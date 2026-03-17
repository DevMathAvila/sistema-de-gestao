import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Clock3, History, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppBottomNav from '@/shared/components/layout/AppBottomNav';
import { getSessionUser, isAdminUser } from '@/core/auth/session';
import { usePersistentTheme } from '@/shared/hooks/usePersistentTheme';
import { NEWS_DATA } from '../constants/newsData';
import { TYPE_META, formatNewsDate, getArchiveNewsItems } from '../constants/newsMeta';
import LenovoNewsLogo from '../components/LenovoNewsLogo';
import NewsDetailModal from '../components/NewsDetailModal';
import { useNews } from '../hooks/useNews';

export default function NewsArchivePage() {
  const navigate = useNavigate();
  const user = getSessionUser() || { role: 'colaborador' };
  const isAdmin = isAdminUser(user);
  const { theme } = usePersistentTheme();
  const [selectedNews, setSelectedNews] = useState(null);
  const { markAsRead } = useNews(user.id);

  const archiveItems = useMemo(() => getArchiveNewsItems(NEWS_DATA), []);
  const registroIndexByVersion = useMemo(() => {
    const ascendingItems = [...NEWS_DATA].sort((left, right) => {
      const leftTime = new Date(`${left?.date || ''}T12:00:00`).getTime();
      const rightTime = new Date(`${right?.date || ''}T12:00:00`).getTime();
      return leftTime - rightTime;
    });

    return ascendingItems.reduce((acc, item, index) => {
      acc[item.version] = index + 1;
      return acc;
    }, {});
  }, []);
  const isDark = theme === 'dark';

  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#050505] text-white' : 'bg-[#f6f1eb] text-slate-900'} pb-24 md:pb-10`}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-10 md:py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={`inline-flex min-h-11 items-center gap-3 rounded-2xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.22em] transition-all ${isDark ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
          >
            <ArrowLeft size={16} />
            Voltar ao Dashboard
          </button>
          <div className={`hidden rounded-2xl border px-4 py-3 md:block ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-300 bg-white'}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-500">Arquivo Lenovo</p>
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Um painel dedicado para acompanhar a evolucao do sistema com clareza.</p>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[2.2rem] border border-red-500/20 bg-[radial-gradient(circle_at_top_left,rgba(226,35,26,0.18),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] p-5 sm:p-6 md:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(226,35,26,0.12)_96%),linear-gradient(90deg,transparent_95%,rgba(226,35,26,0.08)_96%)] bg-[size:20px_20px] opacity-30" />
          <div className="relative z-10">
            <LenovoNewsLogo />

            <div className="mt-6 grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
              <div className={`rounded-[1.8rem] border p-5 ${isDark ? 'border-white/10 bg-black/30' : 'border-slate-300 bg-white/90'}`}>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-red-500">Sobre este mural</p>
                <h1 className="mt-3 text-3xl font-black uppercase italic tracking-tighter sm:text-4xl md:text-5xl">
                  Todas as atualizacoes do sistema em ordem historica
                </h1>
                <p className={`mt-4 max-w-3xl text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Esta pagina funciona como um arquivo vivo do produto. Aqui ficam registradas todas as implementacoes cadastradas manualmente no sistema, da mais recente para a mais antiga, com contexto suficiente para consulta operacional, onboarding e historico de evolucao.
                </p>
              </div>

              <div className={`rounded-[1.8rem] border p-5 ${isDark ? 'border-white/10 bg-black/30' : 'border-slate-300 bg-white/90'}`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-1 flex h-10 w-10 items-center justify-center rounded-2xl ${isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'}`}>
                    <History size={18} />
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-red-500">Resumo rapido</p>
                    <p className="mt-2 text-2xl font-black">{archiveItems.length}</p>
                    <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>atualizacoes cadastradas no historico</p>
                  </div>
                </div>
                <div className={`mt-5 rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-[#f8fafc]'}`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">Por que este mural existe</p>
                  <p className={`mt-2 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Reunir em um unico lugar tudo o que foi evoluido no sistema, facilitando consulta, acompanhamento e contexto para toda a operacao.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-red-500">Arquivo completo</p>
              <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight sm:text-3xl">Das entregas mais recentes ate a origem do produto</h2>
            </div>
            <div className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] md:inline-flex ${isDark ? 'border-white/10 bg-white/[0.04] text-slate-200' : 'border-slate-300 bg-white text-slate-700'}`}>
              <Clock3 size={14} />
              Mais novas primeiro
            </div>
          </div>

          <div className="space-y-4">
            {archiveItems.map((item, index) => {
              const meta = TYPE_META[item.type] || TYPE_META.feature;
              const registroNumero = registroIndexByVersion[item.version] || index + 1;
              return (
                <article
                  key={item.version}
                  className={`group relative overflow-hidden rounded-[1.9rem] border transition-all ${isDark ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] hover:border-red-500/30' : 'border-slate-300 bg-white/95 hover:border-red-300 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]'}`}
                >
                  <div className={`absolute left-0 top-0 h-full w-1.5 ${meta.line}`} />
                  <div className="grid gap-0 md:grid-cols-[140px_1fr]">
                    <div className={`flex flex-col justify-between border-b p-5 md:border-b-0 md:border-r ${isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-[#fbf7f2]'}`}>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-500">Registro</p>
                        <p className="mt-3 text-3xl font-black italic">{String(registroNumero).padStart(2, '0')}</p>
                      </div>
                      <div className="mt-5">
                        <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Versao</p>
                        <p className="mt-1 text-lg font-black">v{item.version}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedNews(item)}
                      className="w-full p-5 text-left sm:p-6"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${meta.pill}`}>
                          {meta.label}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${isDark ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                          {formatNewsDate(item.date)}
                        </span>
                      </div>
                      <h3 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">{item.title}</h3>
                      <p className={`mt-3 max-w-4xl text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {item.summary}
                      </p>

                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-[#fafafa]'}`}>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">Previa</p>
                          <div className="mt-3 space-y-2">
                            {item.items.slice(0, 2).map((entry) => (
                              <div key={entry} className="flex items-start gap-2.5">
                                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                                <p className="text-sm">{entry}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={`rounded-2xl border p-4 ${isDark ? 'border-white/10 bg-[linear-gradient(135deg,rgba(226,35,26,0.12),rgba(255,255,255,0.02))]' : 'border-red-200 bg-[linear-gradient(135deg,rgba(254,242,242,1),rgba(255,255,255,1))]'}`}>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">Abrir topico</p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <ScrollText size={18} className="text-red-500" />
                              <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Ver descricao completa, contexto e impacto da entrega.</p>
                            </div>
                            <ChevronRight size={18} className="shrink-0 text-red-500 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <AppBottomNav isAdmin={isAdmin} theme={theme} />
      <NewsDetailModal newsItem={selectedNews} theme={theme} onClose={() => setSelectedNews(null)} />
    </div>
  );
}
