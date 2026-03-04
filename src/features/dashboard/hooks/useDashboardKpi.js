import { useEffect, useMemo, useState } from 'react';
import { computeDashboardMetrics, fetchDashboardDataset } from '../services/dashboardAnalyticsService';

const DASHBOARD_DATASET_CACHE_TTL_MS = 5 * 60 * 1000;
const dashboardDatasetCache = new Map();
const dashboardDatasetInFlight = new Map();

function buildDatasetCacheKey(dataInicio, dataFim) {
  return `${dataInicio || 'null'}__${dataFim || 'null'}`;
}

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
    const cacheKey = buildDatasetCacheKey(dataInicio, dataFim);
    const cached = dashboardDatasetCache.get(cacheKey);
    const cacheIsValid = cached && Date.now() - cached.cachedAt < DASHBOARD_DATASET_CACHE_TTL_MS;

    if (cacheIsValid) {
      setDataset(cached.dataset);
      setLoadingKpi(false);
      return;
    }

    setLoadingKpi(true);

    const request =
      dashboardDatasetInFlight.get(cacheKey) ||
      fetchDashboardDataset(dataInicio || null, dataFim || null).finally(() => {
        dashboardDatasetInFlight.delete(cacheKey);
      });

    dashboardDatasetInFlight.set(cacheKey, request);

    request
      .then((res) => {
        if (cancelled) return;
        if (res?.hasError) {
          setDataset({ kpiRows: [], concluidasRows: [], abertasRows: [] });
          return;
        }
        const nextDataset = {
          kpiRows: Array.isArray(res?.kpiRows) ? res.kpiRows : [],
          concluidasRows: Array.isArray(res?.concluidasRows) ? res.concluidasRows : [],
          abertasRows: Array.isArray(res?.abertasRows) ? res.abertasRows : [],
        };
        dashboardDatasetCache.set(cacheKey, {
          dataset: nextDataset,
          cachedAt: Date.now(),
        });
        setDataset(nextDataset);
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
