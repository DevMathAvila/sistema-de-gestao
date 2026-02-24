import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, HardDrive, User, 
  Settings, AlertCircle, Eye, Key, X, CheckCircle2 
} from 'lucide-react';
import { supabase } from '../services/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('lenovo_user')) || { username: 'Técnico' };
  
  const [setoresComFalha, setSetoresComFalha] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA TROCA DE SENHA
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const setores = [
    "Runin 01", "Runin 02", "Runin 03", "Runin 04", "Runin 05",
    "Runin 06", "Runin 07", "Runin 08", "Runin 09", "Runin 10", "AVT"
  ];

  const buscarFalhas = async () => {
    try {
      const { data, error } = await supabase
        .from('registros_falhas')
        .select('setor')
        .eq('status', 'aberto');

      if (error) throw error;

      const nomesDosSetores = [...new Set(data.map(item => item.setor))];
      setSetoresComFalha(nomesDosSetores);
    } catch (error) {
      console.error("Erro ao carregar alertas:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarFalhas();
    const interval = setInterval(buscarFalhas, 30000);
    return () => clearInterval(interval);
  }, []);

  // FUNÇÃO PARA ATUALIZAR SENHA - AJUSTADA PARA FLEXIBILIDADE DE ID
  const handleUpdatePassword = async () => {
    if (newPassword.length < 3) {
      return alert("A senha deve ter pelo menos 3 caracteres.");
    }

    setUpdating(true);
    try {
      // INCREMENTO: Tentamos converter para número, mas se for UUID (texto), usamos o valor original
      // Isso evita o erro de "ID inválido" se o ID no localStorage não for numérico
      const userIdFinal = isNaN(Number(user.id)) ? user.id : Number(user.id);

      if (!userIdFinal) {
        throw new Error("Sessão de usuário corrompida. Por favor, faça login novamente.");
      }

      const { error } = await supabase
        .from('usuarios') 
        .update({ senha: newPassword })
        .eq('id', userIdFinal);

      if (error) throw error;

      alert("Senha alterada com sucesso! Use a nova senha no próximo login.");
      setShowPassModal(false);
      setNewPassword('');
    } catch (err) {
      alert("Erro ao atualizar senha: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lenovo_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans">
      
      {/* MODAL DE TROCA DE SENHA */}
      {showPassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3 text-red-600">
                  <Key size={24} />
                  <h3 className="font-black uppercase italic tracking-tighter text-xl text-white">Nova Senha</h3>
                </div>
                <button onClick={() => setShowPassModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <p className="text-gray-500 text-[10px] uppercase font-bold mb-2 tracking-widest">Usuário: {user.username}</p>
              <input 
                type="text" 
                placeholder="Digite a nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white focus:border-red-600 outline-none transition-all mb-6 font-mono"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPassModal(false)}
                  className="flex-1 bg-white/5 text-gray-400 font-bold p-4 rounded-xl hover:bg-white/10 transition-all uppercase text-[10px]"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleUpdatePassword}
                  disabled={updating}
                  className="flex-[2] bg-red-600 text-white font-black p-4 rounded-xl hover:bg-red-500 transition-all uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {updating ? 'Salvando...' : <><CheckCircle2 size={16} /> Salvar Senha</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 p-6 flex flex-col bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(226,35,26,0.5)]">L</div>
          <h1 className="text-xl font-black tracking-tighter">LENOVO <span className="text-[10px] block text-gray-500 font-normal tracking-widest uppercase">Asset System</span></h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-red-600 font-bold border border-white/10 shadow-inner cursor-default">
            <LayoutDashboard size={20} /> Painel Geral
          </div>

          <button 
            onClick={() => navigate('/visualizar')}
            className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-white transition-all group"
          >
            <Eye size={20} className="group-hover:text-red-600 transition-colors" /> Visualizar Falhas
          </button>

          <button 
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-white transition-all group"
          >
            <Settings size={20} className="group-hover:text-red-600 transition-colors" /> Painel Admin
          </button>

          <button 
            onClick={() => setShowPassModal(true)}
            className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-white transition-all group"
          >
            <Key size={20} className="group-hover:text-red-600 transition-colors" /> Alterar Senha
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="p-2 bg-gray-800 rounded-full text-gray-400"><User size={20}/></div>
            <span className="text-sm font-medium text-gray-300">{user.username}</span>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-red-500 transition-colors group">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight uppercase italic font-black">Status da Fábrica</h2>
            <p className="text-gray-400">Monitoramento em tempo real dos setores de teste.</p>
          </div>
          {loading && <div className="text-xs text-red-600 animate-pulse font-mono tracking-widest">SINCRONIZANDO...</div>}
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {setores.map((setor) => {
            const temFalha = setoresComFalha.includes(setor);
            
            return (
              <button 
                key={setor} 
                onClick={() => navigate('/registrar', { state: { setor } })}
                className={`p-6 rounded-3xl border-2 transition-all text-left group relative overflow-hidden h-48 flex flex-col justify-between ${
                  temFalha 
                  ? 'bg-red-950/20 border-red-600/50 hover:bg-red-900/30 shadow-[0_0_25px_rgba(220,38,38,0.15)] hover:scale-[1.02]' 
                  : 'bg-[#0A0A0A] border-white/5 hover:border-white/20 hover:scale-[1.02]'
                }`}
              >
                {temFalha && (
                  <div className="absolute top-4 right-4 animate-bounce text-red-500">
                    <AlertCircle size={24} />
                  </div>
                )}

                <div>
                  <div className={`p-3 rounded-xl w-fit mb-4 transition-colors ${
                    temFalha ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-white/5 text-gray-500 group-hover:text-white'
                  }`}>
                    <HardDrive size={24} />
                  </div>
                  <span className="block font-black text-2xl tracking-tight uppercase">{setor}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold uppercase tracking-[2px] ${temFalha ? 'text-red-400' : 'text-gray-600'}`}>
                    {temFalha ? '⚠️ ANOMALIA DETECTADA' : 'SISTEMA OPERACIONAL'}
                  </span>
                  <div className={`mt-2 text-[10px] font-black tracking-widest ${temFalha ? 'text-white underline' : 'text-red-600 opacity-0 group-hover:opacity-100'} transition-all`}>
                    REGISTRAR FALHA →
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;