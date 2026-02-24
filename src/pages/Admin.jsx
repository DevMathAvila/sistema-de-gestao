import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Users, BarChart3, Trash2, 
  LayoutDashboard, Loader2, Search, Calendar, AlertTriangle
} from 'lucide-react';
import { supabase } from '../services/supabase';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [falhasStats, setFalhasStats] = useState([]);
  const [setorFiltro, setSetorFiltro] = useState('TODOS');
  const [loading, setLoading] = useState(true); 
  
  const [historicoFalhas, setHistoricoFalhas] = useState([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [buscandoHistorico, setBuscandoHistorico] = useState(false);

  const [novoUser, setNovoUser] = useState({ username: '', senha: '', role: 'técnico' });
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const COLUNA_DATA = 'created_at'; 

  // --- FUNÇÕES DE BUSCA (Memorizadas para performance) ---
  const buscarUsuarios = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('usuarios').select('*').order('username');
      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) {
      console.error(`Erro: ${err.message}`);
    }
  }, []);

  const buscarEstatisticas = useCallback(async () => {
    try {
      let query = supabase.from('registros_falhas').select('falha');
      if (setorFiltro !== 'TODOS') query = query.eq('setor', setorFiltro);
      const { data, error } = await query;
      if (error) throw error;
      
      const contagemIndividual = {};
      data?.forEach(reg => {
        const lista = reg.falha.split(',').map(item => item.trim());
        lista.forEach(f => { if (f) contagemIndividual[f] = (contagemIndividual[f] || 0) + 1; });
      });
      
      const statsFormatadas = Object.entries(contagemIndividual)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total);
      setFalhasStats(statsFormatadas);
    } catch (err) {
      console.error(`Erro Pareto: ${err.message}`);
    }
  }, [setorFiltro]);

  const buscarHistorico = useCallback(async () => {
    setBuscandoHistorico(true);
    try {
      let query = supabase.from('registros_falhas').select('*').order(COLUNA_DATA, { ascending: false });
      if (dataInicio && dataFim) {
        query = query.gte(COLUNA_DATA, `${dataInicio}T00:00:00.000Z`)
                     .lte(COLUNA_DATA, `${dataFim}T23:59:59.999Z`);
      }
      const { data, error } = await query;
      if (error) throw error;
      setHistoricoFalhas(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setBuscandoHistorico(false);
    }
  }, [dataInicio, dataFim]);

  // --- CONTROLE DE ACESSO ---
  useEffect(() => {
    const sessaoSativa = localStorage.getItem('lenovo_user');
    if (!sessaoSativa) { navigate('/'); return; }
    const user = JSON.parse(sessaoSativa);
    if (user.role !== 'admin') {
      navigate('/dashboard');
    } else {
      setLoading(false); 
    }
  }, [navigate]);

  useEffect(() => {
    if (!loading) {
      if (activeTab === 'usuarios') buscarUsuarios();
      if (activeTab === 'estatisticas') buscarEstatisticas();
      if (activeTab === 'historico') buscarHistorico();
    }
  }, [activeTab, loading, buscarUsuarios, buscarEstatisticas, buscarHistorico]);

  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    if (!novoUser.username || !novoUser.senha) return;
    try {
      const { error } = await supabase.from('usuarios').insert([
        { username: novoUser.username.toLowerCase().trim(), senha: novoUser.senha, role: novoUser.role }
      ]);
      if (error) throw error;
      setNovoUser({ username: '', senha: '', role: 'técnico' });
      setFeedback({ type: 'success', text: 'Acesso criado!' });
      buscarUsuarios();
      setTimeout(() => setFeedback({ type: '', text: '' }), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const deletarUsuario = async (id) => {
    if(!window.confirm("Excluir este acesso?")) return;
    await supabase.from('usuarios').delete().eq('id', id);
    buscarUsuarios();
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-white/10 p-6 flex flex-col bg-[#0A0A0A]">
        <div className="flex items-center gap-3 mb-10 text-red-600">
          <ShieldCheck size={30} />
          <h1 className="text-xl font-black tracking-tighter text-white italic">LENOVO ADMIN</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('usuarios')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'usuarios' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}><Users size={20} /> Equipe</button>
          <button onClick={() => setActiveTab('estatisticas')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'estatisticas' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}><BarChart3 size={20} /> Pareto</button>
          <button onClick={() => setActiveTab('historico')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'historico' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}><Calendar size={20} /> Histórico</button>
          <hr className="border-white/5 my-4" />
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-white group transition-all"><LayoutDashboard size={20} className="group-hover:text-red-600" /> Sair do Admin</button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {feedback.text && (
          <div className={`mb-4 p-3 rounded-xl text-[10px] font-black uppercase text-center ${feedback.type === 'error' ? 'bg-red-600/20 text-red-500' : 'bg-green-600/20 text-green-500'}`}>
            {feedback.text}
          </div>
        )}

        {/* GESTÃO DE USUÁRIOS */}
        {activeTab === 'usuarios' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black mb-8 uppercase italic tracking-tighter">Controle de Acessos</h2>
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl mb-10">
              <form onSubmit={handleCriarUsuario} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Usuário" className="bg-black border border-white/10 p-4 rounded-2xl outline-none" value={novoUser.username} onChange={e => setNovoUser({...novoUser, username: e.target.value})} />
                <input type="text" placeholder="Senha" className="bg-black border border-white/10 p-4 rounded-2xl outline-none" value={novoUser.senha} onChange={e => setNovoUser({...novoUser, senha: e.target.value})} />
                <select className="bg-black border border-white/10 p-4 rounded-2xl outline-none" value={novoUser.role} onChange={e => setNovoUser({...novoUser, role: e.target.value})}>
                  <option value="técnico">Técnico</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="bg-white text-black font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase text-xs">Criar</button>
              </form>
            </div>

            <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/5 bg-white/[0.02]">
                    <th className="p-6">Nível</th><th className="p-6">Usuário</th><th className="p-6">Senha</th><th className="p-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="p-6 text-[9px] font-black uppercase text-red-500">{u.role}</td>
                      <td className="p-6 font-bold">{u.username}</td>
                      <td className="p-6 font-mono text-gray-500">{u.senha}</td>
                      <td className="p-6 text-right"><button onClick={() => deletarUsuario(u.id)} className="text-gray-700 hover:text-red-500"><Trash2 size={18} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PARETO DE FALHAS */}
        {activeTab === 'estatisticas' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10 gap-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-600">Pareto de Falhas</h2>
              <select value={setorFiltro} onChange={e => setSetorFiltro(e.target.value)} className="bg-white/5 border border-white/10 text-white font-bold p-3 rounded-2xl outline-none">
                <option value="TODOS" className="bg-black text-red-500">GERAL (TODOS)</option>
                {["Runin 01", "Runin 02", "Runin 03", "Runin 04", "Runin 05", "Runin 06", "Runin 07", "Runin 08", "Runin 09", "Runin 10", "AVT"].map(s => (
                  <option key={s} value={s} className="bg-black">{s}</option>
                ))}
              </select>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2rem]">
              <div className="space-y-6">
                {falhasStats.map((item) => (
                  <div key={item.nome}>
                    <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">
                      <span>{item.nome}</span><span className="text-red-600">{item.total} Ocorrências</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${(item.total / (falhasStats[0]?.total || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
                {falhasStats.length === 0 && <p className="text-center text-gray-600 py-10">Nenhuma falha registrada neste setor.</p>}
              </div>
            </div>
          </section>
        )}

        {/* HISTÓRICO GERAL (EM MANUTENÇÃO) */}
        {activeTab === 'historico' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center py-20">
            <div className="bg-red-600/10 p-10 rounded-[3rem] border border-red-600/20 text-center">
                <AlertTriangle size={60} className="text-red-600 mx-auto mb-6 animate-pulse" />
                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Histórico em Manutenção</h2>
                <p className="text-gray-500 text-sm max-w-xs mx-auto uppercase font-bold tracking-widest">Estamos otimizando o banco de dados para consultas de longo período.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Admin;