import React, { useCallback, useState } from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import SigaFailureCard from './SigaFailureCard';
import SigaFinalizeConfirmDialog from './SigaFinalizeConfirmDialog';

export default function SigaDeskOverlay({
  open,
  onClose,
  theme,
  styles,
  activeTab,
  setActiveTab,
  aguardando,
  finalizados,
  drafts,
  updateDraft,
  finalizeSigaItem,
  submittingId,
  loading,
}) {
  const [confirmItem, setConfirmItem] = useState(null);

  const handleAskFinalize = useCallback((item) => {
    setConfirmItem(item);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    if (submittingId) return;
    setConfirmItem(null);
  }, [submittingId]);

  const handleConfirmFinalize = useCallback(async () => {
    if (!confirmItem) return;
    await finalizeSigaItem(confirmItem);
    setConfirmItem(null);
  }, [confirmItem, finalizeSigaItem]);

  if (!open) return null;

  const currentList = activeTab === 'aguardando' ? aguardando : finalizados;

  return (
    <div className="fixed inset-0 z-[260]">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        aria-label="Fechar painel SIGA"
      />
      <div className="relative h-full w-full p-3 md:p-6">
        <div className={`h-full rounded-[2rem] border overflow-hidden shadow-2xl ${
          theme === 'dark'
            ? 'bg-black/35 border-white/15 backdrop-blur-2xl'
            : 'bg-white/35 border-white/50 backdrop-blur-2xl'
        }`}>
          <header className="px-4 md:px-6 py-4 border-b border-white/15 flex items-center justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">SIGA</h3>
              <p className={`text-[11px] ${styles.subtext}`}>Transferencias em aberto e finalizacoes</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`h-10 w-10 rounded-xl border flex items-center justify-center ${
                theme === 'dark' ? 'border-white/15 bg-white/5' : 'border-slate-300 bg-white/70'
              }`}
            >
              <X size={16} />
            </button>
          </header>

          <div className="px-4 md:px-6 pt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('aguardando')}
              className={`h-11 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${
                activeTab === 'aguardando' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : `${styles.card} ${styles.subtext}`
              }`}
            >
              Aguardando ({aguardando.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('finalizados')}
              className={`h-11 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest ${
                activeTab === 'finalizados' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : `${styles.card} ${styles.subtext}`
              }`}
            >
              Finalizados ({finalizados.length})
            </button>
          </div>

          <div className="h-[calc(100%-132px)] p-4 md:p-6">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-red-600/25 border-t-red-600 rounded-full animate-spin" />
              </div>
            ) : currentList.length === 0 ? (
              <div className={`${styles.card} rounded-3xl p-10 text-center h-full flex items-center justify-center`}>
                <p className="text-sm font-black uppercase opacity-50">Nenhum item nesta aba.</p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {currentList.map((item) => (
                    <SigaFailureCard
                      key={item.id}
                      item={item}
                      draft={drafts[item.id]}
                      onDraftChange={updateDraft}
                      onFinalize={handleAskFinalize}
                      isSubmitting={submittingId === item.id}
                      theme={theme}
                      isFinalizado={activeTab === 'finalizados'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SigaFinalizeConfirmDialog
        open={Boolean(confirmItem)}
        theme={theme}
        item={confirmItem}
        loading={Boolean(confirmItem && submittingId === confirmItem.id)}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirmFinalize}
      />
    </div>
  );
}
