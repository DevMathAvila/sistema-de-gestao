import React, { useMemo, useState } from 'react';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Clock3 from 'lucide-react/dist/esm/icons/clock-3';
import Monitor from 'lucide-react/dist/esm/icons/monitor';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import X from 'lucide-react/dist/esm/icons/x';

export default function CloseFailureModal({
  theme,
  styles,
  modalData,
  etapaFechamento,
  setEtapaFechamento,
  solucaoTexto,
  setSolucaoTexto,
  enviando,
  isColaborador,
  falhasSelecionadas,
  toggleFalhaSelecionada,
  handleFinalizarChamado,
  handleEnviarParaSiga,
  fecharModal,
  historicoPonto,
  historicoVisivel,
  loadingHistoricoPonto,
  formatDateTime,
  isMobileView,
  mostrarHistoricoCompleto,
  setMostrarHistoricoCompleto,
}) {
  if (!modalData) return null;
  const [customPreset, setCustomPreset] = useState('');
  const presetOptions = useMemo(
    () => ([
      'Testado - Validado - Funcionando',
      'Manutencao feita no CABO RJ45',
      'VGA Trocado por um novo',
      'HDMI Trocado por um novo',
    ]),
    []
  );

  const handleApplyPreset = (value) => {
    if (!value) return;
    setSolucaoTexto(value);
  };

  const handleAddPreset = () => {
    const trimmed = String(customPreset || '').trim();
    if (!trimmed) return;
    setSolucaoTexto(trimmed);
    setCustomPreset('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-white'} border border-white/10 w-full max-w-sm rounded-[2rem] shadow-2xl max-h-[85vh] flex flex-col`}>
        <div className={`p-6 flex justify-between items-center ${etapaFechamento ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${etapaFechamento ? 'bg-green-500' : 'bg-red-600'} text-white`}>
              {modalData.isMonitor ? <Monitor size={20} /> : <ShieldAlert size={20} />}
            </div>
            <div>
              <h3 className={`text-sm font-black uppercase italic leading-none ${theme === 'light' ? 'text-slate-900' : ''}`}>{modalData.setor}</h3>
              <p className="text-[8px] font-black uppercase mt-1 tracking-widest opacity-60">T{modalData.trave} • Ponto {modalData.ponto}</p>
            </div>
          </div>
          <button onClick={fecharModal} className="text-gray-500 hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {String(modalData.ponto) !== 'Todos' && (
            <section className={`mb-5 p-4 rounded-xl border ${styles.mutedCard}`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock3 size={14} className="text-red-600" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600">Historico Recente deste Ponto</h4>
              </div>
              {loadingHistoricoPonto ? (
                <p className="text-[10px] font-black uppercase opacity-50">Carregando historico...</p>
              ) : historicoPonto.length === 0 ? (
                <p className="text-[11px] opacity-60">Nenhum historico registrado para este ponto.</p>
              ) : (
                <>
                  <div className="relative pl-5 space-y-3">
                    <div className={`absolute left-[6px] top-1 bottom-1 w-px ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-300'}`} />
                    {historicoVisivel.map((item) => (
                      <article key={`${item.id}-${item.resolvido_em || item.data || ''}`} className="relative">
                        <span className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white" />
                        <p className="text-[9px] font-black uppercase tracking-wider opacity-60">{formatDateTime(item.resolvido_em || item.data)}</p>
                        <p className="text-[10px] font-black uppercase text-red-600 mt-1">{item.falha || '-'}</p>
                        <p className="text-[11px] mt-1 opacity-80">{item.solucao || '-'}</p>
                        <p className="text-[9px] font-black uppercase opacity-50 mt-1">Tecnico: {item.resolvido_por || item.usuario || '-'}</p>
                      </article>
                    ))}
                  </div>
                  {isMobileView && historicoPonto.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setMostrarHistoricoCompleto((prev) => !prev)}
                      className="mt-3 text-[10px] font-black uppercase tracking-wider text-red-600"
                    >
                      {mostrarHistoricoCompleto ? 'Ver menos' : 'Ver mais'}
                    </button>
                  )}
                </>
              )}
            </section>
          )}

          {!etapaFechamento ? (
            <div className="text-center space-y-6">
              <div className={`${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} p-4 rounded-xl`}>
                <span className="text-[8px] text-gray-500 font-bold uppercase block mb-1">Causa da Falha:</span>
                <h4 className="text-sm font-black italic uppercase text-red-600 leading-tight break-words">"{modalData.falha}"</h4>
              </div>
              <div className="text-left space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Selecionar falhas para concluir</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(modalData.falhasDisponiveis || []).map((item) => {
                    const checked = falhasSelecionadas.some((f) => f.key === item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleFalhaSelecionada(item)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                          checked
                            ? 'border-red-600 bg-red-600/10'
                            : theme === 'dark'
                              ? 'border-white/10 bg-white/5'
                              : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase">{item.falha}</span>
                        <span className={`text-[9px] font-black px-2 py-1 rounded-full ${checked ? 'bg-red-600 text-white' : theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
                          {checked ? 'Selecionada' : 'Pendente'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleEnviarParaSiga}
                  disabled={isColaborador || enviando || falhasSelecionadas.length === 0}
                  className="w-full py-4 bg-cyan-500/90 hover:bg-cyan-500 text-white font-black rounded-xl uppercase text-[10px] tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Enviar para SIGA
                </button>
                <button
                  onClick={() => setEtapaFechamento(true)}
                  disabled={isColaborador || falhasSelecionadas.length === 0}
                  className={`w-full py-4 ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} font-black rounded-xl flex items-center justify-center gap-2 uppercase text-[10px] disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Reparar Selecionadas <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} rounded-xl p-3`}>
                <p className="text-[8px] font-black uppercase opacity-60 mb-2">Falhas selecionadas</p>
                <div className="flex flex-wrap gap-2">
                  {falhasSelecionadas.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleFalhaSelecionada(item)}
                      className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase"
                    >
                      {item.falha} <span className="opacity-80">x</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className={`${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'} rounded-xl p-3`}>
                <p className="text-[8px] font-black uppercase opacity-60 mb-2">Frases prontas</p>
                <div className="flex flex-wrap gap-2">
                  {presetOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleApplyPreset(opt)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${
                        solucaoTexto === opt
                          ? 'bg-red-600 text-white'
                          : theme === 'dark'
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={customPreset}
                    onChange={(e) => setCustomPreset(e.target.value)}
                    placeholder="Adicionar opcao propria"
                    className={`flex-1 ${styles.input} h-10 px-3 rounded-xl outline-none text-[10px]`}
                  />
                  <button
                    type="button"
                    onClick={handleAddPreset}
                    className="h-10 w-10 rounded-xl bg-red-600 text-white font-black text-sm hover:bg-red-700"
                    aria-label="Adicionar frase"
                  >
                    +
                  </button>
                </div>
              </div>
              <textarea
                autoFocus
                placeholder="Relatorio de solucao..."
                className={`w-full ${styles.input} p-4 rounded-xl outline-none min-h-[100px] text-[11px] resize-none transition-all`}
                value={solucaoTexto}
                onChange={(e) => setSolucaoTexto(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setEtapaFechamento(false)} className={`py-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} text-[9px] font-black uppercase rounded-xl`}>
                  Voltar
                </button>
                <button
                  onClick={handleFinalizarChamado}
                  disabled={enviando || !solucaoTexto.trim() || isColaborador || falhasSelecionadas.length === 0}
                  className="py-3 bg-green-600 text-white rounded-xl font-black uppercase text-[9px] disabled:opacity-30"
                >
                  {enviando ? '...' : 'Concluir'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

