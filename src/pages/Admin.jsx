import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Users, BarChart3, Trash2, 
  LayoutDashboard, Filter, HardDrive, Loader2, RefreshCw, UserPlus 
} from 'lucide-react';
import { supabase } from '../services/supabase';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [falhasStats, setFalhasStats] = useState([]);
  const [setorFiltro, setSetorFiltro] = useState('Runin 01');
  const [loading, setLoading] = useState(true); 
  
  const [novoUser, setNovoUser] = useState({ username: '', senha: '', role: 'técnico' });

  // 1. FUNÇÃO DE SEGURANÇA (VERIFICAÇÃO DE ROLE)
  useEffect(() => {
    const verificarAcesso = () => {
      const sessaoSativa = localStorage.getItem('lenovo_user');
      
      if (!sessaoSativa) {
        navigate('/');
        return;
      }

      const user = JSON.parse(sessaoSativa);

      if (user.role !== 'admin') {
        alert("⚠️ ACESSO NEGADO: Esta área é restrita a administradores.");
        navigate('/dashboard');
      } else {
        setLoading(false); 
      }
    };

    verificarAcesso();
  }, [navigate]);

  // 2. BUSCA DE DADOS
  useEffect(() => {
    if (!loading) {
      if (activeTab === 'usuarios') buscarUsuarios();
      if (activeTab === 'estatisticas') buscarEstatisticas();
    }
  }, [activeTab, setorFiltro, loading]);

  const buscarUsuarios = async () => {
    try {
      const { data, error } = await supabase.from('usuarios').select('*').order('username');
      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err.message);
    }
  };

  const buscarEstatisticas = async () => {
    try {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('tipo_falha')
        .eq('setor', setorFiltro);

      if (error) throw error;

      const contagemIndividual = {};
      data?.forEach(reg => {
        const lista = reg.tipo_falha.split(',').map(item => item.trim());
        lista.forEach(f => {
          if (f) {
            contagemIndividual[f] = (contagemIndividual[f] || 0) + 1;
          }
        });
      });

      const statsFormatadas = Object.entries(contagemIndividual)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total);

      setFalhasStats(statsFormatadas);
    } catch (err) {
      console.error("Erro estatísticas:", err.message);
    }
  };

  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    if (!novoUser.username || !novoUser.senha) return alert("Preencha usuário e senha!");

    setLoading(true);
    try {
      const { error } = await supabase.from('usuarios').insert([
        { 
          username: novoUser.username.toLowerCase().trim(), 
          senha: novoUser.senha, 
          role: novoUser.role 
        }
      ]);

      if (error) throw error;

      setNovoUser({ username: '', senha: '', role: 'técnico' });
      await buscarUsuarios();
      alert("Usuário criado com sucesso!");
    } catch (err) {
      alert("Erro ao criar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO CORRIGIDA PARA ACEITAR UUID E BIGINT
  const deletarUsuario = async (id) => {
    if (!id) return alert("ID inválido.");

    if (window.confirm("Remover este acesso permanentemente?")) {
      setLoading(true);
      try {
        // INCREMENTO: Detecta se o ID é número ou texto (UUID)
        // Se for número, envia Number(id). Se for UUID, envia o texto original.
        const idFinal = isNaN(Number(id)) ? id : Number(id);

        const { error } = await supabase
          .from('usuarios')
          .delete()
          .eq('id', idFinal);

        if (error) throw error;
        
        alert("Acesso removido.");
        await buscarUsuarios();
      } catch (err) {
        alert("Erro ao deletar: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Admin */}
      <aside className="w-full md:w-64 border-r border-white/10 p-6 flex flex-col bg-[#0A0A0A]">
        <div className="flex items-center gap-3 mb-10 text-red-600">
          <ShieldCheck size={30} />
          <h1 className="text-xl font-black tracking-tighter text-white italic">LENOVO ADMIN</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'usuarios' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}
          >
            <Users size={20} /> Gestão de Equipe
          </button>
          <button 
            onClick={() => setActiveTab('estatisticas')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'estatisticas' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}
          >
            <BarChart3 size={20} /> Relatório de Falhas
          </button>
          <hr className="border-white/5 my-4" />
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-white group transition-all">
            <LayoutDashboard size={20} className="group-hover:text-red-600" /> Painel de Linha
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {activeTab === 'usuarios' && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black mb-8 uppercase italic tracking-tighter">Controle de Acessos</h2>
            
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-3xl mb-10 shadow-2xl">
              <h3 className="text-[10px] font-black text-gray-500 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                <UserPlus size={14} className="text-red-600" /> Cadastrar Novo Técnico
              </h3>
              <form onSubmit={handleCriarUsuario} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input 
                  type="text" placeholder="Username" 
                  className="bg-black border border-white/10 p-4 rounded-2xl focus:border-red-600 outline-none transition-all text-sm"
                  value={novoUser.username} onChange={e => setNovoUser({...novoUser, username: e.target.value})}
                />
                <input 
                  type="text" placeholder="Senha" 
                  className="bg-black border border-white/10 p-4 rounded-2xl focus:border-red-600 outline-none transition-all text-sm font-mono"
                  value={novoUser.senha} onChange={e => setNovoUser({...novoUser, senha: e.target.value})}
                />
                <select 
                  className="bg-black border border-white/10 p-4 rounded-2xl outline-none cursor-pointer text-sm"
                  value={novoUser.role} onChange={e => setNovoUser({...novoUser, role: e.target.value})}
                >
                  <option value="técnico">Técnico Operador</option>
                  <option value="admin">Administrador</option>
                </select>
                <button 
                  className="bg-white text-black font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase text-xs tracking-widest"
                >
                  Criar Acesso
                </button>
              </form>
            </div>

            <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02]">
                    <th className="p-6 text-center">Nível</th>
                    <th className="p-6">Usuário</th>
                    <th className="p-6">Senha</th>
                    <th className="p-6">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6 text-center">
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6 font-bold text-gray-300">{u.username}</td>
                      <td className="p-6 font-mono text-red-600 text-sm tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">{u.senha}</td>
                      <td className="p-6">
                        <button onClick={() => deletarUsuario(u.id)} className="text-gray-700 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                          <Trash2 size={18} />
                        </button>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-600">Pareto de Falhas</h2>
              <div className="flex gap-3 w-full md:w-auto">
                <select 
                  value={setorFiltro} onChange={e => setSetorFiltro(e.target.value)}
                  className="flex-1 md:w-48 bg-white/5 border border-white/10 text-white font-bold p-3 rounded-2xl outline-none hover:border-red-600 transition-colors cursor-pointer text-sm"
                >
                  {["Runin 01", "Runin 02", "Runin 03", "Runin 04", "Runin 05", "Runin 06", "Runin 07", "Runin 08", "Runin 09", "Runin 10", "AVT"].map(s => (
                    <option key={s} value={s} className="bg-black">{s}</option>
                  ))}
                </select>
                <button onClick={buscarEstatisticas} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-red-600">
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <h3 className="text-gray-500 text-[10px] font-black uppercase mb-8 tracking-[0.2em] flex items-center gap-2">
                  <Filter size={14} className="text-red-600" /> Frequência por Componente - {setorFiltro}
                </h3>
                
                <div className="space-y-6">
                  {falhasStats.length > 0 ? falhasStats.map((item) => (
                    <div key={item.nome} className="group">
                      <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
                        <span className="text-gray-400 group-hover:text-white transition-colors">{item.nome}</span>
                        <span className="text-red-600">{item.total} Reparos</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-600 rounded-full shadow-[0_0_15px_rgba(226,35,26,0.3)] transition-all duration-1000 ease-out" 
                          style={{ width: `${(item.total / (falhasStats[0]?.total || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                      <p className="text-gray-600 font-mono text-sm uppercase italic">Sem dados registrados neste setor.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-red-600 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(226,35,26,0.15)] relative overflow-hidden group">
                  <HardDrive size={100} className="absolute -right-5 -bottom-5 text-black/10 group-hover:scale-110 transition-transform duration-500" />
                  <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Total do Setor</h4>
                  <span className="text-6xl font-black text-white block tracking-tighter italic">
                    {falhasStats.reduce((a, b) => a + b.total, 0)}
                  </span>
                  <p className="text-[10px] mt-4 text-white/80 font-bold uppercase tracking-widest">Incidentes Catalogados</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] flex-1">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Lógica do Gráfico</h4>
                  <p className="text-xs text-gray-400 leading-relaxed italic">
                    O sistema desmembra registros combinados. <br/><br/>
                    Se um técnico salvar <span className="text-white">"VGA, Rede"</span>, o banco contabiliza individualmente cada componente para gerar um Pareto real de defeitos.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Admin;