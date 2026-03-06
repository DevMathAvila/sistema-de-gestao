import React from 'react';

export default function AdminStatsSection({ s, theme, setorFiltro, setSetorFiltro, listaSetores, falhasStats }) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Grafico <span className="text-red-600">Pareto</span></h2>
          <p className={s.sub}>Analise de recorrencia por componente.</p>
        </div>
        <select value={setorFiltro} onChange={(e) => setSetorFiltro(e.target.value)} className={`${s.input} font-black text-[10px] p-4 rounded-2xl outline-none border-2 border-red-600/20 uppercase tracking-widest`}>
          <option value="TODOS">TODOS OS SETORES</option>
          {listaSetores.map((setorNome) => (
            <option key={setorNome} value={setorNome}>{setorNome.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className={`${s.card} p-10 rounded-[3rem]`}>
        <div className="space-y-8">
          {falhasStats.map((item) => (
            <div key={item.nome} className="group">
              <div className="flex justify-between text-[11px] font-black mb-3 uppercase tracking-widest">
                <span className={s.sub}>{item.nome}</span>
                <span className="text-red-600 font-black">{item.total} Ocorrencias</span>
              </div>
              <div className={`w-full h-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} rounded-full overflow-hidden p-1`}>
                <div className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-1000 group-hover:brightness-110 shadow-lg shadow-red-600/20" style={{ width: `${(item.total / (falhasStats[0]?.total || 1)) * 100}%` }} />
              </div>
            </div>
          ))}
          {falhasStats.length === 0 && <div className="text-center py-10 italic opacity-50">Nenhum dado registrado para este filtro.</div>}
        </div>
      </div>
    </section>
  );
}
