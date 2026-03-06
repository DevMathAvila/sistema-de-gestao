import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [salvandoUsuario, setSalvandoUsuario] = useState(false);
  const [removendoUsuario, setRemovendoUsuario] = useState(false);
  const [usuarioPendenteRemocao, setUsuarioPendenteRemocao] = useState(null);
  const [userActionFeedback, setUserActionFeedback] = useState(null);
  const feedbackTimerRef = useRef(null);

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

  const showUserFeedback = useCallback((type, message) => {
    setUserActionFeedback({ type, message });
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setUserActionFeedback(null);
    }, 4200);
  }, []);

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
    if (!novoUser.username || !novoUser.senha) {
      showUserFeedback('error', 'Preencha username e senha para cadastrar.');
      return;
    }

    const roleSelecionada = String(novoUser.role || '').toLowerCase();
    const rolePermitida = roleOptions.some((opt) => opt.value === roleSelecionada)
      ? roleSelecionada
      : roleOptions[0].value;

    setSalvandoUsuario(true);
    try {
      await createUsuario({
        username: novoUser.username,
        senha: novoUser.senha,
        role: rolePermitida,
      });
      setNovoUser({ username: '', senha: '', role: roleOptions[0].value });
      await fetchUsuarios();
      showUserFeedback('success', 'Usuario criado com sucesso.');
    } catch (err) {
      showUserFeedback('error', err?.message || 'Erro ao criar usuario.');
    } finally {
      setSalvandoUsuario(false);
    }
  }, [novoUser, roleOptions, fetchUsuarios, showUserFeedback]);

  const handleAskRemoveUser = useCallback((user) => {
    if (!isMaster || !user) return;
    setUsuarioPendenteRemocao(user);
  }, [isMaster]);

  const handleCancelRemoveUser = useCallback(() => {
    if (removendoUsuario) return;
    setUsuarioPendenteRemocao(null);
  }, [removendoUsuario]);

  const handleConfirmRemoveUser = useCallback(async () => {
    const authUserId = usuarioPendenteRemocao?.auth_user_id || usuarioPendenteRemocao?.id;
    if (!authUserId) {
      showUserFeedback('error', 'ID de usuario invalido para remocao.');
      return;
    }

    setRemovendoUsuario(true);
    try {
      await removeUsuario(authUserId);
      await fetchUsuarios();
      showUserFeedback('success', `Usuario "${usuarioPendenteRemocao?.username || ''}" removido.`);
      setUsuarioPendenteRemocao(null);
    } catch (err) {
      showUserFeedback('error', err?.message || 'Erro ao remover usuario.');
    }
    finally {
      setRemovendoUsuario(false);
    }
  }, [fetchUsuarios, showUserFeedback, usuarioPendenteRemocao]);

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

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    };
  }, []);

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
    salvandoUsuario,
    removendoUsuario,
    usuarioPendenteRemocao,
    userActionFeedback,
    handleCreateUser,
    handleAskRemoveUser,
    handleCancelRemoveUser,
    handleConfirmRemoveUser,
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
