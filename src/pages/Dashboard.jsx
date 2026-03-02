import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, HardDrive, User, Sun, Moon,
  Settings, AlertTriangle, Eye, Key, Activity, Zap, Menu, X
} from 'lucide-react';
import { LISTA_SETORES } from '../data/setores';
import { listarFalhasAbertas, atualizarSenhaUsuario } from '../services/supabaseSecure';
import { clearSessionData, getSessionUser, isAdminUser } from '../lib/session';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getSessionUser() || { username: 'Tecnico', role: 'colaborador' };
  const isAdmin = isAdminUser(user);

  const [setoresComFalha, setSetoresComFalha] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showPassModal, setShowPassModal] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [updatingSenha, setUpdatingSenha] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const regexSenhaForte = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  const avaliarForcaSenha = (senha) => {
    if (!senha) return { nivel: 'Nenhuma', barra: 'bg-slate-400', progresso: 0, forte: false };
    let score = 0;
    if (senha.length >= 8) score += 1;
    if (/[A-Z]/.test(senha)) score += 1;
    if (/\d/.test(senha)) score += 1;
    if (/[^A-Za-z0-9]/.test(senha)) score += 1;

    if (regexSenhaForte.test(senha)) {
      return { nivel: 'Forte/Segura', barra: 'bg-emerald-500', progresso: 100, forte: true };
    }
    if (score >= 2) return { nivel: 'Média', barra: 'bg-amber-400', progresso: 66, forte: false };
    return { nivel: 'Fraca', barra: 'bg-red-500', progresso: 33, forte: false };
  };

  const forcaSenha = avaliarForcaSenha(novaSenha);
  const senhasIguais = novaSenha.length > 0 && novaSenha === confirmarSenha;
  const podeAtualizarSenha = forcaSenha.forte && senhasIguais && !updatingSenha;
  const usernameSessao = String(user?.username ?? '').trim();

  const buscarFalhas = async () => {
    try {
      const { data, error } = await listarFalhasAbertas();
      if (error) throw error;
      const registrosValidos = (data || []).filter(item => item.setor && item.trave && item.ponto);
      setSetoresComFalha([...new Set(registrosValidos.map(item => item.setor))]);
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
    limparModalSenha();
    setSetoresComFalha([]);
    clearSessionData();
    navigate('/', { replace: true });
  };

  const abrirModalSenha = () => {
    setShowPassModal(true);
    setMobileMenuOpen(false);
  };

  const navegar = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const limparModalSenha = () => {
    setNovaSenha('');
    setConfirmarSenha('');
    setUpdatingSenha(false);
    setShowPassModal(false);
  };

  const handleAtualizarSenha = async () => {
    if (!podeAtualizarSenha) return;
    setUpdatingSenha(true);
    try {
      if (!usernameSessao) throw new Error('Usuario logado nao encontrado.');

      const result = await atualizarSenhaUsuario(usernameSessao, novaSenha);
      if (!result?.success) throw new Error(result?.error?.message || 'Falha ao atualizar senha.');

      alert('Senha atualizada com sucesso!');
      setTimeout(() => {
        limparModalSenha();
      }, 2000);
    } catch (err) {
      alert(err?.message || 'Nao foi possivel atualizar a senha.');
    } finally {
      setUpdatingSenha(false);
    }
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

  const navItems = [
    { label: 'VISUALIZAR FALHAS', icon: Eye, path: '/visualizar' },
    ...(isAdmin ? [{ label: 'PAINEL ADMIN', icon: Settings, path: '/admin' }] : []),
    { label: 'ALTERAR SENHA', icon: Key, action: abrirModalSenha },
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
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Navegação</p>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                <X size={16} />
              </button>
            </div>
            <nav className="space-y-3">
              <div className={`flex items-center gap-3 p-4 rounded-2xl font-black italic border border-red-600/10 text-xs ${styles.navActive}`}>
                <LayoutDashboard size={18} /> PAINEL PRINCIPAL
              </div>
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action || (() => navegar(item.path))}
                  className={`w-full min-h-12 flex items-center gap-3 p-4 ${styles.subtext} hover:text-red-600 rounded-2xl transition-all group font-black text-[11px] tracking-widest uppercase text-left`}
                >
                  <item.icon size={18} className="group-hover:text-red-600 transition-all" /> {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto space-y-3 pt-6 border-t border-white/10">
              <button onClick={toggleTheme} className={`w-full min-h-12 p-3 rounded-xl border flex items-center justify-between ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <span className="text-[11px] font-black uppercase">Tema</span>
                {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-red-600" />}
              </button>
              <button onClick={handleLogout} className="w-full min-h-12 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest transition-all">
                Encerrar Sessão
              </button>
            </div>
          </aside>
        </div>
      )}
      
      {/* Sidebar */}
      <aside className={`hidden md:flex w-64 border-r ${styles.sidebar} p-6 flex-col z-20 backdrop-blur-xl`}>
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
          {navItems.map((item, idx) => (
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
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto z-10">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[2px] w-8 bg-red-600"></div>
              <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">Operational Status</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none ${styles.text}`}>
              FÁBRICA <span className="text-red-600">STATUS</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'} flex items-center gap-2`}>
              <Activity size={14} className="text-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider">Telemetria Ativa</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPassModal(true)}
              className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-black text-[10px] uppercase tracking-wider transition-all ${
                theme === 'dark'
                  ? 'border-red-600/40 bg-red-600/10 text-red-500 hover:bg-red-600/20'
                  : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <Key size={14} />
              Segurança
            </button>
          </div>
        </header>

        {/* Grid de Setores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
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

      {showPassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-[2.5rem] border p-8 ${theme === 'dark' ? 'bg-[#0B0B0B] border-white/10' : 'bg-white border-slate-200 shadow-2xl'}`}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600">Security</p>
                <h3 className="text-2xl font-black italic uppercase tracking-tight">Alterar Senha</h3>
              </div>
              <button
                type="button"
                onClick={limparModalSenha}
                className={`px-4 py-2 rounded-2xl font-black text-[10px] uppercase transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
              >
                Fechar
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase ml-2 ${styles.subtext}`}>Nova Senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha"
                  className={`w-full px-5 py-4 rounded-[2.5rem] border outline-none text-sm font-bold transition-all ${
                    theme === 'dark'
                      ? 'bg-black border-white/10 text-white focus:border-red-600/40'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-red-300'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase ml-2 ${styles.subtext}`}>Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className={`w-full px-5 py-4 rounded-[2.5rem] border outline-none text-sm font-bold transition-all ${
                    theme === 'dark'
                      ? 'bg-black border-white/10 text-white focus:border-red-600/40'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-red-300'
                  }`}
                />
              </div>

              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${styles.subtext}`}>Forca da senha</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    forcaSenha.forte ? 'text-emerald-500' : forcaSenha.nivel === 'Média' ? 'text-amber-500' : 'text-red-500'
                  }`}>{forcaSenha.nivel}</span>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}>
                  <div
                    className={`h-full transition-all duration-300 ${forcaSenha.barra}`}
                    style={{ width: `${forcaSenha.progresso}%` }}
                  />
                </div>
                <p className={`mt-2 text-[10px] font-black uppercase tracking-wider ${styles.subtext}`}>
                  Minimo 8 caracteres, 1 letra maiuscula, 1 numero e 1 caractere especial.
                </p>
              </div>

              {confirmarSenha.length > 0 && !senhasIguais && (
                <p className="text-[10px] font-black uppercase tracking-wider text-red-500">As senhas nao coincidem.</p>
              )}

              <button
                type="button"
                onClick={handleAtualizarSenha}
                disabled={!podeAtualizarSenha}
                className={`w-full mt-2 px-6 py-4 rounded-[2.5rem] font-black uppercase text-xs tracking-widest transition-all ${
                  podeAtualizarSenha
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {updatingSenha ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

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

