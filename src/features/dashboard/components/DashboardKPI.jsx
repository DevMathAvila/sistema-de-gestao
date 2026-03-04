import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import DateRangePicker from '../../../shared/components/filters/DateRangePicker';
import DashboardHistoricalPoints from './DashboardHistoricalPoints';
import DashboardAgingTable from './DashboardAgingTable';
import { useDashboardKpi } from '../hooks/useDashboardKpi';
import { exportDashboardKpiReportPdf } from '../services/dashboardPdfReportService';

export default function DashboardKPI({ dataInicio, dataFim, setDataInicio, setDataFim, theme, s }) {
  const {
    totalGeral,
    totalPendentes,
    totalConcluidas,
    porSetor,
    porStatus,
    top5,
    setorInsights,
    pontosHistorico,
    tempoSemManutencao,
    pontosStatusResumo,
    pendingAging,
    setorAgingResumo,
    expectedMaintenanceDays,
    generatedAt,
    loadingKpi,
    intervaloInvalido,
  } = useDashboardKpi(dataInicio, dataFim);

  const periodoLabel = dataInicio || dataFim ? `${dataInicio || '...'} a ${dataFim || '...'}` : 'Todo o Periodo';

  if (loadingKpi) {
    return (
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
        <div className={`${s.card} rounded-[2.5rem] flex items-center justify-center py-32`}>
          <Loader2 className="animate-spin text-red-600" size={48} />
        </div>
      </section>
    );
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">
            Dashboard <span className="text-red-600">KPI</span>
          </h2>
          <p className={s.sub}>Indicadores executivos para analise de falhas e manutencao.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker
            dataInicio={dataInicio}
            dataFim={dataFim}
            setDataInicio={setDataInicio}
            setDataFim={setDataFim}
            theme={theme}
            compact
          />
          <button
            type="button"
            onClick={() =>
              exportDashboardKpiReportPdf({
                metrics: {
                  totalGeral,
                  totalPendentes,
                  totalConcluidas,
                  porSetor,
                  porStatus,
                  top5,
                  setorInsights,
                  pontosHistorico,
                  pontosStatusResumo,
                  pendingAging,
                  setorAgingResumo,
                  expectedMaintenanceDays,
                  generatedAt,
                  tempoSemManutencao,
                },
                periodoLabel,
              })
            }
            className="h-11 px-4 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 justify-center"
          >
            <Download size={14} /> Exportar PDF
          </button>
        </div>
      </header>

      {intervaloInvalido && (
        <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-4">
          Intervalo invalido: a data inicial deve ser menor ou igual a final.
        </p>
      )}

      <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-6`}>Periodo: {periodoLabel}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className={`${s.card} p-6 rounded-[2rem] border-l-4 border-red-600`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-1`}>Total Geral de Falhas</p>
          <p className="text-4xl font-black text-red-600 italic">{totalGeral}</p>
        </div>
        <div className={`${s.card} p-6 rounded-[2rem] border-l-4 border-amber-500`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-1`}>Total Pendentes</p>
          <p className="text-4xl font-black text-amber-500 italic">{totalPendentes}</p>
        </div>
        <div className={`${s.card} p-6 rounded-[2rem] border-l-4 border-emerald-500`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-1`}>Total Concluidas</p>
          <p className="text-4xl font-black text-emerald-500 italic">{totalConcluidas}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className={`${s.card} p-6 rounded-[2.5rem]`}>
          <h3 className="text-lg font-black uppercase italic text-red-600 mb-6">Volume por Setor</h3>
          <div className="h-80">
            {porSetor.length === 0 ? (
              <div className={`h-full flex items-center justify-center ${s.sub} text-sm`}>Sem dados no periodo</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porSetor} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                      border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: theme === 'dark' ? '#fff' : '#0f172a' }}
                  />
                  <Bar dataKey="total" fill="#dc2626" radius={[4, 4, 0, 0]} name="Falhas" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={`${s.card} p-6 rounded-[2.5rem]`}>
          <h3 className="text-lg font-black uppercase italic text-red-600 mb-6">Status (aberto vs concluido)</h3>
          <div className="h-80">
            {porStatus.length === 0 ? (
              <div className={`h-full flex items-center justify-center ${s.sub} text-sm`}>Sem dados no periodo</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={porStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {porStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                      border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-10">
        <div className={`${s.card} p-8 rounded-[2.5rem] xl:col-span-3`}>
          <h3 className="text-lg font-black uppercase italic text-red-600 mb-6">Ranking de Recorrencia (Top 5)</h3>
          {top5.length === 0 ? (
            <p className={`${s.sub} text-sm`}>Nenhuma falha registrada no periodo.</p>
          ) : (
            <div className="space-y-4">
              {top5.map((item, idx) => {
                const maxTotal = Math.max(...top5.map((x) => x.total || 0), 1);
                const pctBruto = (item.total / maxTotal) * 100;
                const pct = Number.isFinite(pctBruto) ? Math.max(0, Math.min(100, pctBruto)) : 0;
                return (
                  <div key={item.nome} className="flex items-center gap-4">
                    <span className={`w-6 text-center font-black text-[10px] ${s.sub}`}>#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1 gap-3">
                        <span className="font-bold truncate">{item.nome}</span>
                        <span className="text-red-600 font-black text-sm whitespace-nowrap">{item.total} ocorrencias</span>
                      </div>
                      <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <div className="h-full bg-red-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`${s.card} p-6 rounded-[2.5rem] xl:col-span-2`}>
          <h3 className="text-lg font-black uppercase italic text-red-600 mb-4">Insights por Setor</h3>
          <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-4`}>
            Tempo medio sem manutencao: {tempoSemManutencao?.label || '-'}
          </p>
          {setorInsights.length === 0 ? (
            <p className={`${s.sub} text-sm`}>Sem dados de setor para o periodo atual.</p>
          ) : (
            <div className="space-y-3">
              {setorInsights.map((setor) => (
                <div key={setor.setor} className="rounded-2xl border border-red-600/15 p-3.5">
                  <p className="text-[12px] font-black text-red-600 uppercase tracking-wide">{setor.setor}</p>
                  <p className={`text-[11px] mt-2 ${s.sub}`}>
                    {setor.topFalhas.map((item) => `${item.falha} (${item.total})`).join(' | ') || 'Sem falhas mapeadas'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-10">
        <DashboardAgingTable
          pendingAging={pendingAging}
          setorAgingResumo={setorAgingResumo}
          expectedMaintenanceDays={expectedMaintenanceDays}
          s={s}
          theme={theme}
        />
      </div>

      <div className="mb-10">
        <DashboardHistoricalPoints points={pontosHistorico} theme={theme} s={s} />
      </div>

      <div className={`${s.card} p-6 rounded-[2.5rem]`}>
        <h3 className="text-lg font-black uppercase italic text-red-600 mb-4">Pontos Pendentes e Concluidos</h3>
        {pontosStatusResumo.length === 0 ? (
          <p className={`${s.sub} text-sm`}>Sem dados por ponto no periodo.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className={`${s.sub} text-[10px] uppercase tracking-widest border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                  <th className="p-3">Run In</th>
                  <th className="p-3">Trave</th>
                  <th className="p-3">Ponto</th>
                  <th className="p-3">Pendentes</th>
                  <th className="p-3">Concluidas</th>
                </tr>
              </thead>
              <tbody>
                {pontosStatusResumo.map((item) => (
                  <tr key={`${item.setor}-${item.trave}-${item.ponto}`} className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                    <td className="p-3 font-bold">{item.setor}</td>
                    <td className="p-3 font-mono">{item.trave}</td>
                    <td className="p-3 font-mono">{item.ponto}</td>
                    <td className="p-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-500">{item.pendentes}</span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-500">{item.concluidas}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
