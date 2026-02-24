import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Zap, Hash, Loader2, Check, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabase'; 

const Registrar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setor = location.state?.setor || "Setor não selecionado";

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Novo estado para sucesso visual
  const [formData, setFormData] = useState({
    trave: '',
    ponto: '',
    falhas: []
  });

  const falhasComuns = ["Rede (RJ45)", "VGA", "AC Adapter", "Energia Y", "Pino Retangular", "HDMI", "DisplayPort"];

  const toggleFalha = (falha) => {
    setFormData(prev => ({
      ...prev,
      falhas: prev.falhas.includes(falha)
        ? prev.falhas.filter(f => f !== falha)
        : [...prev.falhas, falha]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.falhas.length === 0) return;
    
    setLoading(true);
    const userSession = JSON.parse(localStorage.getItem('lenovo_user'));

    try {
      const { error } = await supabase
        .from('registros_falhas')
        .insert([
          { 
            usuario: userSession?.username || 'Técnico Desconhecido',
            setor: setor,
            trave: formData.trave,
            ponto: formData.ponto === "todos" ? "1-15 (Inteira)" : formData.ponto,
            falha: formData.falhas.join(', '), 
            status: 'aberto'
          }
        ]);

      if (error) throw error;

      // EM VEZ DE ALERT: Ativa animação de sucesso
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert('Erro técnico: ' + error.message); // Mantive só pra erro crítico
      setLoading(false);
    }
  };

  // TELA DE SUCESSO (Renderização Condicional)
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
        <div className="animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
            <Check size={48} className="text-white stroke-[4px]" />
          </div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Registro Concluído</h2>
          <p className="text-gray-500 font-mono tracking-widest uppercase text-xs">Sincronizando com o banco de dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Painel
      </button>

      <div className="max-w-2xl mx-auto">
        <header className="mb-10 border-l-4 border-lenovoRed pl-6">
          <h2 className="text-4xl font-black uppercase tracking-tight">{setor}</h2>
          <p className="text-gray-400 mt-2">Diagnóstico de hardware e infraestrutura.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#0A0A0A] border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Indicador de carregamento sutil no topo do card */}
          {loading && <div className="absolute top-0 left-0 w-full h-1 bg-lenovoRed animate-pulse" />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest italic">
                <Hash size={14} /> Localização / Trave
              </label>
              <select 
                required
                disabled={loading}
                className="w-full bg-black border border-white/10 p-4 rounded-xl focus:border-lenovoRed outline-none appearance-none cursor-pointer hover:border-white/20 transition-all"
                value={formData.trave}
                onChange={(e) => setFormData({...formData, trave: e.target.value})}
              >
                <option value="">Selecione a trave</option>
                {[...Array(23)].map((_, i) => <option key={i+1} value={i+1}>TRAVE {i+1}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest italic">
                <Zap size={14} className="text-yellow-500" /> Ponto de Teste
              </label>
              <select 
                required
                disabled={loading}
                className="w-full bg-black border border-white/10 p-4 rounded-xl focus:border-lenovoRed outline-none appearance-none cursor-pointer hover:border-white/20 transition-all"
                value={formData.ponto}
                onChange={(e) => setFormData({...formData, ponto: e.target.value})}
              >
                <option value="">Selecione o ponto</option>
                <option value="todos" className="text-lenovoRed font-bold italic">⚠️ TODOS OS PONTOS</option>
                {[...Array(15)].map((_, i) => <option key={i+1} value={i+1}>PONTO {i+1}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] text-center">Checklist de Falhas</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {falhasComuns.map((falha) => {
                const selecionado = formData.falhas.includes(falha);
                return (
                  <button
                    key={falha}
                    type="button"
                    disabled={loading}
                    onClick={() => toggleFalha(falha)}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between text-[10px] font-black uppercase tracking-tighter ${
                      selecionado 
                      ? 'bg-lenovoRed border-lenovoRed text-white shadow-[0_10px_20px_rgba(226,35,26,0.2)] scale-95' 
                      : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-gray-300'
                    }`}
                  >
                    {falha}
                    {selecionado && <CheckCircle2 size={14} className="animate-in zoom-in" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            type="submit"
            disabled={formData.falhas.length === 0 || !formData.trave || !formData.ponto || loading}
            className={`w-full p-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all mt-6 shadow-xl active:scale-95 ${
              loading 
              ? 'bg-gray-800 text-gray-600' 
              : 'bg-lenovoRed hover:bg-red-700 text-white shadow-[0_0_25px_rgba(226,35,26,0.3)]'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>ENVIANDO RELATÓRIO...</span>
              </>
            ) : (
              <>
                <Save size={24} />
                <span>FINALIZAR REGISTRO</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registrar;