import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Zap, Hash, Loader2, Check, CheckCircle2, Layout, Cpu, Sun, Moon } from 'lucide-react';
import { LISTA_SETORES } from '../data/setores';
import { FALHAS_COMUNS } from '../data/falhasComuns';
import { inserirRegistrosFalha, listarChamadosAbertosPorSetor } from '../services/supabaseSecure';
import { getSessionUser, isAdminUser } from '../lib/session';
import AppBottomNav from '../components/AppBottomNav';

const listaPontos = [...Array(15)].map((_, i) => (i + 1).toString());

const Registrar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setor = (() => {
    const s = location.state?.setor;
    return s && LISTA_SETORES.includes(s) ? s : LISTA_SETORES[0] ?? 'Setor não selecionado';
  })();

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [chamadosAbertos, setChamadosAbertos] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [formData, setFormData] = useState({ trave: '', pontos: [], falhas: [] });
  const isAdmin = isAdminUser(getSessionUser() || { role: 'colaborador' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await listarChamadosAbertosPorSetor(setor);
      if (!cancelled && !error) setChamadosAbertos(data || []);
    })();
    return () => { cancelled = true; };
  }, [setor]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const traveTemErro = (numTrave) => chamadosAbertos.some(c => String(c.trave) === String(numTrave));

  const getInfoPonto = (numPonto) => {
    if (!formData.trave) return null;
    const chamadosDestePonto = chamadosAbertos.filter(c => {
      if (String(c.trave) !== String(formData.trave)) return false;
      const pStr = String(c.ponto || "");
      if (pStr === "1-15 (Inteira)") return true;
      const pontosArray = pStr.split(',').map(p => p.replace('Ponto ', '').trim());
      return pontosArray.includes(String(numPonto));
    });
    if (chamadosDestePonto.length === 0) return null;
    const todasFalhas = chamadosDestePonto.map(c => c.falha).join(', ');
    return [...new Set(todasFalhas.split(', ').map(f => f.trim()))].join(', ');
  };

  const togglePonto = (ponto) => {
    setFormData(prev => ({
      ...prev,
      pontos: prev.pontos.includes(ponto) ? prev.pontos.filter(p => p !== ponto) : [...prev.pontos, ponto]
    }));
  };

  const toggleFalha = (falha) => {
    setFormData(prev => ({
      ...prev,
      falhas: prev.falhas.includes(falha) ? prev.falhas.filter(f => f !== falha) : [...prev.falhas, falha]
    }));
  };

  const selecionarTodosPontos = () => {
    setFormData(prev => ({
      ...prev,
      pontos: prev.pontos.length === listaPontos.length ? [] : listaPontos
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.falhas.length === 0 || formData.pontos.length === 0 || !formData.trave) return;
    setLoading(true);
    try {
      const { error } = await inserirRegistrosFalha(
        setor,
        formData.trave,
        formData.pontos,
        formData.falhas
      );
      if (error) throw error;
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      alert(err?.message || 'Erro ao registrar.');
      setLoading(false);
    }
  };

  // Configurações de cores baseadas no tema
  const colors = {
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    card: theme === 'dark' ? 'bg-white/[0.03] border-white/10 shadow-black' : 'bg-white border-slate-100 shadow-slate-200/50',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-400' : 'text-slate-500',
    buttonInativo: theme === 'dark' ? 'bg-white/5 border-white/5 text-gray-500' : 'bg-slate-100 border-slate-100 text-slate-400',
    hover: theme === 'dark' ? 'hover:border-white/20' : 'hover:border-slate-300'
  };

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} p-4 md:p-10 pb-24 md:pb-10 font-sans relative transition-colors duration-500 overflow-x-hidden`}>
      
      {/* Background Decorativo */}
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${theme === 'dark' ? 'bg-red-600/10' : 'bg-red-500/10'} blur-[120px] rounded-full animate-pulse`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] ${theme === 'dark' ? 'bg-blue-600/5' : 'bg-blue-500/10'} blur-[100px] rounded-full`} />

      {isSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-12 animate-in zoom-in duration-300">
                <Check size={48} className="text-black stroke-[3px]" />
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">Registro Finalizado</h2>
            </div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-12">
          <button onClick={() => navigate('/dashboard')} className={`group flex items-center gap-3 ${colors.subtext} hover:text-red-600 transition-all`}>
            <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} border group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all`}>
              <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Voltar ao Início</span>
          </button>

          <button onClick={toggleTheme} className={`p-3 rounded-2xl border ${colors.card} hover:scale-105 transition-all`}>
            {theme === 'dark' ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-red-600" />}
          </button>
        </div>

        {/* Brand Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-12 bg-red-600"></div>
                <span className="text-red-600 text-[11px] font-black uppercase tracking-[0.2em]">Diagnostic Terminal</span>
            </div>
            <h2 className={`text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none ${colors.text}`}>{setor}</h2>
          </div>
          <div className={`flex items-center gap-4 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'} border px-6 py-3 rounded-3xl backdrop-blur-md shadow-sm`}>
              <Cpu size={20} className="text-red-600" />
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-wider ${colors.text}`}>Lenovo System</span>
                <span className={`text-[8px] font-bold ${colors.subtext} uppercase`}>Hardware Engine v3.0</span>
              </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Coluna Esquerda */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Seção Trave */}
            <div className={`${colors.card} backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl`}>
              <div className="flex items-center justify-between mb-8 px-2">
                <label className={`flex items-center gap-3 text-[11px] font-black ${colors.subtext} uppercase tracking-widest`}>
                  <Hash size={18} className="text-red-600" /> Identificação da Trave
                </label>
                {formData.trave && (
                  <span className="text-[10px] font-black bg-red-600 text-white px-3 py-1 rounded-lg animate-in fade-in zoom-in">
                    TRAVE {formData.trave} SELECIONADA
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {[...Array(23)].map((_, i) => {
                  const num = i + 1;
                  const erro = traveTemErro(num);
                  const isSelected = String(formData.trave) === String(num);
                  return (
                    <button key={num} type="button" onClick={() => setFormData({...formData, trave: num, pontos: []})}
                      className={`h-16 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden font-black text-xl ${
                        isSelected 
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 scale-105' 
                        : erro 
                        ? (theme === 'dark' ? 'bg-red-950/30 border-red-600/50 text-red-500' : 'bg-red-50 border-red-200 text-red-600') 
                        : `${colors.buttonInativo} ${colors.hover}`
                      }`}>
                      {num}
                      {erro && !isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-sm"></div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seção Pontos */}
            <div className={`${colors.card} backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl transition-all duration-500 ${!formData.trave ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-8 px-2">
                <label className={`flex items-center gap-3 text-[11px] font-black ${colors.subtext} uppercase tracking-widest`}>
                  <Layout size={18} className="text-blue-500" /> Slots da Unidade
                </label>
                <button type="button" onClick={selecionarTodosPontos} className="text-[10px] font-black text-blue-600 uppercase hover:text-red-600 transition-colors">
                  {formData.pontos.length === listaPontos.length ? "[ Desmarcar Todos ]" : "[ Selecionar Todos ]"}
                </button>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                {listaPontos.map((p) => {
                  const selecionado = formData.pontos.includes(p);
                  const falhasNoPonto = getInfoPonto(p);
                  return (
                    <button key={p} type="button" onClick={() => togglePonto(p)}
                      className={`relative h-14 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center group font-black ${
                        selecionado 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                        : falhasNoPonto 
                        ? (theme === 'dark' ? 'bg-red-900/20 border-red-600 text-red-500' : 'bg-red-50 border-red-300 text-red-600') 
                        : `${colors.buttonInativo} ${colors.hover}`
                      }`}>
                      {p}
                      {falhasNoPonto && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 shadow-2xl transition-all pointer-events-none uppercase font-black italic">
                          {falhasNoPonto}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="lg:col-span-5 space-y-8 flex flex-col">
            <div className={`${colors.card} p-8 rounded-[3rem] shadow-2xl flex-1`}>
              <label className={`flex items-center gap-3 text-[11px] font-black ${colors.subtext} uppercase tracking-widest mb-10`}>
                <Zap size={18} className="text-yellow-500" /> Tipos de Ocorrência
              </label>
              
              <div className="space-y-3">
                {FALHAS_COMUNS.map((falha) => {
                  const isSelected = formData.falhas.includes(falha);
                  return (
                    <button key={falha} type="button" onClick={() => toggleFalha(falha)}
                      className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between font-black uppercase tracking-tighter text-sm ${
                        isSelected 
                        ? 'bg-gradient-to-r from-red-600 to-rose-500 border-red-400 text-white shadow-xl translate-x-2' 
                        : `${colors.buttonInativo} hover:bg-slate-200/50`
                      }`}>
                      {falha}
                      {isSelected ? <CheckCircle2 size={20} /> : <div className={`w-6 h-6 rounded-full border-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={formData.falhas.length === 0 || !formData.trave || formData.pontos.length === 0 || loading}
              className={`w-full p-10 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 transition-all duration-500 relative overflow-hidden group shadow-2xl ${
                loading ? 'bg-slate-800' : `${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} hover:bg-red-600 hover:text-white active:scale-95 disabled:opacity-20`
              }`}>
              {loading ? (
                <Loader2 className="animate-spin" size={36} />
              ) : (
                <>
                  <Save size={32} className="group-hover:rotate-12 transition-transform" />
                  <span className="italic uppercase tracking-tighter">Registrar Falha</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </div>
        </form>
      </div>
      <AppBottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default Registrar;
