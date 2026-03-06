import React from 'react';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';

export default function InoperantPointsBoard({
  inoperantesPorSetor,
  theme,
  styles,
  isColaborador,
  onReativar,
  enviando,
  formatDateTime,
}) {
  const setores = Object.keys(inoperantesPorSetor || {});
  if (setores.length === 0) {
    return (
      <section className={`${styles.card} rounded-2xl border p-6`}>
        <p className="text-sm font-black uppercase text-emerald-500">Nenhum ponto inoperante aberto.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {setores.map((setor) => {
        const itens = inoperantesPorSetor[setor] || [];
        return (
          <section key={setor} className={`${styles.card} rounded-2xl border overflow-hidden`}>
            <header className={`px-5 py-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
              <p className="text-xs font-black uppercase tracking-widest text-amber-500">Pontos inoperantes</p>
              <h3 className="text-2xl font-black uppercase italic mt-1">{setor}</h3>
            </header>
            <div className="p-4 sm:p-5 space-y-3">
              {itens.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider opacity-70">
                        Trave {String(item.trave || '-').padStart(2, '0')} | {item.ponto || '-'}
                      </p>
                      <p className="text-sm font-black uppercase text-amber-500 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        {item.falha || '-'}
                      </p>
                      <p className={`text-[10px] ${styles.subtext}`}>
                        Aberto em {formatDateTime(item.data)}
                      </p>
                    </div>
                    {!isColaborador && (
                      <button
                        type="button"
                        onClick={() => onReativar(item.id)}
                        disabled={enviando}
                        className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50"
                      >
                        <span className="inline-flex items-center gap-2">
                          <RotateCcw size={12} />
                          Reativar
                        </span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
