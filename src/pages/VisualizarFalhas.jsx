import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, HardDrive, Hash, ChevronDown, 
  Eye, X, ShieldAlert, ArrowRight, Sun, Moon,
  Box, Zap, Activity, Bell, BellRing, Octagon, Monitor
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
  const [showNotifications, setShowNotifications] = useState(false);
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

  const getStatusTrave = (chamados) => {
    const temTraveParada = chamados.some(f => 
        normalizar(f.ponto).includes('travetoda') || 
        String(f.ponto).includes('1-15')
    );
    const total = chamados.length;

    if (temTraveParada) return { label: 'TRAVE PARADA', color: 'bg-purple-600 animate-pulse', textColor: 'text-white', level: 4 };
    if (total >= 11) return { label: 'URGÊNCIA (11-15)', color: 'bg-red-600', textColor: 'text-white', level: 3 };
    if (total >= 6) return { label: 'PRIORIDADE (6-10)', color: 'bg-orange-500', textColor: 'text-white', level: 2 };
    if (total >= 1) return { label: 'ATENÇÃO (1-5)', color: 'bg-yellow-500', textColor: 'text-black', level: 1 };
    return { label: 'OPERACIONAL', color: 'bg-emerald-500', textColor: 'text-white', level: 0 };
  };

  const alertasCriticos = falhas.filter(f => 
    normalizar(f.ponto).includes('travetoda') || 
    String(f.ponto).includes('1-15')
  );

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
    setModalData({ ids: chamadosDaTrave.map(f => f.id), setor: s, trave: t, ponto: "Todos", falha: "Reparo Geral da Trave", usuario: "Equipe" });
    setModoLote(true);
  };

  const fecharModal = () => { setModalData(null); setEtapaFechamento(false); setSolucaoTexto(''); setModoLote(false); };

  const getDadosPonto = (s, t, p) => {
    const chamadosNoPonto = falhas.filter(f => {
      if (normalizar(f.setor) !== normalizar(s) || String(f.trave) !== String(t)) return false;
      const pStr = String(f.ponto);
      const pNorm = normalizar(pStr);
      const isInteira = pNorm.includes("travetoda") || pStr.includes("1-15");
      const isEstePonto = new RegExp(`(^|,|\\s|ponto)${p}($|,|\\s)`).test(pNorm);
      return isInteira || isEstePonto;
    });

    if (chamadosNoPonto.length > 0) {
      const falhaConcatenada = chamadosNoPonto.map(f => f.falha).join(' + ');
      return { 
        id: chamadosNoPonto[0].id, 
        ids: chamadosNoPonto.map(f => f.id), 
        setor: s, 
        trave: t, 
        ponto: p, 
        falha: falhaConcatenada,
        isMonitor: falhaConcatenada.toLowerCase().includes('monitor')
      };
    }
    return null;
  };

  const countTravesComFalha = (s) => new Set(falhas.filter(f => normalizar(f.setor) === normalizar(s)).map(f => String(f.trave))).size;

  const colors = {
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200',
    card: theme === 'dark' ? 'bg-[#080808] border-white/5 shadow-black/50' : 'bg-white border-slate-100 shadow-slate-200/50',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-500' : 'text-slate-400',
    hover: theme === 'dark' ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-100',
    input: theme === 'dark' ? 'bg-black border-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'
  };

  if (loading) return (
    <div className={`min-h-screen ${colors.bg} flex flex-col items-center justify-center`}>
      <div className="w-8 h-8 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-4" />
      <span className="text-red-600 font-black tracking-widest text-[9px] uppercase">Sincronizando</span>
    </div>
  );

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500`}>
      {/* SIDEBAR */}
      <aside className={`hidden md:flex w-56 border-r ${colors.sidebar} p-6 flex-col z-20 backdrop-blur-xl`}>
        <div className="flex items-center gap-3 mb-10 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl shadow-xl text-white">L</div>
          <div>
            <h1 className="text-md font-black italic tracking-tighter leading-none">LENOVO</h1>
            <span className="text-[8px] text-red-600 font-black tracking-widest uppercase">Live Pro</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => navigate('/dashboard')} className={`w-full flex items-center gap-3 p-3 ${colors.subtext} font-black text-[10px] ${colors.hover} rounded-xl transition-all`}>
            <LayoutDashboard size={18} /> DASHBOARD
          </button>
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-black italic text-[10px] shadow-lg shadow-red-500/20">
            <Eye size={18} /> LIVE MONITOR
          </div>
        </nav>

        <button onClick={toggleTheme} className={`mt-auto flex items-center justify-between p-3 rounded-xl border ${colors.sidebar} ${colors.hover}`}>
            <span className="text-[9px] font-black uppercase">{theme === 'dark' ? 'Dark' : 'Light'}</span>
            {theme === 'dark' ? <Moon size={16} className="text-red-500" /> : <Sun size={16} className="text-yellow-500" />}
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto z-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-red-600" />
              <span className={`text-[9px] font-black uppercase tracking-widest ${colors.subtext}`}>Real-time Telemetry</span>
            </div>
            <h2 className={`text-4xl font-black uppercase italic tracking-tighter leading-none ${colors.text}`}>
              MONITOR<span className="text-red-600">.</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-4 rounded-2xl transition-all relative border shadow-md ${alertasCriticos.length > 0 ? 'bg-purple-600 border-purple-400 text-white animate-bounce' : `${colors.card} ${colors.subtext}`}`}>
                  {alertasCriticos.length > 0 ? <BellRing size={20} /> : <Bell size={20} />}
                  {alertasCriticos.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-purple-600 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-purple-600">
                      {alertasCriticos.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-72 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl z-[120] overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[9px] font-black tracking-widest uppercase text-purple-500">Alertas Críticos</span>
                      <button onClick={() => setShowNotifications(false)} className="text-gray-500"><X size={16}/></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {alertasCriticos.map(alerta => (
                        <div key={alerta.id} className="p-4 border-b border-white/5 hover:bg-white/[0.02]">
                          <p className="text-[11px] font-black uppercase text-white">{alerta.setor} • T{alerta.trave}</p>
                          <p className="text-[9px] text-red-500 font-bold uppercase">{alerta.falha}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>

             <div className={`px-4 py-3 ${theme === 'dark' ? 'bg-red-600/5' : 'bg-red-50'} rounded-2xl border ${theme === 'dark' ? 'border-red-600/20' : 'border-red-100'} flex items-center gap-3`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[10px] font-black text-red-600 uppercase italic">{falhas.length} Falhas Ativas</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {setoresValidos.map(setor => {
            const numTravesAfetadas = countTravesComFalha(setor);
            const isSetorAberto = setorAberto === setor;
            const itensCarrinho = isSetorAberto ? calcularCarrinhoSetor(setor) : [];
            const setorTemParadaCritica = falhas.some(f => 
                normalizar(f.setor) === normalizar(setor) && 
                (normalizar(f.ponto).includes('travetoda') || String(f.ponto).includes('1-15'))
            );

            return (
              <div key={setor} className={`border ${colors.card} rounded-[2rem] transition-all duration-300 ${setorTemParadaCritica ? 'border-purple-600/40 ring-1 ring-purple-600/10' : ''}`}>
                <button onClick={() => {setSetorAberto(isSetorAberto ? null : setor); setTraveAberta(null);}} 
                  className={`w-full p-4 md:p-5 flex items-center justify-between transition-all ${colors.hover}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl shadow-inner ${setorTemParadaCritica ? 'bg-purple-600 text-white' : (numTravesAfetadas > 0 ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-700')}`}>
                      {setorTemParadaCritica ? <Octagon size={20} /> : <HardDrive size={20} />}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-xl uppercase italic tracking-tighter ${colors.text}`}>{setor}</span>
                        {setorTemParadaCritica && <span className="bg-purple-600 text-[7px] font-black px-2 py-0.5 rounded-full text-white">PARADA</span>}
                      </div>
                      <span className={`text-[9px] font-black uppercase mt-1 flex items-center gap-1.5 ${numTravesAfetadas > 0 ? (setorTemParadaCritica ? 'text-purple-400' : 'text-red-500') : 'text-gray-500'}`}>
                        {numTravesAfetadas > 0 ? <><Zap size={10} fill="currentColor" /> {numTravesAfetadas} Traves Afetadas</> : 'Estável'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown size={20} className={`transition-transform duration-500 ${isSetorAberto ? 'rotate-180' : ''} ${colors.subtext}`} />
                </button>

                {isSetorAberto && (
                  <div className="px-6 pb-6 space-y-6 animate-in slide-in-from-top-2">
                    {itensCarrinho.length > 0 && (
                      <div className={`${theme === 'dark' ? 'bg-black/20' : 'bg-slate-50'} p-5 rounded-2xl border ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-2 mb-3">
                           <Box size={14} className="text-red-600" />
                           <h4 className="text-[9px] font-black uppercase tracking-widest">Insumos</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {itensCarrinho.map(([peca, qtd]) => (
                            <div key={peca} className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
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
                        const chamadosDaTrave = falhas.filter(f => normalizar(f.setor) === normalizar(setor) && String(f.trave) === String(tNum));
                        const status = getStatusTrave(chamadosDaTrave);
                        const isTraveAberta = traveAberta === tNum;
                        
                        return (
                          <div key={tNum}>
                            <div className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${chamadosDaTrave.length > 0 ? `border-${status.color.split('-')[1]}-500/20 bg-white/[0.01]` : 'border-transparent'}`}>
                              <button onClick={() => setTraveAberta(isTraveAberta ? null : tNum)} className="flex-1 flex items-center justify-between px-3">
                                <span className={`flex items-center gap-2 text-[10px] font-black uppercase italic ${chamadosDaTrave.length > 0 ? (status.level === 4 ? 'text-purple-500' : 'text-red-600') : 'text-gray-600'}`}>
                                    <Hash size={14} /> Trave {tNum.toString().padStart(2, '0')}
                                </span>
                                {chamadosDaTrave.length > 0 && (
                                  <span className={`px-3 py-1 ${status.color} ${status.textColor} text-[8px] font-black rounded-full`}>
                                    {status.label}
                                  </span>
                                )}
                              </button>
                              {chamadosDaTrave.length > 0 && (
                                <button onClick={() => abrirModalLote(setor, tNum)} className="px-3 py-1.5 bg-white text-black rounded-lg font-black text-[8px] uppercase hover:bg-red-600 hover:text-white transition-all">
                                  Resolver
                                </button>
                              )}
                            </div>

                            {isTraveAberta && (
                              <div className="p-4 mt-2 bg-black/40 rounded-2xl grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-15 gap-2 border border-white/5 shadow-inner">
                                {[...Array(15)].map((_, j) => {
                                  const pNum = j + 1;
                                  const dadosPonto = getDadosPonto(setor, tNum, pNum);
                                  const isInteira = dadosPonto && (normalizar(dadosPonto.falha).includes('travetoda') || String(falhas.find(f => f.id === dadosPonto.id)?.ponto).includes('1-15'));
                                  
                                  let bgClass = theme === 'dark' ? 'bg-white/5 text-gray-700' : 'bg-white border-slate-200 text-slate-300';
                                  if (dadosPonto) {
                                    if (isInteira) bgClass = 'bg-purple-600 text-white animate-pulse shadow-lg shadow-purple-500/20';
                                    else if (dadosPonto.isMonitor) bgClass = 'bg-orange-500 text-white shadow-lg shadow-orange-500/20';
                                    else bgClass = 'bg-red-600 text-white shadow-lg shadow-red-600/20';
                                  }

                                  return (
                                    <div key={pNum} className="relative group">
                                      <button 
                                        onClick={() => { if (dadosPonto) { setModalData(dadosPonto); setModoLote(false); } }} 
                                        className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-[9px] font-black transition-all duration-300 group-hover:scale-110 group-hover:z-10 ${bgClass}`}
                                      >
                                        <span className="text-[5px] opacity-50 mb-0">PT</span>
                                        {pNum}
                                      </button>

                                      {/* TOOLTIP DESIGNER */}
                                      {dadosPonto && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#0f0f0f]/95 backdrop-blur-md border border-white/10 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] pointer-events-none shadow-2xl">
                                          <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isInteira ? 'bg-purple-500' : 'bg-red-500'}`} />
                                            <span className="text-[7px] font-black uppercase tracking-tighter text-gray-500">Status de Falha</span>
                                          </div>
                                          <p className="text-[10px] font-bold text-white leading-tight uppercase italic">
                                            {dadosPonto.falha}
                                          </p>
                                          <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-[6px] font-black text-red-600 uppercase">Clique para tratar</span>
                                            <ArrowRight size={8} className="text-white" />
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {modalData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`${theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-white'} border border-white/10 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95`}>
            <div className={`p-6 flex justify-between items-center ${etapaFechamento ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${etapaFechamento ? 'bg-green-500' : 'bg-red-600'} text-white`}>
                   {modalData.isMonitor ? <Monitor size={20} /> : <ShieldAlert size={20} />}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase italic leading-none">{modalData.setor}</h3>
                  <p className="text-[8px] font-black uppercase mt-1 tracking-widest opacity-60">T{modalData.trave} • Ponto {modalData.ponto}</p>
                </div>
              </div>
              <button onClick={fecharModal} className="text-gray-500 hover:text-red-500"><X size={20} /></button>
            </div>
            <div className="p-6">
              {!etapaFechamento ? (
                <div className="text-center space-y-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <span className="text-[8px] text-gray-500 font-bold uppercase block mb-1">Causa da Falha:</span>
                    <h4 className="text-lg font-black italic uppercase text-red-600 leading-tight">"{modalData.falha}"</h4>
                  </div>
                  <button onClick={() => setEtapaFechamento(true)} className="w-full py-4 bg-white text-black font-black rounded-xl flex items-center justify-center gap-2 uppercase text-[10px] hover:scale-[1.02] transition-all shadow-xl">
                    Reparar Falha <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea autoFocus placeholder="Relatório de solução..." className={`w-full ${colors.input} p-4 rounded-xl outline-none min-h-[100px] text-[11px] resize-none transition-all`} value={solucaoTexto} onChange={(e) => setSolucaoTexto(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setEtapaFechamento(false)} className="py-3 bg-white/5 text-[9px] font-black uppercase rounded-xl">Voltar</button>
                    <button onClick={handleFinalizarChamado} disabled={enviando || !solucaoTexto.trim()} className="py-3 bg-green-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg disabled:opacity-30">
                      {enviando ? '...' : 'Concluir'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .lg\\:grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }
        @media (max-width: 1280px) { .lg\\:grid-cols-15 { grid-template-columns: repeat(10, minmax(0, 1fr)); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default VisualizarFalhas;