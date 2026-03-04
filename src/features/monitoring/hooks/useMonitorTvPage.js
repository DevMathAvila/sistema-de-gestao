import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildMonitorPanel, countCriticalStops, fetchOpenFailures } from '../services/monitorService';

export function useMonitorTvPage() {
  const [falhas, setFalhas] = useState([]);
  const [stats, setStats] = useState({ total: 0, criticas: 0 });

  const processarDados = useCallback(async () => {
    try {
      const listaAbertos = await fetchOpenFailures();
      setFalhas(listaAbertos);
      setStats({ total: listaAbertos.length, criticas: countCriticalStops(listaAbertos) });
    } catch {
      setFalhas([]);
      setStats({ total: 0, criticas: 0 });
    }
  }, []);

  useEffect(() => {
    processarDados();
    const interval = setInterval(processarDados, 5000);
    return () => clearInterval(interval);
  }, [processarDados]);

  const painel = useMemo(() => buildMonitorPanel(falhas), [falhas]);

  return { stats, painel };
}
