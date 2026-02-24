import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Zap, Hash, Loader2, Check, AlertTriangle, CheckCircle2, Layout, Cpu } from 'lucide-react';
import { supabase } from '../services/supabase'; 

const Registrar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setor = location.state?.setor || "Setor não selecionado";

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  const [chamadosAbertos, setChamadosAbertos] = useState([]); 
  const [formData, setFormData] = useState({
    trave: '',
    pontos: [], 
    falhas: []
  });

  const falhasComuns = ["Rede (RJ45)", "VGA", "AC Adapter", "Energia Y", "Pino Retangular", "HDMI", "DisplayPort"];
  const listaPontos = [...Array(15)].map((_, i) => (i + 1).toString());

  useEffect(() => {
    const buscarChamadosAtivos = async () => {
      if (!setor) return;
      const { data, error } = await supabase
        .from('registros_falhas')
        .select('trave, ponto, falha')
        .eq('setor', setor)
        .eq('status', 'aberto')
        .not('trave', 'is', null)
        .not('ponto', 'is', null);

      if (!error) setChamadosAbertos(data || []);
    };
    buscarChamadosAtivos();
  }, [setor]);

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
    const userSession = JSON.parse(localStorage.getItem('lenovo_user'));

    try {
      let inserts = [];
      const falhasTexto = formData.falhas.join(', ');
      
      if (formData.pontos.length === listaPontos.length) {
        inserts.push({
          usuario: userSession?.username || 'Técnico',
          setor: setor,
          trave: formData.trave,
          ponto: "1-15 (Inteira)",
          falha: falhasTexto,
          status: 'aberto'
        });
      } else {
        inserts = formData.pontos.map(p => ({
          usuario: userSession?.username || 'Técnico',
          setor: setor,
          trave: formData.trave,
          ponto: `Ponto ${p}`,
          falha: falhasTexto,
          status: 'aberto'
        }));
      }

      const { error } = await supabase.from('registros_falhas').insert(inserts);
      if (error) throw error;
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      alert('Erro: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 md:p-10 font-sans relative overflow-hidden">
      
      {/* Background Decorativo - Efeito de profundidade flutuante */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full" />

      {isSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)] rotate-12 animate-in zoom-in duration-300">
                <Check size={48} className="text-black stroke-[3px]" />
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter italic">Processado com Sucesso!</h2>
            </div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header Navigation */}
        <button onClick={() => navigate('/dashboard')} className="group flex items-center gap-3 text-gray-400 hover:text-white mb-12 transition-all">
          <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-red-600 group-hover:border-red-600 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em]">Back to System</span>
        </button>

        {/* Brand Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="h-[2px] w-8 bg-red-600"></div>
                <span className="text-red-600 text-[10px] font-black uppercase tracking-widest">Active Terminal</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">{setor}</h2>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                <Cpu size={16} className="text-red-600 animate-spin-slow" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Hardware Diagnostic v2.0</span>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Coluna Esquerda: Seleção de Trave e Pontos */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Seção Trave */}
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl">
              <label className="flex items-center gap-3 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 px-2">
                <Hash size={16} className="text-red-600" /> Rack ID (Trave)
              </label>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {[...Array(23)].map((_, i) => {
                  const num = i + 1;
                  const erro = traveTemErro(num);
                  const isSelected = String(formData.trave) === String(num);
                  return (
                    <button key={num} type="button" onClick={() => setFormData({...formData, trave: num, pontos: []})}
                      className={`h-14 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden font-black text-lg ${
                        isSelected 
                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-105' 
                        : erro 
                        ? 'bg-red-950/30 border-red-600/50 text-red-500 animate-pulse' 
                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                      }`}>
                      {num}
                      {erro && !isSelected && <div className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,1)]"></div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seção Pontos */}
            <div className={`bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl transition-all duration-500 ${!formData.trave ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-6 px-2">
                <label className="flex items-center gap-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  <Layout size={16} className="text-blue-500" /> Unit Slots (Pontos)
                </label>
                <button type="button" onClick={selecionarTodosPontos} className="text-[10px] font-black text-blue-500 uppercase hover:text-white transition-colors">
                  {formData.pontos.length === listaPontos.length ? "[ Deselect All ]" : "[ Select All ]"}
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
                        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                        : falhasNoPonto 
                        ? 'bg-red-950/20 border-red-600 text-red-600' 
                        : 'bg-white/5 border-white/5 text-gray-600 hover:border-white/20'
                      }`}>
                      {p}
                      {falhasNoPonto && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 shadow-xl transition-all pointer-events-none uppercase tracking-tighter">
                          {falhasNoPonto}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Falhas e Submit */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <div className="bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl flex-1">
              <label className="flex items-center gap-3 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8">
                <Zap size={16} className="text-yellow-500" /> Failure Type
              </label>
              
              <div className="space-y-3">
                {falhasComuns.map((falha) => {
                  const isSelected = formData.falhas.includes(falha);
                  return (
                    <button key={falha} type="button" onClick={() => toggleFalha(falha)}
                      className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between font-black uppercase tracking-tighter text-sm ${
                        isSelected 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 border-red-400 text-white shadow-lg translate-x-2' 
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                      }`}>
                      {falha}
                      {isSelected ? <CheckCircle2 size={18} /> : <div className="w-5 h-5 rounded-full border-2 border-white/10" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={formData.falhas.length === 0 || !formData.trave || formData.pontos.length === 0 || loading}
              className={`w-full p-8 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 transition-all duration-500 relative overflow-hidden group shadow-2xl ${
                loading ? 'bg-gray-800' : 'bg-white text-black hover:bg-red-600 hover:text-white active:scale-95 disabled:opacity-20 disabled:grayscale'
              }`}>
              {loading ? (
                <Loader2 className="animate-spin" size={32} />
              ) : (
                <>
                  <Save size={28} className="group-hover:rotate-12 transition-transform" />
                  <span className="italic uppercase tracking-tighter">Execute System log</span>
                </>
              )}
              {/* Overlay de brilho no botão */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(220, 38, 38, 0.5);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};

export default Registrar;