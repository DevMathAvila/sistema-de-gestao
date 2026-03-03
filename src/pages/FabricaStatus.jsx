import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, HardDrive, User, Sun, Moon,
  Settings, AlertTriangle, Eye, Activity, Zap, Menu, X, PanelLeftClose, PanelLeftOpen, Shield
} from 'lucide-react';
import { LISTA_SETORES } from '../data/setores';
import { listarFalhasAbertas } from '../services/supabaseSecure';
import { clearSessionData, getSessionUser, isAdminUser } from '../lib/session';
import AppBottomNav from '../components/AppBottomNav';

const FabricaStatus = () => {
  const navigate = useNavigate();
  const user = getSessionUser() || { username: 'Tecnico', role: 'colaborador' };
  const isAdmin = isAdminUser(user);

  const [setoresComFalha, setSetoresComFalha] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [hoverMenuTop, setHoverMenuTop] = useState(0);

  const buscarFalhas = async () => {
    try {
      const { data, error } = await listarFalhasAbertas();
      if (error) throw error;
      const registrosValidos = (data || []).filter((item) => item.setor && item.trave && item.ponto);
      setSetoresComFalha([...new Set(registrosValidos.map((item) => item.setor))]);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    buscarFalhas();
    const interval = setInterval(buscarFalhas, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    setSetoresComFalha([]);
    clearSessionData();
    navigate('/', { replace: true });
  };

  const navigateAndCloseMobile = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const styles = {
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-black/60 border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
    card: theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/40',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-500' : 'text-slate-400',
    navActive: theme === 'dark' ? 'bg-white/5 text-red-500' : 'bg-red-50 text-red-600',
  };

  const sidebarGroups = [
    {
      id: 'operacao',
      label: 'Operacao',
      icon: LayoutDashboard,
      items: [
        { label: 'Abrir chamado', icon: HardDrive, action: () => navigate('/abrir-chamado') },
        { label: 'Visualizar Falhas', icon: Eye, action: () => navigate('/visualizar') },
      ],
    },
    ...(isAdmin
      ? [{
          id: 'admin',
          label: 'Administracao',
          icon: Settings,
          items: [{ label: 'Painel Admin', icon: Settings, action: () => navigate('/admin') }],
        }]
      : []),
  ];

  return (
    <div className={`min-h-screen ${styles.bg} ${styles.text} flex flex-col md:flex-row font-sans relative overflow-hidden transition-colors duration-500`}>
      <header className={`md:hidden sticky top-0 z-40 px-4 py-3.5 border-b backdrop-blur-2xl ${theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/70 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-lg shadow-red-600/30">L</div>
            <div>
              <p className="text-sm font-black italic leading-none">LENOVO</p>
              <p className={`text-[9px] font-black uppercase tracking-wider ${styles.subtext}`}>Core Dashboard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className={`p-2.5 rounded-xl border transition-all ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Fechar menu" />
          <aside className={`absolute right-0 top-0 h-full w-[88%] max-w-sm border-l p-6 flex flex-col shadow-2xl transition-transform duration-300 ${
            theme === 'dark' ? 'bg-[#060606]/95 border-white/10 backdrop-blur-2xl' : 'bg-white/95 border-slate-200 backdrop-blur-2xl'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Navegacao</p>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                <X size={16} />
              </button>
            </div>
            <nav className="space-y-3">
              <button
                type="button"
                onClick={() => navigateAndCloseMobile('/visualizar')}
                className={`w-full min-h-12 flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 rounded-2xl transition-all group font-black text-[11px] tracking-widest uppercase text-left`}
              >
                <Eye size={18} className="group-hover:text-red-600 transition-all" /> Visualizar Falhas
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => navigateAndCloseMobile('/admin')}
                  className={`w-full min-h-12 flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 rounded-2xl transition-all group font-black text-[11px] tracking-widest uppercase text-left`}
                >
                  <Settings size={18} className="group-hover:text-red-600 transition-all" /> Painel Admin
                </button>
              )}
              <button
                type="button"
                onClick={() => navigateAndCloseMobile('/alterar-senha')}
                className={`w-full min-h-12 flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 rounded-2xl transition-all group font-black text-[11px] tracking-widest uppercase text-left`}
              >
                <Shield size={18} className="group-hover:text-red-600 transition-all" /> Seguranca
              </button>
            </nav>
            <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
              <button onClick={toggleTheme} className={`w-full min-h-12 p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-[11px] font-black uppercase">Tema</span>
                {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
              </button>
              <button onClick={handleLogout} className="w-full min-h-12 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest transition-all">
                Encerrar Sessao
              </button>
            </div>
          </aside>
        </div>
      )}

      <aside
        onMouseLeave={() => setHoveredGroup(null)}
        className={`hidden md:flex ${sidebarCollapsed ? 'w-24' : 'w-64'} border-r ${styles.sidebar} p-4 flex-col z-20 backdrop-blur-xl transition-all duration-300 relative`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/20">L</div>
            {!sidebarCollapsed && <div>
              <h1 className="text-xl font-black tracking-tighter italic leading-none">LENOVO</h1>
              <span className="text-[8px] font-bold tracking-[0.2em] text-red-600 uppercase">Core Dashboard</span>
            </div>}
          </div>
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className={`p-2 rounded-lg border ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              onMouseEnter={(e) => {
                setHoveredGroup(group.id);
                setHoverMenuTop(e.currentTarget.offsetTop);
              }}
              className={`w-full flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 hover:translate-x-1 rounded-2xl transition-all group font-black text-[10px] tracking-widest uppercase text-left`}
            >
              <group.icon size={18} className="group-hover:text-red-600 transition-all" /> {!sidebarCollapsed && group.label}
            </button>
          ))}
        </nav>

        {hoveredGroup && (
          <div
            onMouseEnter={() => setHoveredGroup(hoveredGroup)}
            style={{ top: hoverMenuTop }}
            className={`absolute ${sidebarCollapsed ? 'left-24' : 'left-64'} w-64 p-3 rounded-2xl border z-50 ${theme === 'dark' ? 'bg-[#090909] border-white/10 shadow-2xl shadow-black/50' : 'bg-white border-slate-200 shadow-2xl shadow-slate-300/40'}`}
          >
            <div className="space-y-1">
              {sidebarGroups
                .find((group) => group.id === hoveredGroup)
                ?.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left font-black text-[10px] uppercase tracking-wider transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'}`}
                  >
                    <item.icon size={16} className="text-red-600" /> {item.label}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
          <button onClick={toggleTheme} className={`w-full p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50'}`}>
            {!sidebarCollapsed && <span className="text-[10px] font-black uppercase">Tema</span>}
            {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
          </button>
          <div className={`flex items-center gap-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600"><User size={20} /></div>
            {!sidebarCollapsed && <div className="overflow-hidden">
              <p className={`text-[8px] font-black uppercase ${styles.subtext}`}>Usuario:</p>
              <p className="text-sm font-black truncate italic leading-none">{user.username}</p>
            </div>}
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all uppercase text-xs">
            <LogOut size={16} /> {!sidebarCollapsed && 'Encerrar Sessao'}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 pb-24 md:pb-10 overflow-y-auto z-10">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[2px] w-8 bg-red-600"></div>
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">Operational Status</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none ${styles.text}`}>
              Fabrica <span className="text-red-600">Status</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'} flex items-center gap-2`}>
              <Activity size={14} className="text-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider">Telemetria Ativa</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/alterar-senha')}
              className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all ${
                theme === 'dark'
                  ? 'border-red-600/40 bg-red-600/10 text-red-500 hover:bg-red-600/20'
                  : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
              }`}
              aria-label="Ir para alteracao de senha"
              title="Seguranca"
            >
              <Shield size={15} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {LISTA_SETORES.map((setorNome) => {
            const temFalha = setoresComFalha.includes(setorNome);
            return (
              <button
                key={setorNome}
                onClick={() => navigate('/registrar', { state: { setor: setorNome } })}
                className={`p-6 rounded-[2.5rem] border transition-all duration-500 text-left group relative h-48 flex flex-col justify-between overflow-hidden ${
                  temFalha
                    ? 'bg-red-600 border-red-500 text-white animate-emergency shadow-2xl shadow-red-600/30'
                    : `${styles.card} hover:border-red-600/40 hover:-translate-y-1`
                }`}
              >
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
                      {temFalha ? 'Alerta Critico' : 'Sistema OK'}
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
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); box-shadow: 0 0 40px rgba(220, 38, 38, 0.4); }
        }
        .animate-emergency { animation: emergency 2s infinite ease-in-out; }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
          border-radius: 10px;
        }
      ` }} />
      <AppBottomNav isAdmin={isAdmin} />
    </div>
  );
};

export default FabricaStatus;
