import React, { useState, useEffect, useMemo } from 'react';
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

const CORES_PIE = ['#dc2626', '#16a34a'];

function normalizeStatus(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function isConcludedRecord(item) {
  return normalizeStatus(item?.status).includes('conclu');
}

function isOpenRecord(item) {
  return normalizeStatus(item?.status).includes('aberto');
}

export default function DashboardKPI({ dataInicio, dataFim, setDataInicio, setDataFim, theme, s, api, Loader2 }) {
  const [kpiData, setKpiData] = useState([]);
  const [loadingKpi, setLoadingKpi] = useState(false);
  const intervaloInvalido = Boolean(dataInicio && dataFim && dataInicio > dataFim);

  useEffect(() => {
    if (intervaloInvalido) {
      setKpiData([]);
      setLoadingKpi(false);
      return;
    }
    let cancelled = false;
    setLoadingKpi(true);
    api
      .listarRegistrosParaKPI(dataInicio || null, dataFim || null)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setKpiData([]);
          return;
        }
        setKpiData(Array.isArray(data) ? data : []);
      })
      .catch(() => { if (!cancelled) setKpiData([]); })
      .finally(() => { if (!cancelled) setLoadingKpi(false); });
    return () => { cancelled = true; };
  }, [dataInicio, dataFim, api, intervaloInvalido]);

  const { totalGeral, totalPendentes, totalConcluidas, porSetor, porStatus, top5 } = useMemo(() => {
    const registros = Array.isArray(kpiData) ? kpiData : [];
    const totalGeral = registros.length;
    const totalPendentes = registros.filter((r) => isOpenRecord(r)).length;
    const totalConcluidas = registros.filter((r) => isConcludedRecord(r)).length;

    const setorCount = {};
    registros.forEach((r) => {
      const setor = r.setor || 'N/I';
      setorCount[setor] = (setorCount[setor] || 0) + 1;
    });
    const porSetor = Object.entries(setorCount).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);

    const porStatus = [
      { name: 'Pendentes', value: totalPendentes, fill: CORES_PIE[0] },
      { name: 'Concluídas', value: totalConcluidas, fill: CORES_PIE[1] },
    ].filter((d) => d.value > 0);

    const falhaCount = {};
    registros.forEach((r) => {
      const raw = (r.falha || '').trim();
      if (!raw) return;
      raw.split(/[,+]/).forEach((part) => {
        const key = part.trim();
        if (key) falhaCount[key] = (falhaCount[key] || 0) + 1;
      });
    });
    const top5 = Object.entries(falhaCount)
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return { totalGeral, totalPendentes, totalConcluidas, porSetor, porStatus, top5 };
  }, [kpiData]);

  const periodoLabel = dataInicio || dataFim ? `${dataInicio || '...'} a ${dataFim || '...'}` : 'Todo o Período';

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
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">
            Dashboard <span className="text-red-600">KPI</span>
          </h2>
          <p className={s.sub}>Indicadores de performance e análise de recorrência.</p>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">De</span>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className={`${s.input} px-4 py-2 rounded-2xl text-xs`}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">Até</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className={`${s.input} px-4 py-2 rounded-2xl text-xs`}
            />
          </div>
        </div>
      </header>

      {intervaloInvalido && (
        <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-4">
          Intervalo inválido: a data inicial deve ser menor ou igual à final.
        </p>
      )}

      <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-6`}>
        Período: {periodoLabel}
      </p>

      {/* 3 Cards de Resumo */}
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
          <p className={`text-[10px] font-black uppercase tracking-widest ${s.sub} mb-1`}>Total Concluídas</p>
          <p className="text-4xl font-black text-emerald-500 italic">{totalConcluidas}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Gráfico de Barras - Volume por Setor */}
        <div className={`${s.card} p-6 rounded-[2.5rem]`}>
          <h3 className="text-lg font-black uppercase italic text-red-600 mb-6">Volume por Setor</h3>
          <div className="h-80">
            {porSetor.length === 0 ? (
              <div className={`h-full flex items-center justify-center ${s.sub} text-sm`}>Sem dados no período</div>
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

        {/* Gráfico de Pizza - Status */}
        <div className={`${s.card} p-6 rounded-[2.5rem]`}>
          <h3 className="text-lg font-black uppercase italic text-red-600 mb-6">Status (aberto vs CONCLUÍDO)</h3>
          <div className="h-80">
            {porStatus.length === 0 ? (
              <div className={`h-full flex items-center justify-center ${s.sub} text-sm`}>Sem dados no período</div>
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

      {/* Top 5 - Ranking de Recorrência */}
      <div className={`${s.card} p-8 rounded-[2.5rem]`}>
        <h3 className="text-lg font-black uppercase italic text-red-600 mb-6">Ranking de Recorrência (Top 5)</h3>
        {top5.length === 0 ? (
          <p className={`${s.sub} text-sm`}>Nenhuma falha registrada no período.</p>
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
                    <div className="flex justify-between mb-1">
                      <span className="font-bold truncate">{item.nome}</span>
                      <span className="text-red-600 font-black text-sm">{item.total} ocorrências</span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <div
                        className="h-full bg-red-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

