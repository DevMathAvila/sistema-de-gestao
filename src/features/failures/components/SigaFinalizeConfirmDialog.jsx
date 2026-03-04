import React from 'react';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import X from 'lucide-react/dist/esm/icons/x';

export default function SigaFinalizeConfirmDialog({
  open,
  theme,
  item,
  loading,
  onCancel,
  onConfirm,
}) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[280]">
      <button
        type="button"
        onClick={onCancel}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Fechar confirmacao"
      />

      <div className="relative h-full w-full p-4 flex items-center justify-center">
        <div className={`w-full max-w-lg rounded-3xl border shadow-2xl ${
          theme === 'dark'
            ? 'bg-[#0b0b0b]/95 border-white/15'
            : 'bg-white/95 border-slate-200'
        }`}>
          <div className="p-5 md:p-6 border-b border-red-600/20 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-red-600/15 text-red-600 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-black uppercase tracking-wide text-red-600">Confirmar Finalizacao</h4>
                <p className="text-xs opacity-75 mt-1">
                  Essa acao conclui a falha no sistema e move o chamado para finalizados.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center ${
                theme === 'dark' ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-slate-50'
              }`}
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-5 md:p-6">
            <div className={`rounded-2xl border p-4 ${
              theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
            }`}>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Chamado</p>
              <p className="font-black mt-1">{item.setor} - Trave {item.trave} - {item.ponto}</p>
              <p className="text-xs mt-2 opacity-80">{item.falha}</p>
            </div>

            <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className={`h-11 px-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                  theme === 'dark'
                    ? 'border-white/15 hover:bg-white/10 disabled:opacity-50'
                    : 'border-slate-300 hover:bg-slate-100 disabled:opacity-50'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="h-11 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'Finalizando...' : 'Com certeza, finalizar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

