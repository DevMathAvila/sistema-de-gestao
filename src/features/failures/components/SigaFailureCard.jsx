import React from 'react';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Save from 'lucide-react/dist/esm/icons/save';
import SendHorizontal from 'lucide-react/dist/esm/icons/send-horizontal';

export default function SigaFailureCard({
  item,
  draft,
  onDraftChange,
  onSave,
  onFinalize,
  isSubmitting,
  isSaving,
  theme,
  isFinalizado = false,
}) {
  if (isFinalizado) {
    return (
      <article className={`rounded-3xl border p-4 ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Finalizado</p>
            <h4 className="font-black mt-1">{item.setor} - Trave {item.trave} - {item.ponto}</h4>
            <p className="text-xs mt-2 opacity-80">{item.falha}</p>
          </div>
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>
        <div className="mt-3 text-[11px] opacity-75 space-y-1">
          <p>Chamado SIGA: {item.siga_codigo_chamado || '-'}</p>
          <p>Dia abertura: {item.siga_data_abertura || '-'}</p>
          <p>Finalizado em: {item.siga_finalizado_em || item.resolvido_em || '-'}</p>
        </div>
      </article>
    );
  }

  return (
    <article className={`group rounded-3xl border border-red-600/25 p-4 transition-all ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-red-600/15 to-transparent'
        : 'bg-gradient-to-br from-red-50 to-white'
    }`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Aguardando SIGA</p>
        <h4 className="font-black mt-1">{item.setor} - Trave {item.trave} - {item.ponto}</h4>
        <p className="text-xs mt-2 opacity-80 line-clamp-2">{item.falha}</p>
        <p className="text-[10px] font-black uppercase opacity-60 mt-3">Hover para acao</p>
      </div>

      <div
        className={`mt-4 rounded-2xl border p-3 backdrop-blur-xl transition-all duration-300 md:max-h-0 md:opacity-0 md:overflow-hidden md:group-hover:max-h-96 md:group-hover:opacity-100 ${
          theme === 'dark' ? 'bg-black/45 border-white/15' : 'bg-white/75 border-slate-300/80'
        }`}
      >
        <div className="space-y-2">
          <label className="block">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Dia da Abertura</span>
            <input
              type="date"
              value={draft?.diaAbertura || ''}
              onChange={(e) => onDraftChange(item.id, 'diaAbertura', e.target.value)}
              className={`mt-1 w-full h-10 rounded-xl border px-3 text-sm ${
                theme === 'dark' ? 'bg-black/60 border-white/15 text-white' : 'bg-white/80 border-slate-300 text-slate-900'
              }`}
            />
          </label>
          <label className="block">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Codigo do Chamado</span>
            <input
              type="text"
              value={draft?.codigoChamado || ''}
              onChange={(e) => onDraftChange(item.id, 'codigoChamado', e.target.value)}
              placeholder="Ex: SIGA-2026-001"
              className={`mt-1 w-full h-10 rounded-xl border px-3 text-sm ${
                theme === 'dark' ? 'bg-black/60 border-white/15 text-white' : 'bg-white/80 border-slate-300 text-slate-900'
              }`}
            />
          </label>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSave(item)}
            disabled={isSaving || isSubmitting}
            className={`h-11 w-full rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 ${
              theme === 'dark'
                ? 'bg-white/10 border border-white/20 hover:bg-white/20 text-white'
                : 'bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <Save size={14} /> {isSaving ? 'SALVANDO...' : 'SALVAR'}
          </button>
          <button
            type="button"
            onClick={() => onFinalize(item)}
            disabled={isSubmitting || isSaving}
            className="h-11 w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <SendHorizontal size={14} /> {isSubmitting ? 'FINALIZANDO...' : 'FINALIZAR'}
          </button>
        </div>
      </div>
    </article>
  );
}
