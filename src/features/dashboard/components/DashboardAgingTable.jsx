import React from 'react';

export default function DashboardAgingTable({ pendingAging, setorAgingResumo, expectedMaintenanceDays, s, theme }) {
  const topPending = pendingAging.slice(0, 12);
  const criticalSetor = setorAgingResumo[0];

  return (
    <div className={`${s.card} p-6 rounded-[2.5rem]`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-black uppercase italic text-red-600">Aging de Pendencias</h3>
          <p className={`text-[11px] ${s.sub}`}>
            SLA esperado: {expectedMaintenanceDays} dia ({(expectedMaintenanceDays * 24).toFixed(1)}h). Chamados acima do limite ficam destacados.
          </p>
        </div>
        {criticalSetor ? (
          <div className="rounded-2xl border border-red-600/30 bg-red-600/10 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Setor Critico</p>
            <p className="text-sm font-black">
              {criticalSetor.setor} - {criticalSetor.acimaSla}/{criticalSetor.pendentes} acima do SLA
            </p>
          </div>
        ) : null}
      </div>

      {topPending.length === 0 ? (
        <p className={`${s.sub} text-sm`}>Nenhuma pendencia aberta no periodo.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className={`${s.sub} text-[10px] uppercase tracking-widest border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                <th className="p-3">Run In</th>
                <th className="p-3">Trave</th>
                <th className="p-3">Ponto</th>
                <th className="p-3">Falha</th>
                <th className="p-3">Abertura</th>
                <th className="p-3">Tempo Aberto</th>
                <th className="p-3">SLA</th>
              </tr>
            </thead>
            <tbody>
              {topPending.map((item) => (
                <tr key={item.id} className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                  <td className="p-3 font-bold">{item.setor}</td>
                  <td className="p-3 font-mono">{item.trave}</td>
                  <td className="p-3 font-mono">{item.ponto}</td>
                  <td className="p-3 text-[11px]">{item.falha}</td>
                  <td className="p-3 text-[11px] font-mono">{item.openedLabel}</td>
                  <td className={`p-3 font-black ${item.aboveSla ? 'text-red-600' : ''}`}>{item.agingLabel}</td>
                  <td className="p-3">
                    {item.aboveSla ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-600 text-white animate-pulse">
                        Critico
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-500">
                        Dentro
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
