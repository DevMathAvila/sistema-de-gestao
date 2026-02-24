import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, HardDrive, Hash, AlertTriangle, 
  User, LogOut, ChevronRight, ChevronDown, Eye, X, Clock, 
  ShieldAlert, Check, ArrowRight, MessageSquare, Loader2, Briefcase
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

  const user = JSON.parse(localStorage.getItem('lenovo_user')) || { username: 'Técnico' };
  const setores = ["Runin 01", "Runin 02", "Runin 03", "Runin 04", "Runin 05", "Runin 06", "Runin 07", "Runin 08", "Runin 09", "Runin 10", "AVT"];

  // LÓGICA DO CARRINHO DE FERRAMENTAS (RESUMO POR SETOR)
  const gerarResumoMateriais = (setorNome) => {
    const resumo = {};
    const falhasDoSetor = falhas.filter(f => f.setor === setorNome);

    falhasDoSetor.forEach(f => {
      if (!f.falha) return;
      
      const listaFalhas = f.falha.split(',').map(s => s.trim());
      // Lógica: Se for inteira conta 15, senão conta os pontos listados na string
      const qtdPontos = f.ponto === "1-15 (Inteira)" 
        ? 15 
        : (f.ponto ? f.ponto.split(',').length : 1);
      
      listaFalhas.forEach(item => {
        if (item) {
          resumo[item] = (resumo[item] || 0) + qtdPontos;
        }
      });
    });
    return resumo;
  };

  const buscarFalhas = async () => {
    try {
      const { data, error } = await supabase
        .from('registros_falhas')
        .select('*')
        .eq('status', 'aberto');
      if (error) throw error;
      setFalhas(data || []);
    } catch (err) {
      console.error("Erro:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarFalhas();
    const interval = setInterval(buscarFalhas, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lenovo_user');
    navigate('/');
  };

  const handleFinalizarChamado = async () => {
    if (!solucaoTexto.trim()) return alert("Descreva o que foi feito para corrigir a falha.");
    setEnviando(true);
    try {
      const { error } = await supabase
        .from('registros_falhas')
        .update({ 
          status: 'fechado',
          solucao: solucaoTexto,
          resolvido_por: user.username,
          resolvido_em: new Date().toISOString()
        })
        .eq('id', modalData.id);

      if (error) throw error;
      setFalhas(prev => prev.filter(f => f.id !== modalData.id));
      fecharModal();
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setEnviando(false);
    }
  };

  const fecharModal = () => {
    setModalData(null);
    setEtapaFechamento(false);
    setSolucaoTexto('');
  };

  const countFalhasSetor = (s) => falhas.filter(f => f.setor === s).length;
  const temFalhaNaTrave = (s, t) => falhas.some(f => f.setor === s && f.trave === t.toString());

  const getFalhaNoPonto = (s, t, p) => {
    return falhas.find(f => {
      const mesmoSetorETrave = f.setor === s && f.trave === t.toString();
      const pontoString = f.ponto || "";
      const pontoMatch = pontoString === "1-15 (Inteira)" || 
                         pontoString.includes(`Ponto ${p}`) || 
                         pontoString === p.toString();
      return mesmoSetorETrave && pontoMatch;
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans relative selection:bg-red-600 selection:text-white">
      
      {/* MODAL MULTI-ETAPA */}
      {modalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(226,35,26,0.15)]">
            <div className={`p-8 border-b border-white/5 flex justify-between items-center ${etapaFechamento ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${etapaFechamento ? 'bg-green-500' : 'bg-red-600'} text-white shadow-lg`}>
                  {etapaFechamento ? <Check size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">
                    {etapaFechamento ? 'Registrar Solução' : 'Detalhes da Ocorrência'}
                  </h3>
                  <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase">ID: #{modalData.id} • {modalData.setor}</p>
                </div>
              </div>
              <button onClick={fecharModal} className="text-gray-500 hover:text-white transition-all"><X size={24} /></button>
            </div>

            <div className="p-8">
              {!etapaFechamento ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">Local</span>
                      <span className="text-white font-bold">Trave {modalData.trave}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">Ponto</span>
                      <span className="text-white font-bold">{modalData.ponto}</span>
                    </div>
                  </div>
                  <div className="bg-red-600/10 p-6 rounded-3xl border border-red-600/20 ring-1 ring-red-500/20">
                    <span className="text-[10px] text-red-500 uppercase font-black block mb-2">Descrição da Falha</span>
                    <span className="text-2xl font-black text-white leading-tight italic">"{modalData.falha}"</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><User size={14} className="text-red-600"/> {modalData.usuario}</span>
                    <span className="flex items-center gap-2"><Clock size={14} className="text-red-600"/> {new Date(modalData.created_at).toLocaleTimeString()}</span>
                  </div>
                  <button onClick={() => setEtapaFechamento(true)} className="w-full p-5 bg-white text-black font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-2 group">
                    Iniciar Reparo <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                  <textarea autoFocus placeholder="Descreva a ação técnica tomada..." className="w-full bg-black border border-white/10 p-5 rounded-3xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all min-h-[140px] resize-none text-sm leading-relaxed" value={solucaoTexto} onChange={(e) => setSolucaoTexto(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setEtapaFechamento(false)} className="p-5 bg-white/5 text-gray-500 font-black rounded-2xl hover:bg-white/10 transition-all uppercase text-[10px] tracking-widest">Voltar</button>
                    <button onClick={handleFinalizarChamado} disabled={enviando} className="p-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-500 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-green-900/20">
                      {enviando ? <Loader2 className="animate-spin" size={18} /> : 'Concluir'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 p-6 flex flex-col bg-black">
        <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(226,35,26,0.3)] group-hover:scale-110 transition-transform">L</div>
          <h1 className="text-xl font-black tracking-tighter italic">LENOVO <span className="text-gray-600 font-light">PRO</span></h1>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 p-4 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-bold text-sm">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <div className="flex items-center gap-3 p-4 bg-red-600/10 rounded-2xl text-red-600 font-black border border-red-600/20 shadow-inner text-sm italic">
            <Eye size={20} /> MAPA DE FALHAS
          </div>
        </nav>
        <div className="mt-auto pt-6 border-t border-white/5">
           <div className="flex items-center gap-3 px-3 py-4 bg-white/[0.03] rounded-2xl mb-4 border border-white/5">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 font-bold text-xs">{user.username[0].toUpperCase()}</div>
              <span className="text-xs font-black text-gray-300 truncate uppercase tracking-tighter">{user.username}</span>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-gray-600 hover:text-red-500 transition-all font-bold text-xs uppercase tracking-widest">
            <LogOut size={18} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Live Monitor</h2>
            <p className="text-gray-500 font-bold text-xs tracking-[0.3em] uppercase mt-2">Status da Linha de Produção em Tempo Real</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-600/10 rounded-xl border border-red-600/20">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
              <span className="text-[10px] font-black text-red-500 uppercase">{falhas.length} Falhas Ativas</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600 animate-pulse">
            <Loader2 className="animate-spin mb-4" size={40} />
            <span className="font-black uppercase tracking-widest text-xs">Sincronizando Banco de Dados...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {setores.map(setor => {
              const numFalhas = countFalhasSetor(setor);
              const isSetorAberto = setorAberto === setor;
              
              // CHAMADA CORRIGIDA DA FUNÇÃO
              const materiais = gerarResumoMateriais(setor);

              return (
                <div key={setor} className={`border rounded-[2rem] overflow-hidden transition-all duration-500 ${numFalhas > 0 ? 'border-red-600/30 bg-red-950/5' : 'border-white/5 bg-[#0A0A0A]'}`}>
                  <button onClick={() => {setSetorAberto(isSetorAberto ? null : setor); setTraveAberta(null);}} className={`w-full p-6 flex items-center justify-between transition-all ${isSetorAberto ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl shadow-2xl ${numFalhas > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-white/5 text-gray-700'}`}>
                          <HardDrive size={24} />
                      </div>
                      <div className="text-left">
                        <span className={`font-black text-2xl tracking-tighter uppercase italic ${numFalhas > 0 ? 'text-white' : 'text-gray-600'}`}>{setor}</span>
                        {numFalhas > 0 && <p className="text-[10px] font-black text-red-500 tracking-[0.2em] uppercase">{numFalhas} ocorrência(s) detectada(s)</p>}
                      </div>
                    </div>
                    {isSetorAberto ? <ChevronDown className="text-red-600" /> : <ChevronRight className="text-gray-800" />}
                  </button>

                  {isSetorAberto && (
                    <div className="p-8 pt-2 space-y-6 animate-in slide-in-from-top-4 duration-500">
                      
                      {/* CARRINHO DE FERRAMENTAS - RESUMO POR RUNIN */}
                      {Object.keys(materiais).length > 0 && (
                        <div className="bg-black/40 border border-white/5 rounded-[2rem] p-6 mb-4 shadow-inner animate-in zoom-in-95 duration-300">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-900/20">
                              <Briefcase size={18} className="text-white" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Kit de Manutenção: {setor}</h4>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {Object.entries(materiais).map(([nome, qtd]) => (
                              <div key={nome} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 flex items-center justify-between group hover:border-red-600/30 transition-all">
                                <span className="text-[10px] font-bold text-gray-500 uppercase group-hover:text-white truncate pr-2">{nome}</span>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="text-lg font-black text-red-600">{qtd}</span>
                                  <span className="text-[8px] font-black text-gray-700 uppercase tracking-tighter font-mono">UN</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {[...Array(23)].map((_, i) => {
                        const tNum = i + 1;
                        const traveComErro = temFalhaNaTrave(setor, tNum);
                        const isTraveAberta = traveAberta === tNum;

                        return (
                          <div key={tNum} className="group">
                            <button onClick={() => setTraveAberta(isTraveAberta ? null : tNum)} className={`w-full p-5 flex justify-between items-center text-xs font-black transition-all rounded-[1.5rem] border ${traveComErro ? 'bg-red-600/10 border-red-600/40 text-red-500 shadow-xl' : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/10'}`}>
                              <span className="flex items-center gap-3"><Hash size={16} className={traveComErro ? "text-red-500" : "text-red-600"}/> TRAVE {String(tNum).padStart(2, '0')}</span>
                              {traveComErro ? <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[9px] animate-bounce tracking-widest">AÇÃO NECESSÁRIA</span> : <ChevronRight size={14} className="opacity-20"/>}
                            </button>

                            {isTraveAberta && (
                              <div className="mt-4 p-6 bg-black/40 rounded-[2rem] grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4 border border-white/5 ring-1 ring-inset ring-white/[0.02] animate-in zoom-in-95">
                                {[...Array(15)].map((_, j) => {
                                  const pNum = j + 1;
                                  const falhaNoPonto = getFalhaNoPonto(setor, tNum, pNum);
                                  return (
                                    <button key={pNum} onClick={() => falhaNoPonto && setModalData(falhaNoPonto)} className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-black border transition-all duration-300 ${falhaNoPonto ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_25px_rgba(226,35,26,0.5)] hover:scale-110' : 'bg-white/[0.02] border-white/5 text-gray-800 hover:border-white/20'}`}>
                                      {pNum}
                                    </button>
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
        )}
      </main>
    </div>
  );
};

export default VisualizarFalhas;