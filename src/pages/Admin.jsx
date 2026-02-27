import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, BarChart3, Trash2, Sun, Moon,
  LayoutDashboard, Loader2, Calendar, AlertTriangle, UserPlus
} from 'lucide-react';
import { LISTA_SETORES, SETOR_TODOS } from '../data/setores';
import * as api from '../services/supabaseSecure';
import * as XLSX from 'xlsx';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [falhasStats, setFalhasStats] = useState([]);
  const [setorFiltro, setSetorFiltro] = useState(SETOR_TODOS);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [novoUser, setNovoUser] = useState({ username: '', senha: '', role: 'técnico' });
  const [historico, setHistorico] = useState([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const buscarUsuarios = useCallback(async () => {
    try {
      const { data, error } = await api.listarUsuarios();
      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) { /* erro tratado na UI */ }
  }, []);

  const buscarEstatisticas = useCallback(async () => {
    try {
      const { data, error } = await api.listarRegistrosFalhas(setorFiltro);
      if (error) throw error;
      const contagemIndividual = {};
      data?.forEach(reg => {
        if (reg.falha) {
          const partes = reg.falha.split(',')
            .map(item => item.trim())
            .filter(item => item !== '');
          partes.forEach(f => {
            contagemIndividual[f] = (contagemIndividual[f] || 0) + 1;
          });
        }
      });
      const statsFormatadas = Object.entries(contagemIndividual)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total);
      setFalhasStats(statsFormatadas);
    } catch (err) { /* erro Pareto */ }
  }, [setorFiltro]);

  const buscarHistorico = useCallback(async () => {
    try {
      setLoadingHistorico(true);
      const { data, error } = await api.listarOcorrenciasConcluidas(
        dataInicio || null,
        dataFim || null
      );
      if (error) throw error;
      setHistorico(data || []);
    } catch {
      // falha silenciosa; pode ser logada se necessário
    } finally {
      setLoadingHistorico(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lenovo_user');
      if (!stored) { navigate('/', { replace: true }); return; }
      const user = JSON.parse(stored);
      if (!user || user.role !== 'admin') {
        navigate('/dashboard', { replace: true });
      } else {
        setLoading(false);
      }
    } catch {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!loading) {
      if (activeTab === 'usuarios') buscarUsuarios();
      if (activeTab === 'estatisticas') buscarEstatisticas();
      if (activeTab === 'historico') buscarHistorico();
    }
  }, [activeTab, loading, buscarUsuarios, buscarEstatisticas, buscarHistorico]);

  const handleExportHistoricoExcel = () => {
    if (!historico || historico.length === 0) return;
    const rows = historico.map((item) => ({
      'Run In': item.setor || '',
      Trave: item.trave ?? '',
      Ponto: item.ponto ?? '',
      Falha: item.falha || '',
      'Descrição': item.solucao || '',
      Dia: item.resolvido_em || '',
      'Finalizado por': item.resolvido_por || '',
      'Criado por': item.usuario || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico');
    XLSX.writeFile(workbook, 'historico_registros_falhas.xlsx');
  };

  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    if (!novoUser.username || !novoUser.senha) return;
    setLoading(true);
    try {
      const { error } = await api.criarUsuario({
        username: novoUser.username,
        senha: novoUser.senha,
        role: novoUser.role,
      });
      if (error) throw error;
      setNovoUser({ username: '', senha: '', role: 'técnico' });
      await buscarUsuarios();
    } catch (err) { alert(err?.message || 'Erro ao criar usuário'); } finally { setLoading(false); }
  };

  const s = {
    bg: theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-[#0A0A0A] border-white/10' : 'bg-white border-slate-200 shadow-xl',
    card: theme === 'dark' ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-100 shadow-lg shadow-slate-200/50',
    input: theme === 'dark' ? 'bg-black border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    sub: theme === 'dark' ? 'text-gray-500' : 'text-slate-400'
  };

  if (loading) return (
    <div className={`min-h-screen ${s.bg} flex items-center justify-center`}>
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  return (
    <div className={`min-h-screen ${s.bg} ${s.text} flex flex-col md:flex-row font-sans transition-colors duration-500`}>
      
      <aside className={`w-full md:w-72 ${s.sidebar} border-r p-8 flex flex-col z-20`}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3 text-red-600">
            <ShieldCheck size={32} strokeWidth={2.5} />
            <div>
              <h1 className="text-xl font-black tracking-tighter text-red-600 italic leading-none">ADMIN</h1>
              <span className={`text-[8px] font-bold uppercase tracking-widest ${s.sub}`}>Privileged Access</span>
            </div>
          </div>
          <button onClick={toggleTheme} className={`p-2 rounded-xl border ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
            {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-red-600" />}
          </button>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'usuarios', label: 'Gestão de Equipe', icon: Users },
            { id: 'estatisticas', label: 'Pareto de Falhas', icon: BarChart3 },
            { id: 'historico', label: 'Histórico Geral', icon: Calendar }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-wider ${
                activeTab === item.id 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                : `${s.sub} hover:bg-red-600/5 hover:text-red-600`
              }`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
          <div className={`my-8 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`} />
          <button onClick={() => navigate('/dashboard')} className={`w-full flex items-center gap-3 p-4 ${s.sub} hover:text-red-600 transition-all font-black text-[10px] uppercase`}>
            <LayoutDashboard size={20} /> Painel de Linha
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === 'usuarios' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <header className="mb-10">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Controle de <span className="text-red-600">Acessos</span></h2>
              <p className={s.sub}>Cadastre novos técnicos ou gerencie permissões administrativas.</p>
            </header>

            <div className={`${s.card} p-8 rounded-[2.5rem] mb-10`}>
              <form onSubmit={handleCriarUsuario} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-2 opacity-50">Username</label>
                  <input type="text" placeholder="ex: jsilva" className={`${s.input} w-full p-4 rounded-2xl focus:ring-2 ring-red-600/20 outline-none text-sm transition-all`} value={novoUser.username} onChange={e => setNovoUser({...novoUser, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-2 opacity-50">Senha de Acesso</label>
                  <input type="text" placeholder="••••" className={`${s.input} w-full p-4 rounded-2xl focus:ring-2 ring-red-600/20 outline-none text-sm font-mono transition-all`} value={novoUser.senha} onChange={e => setNovoUser({...novoUser, senha: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-2 opacity-50">Nível</label>
                  <select className={`${s.input} w-full p-4 rounded-2xl outline-none text-sm`} value={novoUser.role} onChange={e => setNovoUser({...novoUser, role: e.target.value})}>
                    <option value="técnico">Técnico Operador</option>
                    <option value="admin">Administrador</option>
                    <option value="colaborador">Colaborador</option>
                  </select>
                </div>
                <button className="mt-6 h-[52px] bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all uppercase text-xs flex items-center justify-center gap-2">
                  <UserPlus size={18} /> Criar Usuário
                </button>
              </form>
            </div>

            <div className={`${s.card} rounded-[2.5rem] overflow-hidden`}>
              <table className="w-full text-left">
                <thead>
                  <tr className={`${theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50'} text-[10px] font-black uppercase tracking-widest ${s.sub} border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                    <th className="p-6 text-red-600">Nível</th>
                    <th className="p-6 text-current">Usuário</th>
                    <th className="p-6 text-current">Credencial</th>
                    <th className="p-6 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                  {usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-red-600/[0.02] transition-colors">
                      <td className="p-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'admin' ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>{u.role}</span></td>
                      <td className="p-6 font-bold">{u.username}</td>
                      <td className="p-6 font-mono text-xs opacity-50">{u.senha}</td>
                      <td className="p-6 text-right">
                        <button onClick={async () => {
                          if (!window.confirm('Remover acesso deste usuário?')) return;
                          const { error } = await api.removerUsuario(u.id);
                          if (!error) await buscarUsuarios();
                          else alert(error.message);
                        }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'estatisticas' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Gráfico <span className="text-red-600">Pareto</span></h2>
                <p className={s.sub}>Análise de recorrência por componente.</p>
              </div>
              <select value={setorFiltro} onChange={e => setSetorFiltro(e.target.value)} 
                className={`${s.input} font-black text-[10px] p-4 rounded-2xl outline-none border-2 border-red-600/20 uppercase tracking-widest`}>
                <option value={SETOR_TODOS}>TODOS OS SETORES</option>
                {LISTA_SETORES.map((setorNome) => (
                  <option key={setorNome} value={setorNome}>{setorNome.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className={`${s.card} p-10 rounded-[3rem]`}>
              <div className="space-y-8">
                {falhasStats.map((item) => (
                  <div key={item.nome} className="group">
                    <div className="flex justify-between text-[11px] font-black mb-3 uppercase tracking-widest">
                      <span className={s.sub}>{item.nome}</span>
                      <span className="text-red-600 font-black">{item.total} Ocorrências</span>
                    </div>
                    <div className={`w-full h-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'} rounded-full overflow-hidden p-1`}>
                      <div className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-1000 group-hover:brightness-110 shadow-lg shadow-red-600/20" 
                        style={{ width: `${(item.total / (falhasStats[0]?.total || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
                {falhasStats.length === 0 && (
                  <div className="text-center py-10 italic opacity-50">Nenhum dado registrado para este filtro.</div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'historico' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                  Histórico <span className="text-red-600">Geral</span>
                </h2>
                <p className={s.sub}>Visualize todas as ocorrências concluídas em linha.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="flex gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">De</span>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className={`${s.input} px-4 py-2 rounded-2xl text-xs`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">Até</span>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className={`${s.input} px-4 py-2 rounded-2xl text-xs`}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportHistoricoExcel}
                  disabled={!historico.length}
                  className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${
                    historico.length
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Exportar Excel
                </button>
              </div>
            </header>

            <div className={`${s.card} rounded-[2.5rem] overflow-hidden`}>
              {loadingHistorico ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-red-600" size={32} />
                </div>
              ) : historico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-600 mb-4">
                    <AlertTriangle size={32} className="animate-pulse" />
                  </div>
                  <h3 className="font-black uppercase italic text-xl mb-2">Nenhum registro encontrado</h3>
                  <p className={`${s.sub} text-xs max-w-sm`}>
                    Ajuste o intervalo de datas ou aguarde novas ocorrências concluídas para visualizar o histórico.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className={`${
                        theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50'
                      } text-[10px] font-black uppercase tracking-widest ${s.sub} border-b ${
                        theme === 'dark' ? 'border-white/5' : 'border-slate-100'
                      }`}
                    >
                      <th className="p-4 md:p-5 text-red-600">Run In</th>
                      <th className="p-4 md:p-5">Trave</th>
                      <th className="p-4 md:p-5">Ponto</th>
                      <th className="p-4 md:p-5">Tipo de Falha</th>
                      <th className="p-4 md:p-5">Data de Conclusão</th>
                      <th className="p-4 md:p-5">Quem Resolveu</th>
                    </tr>
                  </thead>
                  <tbody className={`text-xs divide-y ${theme === 'dark' ? 'divide-white/5' : 'divide-slate-100'}`}>
                    {historico.map((item) => (
                      <tr key={item.id}>
                        <td className="p-4 md:p-5 font-bold">{item.setor}</td>
                        <td className="p-4 md:p-5 font-mono">{item.trave}</td>
                        <td className="p-4 md:p-5 font-mono">{item.ponto}</td>
                        <td className="p-4 md:p-5">
                          <span className="inline-flex px-3 py-1 rounded-full bg-red-600/10 text-red-600 font-black text-[10px] uppercase tracking-widest">
                            {item.falha}
                          </span>
                        </td>
                        <td className="p-4 md:p-5">
                          <span className="text-[11px] font-mono opacity-80">
                            {item.resolvido_em || '-'}
                          </span>
                        </td>
                        <td className="p-4 md:p-5">
                          <span className="text-[11px] font-bold">{item.resolvido_por || '-'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
          background: ${theme === 'dark' ? '#1a1a1a' : '#e2e8f0'}; 
          border-radius: 20px;
          border: 2px solid ${theme === 'dark' ? '#050505' : '#f8fafc'};
        }
      `}} />
    </div>
  );
};

export default Admin;