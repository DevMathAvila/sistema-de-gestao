import React, { useMemo, useState } from 'react';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Cog from 'lucide-react/dist/esm/icons/cog';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import X from 'lucide-react/dist/esm/icons/x';

function toDateTimeLocal(value) {
  if (!value) return '';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = dt.getFullYear();
  const mm = pad(dt.getMonth() + 1);
  const dd = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const min = pad(dt.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function InoperantPointsBoard({
  inoperantesPorSetor,
  theme,
  styles,
  isColaborador,
  onReativar,
  onFinalizar,
  onEditar,
  enviando,
  formatDateTime,
}) {
  const [finalizarItem, setFinalizarItem] = useState(null);
  const [finalizarTexto, setFinalizarTexto] = useState('');
  const [editarItem, setEditarItem] = useState(null);
  const [editarData, setEditarData] = useState('');
  const [editarFalha, setEditarFalha] = useState('');
  const [editarMotivo, setEditarMotivo] = useState('');

  const sugestoesFinalizacao = useMemo(
    () => ['Encontrado no servidor', 'Refeito femea', 'Troca de patch cord', 'Correção de pinagem RJ45'],
    [],
  );

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
                      {item?.inoperante_motivo && (
                        <p className="text-[10px] font-semibold text-amber-500">
                          Motivo: {item.inoperante_motivo}
                        </p>
                      )}
                      <p className={`text-[10px] ${styles.subtext}`}>
                        Aberto em {formatDateTime(item.inoperante_em || item.data)} | Apontado por {item.inoperante_por || item.usuario || '-'}
                      </p>
                    </div>
                    {!isColaborador && (
                      <div className="flex flex-wrap gap-2">
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
                        <button
                          type="button"
                          onClick={() => {
                            setFinalizarItem(item);
                            setFinalizarTexto('');
                          }}
                          disabled={enviando}
                          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50"
                        >
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 size={12} />
                            Finalizar
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditarItem(item);
                            setEditarData(toDateTimeLocal(item.data));
                            setEditarFalha(String(item.falha || ''));
                            setEditarMotivo(String(item.inoperante_motivo || item.inoperante_observacao || ''));
                          }}
                          disabled={enviando}
                          className={`h-10 w-10 rounded-xl border flex items-center justify-center ${
                            theme === 'dark' ? 'border-white/20 hover:bg-white/10' : 'border-slate-300 hover:bg-slate-200'
                          }`}
                          aria-label="Editar inoperante"
                        >
                          <Cog size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {finalizarItem && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-white'} border border-white/10 w-[calc(100vw-32px)] max-w-lg rounded-[1.5rem] shadow-2xl`}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-sm font-black uppercase text-blue-500">Finalizar Inoperante</p>
              <button onClick={() => setFinalizarItem(null)}><X size={16} /></button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-wider opacity-70">
                {finalizarItem.setor} | Trave {finalizarItem.trave} | {finalizarItem.ponto}
              </p>
              <div className="flex flex-wrap gap-2">
                {sugestoesFinalizacao.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setFinalizarTexto(sug)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${
                      finalizarTexto === sug
                        ? 'bg-blue-600 text-white'
                        : theme === 'dark'
                          ? 'bg-white/10'
                          : 'bg-slate-100'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Descricao final (uso unico)"
                className={`w-full ${styles.input} p-3 rounded-xl outline-none min-h-[90px] text-[11px] resize-none`}
                value={finalizarTexto}
                onChange={(e) => setFinalizarTexto(e.target.value)}
              />
              <div className="flex flex-col justify-end gap-2 sm:flex-row">
                <button className="px-4 h-11 rounded-xl border" onClick={() => setFinalizarItem(null)}>Cancelar</button>
                <button
                  className="px-4 h-11 rounded-xl bg-blue-600 text-white font-black uppercase text-[10px] disabled:opacity-40"
                  disabled={!finalizarTexto.trim() || enviando}
                  onClick={async () => {
                    await onFinalizar({ id: finalizarItem.id, solucao: finalizarTexto });
                    setFinalizarItem(null);
                    setFinalizarTexto('');
                  }}
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editarItem && (
        <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-white'} border border-white/10 w-[calc(100vw-32px)] max-w-lg rounded-[1.5rem] shadow-2xl`}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-sm font-black uppercase text-amber-500">Editar Inoperante</p>
              <button onClick={() => setEditarItem(null)}><X size={16} /></button>
            </div>
            <div className="p-4 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-wider opacity-70 block">Data da falha</label>
              <input
                type="datetime-local"
                value={editarData}
                onChange={(e) => setEditarData(e.target.value)}
                className={`w-full ${styles.input} h-10 px-3 rounded-xl`}
              />
              <label className="text-[10px] font-black uppercase tracking-wider opacity-70 block">Descricao da falha</label>
              <textarea
                value={editarFalha}
                onChange={(e) => setEditarFalha(e.target.value)}
                className={`w-full ${styles.input} p-3 rounded-xl min-h-[70px] text-[11px]`}
              />
              <label className="text-[10px] font-black uppercase tracking-wider opacity-70 block">Motivo inoperante</label>
              <textarea
                value={editarMotivo}
                onChange={(e) => setEditarMotivo(e.target.value)}
                className={`w-full ${styles.input} p-3 rounded-xl min-h-[70px] text-[11px]`}
              />
              <div className="flex flex-col justify-end gap-2 sm:flex-row">
                <button className="px-4 h-11 rounded-xl border" onClick={() => setEditarItem(null)}>Cancelar</button>
                <button
                  className="px-4 h-11 rounded-xl bg-amber-500 text-white font-black uppercase text-[10px] disabled:opacity-40"
                  disabled={enviando}
                  onClick={async () => {
                    await onEditar({
                      id: editarItem.id,
                      data: editarData,
                      falha: editarFalha,
                      motivo: editarMotivo,
                    });
                    setEditarItem(null);
                  }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
