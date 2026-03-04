import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Factory,
  Megaphone,
  Plus,
  ShieldAlert,
  Siren,
} from 'lucide-react';
import { useHomePage } from '../hooks/useHomePage';
import { getUrgencia } from '../services/homeService';

const urgenciaConfig = {
  critica: { icon: Siren, label: 'Critica', color: 'text-red-400' },
  alerta: { icon: ShieldAlert, label: 'Alerta', color: 'text-amber-300' },
  info: { icon: CircleAlert, label: 'Info', color: 'text-sky-300' },
};

export default function HomePage() {
  const {
    navigate,
    user,
    isMaster,
    avisos,
    loading,
    titulo,
    setTitulo,
    mensagem,
    setMensagem,
    saving,
    hoje,
    setores,
    isBlack,
    handleCriarAviso,
  } = useHomePage();

  return (
    <div className="space-y-8">
      <section className="glass-card grad-border relative p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">Mission Home</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-white md:text-4xl">Ola, {user.username}. Hoje e dia {hoje}.</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">Painel central de operacao e comunicacao da fabrica.</p>
      </section>

      <section className="glass-card grad-border p-6 md:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-red-500">
            <Megaphone size={18} />
            <h2 className="text-lg font-black uppercase tracking-wide">Feed de Comandos</h2>
          </div>
          <span className="rounded-full border border-red-500/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-300">Live</span>
        </div>

        {isMaster && (
          <form onSubmit={handleCriarAviso} className="mb-6 grid gap-3 rounded-2xl border border-white/15 bg-black/30 p-4 md:grid-cols-12">
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Titulo do aviso" className="md:col-span-3 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-red-500" />
            <input value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Mensagem" className="md:col-span-7 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-red-500" />
            <button type="submit" disabled={saving} className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-700 disabled:opacity-60">
              <Plus size={14} /> {saving ? 'Salvando' : 'Publicar'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-slate-300">Carregando avisos...</p>
        ) : avisos.length === 0 ? (
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-300">
            <AlertCircle size={16} className="text-red-500" />
            Nenhum aviso publicado.
          </div>
        ) : (
          <div className="space-y-3">
            {avisos.map((aviso, idx) => {
              const urgencia = urgenciaConfig[getUrgencia(aviso).kind] || urgenciaConfig.info;
              return (
                <article key={aviso.id} className="floating-card grid grid-cols-[74px_1fr] gap-3 rounded-2xl border border-white/15 bg-black/35 p-4" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex flex-col items-center justify-center rounded-xl border border-white/15 bg-black/45 p-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{aviso.createdAt ? new Date(aviso.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                    <span className="mt-1 text-[10px] font-semibold text-slate-500">{aviso.createdAt ? new Date(aviso.createdAt).toLocaleDateString('pt-BR') : '--/--'}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-black text-white">{aviso.titulo}</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${urgencia.color}`}>
                        <urgencia.icon size={12} /> {urgencia.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-200">{aviso.mensagem}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">Autor: {aviso.autor}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2 text-slate-200">
          <Factory size={16} className="text-red-500" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Acesso Rapido por Setor</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {setores.map((setor) => (
            <button
              key={setor}
              type="button"
              onClick={() => navigate('/registrar', { state: { setor } })}
              className={`floating-card grad-border relative flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-100 ${isBlack ? 'bg-white/[0.03]' : 'bg-black/35'}`}
            >
              <span>{setor}</span>
              <ArrowRight size={14} className="text-red-500" />
            </button>
          ))}
        </div>
      </section>

      <section className="glass-card p-4 text-sm text-slate-300">
        <div className="flex items-center gap-2 text-slate-200">
          <CalendarDays size={14} className="text-red-500" />
          Resumo operacional em {new Date().toLocaleDateString('pt-BR')}.
        </div>
      </section>
    </div>
  );
}
