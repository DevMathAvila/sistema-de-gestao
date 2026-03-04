import React from 'react';
import { ChevronDown, Hash, Zap } from 'lucide-react';
import { normalizeText, traveTemParada } from '../services/failuresService';

export default function FailureSectorBoard({
  setors,
  falhasPorSetor,
  setorAberto,
  setSetorAberto,
  traveAberta,
  setTraveAberta,
  traves,
  pontos,
  getTraveChamados,
  getStatusTrave,
  getDadosPonto,
  abrirModalPonto,
  abrirModalLote,
  isColaborador,
  styles,
  theme,
}) {
  return (
    <div className="space-y-4">
      {setors.map((setor) => {
        const falhasDoSetor = falhasPorSetor[setor] || [];
        const numTravesAfetadas = new Set(falhasDoSetor.map((f) => String(f.trave))).size;
        const setorTemParadaCritica = traveTemParada(falhasDoSetor);
        const isSetorAberto = setorAberto === setor;

        return (
          <div key={setor} className={`${styles.card} rounded-2xl border overflow-hidden`}>
            <button
              type="button"
              onClick={() => setSetorAberto(isSetorAberto ? null : setor)}
              className={`w-full flex items-center justify-between p-5 ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black uppercase italic">{setor}</span>
                  {setorTemParadaCritica && <span className="bg-purple-600 text-[8px] font-black px-2 py-0.5 rounded-full text-white">PARADA</span>}
                </div>
                <span className={`text-[10px] font-black uppercase mt-1 flex items-center gap-1.5 ${numTravesAfetadas > 0 ? (setorTemParadaCritica ? 'text-purple-400' : 'text-red-500') : 'text-gray-500'}`}>
                  {numTravesAfetadas > 0 ? <><Zap size={10} /> {numTravesAfetadas} Traves Afetadas</> : 'Estavel'}
                </span>
              </div>
              <ChevronDown size={20} className={`transition-transform duration-500 ${isSetorAberto ? 'rotate-180' : ''} ${styles.subtext}`} />
            </button>

            {isSetorAberto && (
              <div className="px-5 pb-5 space-y-3">
                {traves.map((traveNum) => {
                  const chamadosDaTrave = getTraveChamados(setor, traveNum);
                  const status = getStatusTrave(chamadosDaTrave);
                  const isTraveOpen = traveAberta === traveNum;
                  const hasFalhas = chamadosDaTrave.length > 0;
                  return (
                    <div key={`${setor}-${traveNum}`} id={`anchor-${normalizeText(setor)}-${traveNum}`}>
                      <div className={`flex items-center gap-2 p-2 rounded-xl border ${hasFalhas ? 'border-red-500/20' : 'border-transparent'}`}>
                        <button onClick={() => setTraveAberta(isTraveOpen ? null : traveNum)} className="flex-1 flex items-center justify-between px-3 py-1">
                          <span className={`flex items-center gap-2 text-[10px] font-black uppercase italic ${hasFalhas ? (status.level === 4 ? 'text-purple-500' : 'text-red-600') : 'text-gray-400'}`}>
                            <Hash size={14} /> Trave {String(traveNum).padStart(2, '0')}
                          </span>
                          {hasFalhas && (
                            <span className={`px-3 py-1 ${status.color} ${status.textColor} text-[8px] font-black rounded-full`}>
                              {status.label}
                            </span>
                          )}
                        </button>
                        {hasFalhas && !isColaborador && (
                          <button onClick={() => abrirModalLote(setor, traveNum)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-black text-[8px] uppercase hover:bg-red-700 transition-all">
                            Resolver
                          </button>
                        )}
                      </div>

                      {isTraveOpen && (
                        <div className={`p-4 mt-2 rounded-2xl grid grid-cols-5 sm:grid-cols-8 gap-2 border ${styles.mutedCard}`}>
                          {pontos.map((p) => {
                            const pontoNum = Number(p);
                            const dadosPonto = getDadosPonto(setor, traveNum, pontoNum);
                            let bgClass = theme === 'dark' ? 'bg-white/5 text-gray-700' : 'bg-white border-slate-200 text-slate-300';
                            if (dadosPonto) {
                              if (dadosPonto.falha.toLowerCase().includes('travetoda') || dadosPonto.falha.includes('1-15')) bgClass = 'bg-purple-600 text-white';
                              else if (dadosPonto.isMonitor) bgClass = 'bg-orange-500 text-white';
                              else bgClass = 'bg-red-600 text-white';
                            }
                            return (
                              <div key={`${setor}-${traveNum}-${p}`} className="relative group">
                                <button
                                  onClick={() => abrirModalPonto(dadosPonto)}
                                  className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-[9px] font-black transition-all duration-300 ${bgClass}`}
                                >
                                  <span className="text-[6px] opacity-50 mb-0">PT</span>
                                  {p}
                                </button>
                                {dadosPonto && (
                                  <div className={`pointer-events-none absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-xl border p-2 opacity-0 group-hover:opacity-100 transition-all ${
                                    theme === 'dark' ? 'bg-black/95 border-white/10' : 'bg-white border-slate-200 shadow-xl'
                                  }`}>
                                    <p className={`text-[10px] font-black uppercase leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                      {dadosPonto.falha}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
