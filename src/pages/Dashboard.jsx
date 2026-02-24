import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, LogOut, HardDrive, User, 
  Settings, AlertTriangle, Eye, Key, X, CheckCircle2, Trash2, Activity, Zap
} from 'lucide-react';
import { supabase } from '../services/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('lenovo_user')) || { username: 'Técnico' };
  
  const [setoresComFalha, setSetoresComFalha] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const setores = [
    "Runin 01", "Runin 02", "Runin 03", "Runin 04", "Runin 05",
    "Runin 06", "Runin 07", "Runin 08", "Runin 09", "Runin 10", "AVT"
  ];

  const buscarFalhas = async () => {
    try {
      const { data, error } = await supabase.from('registros_falhas').select('setor, trave, ponto').eq('status', 'aberto');
      if (error) throw error;
      const registrosValidos = (data || []).filter(item => item.setor && item.trave && item.ponto);
      setSetoresComFalha([...new Set(registrosValidos.map(item => item.setor))]);
    } catch (error) { console.error(error.message); } finally { setLoading(false); }
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

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col md:flex-row font-sans relative overflow-hidden text-sm">
      
      {/* Overlay de Scanlines (Efeito de Monitor) */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.02]" 
           style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 2px 100%' }} />

      {/* Sidebar Compacta */}
      <aside className="w-full md:w-60 border-r border-white/5 p-5 flex flex-col bg-black/60 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse">L</div>
          <div>
            <h1 className="text-lg font-black tracking-tighter italic leading-none">LENOVO</h1>
            <span className="text-[7px] font-bold tracking-[0.2em] text-red-500 uppercase">Core Ops</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-red-500 font-bold italic border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.01)] text-xs">
            <LayoutDashboard size={16} /> MAIN PANEL
          </div>
          {[
            { label: 'VISUALIZAR FALHAS', icon: Eye, path: '/visualizar' },
            { label: 'PAINEL ADMIN', icon: Settings, path: '/admin' },
            { label: 'ALTERAR SENHA', icon: Key, action: () => setShowPassModal(true) }
          ].map((item, idx) => (
            <button key={idx} onClick={item.action || (() => navigate(item.path))} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all group font-bold text-[10px] tracking-wider uppercase">
              <item.icon size={16} className="group-hover:text-red-500 transition-all" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-5 border-t border-white/5">
          <div className="flex items-center gap-3 mb-5 bg-white/5 p-3 rounded-xl">
            <div className="p-1.5 bg-red-600/20 rounded-lg text-red-500"><User size={14}/></div>
            <div className="overflow-hidden">
                <p className="text-[8px] font-black text-gray-600 uppercase">User</p>
                <p className="text-xs font-bold truncate italic leading-none">{user.username}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-red-500 font-black transition-all uppercase text-[9px]">
            <LogOut size={16} /> LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto z-10">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-1">FACTORY <span className="text-red-600">STATUS</span></h2>
            <div className="flex items-center gap-2">
                <Activity size={12} className="text-green-500 animate-pulse" />
                <span className="text-[8px] font-black tracking-[0.3em] text-gray-600 uppercase font-mono">Real-time Telemetry Active</span>
            </div>
          </div>
          
          <button onClick={buscarFalhas}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-red-600/30 rounded-lg text-[9px] font-black text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase"
          >
            <Trash2 size={12} /> Purge Data
          </button>
        </header>

        {/* Grid ajustado para ser mais denso */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {setores.map((setorNome) => {
            const temFalha = setoresComFalha.includes(setorNome);
            return (
              <button key={setorNome} onClick={() => navigate('/registrar', { state: { setor: setorNome } })}
                className={`p-4 rounded-2xl border transition-all duration-300 text-left group relative h-36 flex flex-col justify-between overflow-hidden ${
                  temFalha 
                  ? 'bg-red-600/5 border-red-600/60 animate-emergency shadow-[0_0_20px_rgba(220,38,38,0.1)]' 
                  : 'bg-white/[0.02] border-white/5 hover:border-red-600/40 hover:bg-white/[0.04]'
                }`}
              >
                {/* Ícone de fundo menor */}
                <div className={`absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.06] transition-all ${temFalha ? 'text-red-600' : 'text-white'}`}>
                    <Zap size={100} />
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <div className={`p-2 rounded-lg transition-all ${temFalha ? 'bg-red-600 text-white animate-bounce' : 'bg-white/5 text-gray-600 group-hover:text-white'}`}>
                    <HardDrive size={18} />
                  </div>
                  {temFalha && (
                    <AlertTriangle size={18} className="text-red-500 animate-pulse" />
                  )}
                </div>

                <div className="relative z-10">
                  <span className="block font-black text-xl tracking-tighter uppercase italic group-hover:translate-x-1 transition-transform">{setorNome}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${temFalha ? 'bg-red-500 animate-ping' : 'bg-green-500/50'}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${temFalha ? 'text-red-500' : 'text-gray-600'}`}>
                        {temFalha ? 'CRITICAL' : 'OPTIMAL'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes emergency {
          0%, 100% { box-shadow: 0 0 10px rgba(220, 38, 38, 0.1); border-color: rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 0 25px rgba(220, 38, 38, 0.3); border-color: rgba(220, 38, 38, 0.8); background-color: rgba(220, 38, 38, 0.1); }
        }
        .animate-emergency { animation: emergency 1.5s infinite ease-in-out; }
      `}} />
    </div>
  );
};

export default Dashboard;