import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, HardDrive, Hash, LogOut, ChevronRight, 
  ChevronDown, Eye, X, ShieldAlert, ArrowRight, 
  Loader2, Briefcase, CheckCircle2, AlertTriangle
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
  const setores = ["Runin 01", "Runin 02", "Runin 03", "Runin 04", "Runin 05", "Runin 06", "Runin 07", "Runin 08", "Runin 09", "Runin 10", "AVT"];

  const buscarFalhas = async () => {
    try {
      const { data, error } = await supabase
        .from('registros_falhas')
        .select('*')
        .eq('status', 'aberto');
      if (error) throw error;
      setFalhas(data || []);
    } catch (err) {
      console.error("Erro na busca:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarFalhas();
    const interval = setInterval(buscarFalhas, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleFinalizarChamado = async () => {
    if (!solucaoTexto.trim()) return alert("Descreva o que foi feito.");
    setEnviando(true);
    try {
      const idsParaFechar = modoLote ? modalData.ids : [modalData.id];
      const { error } = await supabase
        .from('registros_falhas')
        .update({ 
          status: 'fechado',
          solucao: solucaoTexto,
          resolvido_por: user.username,
          resolvido_em: new Date().toISOString()
        })
        .in('id', idsParaFechar);

      if (error) throw error;
      setFalhas(prev => prev.filter(f => !idsParaFechar.includes(f.id)));
      fecharModal();
    } catch (err) {
      alert("Erro ao finalizar: " + err.message);
    } finally {
      setEnviando(false);
    }
  };

  const abrirModalLote = (s, t) => {
    const chamadosDaTrave = falhas.filter(f => f.setor === s && String(f.trave) === String(t));
    setModalData({
      ids: chamadosDaTrave.map(f => f.id),
      setor: s,
      trave: t,
      ponto: "Múltiplos Pontos",
      falha: "Manutenção Coletiva na Trave",
      usuario: "Equipe Técnica"
    });
    setModoLote(true);
  };

  const fecharModal = () => {
    setModalData(null);
    setEtapaFechamento(false);
    setSolucaoTexto('');
    setModoLote(false);
  };

  const getDadosPonto = (s, t, p) => {
    const chamadosNoPonto = falhas.filter(f => {
      if (f.setor !== s || String(f.trave) !== String(t)) return false;
      const pStr = String(f.ponto || "");
      if (pStr.includes("Inteira")) return true;
      const regex = new RegExp(`(^|,|\\s)${p}($|,|\\s)`);
      return regex.test(pStr);
    });
    if (chamadosNoPonto.length === 0) return null;
    if (chamadosNoPonto.length > 1) {
      return {
        id: chamadosNoPonto[0].id,
        ids: chamadosNoPonto.map(f => f.id),
        setor: s,
        trave: t,
        ponto: p,
        falha: chamadosNoPonto.map(f => f.falha).join(' + '),
        agrupado: true
      };
    }
    return chamadosNoPonto[0];
  };

  // --- NOVA LÓGICA DE CONTAGEM POR TRAVES ÚNICAS ---
  const countTravesComFalha = (s) => {
    const falhasDoSetor = falhas.filter(f => f.setor === s);
    // Cria um Set para armazenar apenas números de traves únicos
    const travesUnicas = new Set(falhasDoSetor.map(f => String(f.trave)));
    return travesUnicas.size;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans relative">
      
      {/* Estilos do Tooltip Moderno */}
      <style>{`
        .ponto-container { position: relative; display: inline-block; }
        .tooltip-moderno {
          visibility: hidden;
          background-color: #0A0A0A;
          color: #fff;
          text-align: center;
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid rgba(220, 38, 38, 0.5);
          position: absolute;
          z-index: 50;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          white-space: nowrap;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          pointer-events: none;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
        }
        .ponto-container:hover .tooltip-moderno {
          visibility: visible;
          opacity: 1;
        }
      `}</style>

      {modalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className={`p-8 border-b border-white/5 flex justify-between items-center ${etapaFechamento ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${etapaFechamento ? 'bg-green-500' : 'bg-red-600'} text-white`}>
                  {modoLote || modalData.agrupado ? <Briefcase size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">
                    {etapaFechamento ? 'Concluir' : (modoLote || modalData.agrupado ? 'Múltiplas Falhas' : 'Ocorrência')}
                  </h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase">Trave {modalData.trave} - Ponto {modalData.ponto}</p>
                </div>
              </div>
              <button onClick={fecharModal} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-8">
              {!etapaFechamento ? (
                <div className="space-y-6">
                  <div className="bg-red-600/10 p-6 rounded-3xl border border-red-600/20">
                    <span className="text-[10px] text-red-500 uppercase font-black block mb-2">Relato(s)</span>
                    <span className="text-2xl font-black text-white italic">"{modalData.falha}"</span>
                  </div>
                  <button onClick={() => {
                    if(modalData.agrupado) setModoLote(true);
                    setEtapaFechamento(true);
                  }} className="w-full p-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 uppercase text-xs">
                    Iniciar Fechamento <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <textarea autoFocus placeholder="Solução aplicada..." className="w-full bg-black border border-white/10 p-5 rounded-3xl text-white outline-none min-h-[140px]" value={solucaoTexto} onChange={(e) => setSolucaoTexto(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setEtapaFechamento(false)} className="p-5 bg-white/5 text-gray-500 rounded-2xl font-black uppercase text-[10px]">Voltar</button>
                    <button onClick={handleFinalizarChamado} disabled={enviando} className="p-5 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px]">
                      {enviando ? 'Enviando...' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <aside className="w-full md:w-64 border-r border-white/10 p-6 flex flex-col bg-black">
        <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xl">L</div>
          <h1 className="text-xl font-black tracking-tighter italic">LENOVO <span className="text-gray-600">PRO</span></h1>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 p-4 text-gray-500 font-bold text-sm hover:text-white">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <div className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-2xl font-black italic text-sm">
            <Eye size={20} /> MAPA DE FALHAS
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <h2 className="text-4xl font-black uppercase italic">Live Monitor</h2>
          <div className="px-4 py-2 bg-red-600/10 rounded-xl border border-red-600/20">
            <span className="text-[10px] font-black text-red-500 uppercase">{falhas.length} Falhas Ativas</span>
          </div>
        </header>

        <div className="space-y-4">
          {setores.map(setor => {
            const numTravesAfetadas = countTravesComFalha(setor);
            const isSetorAberto = setorAberto === setor;

            return (
              <div key={setor} className={`border rounded-[2rem] overflow-hidden transition-all ${numTravesAfetadas > 0 ? 'border-red-600/30' : 'border-white/5 bg-[#0A0A0A]'}`}>
                <button onClick={() => {setSetorAberto(isSetorAberto ? null : setor); setTraveAberta(null);}} className="w-full p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${numTravesAfetadas > 0 ? 'bg-red-600 animate-pulse' : 'bg-white/5'}`}>
                      <HardDrive size={24} />
                    </div>
                    <div className="text-left">
                      <span className="font-black text-2xl uppercase italic">{setor}</span>
                      {numTravesAfetadas > 0 && (
                        <p className="text-[10px] font-black text-red-500 uppercase">
                          {numTravesAfetadas} {numTravesAfetadas === 1 ? 'trave com falha' : 'traves com falhas'}
                        </p>
                      )}
                    </div>
                  </div>
                  {isSetorAberto ? <ChevronDown /> : <ChevronRight />}
                </button>

                {isSetorAberto && (
                  <div className="p-8 pt-2 space-y-4">
                    {[...Array(23)].map((_, i) => {
                      const tNum = i + 1;
                      const chamadosDaTrave = falhas.filter(f => f.setor === setor && String(f.trave) === String(tNum));
                      const isTraveAberta = traveAberta === tNum;

                      return (
                        <div key={tNum} className="space-y-2">
                          <div className={`flex items-center gap-2 p-2 rounded-2xl border transition-all ${chamadosDaTrave.length > 0 ? 'bg-red-600/10 border-red-600/40 shadow-[0_0_15px_rgba(220,38,38,0.1)]' : 'bg-white/[0.02] border-white/5'}`}>
                            <button onClick={() => setTraveAberta(isTraveAberta ? null : tNum)} className="flex-1 p-3 flex justify-between items-center text-xs font-black">
                              <span className="flex items-center gap-3 uppercase"><Hash size={16} className="text-red-600"/> Trave {tNum}</span>
                              {chamadosDaTrave.length > 0 && (
                                <div className="flex items-center gap-2 text-red-500">
                                  <AlertTriangle size={14} className="animate-bounce" />
                                  <span className="animate-pulse">{chamadosDaTrave.length} FALHAS</span>
                                </div>
                              )}
                            </button>
                            
                            {chamadosDaTrave.length > 0 && (
                              <button 
                                onClick={() => abrirModalLote(setor, tNum)}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-600 transition-all font-black text-[10px] uppercase"
                              >
                                <CheckCircle2 size={14} /> Resolver Tudo
                              </button>
                            )}
                          </div>

                          {isTraveAberta && (
                            <div className="p-6 bg-black/40 rounded-[2rem] grid grid-cols-5 sm:grid-cols-10 gap-4 border border-white/5 animate-in slide-in-from-top-2">
                              {[...Array(15)].map((_, j) => {
                                const pNum = j + 1;
                                const dadosPonto = getDadosPonto(setor, tNum, pNum);
                                return (
                                  <div key={pNum} className="ponto-container">
                                    {dadosPonto && (
                                      <div className="tooltip-moderno">
                                        {dadosPonto.falha}
                                      </div>
                                    )}
                                    <button 
                                      onClick={() => {
                                        if (dadosPonto) {
                                          setModalData(dadosPonto);
                                          setModoLote(false);
                                        }
                                      }} 
                                      className={`aspect-square w-full rounded-2xl flex items-center justify-center text-xs font-black border transition-all hover:scale-110 active:scale-95 ${dadosPonto ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-white/[0.02] border-white/5 text-gray-800'}`}
                                    >
                                      {pNum}
                                    </button>
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
      </main>
    </div>
  );
};

export default VisualizarFalhas;