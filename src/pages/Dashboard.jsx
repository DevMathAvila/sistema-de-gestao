import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, HardDrive, User, Sun, Moon,
  Settings, AlertTriangle, Eye, Key, Activity, Zap
} from 'lucide-react';
import { LISTA_SETORES } from '../data/setores';
import { listarFalhasAbertas } from '../services/supabaseSecure';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = (() => {
    try {
      const stored = localStorage.getItem('lenovo_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  })() || { username: 'Técnico' };

  const [setoresComFalha, setSetoresComFalha] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showPassModal, setShowPassModal] = useState(false);

  const buscarFalhas = async () => {
    try {
      const { data, error } = await listarFalhasAbertas();
      if (error) throw error;
      const registrosValidos = (data || []).filter(item => item.setor && item.trave && item.ponto);
      setSetoresComFalha([...new Set(registrosValidos.map(item => item.setor))]);
    } catch { /* silencioso */ } finally { setLoading(false); }
  };

  useEffect(() => {
    buscarFalhas();
    const interval = setInterval(buscarFalhas, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('lenovo_user');
    navigate('/');
  };

  // Variáveis de Estilo Baseadas no Tema
  const styles = {
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-black/60 border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
    card: theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/40',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-500' : 'text-slate-400',
    navActive: theme === 'dark' ? 'bg-white/5 text-red-500' : 'bg-red-50 text-red-600',
  };

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500`}>
      
      {/* Sidebar */}
      <aside className={`w-full md:w-64 border-r ${styles.sidebar} p-6 flex flex-col z-20 backdrop-blur-xl`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/20">L</div>
            <div>
              <h1 className="text-xl font-black tracking-tighter italic leading-none">LENOVO</h1>
              <span className="text-[8px] font-bold tracking-[0.2em] text-red-600 uppercase">Core Dashboard</span>
            </div>
          </div>
          <button onClick={toggleTheme} className={`p-2 rounded-lg border ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
            {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
          </button>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className={`flex items-center gap-3 p-4 rounded-2xl font-black italic border border-red-600/10 text-xs ${styles.navActive}`}>
            <LayoutDashboard size={18} /> PAINEL PRINCIPAL
          </div>
          {[
            { label: 'VISUALIZAR FALHAS', icon: Eye, path: '/visualizar' },
            { label: 'PAINEL ADMIN', icon: Settings, path: '/admin' },
            { label: 'ALTERAR SENHA', icon: Key, action: () => setShowPassModal(true) }
          ].map((item, idx) => (
            <button key={idx} onClick={item.action || (() => navigate(item.path))} 
              className={`w-full flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 hover:translate-x-1 rounded-2xl transition-all group font-black text-[10px] tracking-widest uppercase`}>
              <item.icon size={18} className="group-hover:text-red-600 transition-all" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className={`flex items-center gap-4 mb-6 p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600"><User size={20}/></div>
            <div className="overflow-hidden">
                <p className={`text-[8px] font-black uppercase ${styles.subtext}`}>Usuario: </p>
                <p className="text-sm font-black truncate italic leading-none">{user.username}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all uppercase text-xs">
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto z-10">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[2px] w-8 bg-red-600"></div>
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">Operational Status</span>
            </div>
            <h2 className={`text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none ${styles.text}`}>
              FÁBRICA <span className="text-red-600">STATUS</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'} flex items-center gap-2`}>
              <Activity size={14} className="text-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider">Telemetria Ativa</span>
            </div>
          </div>
        </header>

        {/* Grid de Setores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {LISTA_SETORES.map((setorNome) => {
            const temFalha = setoresComFalha.includes(setorNome);
            return (
              <button key={setorNome} onClick={() => navigate('/registrar', { state: { setor: setorNome } })}
                className={`p-6 rounded-[2.5rem] border transition-all duration-500 text-left group relative h-48 flex flex-col justify-between overflow-hidden ${
                  temFalha 
                  ? 'bg-red-600 border-red-500 text-white animate-emergency shadow-2xl shadow-red-600/30' 
                  : `${styles.card} hover:border-red-600/40 hover:-translate-y-1`
                }`}
              >
                {/* Efeito de Zap no fundo */}
                <div className={`absolute -right-6 -bottom-6 opacity-[0.05] group-hover:scale-110 transition-transform ${temFalha ? 'text-white' : 'text-red-600'}`}>
                    <Zap size={140} />
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <div className={`p-3 rounded-2xl transition-all ${temFalha ? 'bg-white/20 text-white' : 'bg-red-600 text-white shadow-lg shadow-red-600/20'}`}>
                    <HardDrive size={24} />
                  </div>
                  {temFalha && (
                    <div className="bg-white text-red-600 p-1.5 rounded-full animate-bounce">
                      <AlertTriangle size={18} fill="currentColor" />
                    </div>
                  )}
                </div>

                <div className="relative z-10">
                  <span className="block font-black text-2xl tracking-tighter uppercase italic">{setorNome}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${temFalha ? 'bg-white animate-ping' : 'bg-green-500'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${temFalha ? 'text-white/80' : styles.subtext}`}>
                        {temFalha ? 'ALERTA CRÍTICO' : 'SISTEMA OK'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Estilos Globais Customizados */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes emergency {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 40px rgba(220, 38, 38, 0.4); }
        }
        .animate-emergency { animation: emergency 2s infinite ease-in-out; }
        
        /* Scrollbar customizada */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
          background: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; 
          border-radius: 10px; 
        }
      `}} />
    </div>
  );
};

export default Dashboard;