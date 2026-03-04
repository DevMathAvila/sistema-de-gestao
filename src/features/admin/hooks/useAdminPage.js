import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getSessionUser, isAdminUser, isMasterUser } from '../../../core/auth/session';
import { SETOR_TODOS } from '../../../shared/constants/setores';
import { ADMIN_NAV_ITEMS, getRoleOptions, resolveAdminTab } from '../constants/adminConfig';
import {
  createUsuario,
  exportHistoricoAbertoExcel,
  exportHistoricoConcluidoExcel,
  loadHistoricoAberto,
  loadHistoricoConcluido,
  loadParetoStats,
  loadUsuarios,
  removeUsuario,
} from '../services/adminService';
import { getAdminThemeClasses } from '../styles/adminTheme';

export function useAdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    return resolveAdminTab(tab);
  });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [usuarios, setUsuarios] = useState([]);
  const [novoUser, setNovoUser] = useState({ username: '', senha: '', role: 'tecnico' });

  const [setorFiltro, setSetorFiltro] = useState(SETOR_TODOS);
  const [falhasStats, setFalhasStats] = useState([]);

  const [historicoSubAba, setHistoricoSubAba] = useState('concluidas');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [historico, setHistorico] = useState([]);
  const [historicoAbertas, setHistoricoAbertas] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [loadingHistoricoAbertas, setLoadingHistoricoAbertas] = useState(false);

  const intervaloInvalido = Boolean(dataInicio && dataFim && dataInicio > dataFim);
  const currentUser = getSessionUser() || { role: 'colaborador' };
  const isMaster = isMasterUser(currentUser);
  const roleOptions = useMemo(() => getRoleOptions(isMaster), [isMaster]);
  const s = useMemo(() => getAdminThemeClasses(theme), [theme]);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  }, [theme]);

  const fetchUsuarios = useCallback(async () => {
    try {
      setUsuarios(await loadUsuarios());
    } catch {
      setUsuarios([]);
    }
  }, []);

  const fetchParetoStats = useCallback(async () => {
    try {
      setFalhasStats(await loadParetoStats(setorFiltro));
    } catch {
      setFalhasStats([]);
    }
  }, [setorFiltro]);

  const fetchHistoricoConcluido = useCallback(async () => {
    if (intervaloInvalido) {
      setHistorico([]);
      return;
    }
    try {
      setLoadingHistorico(true);
      setHistorico(await loadHistoricoConcluido(dataInicio, dataFim));
    } catch {
      setHistorico([]);
    } finally {
      setLoadingHistorico(false);
    }
  }, [dataInicio, dataFim, intervaloInvalido]);

  const fetchHistoricoAberto = useCallback(async () => {
    if (intervaloInvalido) {
      setHistoricoAbertas([]);
      return;
    }
    try {
      setLoadingHistoricoAbertas(true);
      setHistoricoAbertas(await loadHistoricoAberto(dataInicio, dataFim));
    } catch {
      setHistoricoAbertas([]);
    } finally {
      setLoadingHistoricoAbertas(false);
    }
  }, [dataInicio, dataFim, intervaloInvalido]);

  const handleCreateUser = useCallback(async (e) => {
    e.preventDefault();
    if (!novoUser.username || !novoUser.senha) return;

    const roleSelecionada = String(novoUser.role || '').toLowerCase();
    const rolePermitida = roleOptions.some((opt) => opt.value === roleSelecionada)
      ? roleSelecionada
      : roleOptions[0].value;

    setLoading(true);
    try {
      await createUsuario({
        username: novoUser.username,
        senha: novoUser.senha,
        role: rolePermitida,
      });
      setNovoUser({ username: '', senha: '', role: roleOptions[0].value });
      await fetchUsuarios();
    } catch (err) {
      alert(err?.message || 'Erro ao criar usuario');
    } finally {
      setLoading(false);
    }
  }, [novoUser, roleOptions, fetchUsuarios]);

  const handleRemoveUser = useCallback(async (userId) => {
    if (!window.confirm('Remover acesso deste usuario?')) return;
    try {
      await removeUsuario(userId);
      await fetchUsuarios();
    } catch (err) {
      alert(err?.message || 'Erro ao remover usuario');
    }
  }, [fetchUsuarios]);

  const handleExportHistorico = useCallback(() => {
    exportHistoricoConcluidoExcel(historico);
  }, [historico]);

  const handleExportAbertas = useCallback(() => {
    exportHistoricoAbertoExcel(historicoAbertas);
  }, [historicoAbertas]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(resolveAdminTab(tab));
  }, [location.search]);

  useEffect(() => {
    const user = getSessionUser();
    if (!user) {
      navigate('/', { replace: true });
      return;
    }
    if (!isAdminUser(user)) {
      navigate('/dashboard', { replace: true });
      return;
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (loading) return;
    if (activeTab === 'usuarios') fetchUsuarios();
    if (activeTab === 'estatisticas') fetchParetoStats();
    if (activeTab === 'historico') {
      if (historicoSubAba === 'concluidas') fetchHistoricoConcluido();
      else fetchHistoricoAberto();
    }
  }, [
    activeTab,
    fetchHistoricoAberto,
    fetchHistoricoConcluido,
    fetchParetoStats,
    fetchUsuarios,
    historicoSubAba,
    loading,
  ]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return {
    s,
    theme,
    loading,
    currentUser,
    isMaster,
    roleOptions,
    activeTab,
    setActiveTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    toggleTheme,
    navItems: ADMIN_NAV_ITEMS,
    novoUser,
    setNovoUser,
    usuarios,
    handleCreateUser,
    handleRemoveUser,
    setorFiltro,
    setSetorFiltro,
    falhasStats,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    intervaloInvalido,
    historicoSubAba,
    setHistoricoSubAba,
    historico,
    historicoAbertas,
    loadingHistorico,
    loadingHistoricoAbertas,
    handleExportHistorico,
    handleExportAbertas,
  };
}
