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

  const limparRegistrosInvalidos = async () => {
    try {
      await supabase.from('registros_falhas').delete().eq('status', 'aberto').or('setor.is.null,trave.is.null,ponto.is.null');
    } catch (err) { console.error(err); }
  };

  const buscarFalhas = async () => {
    try {
      const { data, error } = await supabase.from('registros_falhas').select('setor, trave, ponto').eq('status', 'aberto');
      if (error) throw error;
      const registrosValidos = (data || []).filter(item => item.setor && item.trave && item.ponto);
      setSetoresComFalha([...new Set(registrosValidos.map(item => item.setor))]);
    } catch (error) {
      console.error(error.message);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    limparRegistrosInvalidos();
    buscarFalhas();
    const interval = setInterval(buscarFalhas, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdatePassword = async () => {
    if (newPassword.length < 3) return;
    setUpdating(true);
    try {
      const userIdFinal = isNaN(Number(user.id)) ? user.id : Number(user.id);
      const { error } = await supabase.from('usuarios').update({ senha: newPassword }).eq('id', userIdFinal);
      if (error) throw error;
      setShowPassModal(false);
      setNewPassword('');
    } catch (err) { alert(err.message); } finally { setUpdating(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('lenovo_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col md:flex-row font-sans relative overflow-hidden">
      
      {/* Overlay de Scanlines (Efeito de Monitor) */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03]" 
           style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }} />

      {showPassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-[3rem] shadow-[0_0_50px_rgba(220,38,38,0.2)] p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black uppercase italic text-2xl tracking-tighter">Security Shift</h3>
                <button onClick={() => setShowPassModal(false)} className="text-gray-500 hover:text-white"><X size={28} /></button>
              </div>
              <input type="text" placeholder="NEW ENCRYPTION KEY" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black border-2 border-white/5 p-5 rounded-2xl text-white focus:border-red-600 outline-none transition-all mb-6 font-mono text-center tracking-widest" />
              <button onClick={handleUpdatePassword} disabled={updating} className="w-full bg-red-600 text-white font-black p-5 rounded-2xl hover:bg-red-500 transition-all uppercase flex items-center justify-center gap-3 shadow-lg shadow-red-600/30">
                {updating ? 'PROCESSING...' : <><CheckCircle2 size={20} /> CONFIRM CHANGE</>}
              </button>
          </div>
        </div>
      )}

      {/* Sidebar Futurista */}
      <aside className="w-full md:w-72 border-r border-white/5 p-8 flex flex-col bg-black/60 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-4 mb-16">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse">L</div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter italic leading-none">LENOVO</h1>
            <span className="text-[9px] font-bold tracking-[0.3em] text-red-500 uppercase">Production Core</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-red-500 font-black italic border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
            <LayoutDashboard size={22} /> MAIN PANEL
          </div>
          {[
            { label: 'VISUALIZAR FALHAS', icon: Eye, path: '/visualizar' },
            { label: 'PAINEL ADMIN', icon: Settings, path: '/admin' },
            { label: 'ALTERAR SENHA', icon: Key, action: () => setShowPassModal(true) }
          ].map((item, idx) => (
            <button key={idx} onClick={item.action || (() => navigate(item.path))} className="w-full flex items-center gap-4 p-4 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all group font-bold text-xs tracking-widest">
              <item.icon size={20} className="group-hover:text-red-500 group-hover:scale-110 transition-all" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 mb-8 bg-white/5 p-4 rounded-2xl">
            <div className="p-2 bg-red-600/20 rounded-full text-red-500"><User size={20}/></div>
            <div className="overflow-hidden">
                <p className="text-[10px] font-black text-gray-600 uppercase">Operator</p>
                <p className="text-sm font-bold truncate italic">{user.username}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 text-gray-500 hover:text-red-500 font-black transition-all uppercase text-xs tracking-tighter">
            <LogOut size={20} /> TERMINATE SESSION
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto z-10">
        <header className="mb-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="relative">
            <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-2">FACTORY<br/><span className="text-red-600">STATUS</span></h2>
            <div className="flex items-center gap-3">
                <Activity size={16} className="text-green-500 animate-bounce" />
                <span className="text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase">Live Biometric Feed 2.4ghz</span>
            </div>
          </div>
          
          <button onClick={() => { limparRegistrosInvalidos(); buscarFalhas(); }}
            className="group relative flex items-center gap-4 px-8 py-4 bg-transparent border-2 border-red-600/30 rounded-2xl text-xs font-black text-red-500 hover:bg-red-600 hover:text-white transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10" />
            <Trash2 size={18} className="group-hover:rotate-12 transition-transform" /> 
            PURGE GHOST DATA
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {setores.map((setor) => {
            const temFalha = setoresComFalha.includes(setor);
            return (
              <button key={setor} onClick={() => navigate('/registrar', { state: { setor } })}
                className={`p-8 rounded-[3rem] border-2 transition-all duration-500 text-left group relative h-64 flex flex-col justify-between overflow-hidden shadow-2xl ${
                  temFalha 
                  ? 'bg-red-600/10 border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.2)] animate-emergency' 
                  : 'bg-white/[0.02] border-white/5 hover:border-red-600/50'
                }`}
              >
                {/* Background Decorativo dentro do Card */}
                <div className={`absolute -right-8 -top-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 ${temFalha ? 'text-red-600' : 'text-white'}`}>
                    <Zap size={200} />
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <div className={`p-5 rounded-2xl transition-all duration-500 ${temFalha ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-bounce' : 'bg-white/5 text-gray-600 group-hover:bg-white/10'}`}>
                    <HardDrive size={32} />
                  </div>
                  {temFalha && (
                    <div className="flex flex-col items-end gap-1">
                        <AlertTriangle size={32} className="text-red-500 animate-pulse" />
                        <span className="text-[8px] font-black text-red-500 animate-pulse uppercase">Urgent</span>
                    </div>
                  )}
                </div>

                <div className="relative z-10">
                  <span className="block font-black text-4xl tracking-tighter uppercase italic group-hover:translate-x-2 transition-transform duration-300">{setor}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${temFalha ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${temFalha ? 'text-red-500' : 'text-gray-600'}`}>
                        {temFalha ? 'Alert: Sector Compromised' : 'Status: Optimal'}
                    </span>
                  </div>
                </div>

                {/* Efeito de brilho ao passar o mouse */}
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes emergency {
          0%, 100% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.2); border-color: rgba(220, 38, 38, 0.5); }
          50% { box-shadow: 0 0 50px rgba(220, 38, 38, 0.5); border-color: rgba(220, 38, 38, 1); background-color: rgba(220, 38, 38, 0.15); }
        }
        .animate-emergency {
          animation: emergency 1.5s infinite ease-in-out;
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #020202; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #cc0000; }
      `}} />
    </div>
  );
};

export default Dashboard;