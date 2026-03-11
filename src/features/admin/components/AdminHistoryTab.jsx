import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Loader2, Upload } from 'lucide-react';
import DateRangePicker from '../../../shared/components/filters/DateRangePicker';
import { SETOR_TODOS } from '../../../shared/constants/setores';
import { formatDateBr } from '../services/adminService';

function EmptyState({ s, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600 mb-4">
        <AlertTriangle size={32} className="animate-pulse" />
      </div>
      <h3 className="font-black uppercase italic text-xl mb-2">{title}</h3>
      <p className={`${s.sub} text-xs max-w-sm`}>{description}</p>
    </div>
  );
}

function HistoricoConcluidoTable({ theme, s, historico }) {
  return (
    <>
      <table className="hidden md:table w-full text-left">
        <thead>
          <tr className={`${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50'} text-[10px] font-black uppercase tracking-widest ${s.sub} border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
            <th className="p-4 md:p-5 text-red-600">Setor</th>
            <th className="p-4 md:p-5">Trave</th>
            <th className="p-4 md:p-5">Ponto</th>
            <th className="p-4 md:p-5">Tipo de Falha</th>
            <th className="p-4 md:p-5">Data de Conclusao</th>
            <th className="p-4 md:p-5">Quem Resolveu</th>
          </tr>
        </thead>
        <tbody className={`text-xs divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
          {historico.map((item) => (
            <tr key={item.id}>
              <td className="p-4 md:p-5 font-bold">{item.setor}</td>
              <td className="p-4 md:p-5 font-mono">{item.trave}</td>
              <td className="p-4 md:p-5 font-mono">{item.ponto}</td>
              <td className="p-4 md:p-5">
                <span className="inline-flex px-3 py-1 rounded-full bg-red-600/10 text-red-600 font-black text-[10px] uppercase tracking-widest">
                  {item.falha}
                </span>
              </td>
              <td className="p-4 md:p-5 font-mono opacity-80">{item.resolvido_em ? formatDateBr(item.resolvido_em) : '-'}</td>
              <td className="p-4 md:p-5 font-bold">{item.resolvido_por || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="md:hidden p-4 space-y-3">
        {historico.map((item) => (
          <div key={item.id} className={`${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'} border rounded-2xl p-4`}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-sm">{item.setor}</p>
              <span className="text-[10px] font-mono opacity-70">{item.resolvido_em ? formatDateBr(item.resolvido_em) : '-'}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <p><span className="opacity-50">Trave:</span> {item.trave}</p>
              <p><span className="opacity-50">Ponto:</span> {item.ponto}</p>
            </div>
            <p className="mt-3">
              <span className="inline-flex px-3 py-1 rounded-full bg-red-600/10 text-red-600 font-black text-[10px] uppercase tracking-widest">
                {item.falha}
              </span>
            </p>
            <p className="mt-3 text-[11px]">
              <span className="opacity-50">Quem resolveu:</span> <span className="font-bold">{item.resolvido_por || '-'}</span>
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function HistoricoAbertoTable({ theme, s, historicoAbertas }) {
  return (
    <>
      <table className="hidden md:table w-full text-left">
        <thead>
          <tr className={`${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50'} text-[10px] font-black uppercase tracking-widest ${s.sub} border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
            <th className="p-4 md:p-5 text-red-600">Setor</th>
            <th className="p-4 md:p-5">Trave</th>
            <th className="p-4 md:p-5">Ponto</th>
            <th className="p-4 md:p-5">Tipo de Falha</th>
            <th className="p-4 md:p-5">Dia</th>
            <th className="p-4 md:p-5">Solicitante</th>
          </tr>
        </thead>
        <tbody className={`text-xs divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
          {historicoAbertas.map((item) => (
            <tr key={item.id}>
              <td className="p-4 md:p-5 font-bold">{item.setor}</td>
              <td className="p-4 md:p-5 font-mono">{item.trave}</td>
              <td className="p-4 md:p-5 font-mono">{item.ponto}</td>
              <td className="p-4 md:p-5">
                <span className="inline-flex px-3 py-1 rounded-full bg-red-600/10 text-red-600 font-black text-[10px] uppercase tracking-widest">
                  {item.falha}
                </span>
              </td>
              <td className="p-4 md:p-5 font-mono opacity-80">{item.data ? formatDateBr(item.data) : '-'}</td>
              <td className="p-4 md:p-5 font-bold">{item.usuario || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="md:hidden p-4 space-y-3">
        {historicoAbertas.map((item) => (
          <div key={item.id} className={`${theme === 'dark' ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'} border rounded-2xl p-4`}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-sm">{item.setor}</p>
              <span className="text-[10px] font-mono opacity-70">{item.data ? formatDateBr(item.data) : '-'}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <p><span className="opacity-50">Trave:</span> {item.trave}</p>
              <p><span className="opacity-50">Ponto:</span> {item.ponto}</p>
            </div>
            <p className="mt-3">
              <span className="inline-flex px-3 py-1 rounded-full bg-red-600/10 text-red-600 font-black text-[10px] uppercase tracking-widest">
                {item.falha}
              </span>
            </p>
            <p className="mt-3 text-[11px]">
              <span className="opacity-50">Solicitante:</span> <span className="font-bold">{item.usuario || '-'}</span>
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

const ITEMS_PER_PAGE = 30;

function PaginationControls({ theme, currentPage, totalPages, onPageChange, totalItems }) {
  if (totalPages <= 1) return null;

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  const pages = [];
  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }

  return (
    <div className="px-6 py-5 md:px-8 flex flex-col gap-4 border-t border-slate-200 dark:border-white/10 md:flex-row md:items-center md:justify-between">
      <p className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
        Exibindo {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)}-{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`min-h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest ${
            currentPage === 1
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : theme === 'dark'
                ? 'bg-white/5 text-white hover:bg-white/10'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
          }`}
        >
          Anterior
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-h-10 min-w-10 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest ${
              page === currentPage
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : theme === 'dark'
                  ? 'bg-white/5 text-white hover:bg-white/10'
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`min-h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest ${
            currentPage === totalPages
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : theme === 'dark'
                ? 'bg-white/5 text-white hover:bg-white/10'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
          }`}
        >
          Proxima
        </button>
      </div>
    </div>
  );
}

export default function AdminHistoryTab({
  s,
  theme,
  dataInicio,
  dataFim,
  setDataInicio,
  setDataFim,
  historicoSetorFiltro,
  setHistoricoSetorFiltro,
  historicoSetores,
  intervaloInvalido,
  historicoSubAba,
  setHistoricoSubAba,
  historico,
  historicoAbertas,
  loadingHistorico,
  loadingHistoricoAbertas,
  importandoHistoricoConcluido,
  historyActionFeedback,
  onExportHistorico,
  onExportAbertas,
  onImportHistoricoConcluido,
}) {
  const fileInputRef = useRef(null);
  const [historicoPage, setHistoricoPage] = useState(1);
  const [historicoAbertasPage, setHistoricoAbertasPage] = useState(1);

  const historicoTotalPages = Math.max(1, Math.ceil(historico.length / ITEMS_PER_PAGE));
  const historicoAbertasTotalPages = Math.max(1, Math.ceil(historicoAbertas.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setHistoricoPage(1);
  }, [historicoSubAba, historicoSetorFiltro, dataInicio, dataFim, historico.length]);

  useEffect(() => {
    setHistoricoAbertasPage(1);
  }, [historicoSubAba, historicoSetorFiltro, dataInicio, dataFim, historicoAbertas.length]);

  const historicoPaginado = useMemo(() => {
    const start = (historicoPage - 1) * ITEMS_PER_PAGE;
    return historico.slice(start, start + ITEMS_PER_PAGE);
  }, [historico, historicoPage]);

  const historicoAbertasPaginado = useMemo(() => {
    const start = (historicoAbertasPage - 1) * ITEMS_PER_PAGE;
    return historicoAbertas.slice(start, start + ITEMS_PER_PAGE);
  }, [historicoAbertas, historicoAbertasPage]);

  const handlePickImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    await onImportHistoricoConcluido?.(file);
    event.target.value = '';
  };

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">
            Historico <span className="text-red-600">Geral</span>
          </h2>
          <p className={s.sub}>Visualize ocorrencias concluidas ou em aberto.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="min-w-[250px]">
            <DateRangePicker
              dataInicio={dataInicio}
              dataFim={dataFim}
              setDataInicio={setDataInicio}
              setDataFim={setDataFim}
              theme={theme}
              compact
            />
          </div>
          <select
            value={historicoSetorFiltro}
            onChange={(e) => setHistoricoSetorFiltro(e.target.value)}
            className={`${s.input} min-w-[220px] font-black text-[10px] p-4 rounded-2xl outline-none border-2 border-red-600/20 uppercase tracking-widest`}
          >
            {historicoSetores.map((setorNome) => (
              <option key={setorNome} value={setorNome}>
                {setorNome === SETOR_TODOS ? 'TODOS OS SETORES' : setorNome.toUpperCase()}
              </option>
            ))}
          </select>
          {intervaloInvalido && (
            <p className="text-[10px] font-black uppercase tracking-wider text-red-600">
              Intervalo invalido: a data inicial deve ser menor ou igual a final.
            </p>
          )}
          {historicoSubAba === 'concluidas' ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleImportFileChange}
              />
              <button
                type="button"
                onClick={handlePickImportFile}
                disabled={importandoHistoricoConcluido}
                className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest inline-flex items-center justify-center gap-2 ${
                  importandoHistoricoConcluido
                    ? 'bg-slate-200 text-slate-400 cursor-wait'
                    : 'bg-slate-900 text-white hover:bg-black shadow-lg'
                }`}
              >
                {importandoHistoricoConcluido ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Importar Concluidos
              </button>
              <button
                type="button"
                onClick={onExportHistorico}
                disabled={!historico.length}
                className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest ${
                  historico.length
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Exportar Excel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onExportAbertas}
              disabled={!historicoAbertas.length}
              className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest ${
                historicoAbertas.length
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Exportar Excel
            </button>
          )}
        </div>
      </header>

      {historicoSubAba === 'concluidas' && historyActionFeedback ? (
        <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
          historyActionFeedback.type === 'success'
            ? theme === 'dark'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : theme === 'dark'
              ? 'border-red-500/30 bg-red-500/10 text-red-200'
              : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {historyActionFeedback.message}
        </div>
      ) : null}

      <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 whitespace-nowrap">
        <div className="flex items-end overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setHistoricoSubAba('concluidas')}
            className={`px-6 py-3 rounded-t-2xl font-black text-[10px] uppercase tracking-widest border border-b-0 transition-all ${
              historicoSubAba === 'concluidas'
                ? 'bg-red-600 text-white border-red-600 shadow-lg'
                : `${s.sub} border-transparent hover:bg-slate-100 dark:hover:bg-white/5`
            }`}
          >
            Falhas Concluidas
          </button>
          <button
            type="button"
            onClick={() => setHistoricoSubAba('abertas')}
            className={`px-6 py-3 rounded-t-2xl font-black text-[10px] uppercase tracking-widest border border-b-0 transition-all ${
              historicoSubAba === 'abertas'
                ? 'bg-red-600 text-white border-red-600 shadow-lg'
                : `${s.sub} border-transparent hover:bg-slate-100 dark:hover:bg-white/5`
            }`}
          >
            Falhas em Aberto
          </button>
        </div>
        <div className={`mb-[1px] inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-t-2xl border border-b-0 px-4 py-2 text-[10px] font-black uppercase tracking-widest ${
          theme === 'dark' ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white text-slate-900'
        }`}>
          <span className="text-red-600">Total</span>
          <span>{historicoSubAba === 'concluidas' ? `${historico.length} falhas concluidas` : `${historicoAbertas.length} falhas em aberto`}</span>
        </div>
      </div>

      <div className={`${s.card} rounded-[2.5rem] overflow-hidden rounded-tl-none`}>
        {historicoSubAba === 'concluidas' && (
          <>
            {loadingHistorico ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-red-600" size={32} />
              </div>
            ) : historico.length === 0 ? (
              <EmptyState
                s={s}
                title="Nenhum registro encontrado"
                description="Ajuste o intervalo de datas ou aguarde novas ocorrencias concluidas."
              />
            ) : (
              <>
                <HistoricoConcluidoTable theme={theme} s={s} historico={historicoPaginado} />
                <PaginationControls
                  theme={theme}
                  currentPage={historicoPage}
                  totalPages={historicoTotalPages}
                  onPageChange={setHistoricoPage}
                  totalItems={historico.length}
                />
              </>
            )}
          </>
        )}

        {historicoSubAba === 'abertas' && (
          <>
            {loadingHistoricoAbertas ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-red-600" size={32} />
              </div>
            ) : historicoAbertas.length === 0 ? (
              <EmptyState
                s={s}
                title="Nenhum registro em aberto"
                description="Ajuste o intervalo de datas ou nao ha falhas abertas no periodo."
              />
            ) : (
              <>
                <HistoricoAbertoTable theme={theme} s={s} historicoAbertas={historicoAbertasPaginado} />
                <PaginationControls
                  theme={theme}
                  currentPage={historicoAbertasPage}
                  totalPages={historicoAbertasTotalPages}
                  onPageChange={setHistoricoAbertasPage}
                  totalItems={historicoAbertas.length}
                />
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
