import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PAGE_STYLE = {
  width: '794px',
  minHeight: '1123px',
};

const PIE_COLORS = ['#cf102d', '#111111', '#6b7280', '#ef4444', '#f59e0b', '#1f2937'];

function LenovoMark() {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-2xl border border-red-200 shadow-sm">
      <div className="bg-[#cf102d] px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white">
        Lenovo
      </div>
    </div>
  );
}

function PdfPage({ children }) {
  return (
    <section
      data-pdf-page="true"
      className="mx-auto mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 text-slate-900 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
      style={PAGE_STYLE}
    >
      {children}
    </section>
  );
}

function KpiCard({ label, value, accent = 'red', helper }) {
  const accentMap = {
    red: 'border-red-500 text-red-600',
    amber: 'border-amber-500 text-amber-500',
    black: 'border-slate-900 text-slate-900',
    gray: 'border-slate-400 text-slate-700',
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className={`mb-3 inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${accentMap[accent] || accentMap.red}`}>
        {label}
      </div>
      <p className="text-3xl font-black italic tracking-tight">{value}</p>
      {helper ? <p className="mt-2 text-[11px] font-medium text-slate-500">{helper}</p> : null}
    </div>
  );
}

function PriorityPill({ value }) {
  const classes = {
    Critica: 'bg-red-600 text-white',
    Alta: 'bg-amber-400 text-slate-900',
    Media: 'bg-slate-900 text-white',
    Normal: 'bg-slate-200 text-slate-700',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${classes[value] || classes.Normal}`}>
      {value}
    </span>
  );
}

function buildInoperantesCauseDistribution(rows) {
  const grouped = {};

  (rows || []).forEach((item) => {
    const cause = String(item?.motivo || item?.falha || 'Sem causa informada')
      .split('|')[0]
      .trim() || 'Sem causa informada';
    grouped[cause] = (grouped[cause] || 0) + 1;
  });

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
}

export default function DashboardExecutivePdfDocument({ metrics, periodoLabel }) {
  const conversionRate = Number(metrics?.conversionRate || 0);
  const statusSiga = `${metrics?.sigaResumo?.chamadosPendentes || 0} pendentes / ${metrics?.sigaResumo?.chamadosFechados || 0} concluidos`;
  const inoperantesAbertos = metrics?.inoperantesAbertosResumo || [];
  const inoperantesCauseDistribution = buildInoperantesCauseDistribution(inoperantesAbertos);

  return (
    <div className="fixed left-[-10000px] top-0 z-[-1] bg-slate-100 p-6">
      <PdfPage>
        <header className="mb-8 flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div className="max-w-[70%]">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-red-600">Relatorio Executivo</p>
            <h1 className="text-4xl font-black uppercase italic leading-none tracking-tight">
              Relatorio de Performance Operacional
            </h1>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-slate-700">
              Infraestrutura IT
            </h2>
            <p className="mt-4 text-sm font-medium text-slate-500">Periodo analisado: {periodoLabel}</p>
          </div>
          <LenovoMark />
        </header>

        <section className="mb-8 grid grid-cols-2 gap-4">
          <KpiCard
            label="Total de Atividades"
            value={metrics?.totalGeral || 0}
            accent="red"
            helper={`Periodo consolidado com ${metrics?.chamadosInseridosNoSistema || 0} chamados registrados`}
          />
          <KpiCard
            label="Taxa de Conversao"
            value={`${conversionRate.toFixed(1)}%`}
            accent="black"
            helper={`${metrics?.totalConcluidas || 0} resolvidos versus ${metrics?.totalPendentes || 0} pendentes`}
          />
          <KpiCard
            label="Top Categoria"
            value={metrics?.topCategory?.name || 'Sem categoria'}
            accent="gray"
            helper={`${metrics?.topCategory?.value || 0} ocorrencias no periodo`}
          />
          <KpiCard
            label="Status SIGA"
            value={statusSiga}
            accent="amber"
            helper="Acompanhamento consolidado do fluxo externo"
          />
        </section>

        <section className="grid grid-cols-[1.05fr_0.95fr] gap-5">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Distribuicao por Tipo de Operacao</p>
              <p className="text-sm font-semibold text-slate-700">Visao consolidada por categoria operacional</p>
            </div>
            <div className="flex h-[280px] items-center justify-center">
              <PieChart width={320} height={240}>
                <Pie
                  data={metrics?.operationTypeDistribution || []}
                  dataKey="value"
                  nameKey="name"
                  cx={160}
                  cy={120}
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={4}
                  isAnimationActive={false}
                >
                  {(metrics?.operationTypeDistribution || []).map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(metrics?.operationTypeDistribution || []).slice(0, 6).map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="text-[11px] font-semibold text-slate-700">{item.name}</span>
                  <span className="ml-auto text-[11px] font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Volume por Setor</p>
              <p className="text-sm font-semibold text-slate-700">Torres comparativas das maiores concentracoes</p>
            </div>
            <div className="flex h-[360px] items-center justify-center">
              <BarChart width={330} height={320} data={(metrics?.porSetor || []).slice(0, 6)} margin={{ top: 12, right: 12, left: -12, bottom: 24 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="total" radius={[10, 10, 0, 0]} fill="#cf102d" isAnimationActive={false} />
              </BarChart>
            </div>
          </div>
        </section>
      </PdfPage>

      <PdfPage>
        <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#111111,#2b2b2b)] p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.26em] text-red-300">Destaques Operacionais</p>
          <p className="max-w-4xl text-[24px] font-black italic leading-tight tracking-tight">
            {metrics?.executiveHighlight?.summary}
          </p>
          <div className="mt-6 grid grid-cols-5 gap-4">
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-300">Ponto Mais Critico</p>
              <div className="mt-2 space-y-1 leading-tight text-white">
                <p className="text-lg font-black">{metrics?.executiveHighlight?.criticalPoint?.setor || '-'}</p>
                <p className="text-lg font-black">Trave {metrics?.executiveHighlight?.criticalPoint?.trave || '-'}</p>
                <p className="text-lg font-black">Falhas {String(metrics?.executiveHighlight?.criticalPoint?.falhas || 0).padStart(2, '0')}</p>
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-300">Concluidas</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{metrics?.executiveHighlight?.resolvedCount || 0}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-300">Pendentes Restantes</p>
              <p className="mt-2 text-2xl font-black text-red-300">{metrics?.executiveHighlight?.remainingCount || 0}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-300">Traves Afetadas</p>
              <p className="mt-2 text-2xl font-black text-amber-300">{metrics?.executiveHighlight?.affectedBars || 0}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-300">Top Falha</p>
              <p className="mt-2 text-2xl font-black text-sky-200">{metrics?.executiveHighlight?.topFailure || '-'}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-[1.1fr_0.9fr] gap-5">
          <div className="space-y-5">
            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pontos Inoperantes</p>
                  <p className="mt-2 text-4xl font-black italic text-slate-900">{inoperantesAbertos.length}</p>
                  <p className="mt-2 max-w-[170px] text-[11px] font-medium text-slate-600">
                    Pontos inoperantes em aberto no fechamento do periodo.
                  </p>
                </div>
                <div className="flex h-[140px] w-[170px] items-center justify-center">
                  {inoperantesCauseDistribution.length > 0 ? (
                    <PieChart width={170} height={140}>
                      <Pie
                        data={inoperantesCauseDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx={85}
                        cy={70}
                        innerRadius={24}
                        outerRadius={44}
                        paddingAngle={3}
                        isAnimationActive={false}
                      >
                        {inoperantesCauseDistribution.map((entry, index) => (
                          <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  ) : (
                    <div className="text-center">
                      <p className="text-3xl font-black italic text-emerald-500">0</p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Sem inoperancia</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {inoperantesCauseDistribution.length > 0 ? inoperantesCauseDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="text-[10px] font-semibold text-slate-700">{item.name}</span>
                    <span className="ml-auto text-[10px] font-black text-slate-900">{item.value}</span>
                  </div>
                )) : (
                  <p className="text-[10px] font-medium text-slate-500">Nenhuma causa ativa de ponto inoperante no periodo.</p>
                )}
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Rastreabilidade SIGA</p>
                  <p className="text-sm font-semibold text-slate-700">Ultimos 3 chamados priorizados para acompanhamento executivo</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-[20px] border border-slate-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">ID</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Descricao Curta</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Status</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Prioridade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(metrics?.sigaTrackingRows || []).slice(0, 3).map((row) => (
                      <tr key={`${row.id}-${row.descricao}`} className="border-t border-slate-200">
                        <td className="px-4 py-3 text-[10px] font-black text-slate-900">{row.id}</td>
                        <td className="px-4 py-3 text-[11px] font-semibold text-slate-700">{row.descricao}</td>
                        <td className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">{row.statusAtual}</td>
                        <td className="px-4 py-3"><PriorityPill value={row.prioridade} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Conversao Operacional</p>
              <p className="mt-2 text-5xl font-black italic text-red-600">{conversionRate.toFixed(1)}%</p>
              <p className="mt-3 text-sm font-medium text-slate-600">
                Resolucao consolidada frente ao volume total de atividades do periodo.
              </p>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Top Setores com Pendencias</p>
              <div className="mt-4 space-y-3">
                {(metrics?.setorStatusResumo || []).slice(0, 4).map((item) => (
                  <div key={item.setor} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-900">{item.setor}</span>
                      <span className="text-[10px] font-black text-red-600">{item.pendentes} pend.</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500"
                        style={{ width: `${Math.max(8, (item.pendentes / Math.max(metrics?.setorStatusResumo?.[0]?.pendentes || 1, 1)) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-medium text-slate-500">{item.concluidas} concluidas no periodo</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </PdfPage>
    </div>
  );
}
