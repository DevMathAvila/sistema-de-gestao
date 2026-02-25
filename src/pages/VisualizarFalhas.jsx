import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, HardDrive, Hash, ChevronDown, 
  Eye, X, ShieldAlert, ArrowRight, Sun, Moon,
  Box, Zap, Activity
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

  // --- LÓGICA DE TEMA ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50'} flex flex-col items-center justify-center`}>
      <div className={`w-10 h-10 border-2 ${theme === 'dark' ? 'border-red-600/20 border-t-red-600' : 'border-slate-200 border-t-red-600'} rounded-full animate-spin mb-4`} />
      <span className="text-red-600 font-black tracking-[0.3em] text-[10px] uppercase">Sincronizando</span>
    </div>
  );

  // Configurações de cores baseadas no tema
  const colors = {
    bg: theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200',
    card: theme === 'dark' ? 'bg-[#0A0A0A] border-white/5 shadow-black/50' : 'bg-white border-white shadow-slate-200/50',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-500' : 'text-slate-400',
    hover: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-100',
    input: theme === 'dark' ? 'bg-black border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'
  };

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500`}>
      
      {/* Glow Visual Effects */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${theme === 'dark' ? 'bg-red-600/5' : 'bg-red-500/10'} blur-[120px] pointer-events-none transition-opacity duration-1000`} />

      {/* MODAL SISTEMA */}
      {modalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-white'} border ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'} w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200`}>
            <div className={`p-8 flex justify-between items-center ${etapaFechamento ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${etapaFechamento ? 'bg-green-500 shadow-green-500/20' : 'bg-red-600 shadow-red-600/20'} text-white shadow-lg`}>
                   <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-black uppercase italic leading-none ${colors.text}`}>{modalData.setor}</h3>
                  <p className="text-[10px] text-red-500 font-black uppercase mt-1 tracking-widest">Trave {modalData.trave} • Ponto {modalData.ponto}</p>
                </div>
              </div>
              <button onClick={fecharModal} className={`${colors.subtext} hover:text-red-500 transition-colors`}><X size={24} /></button>
            </div>
            <div className="p-8">
              {!etapaFechamento ? (
                <div className="text-center space-y-8">
                  <div className={`p-6 rounded-3xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Falha Identificada:</span>
                    <h4 className="text-2xl font-black text-red-600 italic uppercase">"{modalData.falha}"</h4>
                  </div>
                  <button onClick={() => setEtapaFechamento(true)} className={`w-full py-5 ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} font-black rounded-2xl flex items-center justify-center gap-3 uppercase text-xs hover:scale-[1.02] transition-all shadow-xl`}>
                    Iniciar Reparo <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <textarea autoFocus placeholder="Descreva a solução aplicada..." className={`w-full ${colors.input} p-6 rounded-[2rem] outline-none focus:ring-2 focus:ring-green-500/20 min-h-[150px] text-sm resize-none transition-all shadow-inner`} value={solucaoTexto} onChange={(e) => setSolucaoTexto(e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setEtapaFechamento(false)} className={`py-5 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} ${colors.subtext} rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200 transition-colors`}>Voltar</button>
                    <button onClick={handleFinalizarChamado} disabled={enviando || !solucaoTexto.trim()} className="py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-green-600/20 disabled:opacity-30">
                      {enviando ? 'Enviando...' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`hidden md:flex w-64 border-r ${colors.sidebar} p-8 flex-col z-20 backdrop-blur-xl transition-all`}>
        <div className="flex items-center gap-4 mb-12 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl text-white group-hover:rotate-6 transition-transform">L</div>
          <div>
            <h1 className={`text-lg font-black italic tracking-tighter leading-none ${colors.text}`}>LENOVO</h1>
            <span className="text-[9px] text-red-600 font-black tracking-[0.2em] uppercase">Live Pro</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-3">
          <button onClick={() => navigate('/dashboard')} className={`w-full flex items-center gap-4 p-4 ${colors.subtext} font-black text-xs ${colors.hover} rounded-2xl transition-all`}>
            <LayoutDashboard size={20} /> DASHBOARD
          </button>
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-black italic text-xs shadow-xl shadow-red-500/20">
            <Eye size={20} /> LIVE MONITOR
          </div>
        </nav>

        {/* Botão de Toggle de Tema */}
        <button onClick={toggleTheme} className={`mt-auto flex items-center justify-between p-4 rounded-2xl border ${colors.sidebar} ${colors.hover} transition-all`}>
           <span className="text-[10px] font-black uppercase">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
           {theme === 'dark' ? <Moon size={18} className="text-red-500" /> : <Sun size={18} className="text-yellow-500" />}
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Activity size={20} className="text-red-600" />
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${colors.subtext}`}>Real-time Telemetry</span>
            </div>
            <h2 className={`text-6xl font-black uppercase italic tracking-tighter leading-none ${colors.text}`}>
               MONITOR<span className="text-red-600">.</span>
            </h2>
          </div>
          
          <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-red-600/5' : 'bg-red-50'} rounded-3xl border ${theme === 'dark' ? 'border-red-600/20' : 'border-red-100'} flex items-center gap-4 shadow-sm`}>
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </div>
            <span className="text-xs font-black text-red-600 uppercase tracking-tighter">
              {falhas.length} Ocorrências Ativas
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {setoresValidos.map(setor => {
            const numTravesAfetadas = countTravesComFalha(setor);
            const isSetorAberto = setorAberto === setor;
            const itensCarrinho = isSetorAberto ? calcularCarrinhoSetor(setor) : [];

            return (
              <div key={setor} className={`border ${colors.card} rounded-[3rem] transition-all duration-300 shadow-xl overflow-hidden ${numTravesAfetadas > 0 && theme === 'light' ? 'bg-white border-red-100' : ''}`}>
                <button onClick={() => {setSetorAberto(isSetorAberto ? null : setor); setTraveAberta(null);}} 
                  className={`w-full p-6 md:p-8 flex items-center justify-between transition-all ${colors.hover}`}>
                  <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-[1.5rem] transition-all shadow-inner ${numTravesAfetadas > 0 ? 'bg-gradient-to-br from-red-600 to-rose-600 text-white' : (theme === 'dark' ? 'bg-white/5 text-gray-700' : 'bg-slate-100 text-slate-300')}`}>
                      <HardDrive size={28} />
                    </div>
                    <div className="text-left">
                      <span className={`font-black text-3xl uppercase italic tracking-tighter block leading-none ${colors.text}`}>{setor}</span>
                      <span className={`text-[10px] font-black uppercase mt-2 inline-flex items-center gap-2 ${numTravesAfetadas > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {numTravesAfetadas > 0 ? (
                          <><Zap size={12} fill="currentColor" /> {numTravesAfetadas} Traves Críticas</>
                        ) : 'Sistema em Conformidade'}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl ${isSetorAberto ? 'bg-red-600 text-white' : colors.hover}`}>
                    <ChevronDown size={24} className={`transition-transform duration-500 ${isSetorAberto ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isSetorAberto && (
                  <div className="px-8 pb-8 space-y-8 animate-in slide-in-from-top-4 duration-500">
                    {/* Carrinho / Insumos */}
                    {itensCarrinho.length > 0 && (
                      <div className={`${theme === 'dark' ? 'bg-black/40' : 'bg-slate-50'} border ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} p-8 rounded-[2.5rem] relative overflow-hidden`}>
                        <div className="flex items-center gap-3 mb-6">
                           <Box size={18} className="text-red-600" />
                           <h4 className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>Insumos Necessários</h4>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {itensCarrinho.map(([peca, qtd]) => (
                            <div key={peca} className={`${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'} px-5 py-3 rounded-2xl flex items-center gap-3 border shadow-sm group hover:border-red-500 transition-colors`}>
                              <span className="text-lg font-black text-red-600">{qtd}x</span>
                              <span className={`text-[10px] font-black uppercase ${colors.subtext} group-hover:text-red-600`}>{peca}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lista de Traves */}
                    <div className="grid grid-cols-1 gap-3">
                      {[...Array(23)].map((_, i) => {
                        const tNum = i + 1;
                        const chamadosDaTrave = falhas.filter(f => normalizar(f.setor) === normalizar(setor) && String(f.trave) === String(tNum));
                        const isTraveAberta = traveAberta === tNum;
                        
                        return (
                          <div key={tNum} className="group/trave">
                            <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${chamadosDaTrave.length > 0 ? (theme === 'dark' ? 'bg-red-600/5 border-red-600/30' : 'bg-red-50/50 border-red-200') : (theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50/50 border-slate-100')}`}>
                              <button onClick={() => setTraveAberta(isTraveAberta ? null : tNum)} className="flex-1 flex items-center justify-between px-4 py-2">
                                <span className={`flex items-center gap-3 text-xs font-black uppercase italic ${chamadosDaTrave.length > 0 ? 'text-red-600' : colors.subtext}`}>
                                    <Hash size={16} /> Trave {tNum.toString().padStart(2, '0')}
                                </span>
                                {chamadosDaTrave.length > 0 && (
                                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-red-600/20">
                                    {chamadosDaTrave.length} {chamadosDaTrave.length === 1 ? 'ALERTA' : 'ALERTAS'}
                                  </span>
                                )}
                              </button>
                              {chamadosDaTrave.length > 0 && (
                                <button onClick={() => abrirModalLote(setor, tNum)} className={`px-5 py-2.5 ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all shadow-md`}>
                                  Resolver Trave
                                </button>
                              )}
                            </div>

                            {/* Grid de Pontos */}
                            {isTraveAberta && (
                              <div className={`p-6 mt-4 ${theme === 'dark' ? 'bg-black/60 border-white/5' : 'bg-slate-100/50 border-slate-200'} rounded-[2rem] grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-15 gap-3 border shadow-inner animate-in fade-in zoom-in-95 duration-300`}>
                                {[...Array(15)].map((_, j) => {
                                  const pNum = j + 1;
                                  const dadosPonto = getDadosPonto(setor, tNum, pNum);
                                  return (
                                    <button 
                                      key={pNum} 
                                      onClick={() => { if (dadosPonto) { setModalData(dadosPonto); setModoLote(false); } }} 
                                      className={`aspect-square rounded-[1rem] flex flex-col items-center justify-center text-[11px] font-black border transition-all hover:scale-110 active:scale-90 ${dadosPonto ? 'bg-gradient-to-br from-red-600 to-rose-600 border-red-400 text-white shadow-lg shadow-red-600/30 animate-pulse' : (theme === 'dark' ? 'bg-white/5 border-transparent text-gray-800' : 'bg-white border-slate-200 text-slate-300')}`}
                                    >
                                      <span className="text-[7px] opacity-50 mb-0.5 tracking-tighter">PT</span>
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Grid Responsivo Customizado */}
      <style dangerouslySetInnerHTML={{ __html: `
        .lg\\:grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }
        @media (max-width: 1280px) { .lg\\:grid-cols-15 { grid-template-columns: repeat(10, minmax(0, 1fr)); } }
        @media (max-width: 1024px) { .lg\\:grid-cols-15 { grid-template-columns: repeat(8, minmax(0, 1fr)); } }
        @media (max-width: 768px) { .lg\\:grid-cols-15 { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
          background: ${theme === 'dark' ? '#222' : '#ddd'}; 
          border-radius: 20px; 
        }
        ::-webkit-scrollbar-thumb:hover { background: #ff1111; }
      `}} />
    </div>
  );
};

export default VisualizarFalhas;