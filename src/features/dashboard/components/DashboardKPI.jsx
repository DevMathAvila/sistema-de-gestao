import React, { Suspense, useCallback, useMemo, useState } from 'react';
import Download from 'lucide-react/dist/esm/icons/download';
import LoaderCircle from 'lucide-react/dist/esm/icons/loader-circle';
import X from 'lucide-react/dist/esm/icons/x';
import DateRangePicker from '../../../shared/components/filters/DateRangePicker';
import DashboardHistoricalPoints from './DashboardHistoricalPoints';
import DashboardAgingTable from './DashboardAgingTable';
import { useDashboardKpi } from '../hooks/useDashboardKpi';
import { DASHBOARD_REPORT_PRESETS, DASHBOARD_REPORT_SECTIONS } from '../constants/reportSections';

const DashboardCharts = React.lazy(() => import('./DashboardCharts'));

const DASHBOARD_VIEWS = [
  { key: 'executivo', label: 'Executivo' },
  { key: 'operacao', label: 'Operacao' },
  { key: 'siga', label: 'SIGA' },
  { key: 'historico', label: 'Historico' },
];

function SectionCard({ title, s, children, className = '' }) {
  return (
    <div className={`${s.card} p-6 rounded-[2.5rem] ${className}`}>
      <h3 className="text-lg font-black uppercase italic text-red-600 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function DashboardKPI({ dataInicio, dataFim, setDataInicio, setDataFim, theme, s }) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [reportPreset, setReportPreset] = useState('weeklyFull');
  const [reportSections, setReportSections] = useState(DASHBOARD_REPORT_PRESETS.weeklyFull);
  const [activeView, setActiveView] = useState('executivo');
  const {
    totalGeral,
    totalPendentes,
    totalConcluidas,
    chamadosInseridosNoSistema,
    conversionRate,
    operationTypeDistribution,
    topCategory,
    porSetor,
    porStatus,
    top5,
    setorInsights,
    setorStatusResumo,
    executiveHighlight,
    pontosHistorico,
    tempoSemManutencao,
    atendimentoGeralResumo,
    inoperantesAbertosResumo,
    inoperantesConcluidosResumo,
    pontosStatusResumo,
    pendingAging,
    setorAgingResumo,
    sigaChamadosAbertos,
    sigaChamadosFinalizados,
    sigaTrackingRows,
    sigaResumo,
    expectedMaintenanceDays,
    generatedAt,
    loadingKpi,
    intervaloInvalido,
    datasetError,
  } = useDashboardKpi(dataInicio, dataFim);

  const periodoLabel = useMemo(
    () => (dataInicio || dataFim ? `${dataInicio || '...'} a ${dataFim || '...'}` : 'Todo o Periodo'),
    [dataInicio, dataFim]
  );

  const reportMetrics = useMemo(
    () => ({
      totalGeral,
      totalPendentes,
      totalConcluidas,
      chamadosInseridosNoSistema,
      conversionRate,
      operationTypeDistribution,
      topCategory,
      porSetor,
      porStatus,
      top5,
      setorInsights,
      setorStatusResumo,
      executiveHighlight,
      pontosHistorico,
      pontosStatusResumo,
      pendingAging,
      setorAgingResumo,
      sigaChamadosAbertos,
      sigaChamadosFinalizados,
      sigaTrackingRows,
      sigaResumo,
      atendimentoGeralResumo,
      inoperantesAbertosResumo,
      inoperantesConcluidosResumo,
      expectedMaintenanceDays,
      generatedAt,
      tempoSemManutencao,
    }),
    [
      expectedMaintenanceDays,
      generatedAt,
      pendingAging,
      operationTypeDistribution,
      pontosHistorico,
      pontosStatusResumo,
      porSetor,
      porStatus,
      setorAgingResumo,
      sigaChamadosAbertos,
      sigaChamadosFinalizados,
      sigaTrackingRows,
      sigaResumo,
      setorInsights,
      setorStatusResumo,
      executiveHighlight,
      tempoSemManutencao,
      atendimentoGeralResumo,
      inoperantesAbertosResumo,
      inoperantesConcluidosResumo,
      topCategory,
      top5,
      totalConcluidas,
      chamadosInseridosNoSistema,
      conversionRate,
      totalGeral,
      totalPendentes,
    ]
  );

  const hasAtLeastOneSection = useMemo(
    () => Object.values(reportSections).some(Boolean),
    [reportSections]
  );

  const sigaPie = useMemo(() => {
    const pendentes = Number(sigaResumo?.chamadosPendentes || 0);
    const fechados = Number(sigaResumo?.chamadosFechados || 0);
    const total = Math.max(pendentes + fechados, 1);
    const pendentesPct = (pendentes / total) * 100;
    return {
      pendentes,
      fechados,
      total: Number(sigaResumo?.chamadosAbertosTotais || 0),
      style: { background: `conic-gradient(#dc2626 0 ${pendentesPct}%, #16a34a ${pendentesPct}% 100%)` },
    };
  }, [sigaResumo]);

  const handleOpenExportModal = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const handleCloseExportModal = useCallback(() => {
    setIsExportModalOpen(false);
  }, []);

  const handleSelectPreset = useCallback((presetKey) => {
    if (!DASHBOARD_REPORT_PRESETS[presetKey]) return;
    setReportSections(DASHBOARD_REPORT_PRESETS[presetKey]);
    setReportPreset(presetKey);
  }, []);

  const handleToggleSection = useCallback((key) => {
    setReportPreset('custom');
    setReportSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const handleExportPdf = useCallback(() => {
    if (!hasAtLeastOneSection) return;
    if (reportPreset === 'weeklyExecutive') {
      import('../services/dashboardExecutivePdfService').then(({ exportDashboardExecutivePdf }) => {
        exportDashboardExecutivePdf({
          metrics: reportMetrics,
          periodoLabel,
        });
      });
    } else {
      import('../services/dashboardPdfReportService').then(({ exportDashboardKpiReportPdf }) => {
        exportDashboardKpiReportPdf({
          metrics: reportMetrics,
          periodoLabel,
          sections: reportSections,
          preset: reportPreset,
        });
      });
    }
    setIsExportModalOpen(false);
  }, [hasAtLeastOneSection, periodoLabel, reportMetrics, reportPreset, reportSections]);

  if (loadingKpi) {
    return (
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
        <div className={`${s.card} rounded-[2.5rem] flex items-center justify-center py-32`}>
          <LoaderCircle className="animate-spin text-red-600" size={48} />
        </div>
      </section>
    );
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">
            Dashboard <span className="text-red-600">KPI</span>
          </h2>
          <p className={s.sub}>Cockpit executivo de manutencao e performance operacional.</p>
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
            onClick={handleOpenExportModal}
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

      {datasetError && (
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4">
          {datasetError}
        </p>
      )}

      <div className={`${s.card} p-5 rounded-[2rem] mb-6 border border-red-600/15`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub}`}>Periodo: {periodoLabel}</p>
          <div className="flex flex-wrap gap-2">
            {DASHBOARD_VIEWS.map((view) => (
              <button
                key={view.key}
                type="button"
                onClick={() => setActiveView(view.key)}
                className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeView === view.key
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : theme === 'dark'
                      ? 'bg-white/5 border border-white/10'
                      : 'bg-slate-50 border border-slate-200'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className={`${s.card} p-6 rounded-[2rem] border-l-4 border-red-600`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-1`}>Total Geral</p>
          <p className="text-4xl font-black text-red-600 italic">{totalGeral}</p>
        </div>
        <div className={`${s.card} p-6 rounded-[2rem] border-l-4 border-amber-500`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-1`}>Pendentes</p>
          <p className="text-4xl font-black text-amber-500 italic">{totalPendentes}</p>
        </div>
        <div className={`${s.card} p-6 rounded-[2rem] border-l-4 border-emerald-500`}>
          <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-1`}>Concluidas</p>
          <p className="text-4xl font-black text-emerald-500 italic">{totalConcluidas}</p>
        </div>
      </div>

      {activeView === 'executivo' && (
        <div className="space-y-8">
          <Suspense
            fallback={(
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`${s.card} p-6 rounded-[2.5rem]`}><div className="h-80 animate-pulse rounded-2xl bg-red-600/5" /></div>
                <div className={`${s.card} p-6 rounded-[2.5rem]`}><div className="h-80 animate-pulse rounded-2xl bg-red-600/5" /></div>
              </div>
            )}
          >
            <DashboardCharts porSetor={porSetor} porStatus={porStatus} theme={theme} s={s} />
          </Suspense>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <SectionCard title="Ranking de Recorrencia (Top 5)" s={s} className="xl:col-span-3">
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
            </SectionCard>

            <SectionCard title="Insights por Setor" s={s} className="xl:col-span-2">
              <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-4`}>
                Tempo medio sem manutencao: {tempoSemManutencao?.label || '-'}
              </p>
              <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-4`}>
                Tempo medio de atendimento: {atendimentoGeralResumo?.mediaLabel || '-'} ({atendimentoGeralResumo?.totalChamados || 0} chamados)
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
            </SectionCard>
          </div>
        </div>
      )}

      {activeView === 'operacao' && (
        <div className="space-y-8">
          <DashboardAgingTable
            pendingAging={pendingAging}
            setorAgingResumo={setorAgingResumo}
            expectedMaintenanceDays={expectedMaintenanceDays}
            s={s}
            theme={theme}
          />

          <SectionCard title="Pontos Pendentes e Concluidos" s={s}>
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
          </SectionCard>

          <SectionCard title="Pontos Inoperantes" s={s}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-2`}>Inativos em aberto</p>
                {inoperantesAbertosResumo.length === 0 ? (
                  <p className={`${s.sub} text-sm`}>Nenhum ponto inoperante aberto no periodo.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead>
                        <tr className={`${s.sub} text-[10px] uppercase tracking-widest border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                          <th className="p-3">Setor</th>
                          <th className="p-3">Trave</th>
                          <th className="p-3">Ponto</th>
                          <th className="p-3">Inicio inativo</th>
                          <th className="p-3">Tempo inativo</th>
                          <th className="p-3">Motivo</th>
                          <th className="p-3">Apontado por</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inoperantesAbertosResumo.slice(0, 15).map((item) => (
                          <tr key={`inop-open-${item.id}`} className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                            <td className="p-3 font-bold">{item.setor}</td>
                            <td className="p-3 font-mono">{item.trave}</td>
                            <td className="p-3 font-mono">{item.ponto}</td>
                            <td className="p-3 font-mono">{item.inicioInativoLabel}</td>
                            <td className="p-3">{item.tempoInativoLabel}</td>
                            <td className="p-3">{item.motivo}</td>
                            <td className="p-3">{item.apontadoPor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-2`}>Inativos arrumados</p>
                {inoperantesConcluidosResumo.length === 0 ? (
                  <p className={`${s.sub} text-sm`}>Nenhum ponto inoperante concluido no periodo.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead>
                        <tr className={`${s.sub} text-[10px] uppercase tracking-widest border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                          <th className="p-3">Setor</th>
                          <th className="p-3">Trave</th>
                          <th className="p-3">Ponto</th>
                          <th className="p-3">Inicio inativo</th>
                          <th className="p-3">Conclusao</th>
                          <th className="p-3">Finalizado por</th>
                          <th className="p-3">O que foi feito</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inoperantesConcluidosResumo.slice(0, 15).map((item) => (
                          <tr key={`inop-done-${item.id}`} className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                            <td className="p-3 font-bold">{item.setor}</td>
                            <td className="p-3 font-mono">{item.trave}</td>
                            <td className="p-3 font-mono">{item.ponto}</td>
                            <td className="p-3 font-mono">{item.inicioInativoLabel}</td>
                            <td className="p-3 font-mono">{item.conclusaoInativoLabel}</td>
                            <td className="p-3">{item.finalizadoPor}</td>
                            <td className="p-3">{item.solucao}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {activeView === 'siga' && (
        <SectionCard title="Chamados Enviados para SIGA" s={s}>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-6">
            <div className={`rounded-3xl border p-5 ${theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-white'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-3`}>Status SIGA</p>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 rounded-full border border-white/10" style={sigaPie.style}>
                  <div className={`absolute inset-3 rounded-full flex items-center justify-center text-[11px] font-black ${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
                    {sigaPie.total}
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <p><span className="inline-block h-2 w-2 rounded-full bg-red-600 mr-2" />Pendentes: <strong>{sigaPie.pendentes}</strong></p>
                  <p><span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-2" />Fechados: <strong>{sigaPie.fechados}</strong></p>
                  <p className={`${s.sub}`}>Abertos totais: <strong>{sigaPie.total}</strong></p>
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border p-5 ${theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-white'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-1`}>Tempo de atendimento (somente finalizados)</p>
              <p className="text-2xl font-black text-red-600">{sigaResumo?.atendimentoTotalLabel || '-'}</p>
              <p className={`text-[11px] mt-3 ${s.sub}`}>Media por chamado: <strong>{sigaResumo?.atendimentoMedioLabel || '-'}</strong></p>
              <p className={`text-[11px] ${s.sub}`}>Pico do periodo: <strong>{sigaResumo?.atendimentoMaxLabel || '-'}</strong></p>
              <p className={`text-[11px] ${s.sub}`}>Em andamento agora: <strong>{sigaResumo?.chamadosEmAndamento || 0}</strong></p>
              <p className={`text-[10px] mt-1 ${s.sub}`}>Atualizacao automatica: a cada 1 minuto</p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-white'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-1`}>Chamados pendentes</p>
              <p className="text-3xl font-black text-amber-500">{sigaResumo?.chamadosPendentes || 0}</p>
            </div>

            <div className={`rounded-3xl border p-5 ${theme === 'dark' ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-white'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-1`}>Chamados fechados</p>
              <p className="text-3xl font-black text-emerald-500">{sigaResumo?.chamadosFechados || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-2`}>Pendentes (SIGA)</p>
              {sigaChamadosAbertos.length === 0 ? (
                <p className={`${s.sub} text-sm`}>Nenhum chamado pendente no periodo.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className={`${s.sub} text-[10px] uppercase tracking-widest border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                        <th className="p-3">Run In</th>
                        <th className="p-3">Trave</th>
                        <th className="p-3">Ponto</th>
                        <th className="p-3">Falha</th>
                        <th className="p-3">Enviado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sigaChamadosAbertos.map((item) => (
                        <tr key={item.id} className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                          <td className="p-3 font-bold">{item.setor}</td>
                          <td className="p-3 font-mono">{item.trave}</td>
                          <td className="p-3 font-mono">{item.ponto}</td>
                          <td className="p-3">{item.falha}</td>
                          <td className="p-3 font-mono">{item.enviadoEmLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-2`}>Finalizados (SIGA)</p>
              {sigaChamadosFinalizados.length === 0 ? (
                <p className={`${s.sub} text-sm`}>Nenhum chamado finalizado no periodo.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead>
                      <tr className={`${s.sub} text-[10px] uppercase tracking-widest border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                        <th className="p-3">Run In</th>
                        <th className="p-3">Trave</th>
                        <th className="p-3">Ponto</th>
                        <th className="p-3">Codigo SIGA</th>
                        <th className="p-3">Fechado em</th>
                        <th className="p-3">Atendimento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sigaChamadosFinalizados.map((item) => (
                        <tr key={item.id} className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                          <td className="p-3 font-bold">{item.setor}</td>
                          <td className="p-3 font-mono">{item.trave}</td>
                          <td className="p-3 font-mono">{item.ponto}</td>
                          <td className="p-3 font-mono">{item.codigoChamado}</td>
                          <td className="p-3 font-mono">{item.fechadoEmLabel}</td>
                          <td className="p-3">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-500">
                              {item.atendimentoLabel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      {activeView === 'historico' && (
        <div className="space-y-8">
          <DashboardHistoricalPoints points={pontosHistorico} theme={theme} s={s} />
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 z-[320]">
          <button
            type="button"
            onClick={handleCloseExportModal}
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            aria-label="Fechar configuracao de exportacao"
          />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 mx-auto w-full max-w-xl">
            <div className={`rounded-3xl border shadow-2xl ${theme === 'dark' ? 'bg-[#090909] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="p-5 border-b border-red-600/15 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Configurar Relatorio KPI</p>
                  <p className={`text-xs ${s.sub}`}>Escolha manualmente as secoes para este PDF.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseExportModal}
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors ${
                    theme === 'dark' ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                  aria-label="Fechar"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('daily')}
                    className={`h-9 px-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                      reportPreset === 'daily'
                        ? 'border-red-600/40 text-red-600 bg-red-600/10'
                        : theme === 'dark'
                          ? 'border-white/15 hover:bg-white/10'
                          : 'border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Diario enxuto
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('weeklyExecutive')}
                    className={`h-9 px-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                      reportPreset === 'weeklyExecutive'
                        ? 'border-red-600/40 text-red-600 bg-red-600/10'
                        : theme === 'dark'
                          ? 'border-white/15 hover:bg-white/10'
                          : 'border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Semanal executivo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('weeklyFull')}
                    className={`h-9 px-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                      reportPreset === 'weeklyFull'
                        ? 'border-red-600/40 text-red-600 bg-red-600/10'
                        : theme === 'dark'
                          ? 'border-white/15 hover:bg-white/10'
                          : 'border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Semanal completo
                  </button>
                </div>

                <div className="space-y-2">
                  {DASHBOARD_REPORT_SECTIONS.map((section) => (
                    <label
                      key={section.key}
                      className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${
                        theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-red-600"
                        checked={Boolean(reportSections[section.key])}
                        onChange={() => handleToggleSection(section.key)}
                      />
                      <span className="text-sm font-black">{section.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-5 pt-0 flex flex-col sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseExportModal}
                  className={`h-11 px-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                    theme === 'dark' ? 'border-white/15 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={!hasAtLeastOneSection}
                  className={`h-11 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                    hasAtLeastOneSection
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Gerar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default React.memo(DashboardKPI);
