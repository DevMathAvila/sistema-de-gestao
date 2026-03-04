import React, { useEffect, useMemo, useState } from 'react';
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import X from 'lucide-react/dist/esm/icons/x';

function formatDateLabel(value) {
  if (!value) return '--/--/----';
  const [y, m, d] = String(value).split('-');
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

export default function DateRangePicker({
  dataInicio,
  dataFim,
  setDataInicio,
  setDataFim,
  theme = 'dark',
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [draftInicio, setDraftInicio] = useState(dataInicio || '');
  const [draftFim, setDraftFim] = useState(dataFim || '');

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const apply = (evt) => setIsMobile(evt.matches);
    setIsMobile(media.matches);
    if (typeof media.addEventListener === 'function') media.addEventListener('change', apply);
    else media.addListener(apply);
    return () => {
      if (typeof media.removeEventListener === 'function') media.removeEventListener('change', apply);
      else media.removeListener(apply);
    };
  }, []);

  const labels = useMemo(() => ({
    inicio: formatDateLabel(dataInicio),
    fim: formatDateLabel(dataFim),
  }), [dataInicio, dataFim]);

  useEffect(() => {
    if (!open) {
      setDraftInicio(dataInicio || '');
      setDraftFim(dataFim || '');
    }
  }, [dataInicio, dataFim, open]);

  const openPicker = () => {
    setDraftInicio(dataInicio || '');
    setDraftFim(dataFim || '');
    setOpen(true);
  };

  const applyDraft = () => {
    setDataInicio(draftInicio || '');
    setDataFim(draftFim || '');
    setOpen(false);
  };

  const clearAll = () => {
    setDraftInicio('');
    setDraftFim('');
    setDataInicio('');
    setDataFim('');
    setOpen(false);
  };

  const onChangeField = (field, value) => {
    if (field === 'inicio') setDraftInicio(value);
    else setDraftFim(value);
  };

  const tileClass = `${theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl px-4 py-3 text-left transition-all hover:border-red-500/40 active:scale-[0.99]`;
  const popClass = `${theme === 'dark' ? 'bg-[#0A0A0A] border-white/10' : 'bg-white border-slate-200'} border shadow-2xl`;

  return (
    <div className="relative">
      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} gap-2`}>
        <button type="button" className={tileClass} onClick={openPicker}>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">De</p>
          <p className="text-xs font-black mt-1">{labels.inicio}</p>
        </button>
        <button type="button" className={tileClass} onClick={openPicker}>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Ate</p>
          <p className="text-xs font-black mt-1">{labels.fim}</p>
        </button>
      </div>

      {!isMobile && open && (
        <div className={`absolute right-0 mt-2 w-[340px] rounded-3xl p-4 z-30 ${popClass}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-red-600">
              <CalendarDays size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Filtro de Data</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-black uppercase opacity-60 mb-1">De</p>
              <input type="date" value={draftInicio} onChange={(e) => onChangeField('inicio', e.target.value)} className={tileClass} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase opacity-60 mb-1">Ate</p>
              <input type="date" value={draftFim} onChange={(e) => onChangeField('fim', e.target.value)} className={tileClass} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={clearAll} className="h-11 rounded-2xl border border-red-600/40 text-red-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Redefinir
              </button>
              <button type="button" onClick={applyDraft} className="h-11 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile && open && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm p-4 flex items-end">
          <div className={`w-full rounded-[2rem] p-5 ${popClass}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <CalendarDays size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Selecionar Periodo</span>
              </div>
              <button type="button" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className={tileClass}>
                <p className="text-[9px] font-black uppercase opacity-60">De</p>
                <input type="date" value={draftInicio} onChange={(e) => onChangeField('inicio', e.target.value)} className="mt-2 w-full bg-transparent text-sm font-black outline-none" />
              </div>
              <div className={tileClass}>
                <p className="text-[9px] font-black uppercase opacity-60">Ate</p>
                <input type="date" value={draftFim} onChange={(e) => onChangeField('fim', e.target.value)} className="mt-2 w-full bg-transparent text-sm font-black outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={clearAll} className="h-12 rounded-2xl border border-red-600/40 text-red-600 font-black text-[10px] uppercase tracking-widest">
                  Redefinir
                </button>
                <button type="button" onClick={applyDraft} className="h-12 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest">
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

