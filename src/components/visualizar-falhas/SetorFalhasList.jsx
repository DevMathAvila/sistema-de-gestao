import React from 'react';
import { Box, ChevronDown, HardDrive, Hash, Octagon, Zap } from 'lucide-react';

export default function SetorFalhasList({
  setores,
  falhas,
  setorAberto,
  traveAberta,
  setSetorAberto,
  setTraveAberta,
  theme,
  colors,
  isColaborador,
  abrirModalLote,
  abrirModalPonto,
  getStatusTrave,
  normalizar,
  countTravesComFalha,
  calcularCarrinhoSetor,
  temParadaCritica,
  getDadosPonto,
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {setores.map((setor) => {
        const numTravesAfetadas = countTravesComFalha(falhas, setor);
        const isSetorAberto = setorAberto === setor;
        const itensCarrinho = isSetorAberto ? calcularCarrinhoSetor(falhas, setor) : [];
        const setorTemParadaCritica = temParadaCritica(falhas, setor);

        return (
          <div key={setor} className={`border ${colors.card} rounded-[2rem] transition-all duration-300 ${setorTemParadaCritica ? 'border-purple-600/40 ring-1 ring-purple-600/10' : ''}`}>
            <button
              onClick={() => {
                setSetorAberto(isSetorAberto ? null : setor);
                setTraveAberta(null);
              }}
              className={`w-full p-4 md:p-5 flex items-center justify-between transition-all ${colors.hover}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shadow-inner ${setorTemParadaCritica ? 'bg-purple-600 text-white' : (numTravesAfetadas > 0 ? 'bg-red-600 text-white' : (theme === 'dark' ? 'bg-white/5 text-gray-700' : 'bg-slate-100 text-slate-400'))}`}>
                  {setorTemParadaCritica ? <Octagon size={20} /> : <HardDrive size={20} />}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-xl uppercase italic tracking-tighter ${colors.text}`}>{setor}</span>
                    {setorTemParadaCritica && <span className="bg-purple-600 text-[7px] font-black px-2 py-0.5 rounded-full text-white">PARADA</span>}
                  </div>
                  <span className={`text-[9px] font-black uppercase mt-1 flex items-center gap-1.5 ${numTravesAfetadas > 0 ? (setorTemParadaCritica ? 'text-purple-400' : 'text-red-500') : 'text-gray-500'}`}>
                    {numTravesAfetadas > 0 ? <><Zap size={10} fill="currentColor" /> {numTravesAfetadas} Traves Afetadas</> : 'Estavel'}
                  </span>
                </div>
              </div>
              <ChevronDown size={20} className={`transition-transform duration-500 ${isSetorAberto ? 'rotate-180' : ''} ${colors.subtext}`} />
            </button>

            {isSetorAberto && (
              <div className="px-6 pb-6 space-y-6 animate-in slide-in-from-top-2">
                {itensCarrinho.length > 0 && (
                  <div className={`${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'} p-5 rounded-2xl border`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Box size={14} className="text-red-600" />
                      <h4 className={`text-[9px] font-black uppercase tracking-widest ${colors.subtext}`}>Insumos Necessarios</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {itensCarrinho.map(([peca, qtd]) => (
                        <div key={peca} className={`${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'} px-3 py-1.5 rounded-lg border flex items-center gap-2`}>
                          <span className="text-xs font-black text-red-600">{qtd}x</span>
                          <span className="text-[8px] font-black uppercase opacity-60">{peca}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  {[...Array(23)].map((_, i) => {
                    const tNum = i + 1;
                    const chamadosDaTrave = falhas.filter((f) => normalizar(f.setor) === normalizar(setor) && String(f.trave) === String(tNum));
                    const status = getStatusTrave(chamadosDaTrave);
                    const isTraveAberta = traveAberta === tNum;

                    return (
                      <div key={tNum} id={`anchor-${normalizar(setor)}-${tNum}`}>
                        <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${chamadosDaTrave.length > 0 ? `border-${status.color.split('-')[1]}-500/20 ${theme === 'dark' ? 'bg-white/[0.01]' : 'bg-white'}` : 'border-transparent'}`}>
                          <button onClick={() => setTraveAberta(isTraveAberta ? null : tNum)} className="flex-1 flex items-center justify-between px-3">
                            <span className={`flex items-center gap-2 text-[10px] font-black uppercase italic ${chamadosDaTrave.length > 0 ? (status.level === 4 ? 'text-purple-500' : 'text-red-600') : 'text-gray-400'}`}>
                              <Hash size={14} /> Trave {tNum.toString().padStart(2, '0')}
                            </span>
                            {chamadosDaTrave.length > 0 && (
                              <span className={`px-3 py-1 ${status.color} ${status.textColor} text-[8px] font-black rounded-full transition-all duration-300`}>
                                {status.label}
                              </span>
                            )}
                          </button>
                          {chamadosDaTrave.length > 0 && !isColaborador && (
                            <button onClick={() => abrirModalLote(setor, tNum)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-black text-[8px] uppercase hover:bg-red-700 transition-all">
                              Resolver
                            </button>
                          )}
                        </div>

                        {isTraveAberta && (
                          <div className={`p-4 mt-2 ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-slate-100 border-slate-200'} rounded-2xl grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-15 gap-2 border shadow-inner`}>
                            {[...Array(15)].map((_, j) => {
                              const pNum = j + 1;
                              const dadosPonto = getDadosPonto(falhas, setor, tNum, pNum);
                              const isInteira = dadosPonto && (normalizar(dadosPonto.falha).includes('travetoda') || String(falhas.find((f) => f.id === dadosPonto.id)?.ponto).includes('1-15'));

                              let pulseClass = '';
                              let bgClass = theme === 'dark' ? 'bg-white/5 text-gray-700' : 'bg-white border-slate-200 text-slate-300';

                              if (dadosPonto) {
                                if (isInteira) {
                                  bgClass = 'bg-purple-600 text-white';
                                  pulseClass = 'animate-glow-purple';
                                } else if (dadosPonto.isMonitor) {
                                  bgClass = 'bg-orange-500 text-white';
                                  pulseClass = 'animate-glow-orange';
                                } else {
                                  bgClass = 'bg-red-600 text-white';
                                  pulseClass = 'animate-glow-red';
                                }
                              }

                              return (
                                <div key={pNum} className="relative group">
                                  <button
                                    onClick={() => abrirModalPonto(dadosPonto)}
                                    className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-[9px] font-black transition-all duration-300 group-hover:z-10 ${bgClass} ${pulseClass}`}
                                  >
                                    <span className="text-[5px] opacity-50 mb-0">PT</span>
                                    {pNum}
                                  </button>
                                  {dadosPonto && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#0f0f0f]/95 backdrop-blur-md border border-white/10 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] pointer-events-none shadow-2xl">
                                      <p className="text-[10px] font-bold text-white leading-tight uppercase italic">{dadosPonto.falha}</p>
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
