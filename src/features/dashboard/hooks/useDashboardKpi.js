import { useEffect, useMemo, useState } from 'react';
import { computeDashboardMetrics, fetchDashboardDataset } from '../services/dashboardAnalyticsService';

export function useDashboardKpi(dataInicio, dataFim) {
  const [dataset, setDataset] = useState({
    kpiRows: [],
    concluidasRows: [],
    abertasRows: [],
  });
  const [loadingKpi, setLoadingKpi] = useState(false);
  const intervaloInvalido = Boolean(dataInicio && dataFim && dataInicio > dataFim);

  useEffect(() => {
    if (intervaloInvalido) {
      setDataset({ kpiRows: [], concluidasRows: [], abertasRows: [] });
      setLoadingKpi(false);
      return;
    }

    let cancelled = false;
    setLoadingKpi(true);

    fetchDashboardDataset(dataInicio || null, dataFim || null)
      .then((res) => {
        if (cancelled) return;
        if (res?.hasError) {
          setDataset({ kpiRows: [], concluidasRows: [], abertasRows: [] });
          return;
        }
        setDataset({
          kpiRows: Array.isArray(res?.kpiRows) ? res.kpiRows : [],
          concluidasRows: Array.isArray(res?.concluidasRows) ? res.concluidasRows : [],
          abertasRows: Array.isArray(res?.abertasRows) ? res.abertasRows : [],
        });
      })
      .catch(() => {
        if (!cancelled) {
          setDataset({ kpiRows: [], concluidasRows: [], abertasRows: [] });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingKpi(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataInicio, dataFim, intervaloInvalido]);

  const computed = useMemo(
    () => computeDashboardMetrics(dataset.kpiRows, dataset.concluidasRows, dataset.abertasRows),
    [dataset]
  );

  return {
    ...computed,
    loadingKpi,
    intervaloInvalido,
    rawDataset: dataset,
  };
}
