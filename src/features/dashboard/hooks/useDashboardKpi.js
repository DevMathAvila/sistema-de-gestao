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
    inseridosRows: [],
  });
  const [loadingKpi, setLoadingKpi] = useState(false);
  const [datasetError, setDatasetError] = useState('');
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [datasetVersion, setDatasetVersion] = useState(() => localStorage.getItem('kpiDataVersion') || '0');
  const intervaloInvalido = Boolean(dataInicio && dataFim && dataInicio > dataFim);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onLocalRefresh = () => {
      setDatasetVersion(localStorage.getItem('kpiDataVersion') || String(Date.now()));
    };
    const onStorage = (event) => {
      if (event.key === 'kpiDataVersion') {
        setDatasetVersion(event.newValue || '0');
      }
    };
    window.addEventListener('kpi:refresh-requested', onLocalRefresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('kpi:refresh-requested', onLocalRefresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (intervaloInvalido) {
      setDataset({ kpiRows: [], concluidasRows: [], abertasRows: [], inseridosRows: [] });
      setDatasetError('');
      setLoadingKpi(false);
      return;
    }

    let cancelled = false;
    const cacheKey = buildDatasetCacheKey(dataInicio, dataFim) + `__${datasetVersion}`;
    const cached = dashboardDatasetCache.get(cacheKey);
    const cacheIsValid = cached && Date.now() - cached.cachedAt < DASHBOARD_DATASET_CACHE_TTL_MS;

    if (cacheIsValid) {
      setDataset(cached.dataset);
      setDatasetError(cached.datasetError || '');
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

        const errorMessages = [
          res?.errors?.kpi?.message,
          res?.errors?.concluidas?.message,
          res?.errors?.abertas?.message,
          res?.errors?.inseridos?.message,
        ].filter(Boolean);

        const nextError = errorMessages.length > 0
          ? `Falha parcial ao carregar KPI: ${errorMessages.join(' | ')}`
          : '';

        const nextDataset = {
          kpiRows: Array.isArray(res?.kpiRows) ? res.kpiRows : [],
          concluidasRows: Array.isArray(res?.concluidasRows) ? res.concluidasRows : [],
          abertasRows: Array.isArray(res?.abertasRows) ? res.abertasRows : [],
          inseridosRows: Array.isArray(res?.inseridosRows) ? res.inseridosRows : [],
        };
        dashboardDatasetCache.set(cacheKey, {
          dataset: nextDataset,
          cachedAt: Date.now(),
          datasetError: nextError,
        });
        setDataset(nextDataset);
        setDatasetError(nextError);
      })
      .catch(() => {
        if (!cancelled) {
          setDataset({ kpiRows: [], concluidasRows: [], abertasRows: [], inseridosRows: [] });
          setDatasetError('Falha total ao carregar KPI.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingKpi(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataInicio, dataFim, intervaloInvalido, datasetVersion]);

  const computed = useMemo(
    () => computeDashboardMetrics(dataset.kpiRows, dataset.concluidasRows, dataset.abertasRows, dataset.inseridosRows, new Date(nowTick)),
    [dataset, nowTick]
  );

  return {
    ...computed,
    loadingKpi,
    intervaloInvalido,
    datasetError,
    rawDataset: dataset,
  };
}
