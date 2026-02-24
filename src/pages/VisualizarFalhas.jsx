import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, HardDrive, Hash, ChevronRight, 
  ChevronDown, Eye, X, ShieldAlert, ArrowRight, 
  Loader2, CheckCircle2, Zap, Layout, ListChecks
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
      const falhasValidas = (data || []).filter(f => f.setor && f.trave);
      setFalhas(falhasValidas);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
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
          status: 'fechado',
          solucao: solucaoTexto,
          resolvido_por: user.username,
          resolvido_em: new Date().toISOString()
        }).in('id', idsParaFechar);
      if (error) throw error;
      fecharModal();
      buscarFalhas();
    } catch (err) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const abrirModalLote = (s, t) => {
    const chamadosDaTrave = falhas.filter(f => normalizar(f.setor) === normalizar(s) && String(f.trave) === String(t));
    setModalData({
      ids: chamadosDaTrave.map(f => f.id),
      setor: s, trave: t, ponto: "Múltiplos",
      falha: "Manutenção Coletiva na Trave", usuario: "Equipe"
    });
    setModoLote(true);
  };

  const fecharModal = () => {
    setModalData(null); setEtapaFechamento(false);
    setSolucaoTexto(''); setModoLote(false);
  };

  const getDadosPonto = (s, t, p) => {
    const chamadosNoPonto = falhas.filter(f => {
      if (normalizar(f.setor) !== normalizar(s) || String(f.trave) !== String(t)) return false;
      const pStr = String(f.ponto || "");
      if (pStr.includes("Inteira")) return true;
      return new RegExp(`(^|,|\\s|Ponto )${p}($|,|\\s)`).test(pStr);
    });
    if (chamadosNoPonto.length === 0) return null;
    return {
      id: chamadosNoPonto[0].id,
      ids: chamadosNoPonto.map(f => f.id),
      setor: s, trave: t, ponto: p,
      falha: chamadosNoPonto.map(f => f.falha).join(' + ')
    };
  };

  const countTravesComFalha = (s) => new Set(falhas.filter(f => normalizar(f.setor) === normalizar(s)).map(f => String(f.trave))).size;

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
      <span className="text-red-600 font-black tracking-widest uppercase text-xs animate-pulse">Syncing Database...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col md:flex-row font-sans relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

      {modalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className={`p-8 flex justify-between items-center ${etapaFechamento ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${etapaFechamento ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]'} text-white`}>
                   <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic leading-none">{modalData.setor}</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Rack {modalData.trave} • Slot {modalData.ponto}</p>
                </div>
              </div>
              <button onClick={fecharModal} className="text-gray-500 hover:text-white transition-colors"><X size={28} /></button>
            </div>
            
            <div className="p-8">
              {!etapaFechamento ? (
                <div className="space-y-8 text-center">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Diagnóstico Detectado</span>
                    <h4 className="text-3xl font-black text-red-500 italic uppercase">"{modalData.falha}"</h4>
                  </div>
                  <button onClick={() => setEtapaFechamento(true)} className="w-full p-6 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 uppercase text-sm hover:bg-red-600 hover:text-white transition-all group">
                    Iniciar Reparo <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Relatório de Manutenção</label>
                    <textarea autoFocus placeholder="O que foi realizado para sanar a falha?" 
                      className="w-full bg-black border border-white/10 p-6 rounded-[2rem] text-white outline-none focus:border-green-500/50 transition-all min-h-[160px] resize-none" 
                      value={solucaoTexto} onChange={(e) => setSolucaoTexto(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setEtapaFechamento(false)} className="p-6 bg-white/5 text-gray-500 rounded-2xl font-black uppercase text-xs hover:bg-white/10 transition-all">Voltar</button>
                    <button onClick={handleFinalizarChamado} disabled={enviando || !solucaoTexto.trim()} 
                      className="p-6 bg-green-600 text-white rounded-2xl font-black uppercase text-xs shadow-[0_0_20px_rgba(34,197,94,0.2)] disabled:opacity-20 transition-all">
                      {enviando ? 'Enviando...' : 'Finalizar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-72 border-r border-white/5 p-8 flex-col bg-black/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4 mb-12 group cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(220,38,38,0.3)] group-hover:rotate-6 transition-transform">L</div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter leading-none">LENOVO</h1>
            <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">Factory Pro</span>
          </div>
        </div>
        <nav className="flex-1 space-y-3">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-4 p-4 text-gray-500 font-bold text-sm hover:bg-white/5 rounded-2xl transition-all">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-black italic text-sm shadow-lg shadow-red-600/20">
            <Eye size={20} /> Live Monitor
          </div>
        </nav>
        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Logged as</p>
            <p className="text-sm font-bold truncate italic">{user.username}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto z-10">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter">Monitor</h2>
            <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live System Feed
            </div>
          </div>
          
          <div className="px-6 py-4 bg-red-600/10 rounded-3xl border border-red-600/20 backdrop-blur-md flex items-center gap-4">
            <div className="relative flex h-4 w-4">
              <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,1)]"></span>
            </div>
            <span className="text-sm font-black text-red-500 uppercase tracking-tighter">{falhas.length} Falhas Detectadas</span>
          </div>
        </header>

        <div className="space-y-6">
          {setoresValidos.map(setor => {
            const numTravesAfetadas = countTravesComFalha(setor);
            const isSetorAberto = setorAberto === setor;
            const itensCarrinho = isSetorAberto ? calcularCarrinhoSetor(setor) : [];

            return (
              <div key={setor} className={`group border rounded-[3rem] transition-all duration-500 overflow-hidden ${numTravesAfetadas > 0 ? 'bg-red-950/5 border-red-600/30' : 'bg-white/[0.02] border-white/5'}`}>
                <button onClick={() => {setSetorAberto(isSetorAberto ? null : setor); setTraveAberta(null);}} 
                  className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-[1.5rem] transition-all duration-500 ${numTravesAfetadas > 0 ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]' : 'bg-white/5 text-gray-600 group-hover:text-white'}`}>
                      <HardDrive size={32} />
                    </div>
                    <div className="text-left">
                      <span className="font-black text-3xl md:text-4xl uppercase italic tracking-tighter block">{setor}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${numTravesAfetadas > 0 ? 'bg-red-600/20 text-red-500' : 'bg-white/5 text-gray-600'}`}>
                            {numTravesAfetadas > 0 ? 'Anomalia Detectada' : 'Nominal'}
                        </span>
                        {numTravesAfetadas > 0 && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{numTravesAfetadas} traves pendentes</span>}
                      </div>
                    </div>
                  </div>
                  <div className={`transition-transform duration-300 ${isSetorAberto ? 'rotate-180 text-red-600' : 'text-gray-700'}`}>
                    <ChevronDown size={32} />
                  </div>
                </button>

                {isSetorAberto && (
                  <div className="p-6 md:p-10 pt-0 space-y-10 animate-in slide-in-from-top duration-500">
                    {/* Shopping List de Manutenção */}
                    {itensCarrinho.length > 0 && (
                      <div className="bg-[#080808] border-2 border-red-600/20 p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Zap size={120} />
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2 bg-red-600 rounded-lg text-white"><ListChecks size={20} /></div>
                          <p className="text-xl font-black uppercase italic tracking-tighter text-red-500">Kit de Manutenção Sugerido</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {itensCarrinho.map(([peca, qtd]) => (
                            <div key={peca} className="bg-white/5 border border-white/5 px-6 py-4 rounded-2xl flex items-center gap-4 hover:border-red-600/50 transition-all">
                              <span className="text-2xl font-black text-red-600 leading-none">{qtd}x</span>
                              <span className="text-xs font-black uppercase tracking-widest text-gray-400">{peca}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lista de Traves */}
                    <div className="grid grid-cols-1 gap-4">
                      {[...Array(23)].map((_, i) => {
                        const tNum = i + 1;
                        const chamadosDaTrave = falhas.filter(f => normalizar(f.setor) === normalizar(setor) && String(f.trave) === String(tNum));
                        const isTraveAberta = traveAberta === tNum;
                        
                        return (
                          <div key={tNum} className="group/trave">
                            <div className={`flex flex-col md:flex-row items-stretch md:items-center gap-4 p-3 rounded-[2rem] border transition-all duration-300 ${chamadosDaTrave.length > 0 ? 'bg-red-600/5 border-red-600/20' : 'bg-white/[0.01] border-white/5'}`}>
                              <button onClick={() => setTraveAberta(isTraveAberta ? null : tNum)} className="flex-1 p-4 flex justify-between items-center text-sm font-black">
                                <span className="flex items-center gap-4 uppercase italic tracking-tighter">
                                    <div className={`p-2 rounded-xl ${chamadosDaTrave.length > 0 ? 'bg-red-600' : 'bg-white/5'}`}>
                                        <Hash size={18} className="text-white"/>
                                    </div>
                                    <span className="text-xl">Trave {tNum}</span>
                                </span>
                                {chamadosDaTrave.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">{chamadosDaTrave.length} ERROS</span>
                                        <ChevronRight size={20} className={`transition-transform duration-300 ${isTraveAberta ? 'rotate-90 text-red-600' : 'text-gray-700'}`} />
                                    </div>
                                )}
                              </button>
                              
                              {chamadosDaTrave.length > 0 && (
                                <button onClick={() => abrirModalLote(setor, tNum)} className="bg-white text-black hover:bg-red-600 hover:text-white px-8 py-4 rounded-2xl font-black text-xs uppercase transition-all tracking-tighter active:scale-95">
                                  Resolver Inteira
                                </button>
                              )}
                            </div>

                            {isTraveAberta && (
                              <div className="p-6 md:p-8 mt-4 bg-black/40 rounded-[2.5rem] grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-15 gap-3 border border-white/5 animate-in zoom-in-95 duration-300">
                                {[...Array(15)].map((_, j) => {
                                  const pNum = j + 1;
                                  const dadosPonto = getDadosPonto(setor, tNum, pNum);
                                  return (
                                    <div key={pNum} className="relative group/ponto">
                                      <button onClick={() => { if (dadosPonto) { setModalData(dadosPonto); setModoLote(false); } }} 
                                        className={`aspect-square w-full rounded-2xl flex flex-col items-center justify-center text-xs font-black border-2 transition-all duration-300 ${dadosPonto ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-pulse' : 'bg-white/5 border-transparent text-gray-800 hover:border-white/20'}`}>
                                        <span className="text-[8px] opacity-40 mb-1">P</span>
                                        <span className="text-lg leading-none">{pNum}</span>
                                      </button>
                                      
                                      {dadosPonto && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl whitespace-nowrap opacity-0 group-hover/ponto:opacity-100 transition-all pointer-events-none z-50 shadow-2xl tracking-tighter">
                                          {dadosPonto.falha}
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-red-600" />
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
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .lg\\:grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(220, 38, 38, 0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(220, 38, 38, 0.5); }
        @media (max-width: 768px) {
            .lg\\:grid-cols-15 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
        }
      `}} />
    </div>
  );
};

export default VisualizarFalhas;