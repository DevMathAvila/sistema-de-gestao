import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, HardDrive, Hash, ChevronRight, 
  ChevronDown, Eye, X, ShieldAlert, ArrowRight, 
  CheckCircle2, Zap, ListChecks, Activity
} from 'lucide-react';
import { supabase } from '../services/supabase';

const VisualizarFalhas = () => {
  const navigate = useNavigate();
  const [falhas, setFalhas] = useState([]);
  const [setorAberto, setSetorAberto] = useState(null);
  const [traveAberta, setTraveAberta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [etapaFechamento, setEtapaFechamento] = useState(false);
  const [solucaoTexto, setSolucaoTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [modoLote, setModoLote] = useState(false);

  const user = JSON.parse(localStorage.getItem('lenovo_user')) || { username: 'Técnico' };
  const setoresValidos = ["Runin 01", "Runin 02", "Runin 03", "Runin 04", "Runin 05", "Runin 06", "Runin 07", "Runin 08", "Runin 09", "Runin 10", "AVT"];

  const normalizar = (texto) => String(texto || "").replace(/\s|-|_/g, '').toLowerCase().trim();

  const buscarFalhas = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('registros_falhas').select('*').eq('status', 'aberto');
      if (error) throw error;
      setFalhas((data || []).filter(f => f.setor && f.trave));
    } catch (err) { console.error(err.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    buscarFalhas();
    const interval = setInterval(buscarFalhas, 5000); 
    return () => clearInterval(interval);
  }, [buscarFalhas]);

  const calcularCarrinhoSetor = (nomeSetor) => {
    const falhasDoSetor = falhas.filter(f => normalizar(f.setor) === normalizar(nomeSetor));
    const contagem = {};
    falhasDoSetor.forEach(f => {
      if (f.falha) {
        f.falha.split(/[,+]/).forEach(p => {
          let item = p.trim();
          if (item) {
            if (item.includes("Rede")) item = "Rede";
            if (item.includes("VGA")) item = "VGA";
            if (item.includes("Energia")) item = "Energia Y";
            contagem[item] = (contagem[item] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(contagem).sort((a, b) => b[1] - a[1]);
  };

  const handleFinalizarChamado = async () => {
    if (!solucaoTexto.trim()) return;
    setEnviando(true);
    try {
      const idsParaFechar = modoLote ? modalData.ids : [modalData.id];
      const { error } = await supabase.from('registros_falhas').update({ 
          status: 'fechado', solucao: solucaoTexto, resolvido_por: user.username, resolvido_em: new Date().toISOString()
        }).in('id', idsParaFechar);
      if (error) throw error;
      fecharModal();
      buscarFalhas();
    } catch (err) { alert(err.message); } finally { setEnviando(false); }
  };

  const abrirModalLote = (s, t) => {
    const chamadosDaTrave = falhas.filter(f => normalizar(f.setor) === normalizar(s) && String(f.trave) === String(t));
    setModalData({ ids: chamadosDaTrave.map(f => f.id), setor: s, trave: t, ponto: "Todos", falha: "Reparo Geral", usuario: "Equipe" });
    setModoLote(true);
  };

  const fecharModal = () => { setModalData(null); setEtapaFechamento(false); setSolucaoTexto(''); setModoLote(false); };

  const getDadosPonto = (s, t, p) => {
    const chamadosNoPonto = falhas.filter(f => {
      if (normalizar(f.setor) !== normalizar(s) || String(f.trave) !== String(t)) return false;
      const pStr = String(f.ponto || "");
      return pStr.includes("Inteira") || new RegExp(`(^|,|\\s|Ponto )${p}($|,|\\s)`).test(pStr);
    });
    return chamadosNoPonto.length > 0 ? { id: chamadosNoPonto[0].id, ids: chamadosNoPonto.map(f => f.id), setor: s, trave: t, ponto: p, falha: chamadosNoPonto.map(f => f.falha).join(' + ') } : null;
  };

  const countTravesComFalha = (s) => new Set(falhas.filter(f => normalizar(f.setor) === normalizar(s)).map(f => String(f.trave))).size;

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-4" />
      <span className="text-red-600 font-bold tracking-[0.3em] text-[10px] uppercase">Syncing</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col md:flex-row font-sans relative overflow-hidden text-sm">
      
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-600/5 blur-[100px] pointer-events-none" />

      {modalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className={`p-6 flex justify-between items-center ${etapaFechamento ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${etapaFechamento ? 'bg-green-500' : 'bg-red-600'} text-white`}>
                   <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic leading-none">{modalData.setor}</h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">T{modalData.trave} • P{modalData.ponto}</p>
                </div>
              </div>
              <button onClick={fecharModal} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6">
              {!etapaFechamento ? (
                <div className="text-center space-y-6">
                  <h4 className="text-xl font-black text-red-500 italic uppercase">"{modalData.falha}"</h4>
                  <button onClick={() => setEtapaFechamento(true)} className="w-full py-4 bg-white text-black font-black rounded-xl flex items-center justify-center gap-2 uppercase text-xs hover:bg-red-600 hover:text-white transition-all">
                    Iniciar Reparo <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea autoFocus placeholder="Relatório de manutenção..." className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-green-500/40 min-h-[120px] text-xs resize-none" value={solucaoTexto} onChange={(e) => setSolucaoTexto(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setEtapaFechamento(false)} className="py-3 bg-white/5 text-gray-500 rounded-xl font-bold uppercase text-[10px]">Voltar</button>
                    <button onClick={handleFinalizarChamado} disabled={enviando || !solucaoTexto.trim()} className="py-3 bg-green-600 text-white rounded-xl font-bold uppercase text-[10px] disabled:opacity-20">
                      {enviando ? '...' : 'Finalizar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Compacta */}
      <aside className="hidden md:flex w-60 border-r border-white/5 p-6 flex-col bg-black/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg">L</div>
          <div>
            <h1 className="text-base font-black italic tracking-tighter leading-none">LENOVO</h1>
            <span className="text-[8px] text-gray-600 font-bold tracking-widest uppercase">Live Pro</span>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 p-3 text-gray-500 font-bold text-xs hover:bg-white/5 rounded-xl transition-all"><LayoutDashboard size={18} /> Dashboard</button>
          <div className="flex items-center gap-3 p-3 bg-red-600 text-white rounded-xl font-bold italic text-xs shadow-md shadow-red-600/20"><Eye size={18} /> Live Monitor</div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto z-10">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">MONITOR</h2>
            <div className="flex items-center gap-2 text-gray-600 font-bold text-[9px] uppercase tracking-widest mt-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Telemetry Active
            </div>
          </div>
          <div className="px-4 py-2 bg-red-600/10 rounded-2xl border border-red-600/20 flex items-center gap-3">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span></span>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{falhas.length} Ativas</span>
          </div>
        </header>

        <div className="space-y-4">
          {setoresValidos.map(setor => {
            const numTravesAfetadas = countTravesComFalha(setor);
            const isSetorAberto = setorAberto === setor;
            const itensCarrinho = isSetorAberto ? calcularCarrinhoSetor(setor) : [];

            return (
              <div key={setor} className={`border rounded-[2rem] transition-all overflow-hidden ${numTravesAfetadas > 0 ? 'bg-red-950/5 border-red-600/20' : 'bg-white/[0.01] border-white/5'}`}>
                <button onClick={() => {setSetorAberto(isSetorAberto ? null : setor); setTraveAberta(null);}} 
                  className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-white/[0.01]">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-all ${numTravesAfetadas > 0 ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-600'}`}>
                      <HardDrive size={20} />
                    </div>
                    <div className="text-left">
                      <span className="font-black text-xl uppercase italic tracking-tighter block leading-none">{setor}</span>
                      <span className={`text-[8px] font-black uppercase mt-1 inline-block ${numTravesAfetadas > 0 ? 'text-red-500' : 'text-gray-600'}`}>
                        {numTravesAfetadas > 0 ? `${numTravesAfetadas} Traves com Erro` : 'Status Nominal'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={20} className={`transition-all ${isSetorAberto ? 'rotate-180 text-red-600' : 'text-gray-800'}`} />
                </button>

                {isSetorAberto && (
                  <div className="p-5 pt-0 space-y-6 animate-in slide-in-from-top duration-300">
                    {itensCarrinho.length > 0 && (
                      <div className="bg-black/40 border border-red-600/10 p-4 rounded-2xl flex flex-wrap gap-3">
                        {itensCarrinho.map(([peca, qtd]) => (
                          <div key={peca} className="bg-white/5 px-3 py-2 rounded-xl flex items-center gap-2 border border-white/5">
                            <span className="text-xs font-black text-red-600">{qtd}x</span>
                            <span className="text-[9px] font-bold uppercase text-gray-500">{peca}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                      {[...Array(23)].map((_, i) => {
                        const tNum = i + 1;
                        const chamadosDaTrave = falhas.filter(f => normalizar(f.setor) === normalizar(setor) && String(f.trave) === String(tNum));
                        const isTraveAberta = traveAberta === tNum;
                        return (
                          <div key={tNum}>
                            <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${chamadosDaTrave.length > 0 ? 'bg-red-600/5 border-red-600/20' : 'bg-white/[0.01] border-white/5'}`}>
                              <button onClick={() => setTraveAberta(isTraveAberta ? null : tNum)} className="flex-1 flex items-center justify-between px-2 py-1">
                                <span className="flex items-center gap-2 text-xs font-black uppercase italic">
                                    <Hash size={14} className={chamadosDaTrave.length > 0 ? 'text-red-500' : 'text-gray-700'}/> Trave {tNum}
                                </span>
                                {chamadosDaTrave.length > 0 && <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-full">{chamadosDaTrave.length}</span>}
                              </button>
                              {chamadosDaTrave.length > 0 && (
                                <button onClick={() => abrirModalLote(setor, tNum)} className="bg-white text-black px-4 py-1.5 rounded-lg font-black text-[9px] uppercase hover:bg-red-600 hover:text-white transition-all">Fechar Trave</button>
                              )}
                            </div>
                            {isTraveAberta && (
                              <div className="p-3 mt-2 bg-black/60 rounded-2xl grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-15 gap-2 border border-white/5">
                                {[...Array(15)].map((_, j) => {
                                  const pNum = j + 1;
                                  const dadosPonto = getDadosPonto(setor, tNum, pNum);
                                  return (
                                    <button key={pNum} onClick={() => { if (dadosPonto) { setModalData(dadosPonto); setModoLote(false); } }} 
                                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-black border transition-all ${dadosPonto ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-white/5 border-transparent text-gray-800'}`}>
                                      <span className="text-[6px] opacity-40">P</span>{pNum}
                                    </button>
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
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .lg\\:grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }
        @media (max-width: 1024px) { .lg\\:grid-cols-15 { grid-template-columns: repeat(8, minmax(0, 1fr)); } }
        @media (max-width: 640px) { .lg\\:grid-cols-15 { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
      `}} />
    </div>
  );
};

export default VisualizarFalhas;