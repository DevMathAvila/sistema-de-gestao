import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Zap, Hash, Loader2, Check, CheckCircle2, AlertCircle } from 'lucide-react';
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
        .eq('status', 'aberto');

      if (!error) setChamadosAbertos(data || []);
    };
    buscarChamadosAtivos();
  }, [setor]);

  const traveTemErro = (numTrave) => {
    return chamadosAbertos.some(c => String(c.trave) === String(numTrave));
  };

  // LÓGICA CORRIGIDA: Agora ele acumula todas as falhas encontradas para o mesmo ponto
  const getInfoPonto = (numPonto) => {
    if (!formData.trave) return null;
    
    // Filtra todos os chamados que pertencem a esta trave e este ponto
    const chamadosDestePonto = chamadosAbertos.filter(c => {
      if (String(c.trave) !== String(formData.trave)) return false;
      const pStr = String(c.ponto);
      return pStr.includes("Inteira") || pStr.includes(`Ponto ${numPonto}`) || pStr.split(',').map(s => s.trim()).includes(numPonto);
    });

    if (chamadosDestePonto.length === 0) return null;

    // Une todas as falhas encontradas (ex: "RJ45" + "VGA") removendo duplicatas
    const todasFalhas = chamadosDestePonto.map(c => c.falha).join(', ');
    const listaUnica = [...new Set(todasFalhas.split(', ').map(f => f.trim()))];
    
    return listaUnica.join(', ');
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
    if (formData.falhas.length === 0 || formData.pontos.length === 0) return;
    
    setLoading(true);
    const userSession = JSON.parse(localStorage.getItem('lenovo_user'));

    try {
      const pontosFormatados = formData.pontos.length === listaPontos.length 
        ? "1-15 (Inteira)" 
        : formData.pontos.sort((a,b) => a-b).map(p => `Ponto ${p}`).join(', ');

      const { error } = await supabase
        .from('registros_falhas')
        .insert([{ 
          usuario: userSession?.username || 'Técnico Desconhecido',
          setor: setor,
          trave: formData.trave,
          ponto: pontosFormatados,
          falha: formData.falhas.join(', '), 
          status: 'aberto'
        }]);

      if (error) throw error;
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      alert('Erro: ' + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans selection:bg-red-500/30">
      {isSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
           <div className="text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(34,197,94,0.6)]">
                <Check size={48} className="text-white stroke-[4px]" />
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter">Registrado!</h2>
           </div>
        </div>
      )}

      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Painel
      </button>

      <div className="max-w-2xl mx-auto">
        <header className="mb-10 border-l-4 border-red-600 pl-6">
          <h2 className="text-5xl font-black uppercase tracking-tighter italic">{setor}</h2>
          <p className="text-gray-500 mt-1 font-medium">Diagnóstico e Reporte de Falhas</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#0A0A0A] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
          
          {/* SELEÇÃO DE TRAVE NEON */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">
              <Hash size={14} className="text-red-600" /> Localização / Trave
            </label>
            <select 
              required
              className={`w-full bg-black border-2 p-5 rounded-2xl focus:outline-none appearance-none cursor-pointer transition-all duration-500 text-sm font-black ${
                traveTemErro(formData.trave) 
                ? 'border-red-600 text-red-500 shadow-[0_0_25px_rgba(220,38,38,0.2)]' 
                : 'border-white/5 text-white hover:border-white/20'
              }`}
              value={formData.trave}
              onChange={(e) => setFormData({...formData, trave: e.target.value, pontos: []})}
            >
              <option value="">Selecione a trave...</option>
              {[...Array(23)].map((_, i) => {
                const num = i + 1;
                const erro = traveTemErro(num);
                return (
                  <option key={num} value={num} className="bg-black text-white">
                    TRAVE {num.toString().padStart(2, '0')} {erro ? '⚠️ PENDENTE' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* GRID DE PONTOS COM FLAGS E TOOLTIP ACUMULATIVO */}
          <div className="space-y-4">
            <div className="flex justify-between items-end px-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                <Zap size={14} className="text-yellow-500" /> Pontos da Trave
              </label>
              <button type="button" onClick={selecionarTodosPontos} className="text-[10px] font-black text-red-600 uppercase hover:text-red-400 transition-colors">
                {formData.pontos.length === listaPontos.length ? "Desmarcar Tudo" : "Selecionar Tudo"}
              </button>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {listaPontos.map((p) => {
                const selecionado = formData.pontos.includes(p);
                const falhasNoPonto = getInfoPonto(p);
                
                return (
                  <button
                    key={p}
                    type="button"
                    disabled={!formData.trave}
                    onClick={() => togglePonto(p)}
                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 group ${
                      selecionado 
                        ? 'bg-red-600 border-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] scale-105 z-10' 
                        : falhasNoPonto 
                          ? 'bg-red-950/10 border-red-600 text-red-600 shadow-[0_0_15px_rgba(220,38,38,0.15)]' 
                          : 'bg-black border-white/5 text-gray-600 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-black tracking-tighter">PT {p}</span>
                    
                    {falhasNoPonto && (
                      <>
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                        {/* TOOLTIP NEON ACUMULATIVO */}
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap font-black shadow-[0_10px_20px_rgba(0,0,0,0.4)] z-50 border border-white/20 scale-90 group-hover:scale-100">
                          <span className="opacity-70 text-[8px] block mb-0.5 uppercase">Chamados Abertos:</span>
                          {falhasNoPonto}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CHECKLIST DE FALHAS */}
          <div className="pt-6 border-t border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {falhasComuns.map((falha) => {
              const isSelected = formData.falhas.includes(falha);
              return (
                <button
                  key={falha}
                  type="button"
                  onClick={() => toggleFalha(falha)}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between text-[10px] font-black uppercase tracking-tighter ${
                    isSelected 
                    ? 'bg-red-600 border-red-600 text-white shadow-lg scale-95' 
                    : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                  }`}
                >
                  {falha}
                  {isSelected && <CheckCircle2 size={14} />}
                </button>
              );
            })}
          </div>

          <button 
            type="submit"
            disabled={formData.falhas.length === 0 || !formData.trave || formData.pontos.length === 0 || loading}
            className={`w-full p-6 rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all mt-4 ${
              loading ? 'bg-gray-900 text-gray-700' : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_20px_40px_rgba(220,38,38,0.2)] active:scale-95'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : <Save size={28} />}
            <span className="italic uppercase tracking-tighter">{loading ? 'Sincronizando...' : 'Finalizar Registro'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registrar;