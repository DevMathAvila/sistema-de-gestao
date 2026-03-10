import React from 'react';
import Box from 'lucide-react/dist/esm/icons/box';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Hash from 'lucide-react/dist/esm/icons/hash';
import Wrench from 'lucide-react/dist/esm/icons/wrench';
import Zap from 'lucide-react/dist/esm/icons/zap';
import { isAvtSetor } from '../constants/failureConstants';
import { normalizeText, traveTemParada } from '../services/failuresService';

export default function FailureSectorBoard({
  setors,
  falhasPorSetor,
  setorAberto,
  setSetorAberto,
  traveAberta,
  setTraveAberta,
  getTravesDoSetor,
  getPontosDoSetor,
  getTraveChamados,
  getMesaTrabalhoTrave,
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
        const setorEhAvt = isAvtSetor(setor);
        const numTravesAfetadas = new Set(falhasDoSetor.map((f) => String(f.trave))).size;
        const setorTemParadaCritica = traveTemParada(falhasDoSetor);
        const setorTemFalha = setorEhAvt ? falhasDoSetor.length > 0 : numTravesAfetadas > 0;
        const isSetorAberto = setorAberto === setor;
        const traves = getTravesDoSetor(setor);
        const pontos = getPontosDoSetor(setor);
        const alertBadgeClass = setorTemParadaCritica
          ? 'border-purple-400/60 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-500 text-white shadow-[0_0_28px_rgba(168,85,247,0.35)]'
          : theme === 'dark'
            ? 'border-red-400/60 bg-gradient-to-r from-red-700 via-rose-600 to-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.35)]'
            : 'border-red-300 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)]';
        const alertDotClass = setorTemParadaCritica ? 'bg-white' : 'bg-white';
        const alertHaloClass = setorTemParadaCritica
          ? 'bg-white/35'
          : theme === 'dark'
            ? 'bg-white/35'
            : 'bg-red-500/40';
        const stableClass = theme === 'dark'
          ? 'text-gray-500'
          : 'text-slate-400';

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
                <div className="mt-2">
                  {setorTemFalha ? (
                    <span className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] transition-all duration-300 ${alertBadgeClass} ${theme === 'dark' ? 'animate-pulse' : ''}`}>
                      <span className={`absolute inset-0 opacity-90 ${theme === 'dark' ? 'bg-gradient-to-r from-white/10 via-transparent to-white/5' : 'animate-pulse'}`} aria-hidden="true" />
                      <span className={`relative flex h-2.5 w-2.5 items-center justify-center rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-white/20'}`}>
                        <span className={`absolute h-2.5 w-2.5 rounded-full ${alertHaloClass} animate-ping`} />
                        <span className={`relative h-1.5 w-1.5 rounded-full ${alertDotClass}`} />
                      </span>
                      <Zap size={12} className="relative shrink-0" />
                      <span className="relative">
                        {setorEhAvt ? `${falhasDoSetor.length} Registros Abertos` : `${numTravesAfetadas} Traves Afetadas`}
                      </span>
                    </span>
                  ) : (
                    <span className={`text-[10px] font-black uppercase mt-1 inline-flex items-center gap-1.5 ${stableClass}`}>
                      Estavel
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown size={20} className={`transition-transform duration-500 ${isSetorAberto ? 'rotate-180' : ''} ${styles.subtext}`} />
            </button>

            {isSetorAberto && setorEhAvt && (
              <div className="px-5 pb-5 space-y-3">
                {(() => {
                  const traveAvt = 1;
                  const chamadosDaTrave = getTraveChamados(setor, traveAvt);
                  const mesaTrabalho = getMesaTrabalhoTrave(setor, traveAvt);
                  const hasFalhas = chamadosDaTrave.length > 0;
                  const status = getStatusTrave(chamadosDaTrave);
                  const avtRowClass = hasFalhas
                    ? status.level === 4
                      ? theme === 'dark'
                        ? 'border-purple-400/40 bg-[linear-gradient(135deg,rgba(88,28,135,0.5),rgba(17,17,17,0.92))] shadow-[0_14px_40px_rgba(168,85,247,0.18)]'
                        : 'border-purple-300 bg-[linear-gradient(135deg,rgba(245,243,255,1),rgba(255,255,255,1))] shadow-[0_12px_32px_rgba(168,85,247,0.12)]'
                      : theme === 'dark'
                        ? 'border-red-400/35 bg-[linear-gradient(135deg,rgba(127,29,29,0.38),rgba(10,10,10,0.96))] shadow-[0_14px_40px_rgba(239,68,68,0.16)]'
                        : 'border-red-200 bg-[linear-gradient(135deg,rgba(255,245,245,1),rgba(255,255,255,1))] shadow-[0_12px_32px_rgba(239,68,68,0.1)]'
                    : theme === 'dark'
                      ? 'border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] hover:border-white/15 hover:bg-white/[0.04]'
                      : 'border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(248,250,252,1))] hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]';
                  const avtTitleClass = hasFalhas
                    ? status.level === 4
                      ? 'text-purple-400'
                      : theme === 'dark' ? 'text-red-300' : 'text-red-700'
                    : theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
                  const avtHashClass = hasFalhas
                    ? status.level === 4
                      ? theme === 'dark' ? 'bg-purple-500/15 text-purple-300 border-purple-400/25' : 'bg-purple-50 text-purple-700 border-purple-200'
                      : theme === 'dark' ? 'bg-red-500/15 text-red-300 border-red-400/20' : 'bg-red-50 text-red-700 border-red-200'
                    : theme === 'dark' ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-100 text-slate-500 border-slate-200';
                  return (
                    <div id={`anchor-${normalizeText(setor)}-${traveAvt}`}>
                      <div className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${avtRowClass}`}>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-300 ${avtHashClass}`}>
                          <Zap size={16} />
                        </div>
                        <div className="flex-1 flex items-center justify-between px-3 py-1">
                          <span className={`flex items-center gap-2 text-[10px] font-black uppercase italic tracking-[0.12em] ${avtTitleClass}`}>
                            Pontos AVT
                          </span>
                          {hasFalhas && (
                            <span className={`px-3 py-1.5 ${status.color} ${status.textColor} text-[8px] font-black rounded-full shadow-lg ring-1 ring-white/10`}>
                              {status.label}
                            </span>
                          )}
                        </div>
                        {hasFalhas && !isColaborador && (
                          <button
                            onClick={() => abrirModalLote(setor, traveAvt)}
                            className={`px-3 py-2 rounded-xl font-black text-[8px] uppercase tracking-[0.14em] transition-all ${
                              theme === 'dark'
                                ? 'bg-white text-black hover:bg-red-500 hover:text-white shadow-[0_10px_24px_rgba(255,255,255,0.14)]'
                                : 'bg-slate-900 text-white hover:bg-red-600 shadow-[0_10px_24px_rgba(15,23,42,0.15)]'
                            }`}
                          >
                            Resolver
                          </button>
                        )}
                      </div>

                      <div className="mt-3 space-y-3">
                        {mesaTrabalho.length > 0 && (
                          <div className={`relative overflow-hidden rounded-[1.6rem] border p-4 ${
                            theme === 'dark'
                              ? 'border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_18px_44px_rgba(0,0,0,0.28)]'
                              : 'border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(248,250,252,1))] shadow-[0_18px_44px_rgba(15,23,42,0.08)]'
                          }`}>
                            <div className="absolute inset-y-0 left-0 w-1 rounded-full bg-gradient-to-b from-red-500 via-rose-500 to-amber-400" />
                            <div className="flex items-start justify-between gap-4 pl-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                                    theme === 'dark'
                                      ? 'border-white/10 bg-white/5 text-red-300'
                                      : 'border-red-200 bg-red-50 text-red-600'
                                  }`}>
                                    <Wrench size={16} />
                                  </span>
                                  <div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>Mesa de Trabalho</p>
                                    <p className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Materiais sugeridos para atender esta trave</p>
                                  </div>
                                </div>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${
                                theme === 'dark'
                                  ? 'bg-white/5 text-white border border-white/10'
                                  : 'bg-slate-900 text-white'
                              }`}>
                                {mesaTrabalho.reduce((acc, [, qtd]) => acc + qtd, 0)} itens
                              </span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 pl-3">
                              {mesaTrabalho.map(([item, qtd]) => (
                                <div
                                  key={`${setor}-${traveAvt}-${item}`}
                                  className={`group relative overflow-hidden rounded-2xl border px-3 py-2 ${
                                    theme === 'dark'
                                      ? 'border-white/10 bg-white/5 text-white'
                                      : 'border-slate-200 bg-white text-slate-900'
                                  }`}
                                >
                                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
                                  <div className="flex items-center gap-2">
                                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                      theme === 'dark' ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'
                                    }`}>
                                      <Box size={14} />
                                    </span>
                                    <div>
                                      <p className={`text-[11px] font-black uppercase tracking-[0.08em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item}</p>
                                      <p className={`text-[10px] font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{qtd} unidade{qtd > 1 ? 's' : ''}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className={`p-4 rounded-2xl grid ${pontos.length > 15 ? 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10' : 'grid-cols-5 sm:grid-cols-8'} gap-2 border ${styles.mutedCard}`}>
                          {pontos.map((p) => {
                            const pontoNum = Number(p);
                            const dadosPonto = getDadosPonto(setor, traveAvt, pontoNum);
                            let bgClass = theme === 'dark' ? 'bg-white/5 text-gray-700' : 'bg-white border-slate-200 text-slate-300';
                            if (dadosPonto) {
                              if (dadosPonto.falha.toLowerCase().includes('travetoda') || dadosPonto.falha.toLowerCase().includes('inteira') || dadosPonto.falha.includes('1-15') || dadosPonto.falha.includes('1-40')) bgClass = 'bg-purple-600 text-white';
                              else if (dadosPonto.isMonitor) bgClass = 'bg-orange-500 text-white';
                              else bgClass = 'bg-red-600 text-white';
                            }
                            return (
                              <div key={`${setor}-${traveAvt}-${p}`} className="relative group">
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
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {isSetorAberto && !setorEhAvt && (
              <div className="px-5 pb-5 space-y-3">
                {traves.map((traveNum) => {
                  const chamadosDaTrave = getTraveChamados(setor, traveNum);
                  const mesaTrabalho = getMesaTrabalhoTrave(setor, traveNum);
                  const status = getStatusTrave(chamadosDaTrave);
                  const isTraveOpen = traveAberta === traveNum;
                  const hasFalhas = chamadosDaTrave.length > 0;
                  const rowClass = hasFalhas
                    ? status.level === 4
                      ? theme === 'dark'
                        ? 'border-purple-400/40 bg-[linear-gradient(135deg,rgba(88,28,135,0.48),rgba(9,9,11,0.96))] shadow-[0_14px_42px_rgba(168,85,247,0.18)]'
                        : 'border-purple-400 bg-[linear-gradient(135deg,rgba(250,245,255,1),rgba(255,255,255,1))] ring-1 ring-purple-200 shadow-[0_14px_38px_rgba(168,85,247,0.18)]'
                      : theme === 'dark'
                        ? 'border-red-400/35 bg-[linear-gradient(135deg,rgba(127,29,29,0.34),rgba(8,8,8,0.96))] shadow-[0_14px_42px_rgba(239,68,68,0.16)]'
                        : 'border-red-300 bg-[linear-gradient(135deg,rgba(255,240,240,1),rgba(255,255,255,1))] ring-1 ring-red-200 shadow-[0_14px_38px_rgba(239,68,68,0.16)]'
                    : theme === 'dark'
                      ? 'border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] hover:border-white/15 hover:bg-white/[0.04]'
                      : 'border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(248,250,252,1))] hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]';
                  const rowTitleClass = hasFalhas
                    ? status.level === 4
                      ? 'text-purple-400'
                      : theme === 'dark' ? 'text-red-300' : 'text-red-700'
                    : theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
                  const rowIndexClass = hasFalhas
                    ? status.level === 4
                      ? theme === 'dark' ? 'bg-purple-500/15 text-purple-300 border-purple-400/20' : 'bg-purple-50 text-purple-700 border-purple-200'
                      : theme === 'dark' ? 'bg-red-500/15 text-red-300 border-red-400/20' : 'bg-red-50 text-red-700 border-red-200'
                    : theme === 'dark' ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-100 text-slate-500 border-slate-200';
                  return (
                    <div key={`${setor}-${traveNum}`} id={`anchor-${normalizeText(setor)}-${traveNum}`}>
                      <div className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${rowClass} ${isTraveOpen ? 'scale-[1.005]' : ''} ${hasFalhas && theme === 'light' ? 'hover:-translate-y-[1px]' : ''}`}>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-300 ${rowIndexClass}`}>
                          <Hash size={15} />
                        </div>
                        <button onClick={() => setTraveAberta(isTraveOpen ? null : traveNum)} className="flex-1 flex items-center justify-between px-3 py-1 text-left">
                          <span className={`flex items-center gap-2 text-[10px] font-black uppercase italic tracking-[0.12em] ${rowTitleClass} ${hasFalhas && theme === 'light' ? 'drop-shadow-[0_1px_10px_rgba(239,68,68,0.18)]' : ''}`}>
                            Trave {String(traveNum).padStart(2, '0')}
                          </span>
                          {hasFalhas && (
                            <span className={`px-3 py-1.5 ${status.color} ${status.textColor} text-[8px] font-black rounded-full shadow-lg ring-1 ${theme === 'light' ? 'ring-red-200 shadow-[0_8px_22px_rgba(239,68,68,0.2)]' : 'ring-white/10'}`}>
                              {status.label}
                            </span>
                          )}
                        </button>
                        {hasFalhas && !isColaborador && (
                          <button
                            onClick={() => abrirModalLote(setor, traveNum)}
                            className={`px-3 py-2 rounded-xl font-black text-[8px] uppercase tracking-[0.14em] transition-all ${
                              theme === 'dark'
                                ? 'bg-white text-black hover:bg-red-500 hover:text-white shadow-[0_10px_24px_rgba(255,255,255,0.14)]'
                                : 'bg-slate-900 text-white hover:bg-red-600 shadow-[0_10px_24px_rgba(15,23,42,0.15)]'
                            }`}
                          >
                            Resolver
                          </button>
                        )}
                      </div>

                      {isTraveOpen && (
                        <div className="mt-3 space-y-3">
                          {mesaTrabalho.length > 0 && (
                            <div className={`relative overflow-hidden rounded-[1.6rem] border p-4 ${
                              theme === 'dark'
                                ? 'border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_18px_44px_rgba(0,0,0,0.28)]'
                                : 'border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(248,250,252,1))] shadow-[0_18px_44px_rgba(15,23,42,0.08)]'
                            }`}>
                              <div className="absolute inset-y-0 left-0 w-1 rounded-full bg-gradient-to-b from-red-500 via-rose-500 to-amber-400" />
                              <div className="flex items-start justify-between gap-4 pl-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                                      theme === 'dark'
                                        ? 'border-white/10 bg-white/5 text-red-300'
                                        : 'border-red-200 bg-red-50 text-red-600'
                                    }`}>
                                      <Wrench size={16} />
                                    </span>
                                    <div>
                                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>Mesa de Trabalho</p>
                                      <p className={`text-[11px] font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Leve estes insumos antes de seguir para a trave</p>
                                    </div>
                                  </div>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${
                                  theme === 'dark'
                                    ? 'bg-white/5 text-white border border-white/10'
                                    : 'bg-slate-900 text-white'
                                }`}>
                                  {mesaTrabalho.reduce((acc, [, qtd]) => acc + qtd, 0)} itens
                                </span>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2 pl-3">
                                {mesaTrabalho.map(([item, qtd]) => (
                                  <div
                                    key={`${setor}-${traveNum}-${item}`}
                                    className={`group relative overflow-hidden rounded-2xl border px-3 py-2 ${
                                      theme === 'dark'
                                        ? 'border-white/10 bg-white/5 text-white'
                                        : 'border-slate-200 bg-white text-slate-900'
                                    }`}
                                  >
                                    <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
                                    <div className="flex items-center gap-2">
                                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                        theme === 'dark' ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-600'
                                      }`}>
                                        <Box size={14} />
                                      </span>
                                      <div>
                                        <p className={`text-[11px] font-black uppercase tracking-[0.08em] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item}</p>
                                        <p className={`text-[10px] font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{qtd} unidade{qtd > 1 ? 's' : ''}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={`p-4 rounded-2xl grid ${pontos.length > 15 ? 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10' : 'grid-cols-5 sm:grid-cols-8'} gap-2 border ${styles.mutedCard}`}>
                            {pontos.map((p) => {
                              const pontoNum = Number(p);
                              const dadosPonto = getDadosPonto(setor, traveNum, pontoNum);
                              let bgClass = theme === 'dark' ? 'bg-white/5 text-gray-700' : 'bg-white border-slate-200 text-slate-300';
                              if (dadosPonto) {
                                if (dadosPonto.falha.toLowerCase().includes('travetoda') || dadosPonto.falha.toLowerCase().includes('inteira') || dadosPonto.falha.includes('1-15') || dadosPonto.falha.includes('1-40')) bgClass = 'bg-purple-600 text-white';
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
