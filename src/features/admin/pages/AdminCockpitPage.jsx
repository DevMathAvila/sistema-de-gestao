import React from 'react';
import { Activity, AlertTriangle, Building2, TrendingDown, TrendingUp, UserCog } from 'lucide-react';
import { useAdminCockpit } from '../hooks/useAdminCockpit';

function MiniBars({ values }) {
  const max = Math.max(...values, 1);
  return (
    <div className="mt-4 flex h-16 items-end gap-1">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm bg-red-500/25">
          <div className="w-full rounded-sm bg-red-500/80" style={{ height: `${Math.max(8, (v / max) * 100)}%` }} title={`${i}h: ${v}`} />
        </div>
      ))}
    </div>
  );
}

export default function AdminCockpitPage() {
  const { user, loading, kpis, delta } = useAdminCockpit();
  const TrendIcon = delta <= 0 ? TrendingDown : TrendingUp;

  const cards = [
    {
      title: 'Falhas Ontem vs Hoje',
      value: `${kpis.totalOntem} | ${kpis.totalHoje}`,
      detail: `Ontem: ${kpis.totalOntem}  Hoje: ${kpis.totalHoje}`,
      icon: AlertTriangle,
      spark: kpis.trendHoje,
      footer: delta <= 0 ? 'Queda de ocorrencias' : 'Aumento de ocorrencias',
      trendIcon: TrendIcon,
    },
    {
      title: 'Setor mais critico',
      value: kpis.setorCritico,
      detail: 'Maior volume de falhas no dia',
      icon: Building2,
      spark: kpis.trendHoje,
      footer: 'Prioridade de intervencao',
      trendIcon: Activity,
    },
    {
      title: 'Tecnico com mais atendimentos',
      value: kpis.tecnicoTop,
      detail: 'Maior resolucao registrada hoje',
      icon: UserCog,
      spark: kpis.trendOntem,
      footer: 'Benchmark de produtividade',
      trendIcon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="glass-card grad-border p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">Admin Command Deck</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Bem-vindo, {user.username}</h1>
        <p className="mt-2 text-sm text-slate-300">Cockpit executivo com leitura instantanea da fabrica.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card, idx) => (
          <article key={card.title} className="floating-card glass-card grad-border lenovo-neon p-5" style={{ animationDelay: `${idx * 70}ms` }}>
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex rounded-xl bg-red-600/15 p-2 text-red-400">
                <card.icon size={18} />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-slate-300">
                <card.trendIcon size={12} /> Trend
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{card.title}</p>
            <h2 className="mt-2 text-2xl font-black text-white">{loading ? '...' : card.value}</h2>
            <p className="mt-1 text-xs text-slate-400">{card.detail}</p>
            <MiniBars values={card.spark} />
            <p className="mt-3 text-[11px] uppercase tracking-wide text-red-300">{card.footer}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
