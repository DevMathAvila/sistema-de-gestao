import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Users, BarChart3, Trash2, 
  LayoutDashboard, Loader2, Calendar, Search, AlertTriangle
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

  const COLUNA_DATA = 'created_at'; 

  // --- BUSCAS (Memorizadas para evitar loops) ---
  const buscarUsuarios = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('usuarios').select('*').order('username');
      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) { console.error('Erro usuários:', err.message); }
  }, []);

  const buscarEstatisticas = useCallback(async () => {
    try {
      let query = supabase.from('registros_falhas').select('falha');
      if (setorFiltro !== 'TODOS') query = query.eq('setor', setorFiltro);
      const { data, error } = await query;
      if (error) throw error;
      
      const contagemIndividual = {};
      data?.forEach(reg => {
        if (reg.falha) {
          reg.falha.split(',').map(item => item.trim()).forEach(f => {
            if (f) contagemIndividual[f] = (contagemIndividual[f] || 0) + 1;
          });
        }
      });
      const statsFormatadas = Object.entries(contagemIndividual)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total);
      setFalhasStats(statsFormatadas);
    } catch (err) { console.error("Erro Pareto:", err.message); }
  }, [setorFiltro]);

  const buscarHistorico = useCallback(async () => {
    setBuscandoHistorico(true);
    try {
      let query = supabase.from('registros_falhas').select('*');
      query = query.order(COLUNA_DATA, { ascending: false });

      if (dataInicio && dataFim) {
        query = query.gte(COLUNA_DATA, `${dataInicio}T00:00:00.000Z`)
                     .lte(COLUNA_DATA, `${dataFim}T23:59:59.999Z`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setHistoricoFalhas(data || []);
    } catch (err) {
      console.error("Modo Manutenção Histórico:", err.message);
      setHistoricoFalhas([]); 
    } finally {
      setBuscandoHistorico(false);
    }
  }, [dataInicio, dataFim]);

  // --- EFEITOS ---
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

  // --- AÇÕES ---
  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    if (!novoUser.username || !novoUser.senha) return alert("Preencha tudo!");
    setLoading(true);
    try {
      const { error } = await supabase.from('usuarios').insert([
        { username: novoUser.username.toLowerCase().trim(), senha: novoUser.senha, role: novoUser.role }
      ]);
      if (error) throw error;
      setNovoUser({ username: '', senha: '', role: 'técnico' });
      await buscarUsuarios();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const formatarDataBR = (dataIso) => {
    if (!dataIso) return '-';
    const d = new Date(dataIso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 border-r border-white/10 p-6 flex flex-col bg-[#0A0A0A]">
        <div className="flex items-center gap-3 mb-10 text-red-600">
          <ShieldCheck size={30} />
          <h1 className="text-xl font-black tracking-tighter text-white italic">LENOVO ADMIN</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('usuarios')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'usuarios' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><Users size={20} /> Gestão de Equipe</button>
          <button onClick={() => setActiveTab('estatisticas')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'estatisticas' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><BarChart3 size={20} /> Pareto de Falhas</button>
          <button onClick={() => setActiveTab('historico')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'historico' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><Calendar size={20} /> Histórico Geral</button>
          <hr className="border-white/5 my-4" />
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-white transition-all"><LayoutDashboard size={20} /> Painel de Linha</button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'usuarios' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black mb-8 uppercase italic tracking-tighter">Acessos</h2>
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl mb-10 shadow-2xl">
              <form onSubmit={handleCriarUsuario} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Username" className="bg-black border border-white/10 p-4 rounded-2xl focus:border-red-600 outline-none text-sm" value={novoUser.username} onChange={e => setNovoUser({...novoUser, username: e.target.value})} />
                <input type="text" placeholder="Senha" className="bg-black border border-white/10 p-4 rounded-2xl focus:border-red-600 outline-none text-sm font-mono" value={novoUser.senha} onChange={e => setNovoUser({...novoUser, senha: e.target.value})} />
                <select className="bg-black border border-white/10 p-4 rounded-2xl outline-none text-sm" value={novoUser.role} onChange={e => setNovoUser({...novoUser, role: e.target.value})}>
                  <option value="técnico">Técnico Operador</option>
                  <option value="admin">Administrador</option>
                </select>
                <button className="bg-white text-black font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase text-xs">Criar</button>
              </form>
            </div>
            <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02]">
                    <th className="p-6">Nível</th><th className="p-6">Usuário</th><th className="p-6">Senha</th><th className="p-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 text-[9px] font-black uppercase tracking-widest text-red-500">{u.role}</td>
                      <td className="p-6 font-bold">{u.username}</td>
                      <td className="p-6 font-mono text-gray-500">{u.senha}</td>
                      <td className="p-6 text-right">
                        <button onClick={async () => {if(window.confirm("Excluir?")){await supabase.from('usuarios').delete().eq('id', u.id); buscarUsuarios();}}} className="text-gray-700 hover:text-red-500"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'estatisticas' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10 gap-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-600">Pareto</h2>
              <select value={setorFiltro} onChange={e => setSetorFiltro(e.target.value)} className="bg-white/5 border border-white/10 text-white font-bold p-3 rounded-2xl outline-none">
                <option value="TODOS" className="bg-black">GERAL</option>
                {["Runin 01", "Runin 02", "Runin 03", "Runin 04", "Runin 05", "Runin 06", "Runin 07", "Runin 08", "Runin 09", "Runin 10", "AVT"].map(s => (
                  <option key={s} value={s} className="bg-black">{s}</option>
                ))}
              </select>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] shadow-2xl">
              <div className="space-y-6">
                {falhasStats.map((item) => (
                  <div key={item.nome}>
                    <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">
                      <span>{item.nome}</span><span className="text-red-600">{item.total}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600" style={{ width: `${(item.total / (falhasStats[0]?.total || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'historico' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center py-20 bg-[#0A0A0A] rounded-[3rem] border border-red-600/20 mb-8">
               <AlertTriangle size={48} className="mx-auto text-red-600 mb-4 animate-pulse" />
               <h3 className="font-black uppercase italic text-xl">Relatório de Auditoria</h3>
               <p className="text-gray-500 text-sm">Este módulo está sendo otimizado para o novo banco de dados.</p>
             </div>

            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl mb-8 shadow-2xl opacity-50 pointer-events-none">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <input type="date" className="bg-black border border-white/10 p-4 rounded-2xl text-sm" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                <input type="date" className="bg-black border border-white/10 p-4 rounded-2xl text-sm" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                <button className="bg-white text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2 uppercase text-xs"><Search size={18}/> Filtrar</button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Admin;