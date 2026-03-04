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

function DashboardKPI({ dataInicio, dataFim, setDataInicio, setDataFim, theme, s }) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [reportPreset, setReportPreset] = useState('weeklyFull');
  const [reportSections, setReportSections] = useState(DASHBOARD_REPORT_PRESETS.weeklyFull);
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

  const periodoLabel = useMemo(
    () => (dataInicio || dataFim ? `${dataInicio || '...'} a ${dataFim || '...'}` : 'Todo o Periodo'),
    [dataInicio, dataFim]
  );

  const reportMetrics = useMemo(
    () => ({
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
    }),
    [
      expectedMaintenanceDays,
      generatedAt,
      pendingAging,
      pontosHistorico,
      pontosStatusResumo,
      porSetor,
      porStatus,
      setorAgingResumo,
      setorInsights,
      tempoSemManutencao,
      top5,
      totalConcluidas,
      totalGeral,
      totalPendentes,
    ]
  );

  const hasAtLeastOneSection = useMemo(
    () => Object.values(reportSections).some(Boolean),
    [reportSections]
  );

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
    import('../services/dashboardPdfReportService').then(({ exportDashboardKpiReportPdf }) => {
      exportDashboardKpiReportPdf({
        metrics: reportMetrics,
        periodoLabel,
        sections: reportSections,
        preset: reportPreset,
      });
    });
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

      <Suspense
        fallback={(
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className={`${s.card} p-6 rounded-[2.5rem]`}>
              <div className="h-80 animate-pulse rounded-2xl bg-red-600/5" />
            </div>
            <div className={`${s.card} p-6 rounded-[2.5rem]`}>
              <div className="h-80 animate-pulse rounded-2xl bg-red-600/5" />
            </div>
          </div>
        )}
      >
        <DashboardCharts porSetor={porSetor} porStatus={porStatus} theme={theme} s={s} />
      </Suspense>

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

      {isExportModalOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            onClick={handleCloseExportModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
