import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Users, BarChart3, Trash2, 
  LayoutDashboard, Filter, HardDrive, Loader2, RefreshCw, UserPlus,
  Search, Calendar, CheckCircle2, AlertCircle
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

  // ============================================================
  // QUANDO CHEGAR EM CASA: Verifique o nome da coluna no Supabase
  // e substitua 'created_at' pelo nome correto abaixo:
  const COLUNA_DATA = 'created_at'; 
  // ============================================================

  useEffect(() => {
    const verificarAcesso = () => {
      const sessaoSativa = localStorage.getItem('lenovo_user');
      if (!sessaoSativa) { navigate('/'); return; }
      const user = JSON.parse(sessaoSativa);
      if (user.role !== 'admin') {
        alert("⚠️ ACESSO NEGADO");
        navigate('/dashboard');
      } else {
        setLoading(false); 
      }
    };
    verificarAcesso();
  }, [navigate]);

  useEffect(() => {
    if (!loading) {
      if (activeTab === 'usuarios') buscarUsuarios();
      if (activeTab === 'estatisticas') buscarEstatisticas();
      if (activeTab === 'historico') buscarHistorico();
    }
  }, [activeTab, setorFiltro, loading]);

  const buscarUsuarios = async () => {
    try {
      const { data, error } = await supabase.from('usuarios').select('*').order('username');
      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) { console.error(err.message); }
  };

  const deletarUsuario = async (id) => {
    if(!window.confirm("Excluir este acesso?")) return;
    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);
      if (error) throw error;
      buscarUsuarios();
    } catch (err) { alert(err.message); }
  };

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
      alert("Sucesso!");
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const buscarEstatisticas = async () => {
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
    } catch (err) { console.error("Erro Pareto:", err.message); }
  };

  const buscarHistorico = async () => {
    setBuscandoHistorico(true);
    try {
      let query = supabase.from('registros_falhas').select('*');

      // Tenta ordenar e filtrar apenas se a coluna existir (evita crash na tela)
      query = query.order(COLUNA_DATA, { ascending: false });

      if (dataInicio && dataFim) {
        query = query.gte(COLUNA_DATA, `${dataInicio}T00:00:00.000Z`)
                     .lte(COLUNA_DATA, `${dataFim}T23:59:59.999Z`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setHistoricoFalhas(data || []);
    } catch (err) {
      console.error("Erro no filtro:", err.message);
      // Se der erro de coluna, busca tudo sem filtro para a tabela não ficar vazia
      const { data: backup } = await supabase.from('registros_falhas').select('*').limit(20);
      setHistoricoFalhas(backup || []);
    } finally {
      setBuscandoHistorico(false);
    }
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
          <button onClick={() => setActiveTab('usuarios')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'usuarios' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}><Users size={20} /> Gestão de Equipe</button>
          <button onClick={() => setActiveTab('estatisticas')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'estatisticas' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}><BarChart3 size={20} /> Pareto de Falhas</button>
          <button onClick={() => setActiveTab('historico')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'historico' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}><Calendar size={20} /> Histórico Geral</button>
          <hr className="border-white/5 my-4" />
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-white group transition-all"><LayoutDashboard size={20} className="group-hover:text-red-600" /> Painel de Linha</button>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'usuarios' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black mb-8 uppercase italic tracking-tighter text-white">Controle de Acessos</h2>
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl mb-10 shadow-2xl">
              <form onSubmit={handleCriarUsuario} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Username" className="bg-black border border-white/10 p-4 rounded-2xl focus:border-red-600 outline-none text-sm" value={novoUser.username} onChange={e => setNovoUser({...novoUser, username: e.target.value})} />
                <input type="text" placeholder="Senha" className="bg-black border border-white/10 p-4 rounded-2xl focus:border-red-600 outline-none text-sm font-mono" value={novoUser.senha} onChange={e => setNovoUser({...novoUser, senha: e.target.value})} />
                <select className="bg-black border border-white/10 p-4 rounded-2xl outline-none cursor-pointer text-sm" value={novoUser.role} onChange={e => setNovoUser({...novoUser, role: e.target.value})}>
                  <option value="técnico">Técnico Operador</option>
                  <option value="admin">Administrador</option>
                </select>
                <button className="bg-white text-black font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase text-xs">Criar Acesso</button>
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
                      <td className="p-6 text-right"><button onClick={() => deletarUsuario(u.id)} className="text-gray-700 hover:text-red-500"><Trash2 size={18} /></button></td>
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
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-600">Pareto de Falhas</h2>
              <select value={setorFiltro} onChange={e => setSetorFiltro(e.target.value)} className="bg-white/5 border border-white/10 text-white font-bold p-3 rounded-2xl outline-none hover:border-red-600">
                <option value="TODOS" className="bg-black text-red-500 font-black italic">GERAL (TODOS)</option>
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
                      <span>{item.nome}</span><span className="text-red-600">{item.total} Reparos</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${(item.total / (falhasStats[0]?.total || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'historico' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black mb-8 uppercase italic tracking-tighter text-red-600">Auditoria de Falhas</h2>
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl mb-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase ml-2 italic">Data Inicial</label>
                  <input type="date" className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600 text-sm text-white cursor-pointer" value={dataInicio} onClick={(e) => e.target.showPicker()} onChange={e => setDataInicio(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase ml-2 italic">Data Final</label>
                  <input type="date" className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-red-600 text-sm text-white cursor-pointer" value={dataFim} onClick={(e) => e.target.showPicker()} onChange={e => setDataFim(e.target.value)} />
                </div>
                <button onClick={buscarHistorico} disabled={buscandoHistorico} className="bg-white text-black font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase text-xs h-[54px] flex items-center justify-center gap-2">
                  {buscandoHistorico ? <Loader2 className="animate-spin" size={18} /> : <><Search size={18}/> Aplicar Filtro</>}
                </button>
              </div>
            </div>
            <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02]">
                    <th className="p-6">Status</th><th className="p-6">Data/Hora</th><th className="p-6">Localização</th><th className="p-6">Falha</th><th className="p-6">Técnico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historicoFalhas.map(f => (
                    <tr key={f.id} className="hover:bg-white/[0.01]">
                      <td className="p-6"><span className={`font-black text-[9px] uppercase py-1 px-3 rounded-full border ${f.status === 'aberto' ? 'text-red-500 bg-red-500/5 border-red-500/20' : 'text-green-500 bg-green-500/5 border-green-500/20'}`}>{f.status}</span></td>
                      <td className="p-6 font-bold text-gray-400">{formatarDataBR(f[COLUNA_DATA])}</td>
                      <td className="p-6"><span className="text-sm font-black text-white italic">{f.setor}</span> <span className="text-[10px] text-gray-600 ml-1">T{f.trave} P{f.ponto}</span></td>
                      <td className="p-6 text-xs text-gray-500 max-w-[200px] truncate">{f.falha}</td>
                      <td className="p-6 text-[10px] font-black uppercase text-gray-600">{f.usuario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Admin;