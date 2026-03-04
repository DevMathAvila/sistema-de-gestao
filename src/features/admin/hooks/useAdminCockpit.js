import { useEffect, useMemo, useState } from 'react';
import { getSessionUser } from '../../../core/auth/session';
import { listarOcorrenciasConcluidas, listarRegistrosParaKPI } from '../../../core/api/supabaseSecure';

function isoDia(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function countByHour(rows, field = 'data') {
  const arr = Array.from({ length: 24 }, () => 0);
  (rows || []).forEach((r) => {
    const dt = new Date(r?.[field] || r?.data || r?.resolvido_em || '');
    if (!Number.isNaN(dt.getTime())) arr[dt.getHours()] += 1;
  });
  return arr;
}

export function useAdminCockpit() {
  const user = getSessionUser() || { username: 'Admin' };
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    totalHoje: 0,
    totalOntem: 0,
    setorCritico: '-',
    tecnicoTop: '-',
    trendHoje: Array.from({ length: 24 }, () => 0),
    trendOntem: Array.from({ length: 24 }, () => 0),
  });

  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      const hoje = isoDia(0);
      const ontem = isoDia(-1);

      const [resHoje, resOntem, concluidasHoje] = await Promise.all([
        listarRegistrosParaKPI(hoje, hoje),
        listarRegistrosParaKPI(ontem, ontem),
        listarOcorrenciasConcluidas(hoje, hoje),
      ]);

      const hojeRows = Array.isArray(resHoje?.data) ? resHoje.data : [];
      const ontemRows = Array.isArray(resOntem?.data) ? resOntem.data : [];
      const concluidasRows = Array.isArray(concluidasHoje?.data) ? concluidasHoje.data : [];

      const setorCount = {};
      hojeRows.forEach((r) => {
        const setor = r?.setor || 'Sem setor';
        setorCount[setor] = (setorCount[setor] || 0) + 1;
      });

      const tecnicoCount = {};
      concluidasRows.forEach((r) => {
        const tecnico = r?.resolvido_por || 'Nao informado';
        tecnicoCount[tecnico] = (tecnicoCount[tecnico] || 0) + 1;
      });

      setKpis({
        totalHoje: hojeRows.length,
        totalOntem: ontemRows.length,
        setorCritico: Object.entries(setorCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-',
        tecnicoTop: Object.entries(tecnicoCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-',
        trendHoje: countByHour(hojeRows, 'data'),
        trendOntem: countByHour(ontemRows, 'data'),
      });
      setLoading(false);
    };

    carregar();
  }, []);

  const delta = useMemo(() => kpis.totalHoje - kpis.totalOntem, [kpis.totalHoje, kpis.totalOntem]);

  return { user, loading, kpis, delta };
}
