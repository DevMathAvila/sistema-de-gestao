import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import DateRangePicker from '../DateRangePicker';

export default function AdminHistorySection({
  s,
  theme,
  dataInicio,
  dataFim,
  setDataInicio,
  setDataFim,
  intervaloInvalido,
  historicoSubAba,
  setHistoricoSubAba,
  handleExportHistoricoExcel,
  handleExportAbertasExcel,
  historico,
  historicoAbertas,
  loadingHistorico,
  loadingHistoricoAbertas,
  formatarDataBR,
}) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">Historico <span className="text-red-600">Geral</span></h2>
          <p className={s.sub}>Visualize ocorrencias concluidas ou em aberto.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="min-w-[250px]">
            <DateRangePicker dataInicio={dataInicio} dataFim={dataFim} setDataInicio={setDataInicio} setDataFim={setDataFim} theme={theme} compact />
          </div>
          {intervaloInvalido && (
            <p className="text-[10px] font-black uppercase tracking-wider text-red-600">Intervalo invalido: a data inicial deve ser menor ou igual a final.</p>
          )}
          {historicoSubAba === 'concluidas' ? (
            <button type="button" onClick={handleExportHistoricoExcel} disabled={!historico.length} className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest ${historico.length ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              Exportar Excel
            </button>
          ) : (
            <button type="button" onClick={handleExportAbertasExcel} disabled={!historicoAbertas.length} className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest ${historicoAbertas.length ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              Exportar Excel
            </button>
          )}
        </div>
      </header>

      <div className="flex border-b border-slate-200 dark:border-white/10 mb-6 overflow-x-auto whitespace-nowrap no-scrollbar">
        <button type="button" onClick={() => setHistoricoSubAba('concluidas')} className={`px-6 py-3 rounded-t-2xl font-black text-[10px] uppercase tracking-widest border border-b-0 transition-all ${historicoSubAba === 'concluidas' ? 'bg-red-600 text-white border-red-600 shadow-lg' : `${s.sub} border-transparent hover:bg-slate-100 dark:hover:bg-white/5`}`}>
          Falhas Concluidas
        </button>
        <button type="button" onClick={() => setHistoricoSubAba('abertas')} className={`px-6 py-3 rounded-t-2xl font-black text-[10px] uppercase tracking-widest border border-b-0 transition-all ${historicoSubAba === 'abertas' ? 'bg-red-600 text-white border-red-600 shadow-lg' : `${s.sub} border-transparent hover:bg-slate-100 dark:hover:bg-white/5`}`}>
          Falhas em Aberto
        </button>
      </div>

      <div className={`${s.card} rounded-[2.5rem] overflow-hidden rounded-tl-none`}>
        {historicoSubAba === 'concluidas' ? (
          loadingHistorico ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-red-600" size={32} /></div>
          ) : historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600 mb-4"><AlertTriangle size={32} className="animate-pulse" /></div>
              <h3 className="font-black uppercase italic text-xl mb-2">Nenhum registro encontrado</h3>
              <p className={`${s.sub} text-xs max-w-sm`}>Ajuste o intervalo de datas ou aguarde novas ocorrencias concluidas.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className={`${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50'} text-[10px] font-black uppercase tracking-widest ${s.sub} border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                  <th className="p-4 md:p-5 text-red-600">Run In</th><th className="p-4 md:p-5">Trave</th><th className="p-4 md:p-5">Ponto</th><th className="p-4 md:p-5">Tipo de Falha</th><th className="p-4 md:p-5">Data de Conclusao</th><th className="p-4 md:p-5">Quem Resolveu</th>
                </tr>
              </thead>
              <tbody className={`text-xs divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                {historico.map((item) => (
                  <tr key={item.id}><td className="p-4 md:p-5 font-bold">{item.setor}</td><td className="p-4 md:p-5 font-mono">{item.trave}</td><td className="p-4 md:p-5 font-mono">{item.ponto}</td><td className="p-4 md:p-5"><span className="inline-flex px-3 py-1 rounded-full bg-red-600/10 text-red-600 font-black text-[10px] uppercase tracking-widest">{item.falha}</span></td><td className="p-4 md:p-5 font-mono opacity-80">{item.resolvido_em ? formatarDataBR(item.resolvido_em) : '-'}</td><td className="p-4 md:p-5 font-bold">{item.resolvido_por || '-'}</td></tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          loadingHistoricoAbertas ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-red-600" size={32} /></div>
          ) : historicoAbertas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600 mb-4"><AlertTriangle size={32} className="animate-pulse" /></div>
              <h3 className="font-black uppercase italic text-xl mb-2">Nenhum registro em aberto</h3>
              <p className={`${s.sub} text-xs max-w-sm`}>Ajuste o intervalo de datas ou nao ha falhas abertas no periodo.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className={`${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50'} text-[10px] font-black uppercase tracking-widest ${s.sub} border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                  <th className="p-4 md:p-5 text-red-600">Run In</th><th className="p-4 md:p-5">Trave</th><th className="p-4 md:p-5">Ponto</th><th className="p-4 md:p-5">Tipo de Falha</th><th className="p-4 md:p-5">Dia</th><th className="p-4 md:p-5">Solicitante</th>
                </tr>
              </thead>
              <tbody className={`text-xs divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                {historicoAbertas.map((item) => (
                  <tr key={item.id}><td className="p-4 md:p-5 font-bold">{item.setor}</td><td className="p-4 md:p-5 font-mono">{item.trave}</td><td className="p-4 md:p-5 font-mono">{item.ponto}</td><td className="p-4 md:p-5"><span className="inline-flex px-3 py-1 rounded-full bg-red-600/10 text-red-600 font-black text-[10px] uppercase tracking-widest">{item.falha}</span></td><td className="p-4 md:p-5 font-mono opacity-80">{item.data ? formatarDataBR(item.data) : '-'}</td><td className="p-4 md:p-5 font-bold">{item.usuario || '-'}</td></tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </section>
  );
}
