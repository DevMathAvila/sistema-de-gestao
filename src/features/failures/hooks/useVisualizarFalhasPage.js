import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSessionData, getSessionUser, isAdminUser } from '../../../core/auth/session';
import { LISTA_SETORES } from '../../../shared/constants/setores';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';
import { PONTOS, TRAVES } from '../constants/failureConstants';
import {
  buildFalhasDoChamado,
  concluirFalhas,
  countFalhasReais,
  fetchFalhasAbertas,
  fetchHistoricoPonto,
  formatDateTime,
  getStatusTrave,
  normalizeText,
  splitFalhas,
  traveTemParada,
} from '../services/failuresService';
import { getFailureTheme } from '../styles/failureTheme';

function isPointMatch(recordPoint, pointNum) {
  const pStr = String(recordPoint || '');
  const normalized = normalizeText(pStr);
  if (normalized.includes('travetoda') || pStr.includes('1-15')) return true;
  const pointRegex = new RegExp(`(^|,|\\s|ponto)${pointNum}($|,|\\s)`);
  return pointRegex.test(normalized);
}

export function useVisualizarFalhasPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = usePersistentTheme();

  const [falhas, setFalhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setorAberto, setSetorAberto] = useState(null);
  const [traveAberta, setTraveAberta] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [etapaFechamento, setEtapaFechamento] = useState(false);
  const [solucaoTexto, setSolucaoTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [falhasSelecionadas, setFalhasSelecionadas] = useState([]);
  const [historicoPonto, setHistoricoPonto] = useState([]);
  const [loadingHistoricoPonto, setLoadingHistoricoPonto] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mostrarHistoricoCompleto, setMostrarHistoricoCompleto] = useState(false);

  useBodyScrollLock(mobileMenuOpen);

  const user = getSessionUser() || { username: 'Tecnico', role: 'colaborador' };
  const isColaborador = user.role === 'colaborador';
  const isAdmin = isAdminUser(user);

  const styles = useMemo(() => getFailureTheme(theme), [theme]);

  const buscarFalhas = useCallback(async () => {
    try {
      const data = await fetchFalhasAbertas();
      setFalhas(data);
    } catch {
      setFalhas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarFalhas();
    const interval = setInterval(buscarFalhas, 5000);
    return () => clearInterval(interval);
  }, [buscarFalhas]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const apply = (evt) => setIsMobileView(evt.matches);
    setIsMobileView(media.matches);
    if (typeof media.addEventListener === 'function') media.addEventListener('change', apply);
    else media.addListener(apply);
    return () => {
      if (typeof media.removeEventListener === 'function') media.removeEventListener('change', apply);
      else media.removeListener(apply);
    };
  }, []);

  useEffect(() => {
    if (!modalData || String(modalData.ponto) === 'Todos') {
      setHistoricoPonto([]);
      setLoadingHistoricoPonto(false);
      setMostrarHistoricoCompleto(false);
      return;
    }

    let cancelled = false;
    setLoadingHistoricoPonto(true);
    setMostrarHistoricoCompleto(false);

    fetchHistoricoPonto({
      setor: modalData.setor,
      trave: modalData.trave,
      ponto: `Ponto ${modalData.ponto}`,
      limite: 5,
    })
      .then((data) => {
        if (!cancelled) setHistoricoPonto(data);
      })
      .catch(() => {
        if (!cancelled) setHistoricoPonto([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistoricoPonto(false);
      });

    return () => {
      cancelled = true;
    };
  }, [modalData]);

  useEffect(() => {
    if (!modalData) {
      setFalhasSelecionadas([]);
      return;
    }
    const disponiveis = Array.isArray(modalData.falhasDisponiveis) ? modalData.falhasDisponiveis : [];
    setFalhasSelecionadas(disponiveis);
  }, [modalData]);

  const falhasPorSetor = useMemo(() => {
    const grouped = {};
    const setorLookup = {};
    LISTA_SETORES.forEach((setor) => {
      grouped[setor] = [];
      setorLookup[normalizeText(setor)] = setor;
    });

    falhas.forEach((f) => {
      const setorOriginal = setorLookup[normalizeText(f.setor)];
      if (!setorOriginal) return;
      grouped[setorOriginal].push(f);
    });

    return grouped;
  }, [falhas]);

  const falhasPorSetorTrave = useMemo(() => {
    const map = {};
    falhas.forEach((f) => {
      const key = `${normalizeText(f.setor)}|${String(f.trave)}`;
      if (!map[key]) map[key] = [];
      map[key].push(f);
    });
    return map;
  }, [falhas]);

  const alertasCriticos = useMemo(() => {
    const grupos = {};
    falhas.forEach((f) => {
      const chave = `${f.setor}-T${f.trave}`;
      if (!grupos[chave]) {
        grupos[chave] = { setor: f.setor, trave: f.trave, count: 0, isTraveToda: false };
      }
      grupos[chave].count += splitFalhas(f.falha).length || 1;
      if (traveTemParada([f])) grupos[chave].isTraveToda = true;
    });
    return Object.values(grupos)
      .filter((g) => g.isTraveToda || g.count >= 5)
      .sort((a, b) => {
        if (a.isTraveToda && !b.isTraveToda) return -1;
        if (!a.isTraveToda && b.isTraveToda) return 1;
        return b.count - a.count;
      });
  }, [falhas]);

  // Mantem o contador consistente com o KPI de pendentes (abertos no momento).
  const falhasAtivasHoje = useMemo(() => falhas.length, [falhas]);

  const historicoVisivel = isMobileView && !mostrarHistoricoCompleto ? historicoPonto.slice(0, 3) : historicoPonto;

  const handleLogout = useCallback(() => {
    clearSessionData();
    navigate('/', { replace: true });
  }, [navigate]);

  const navigateAndCloseMobile = useCallback((path) => {
    setMobileMenuOpen(false);
    navigate(path);
  }, [navigate]);

  const getTraveChamados = useCallback((setor, trave) => {
    const key = `${normalizeText(setor)}|${String(trave)}`;
    return falhasPorSetorTrave[key] || [];
  }, [falhasPorSetorTrave]);

  const getDadosPonto = useCallback((setor, trave, ponto) => {
    const key = `${normalizeText(setor)}|${String(trave)}`;
    const chamadosDaTrave = falhasPorSetorTrave[key] || [];

    const chamadosNoPonto = chamadosDaTrave.filter((f) => {
      return isPointMatch(f.ponto, ponto);
    });
    if (chamadosNoPonto.length === 0) return null;

    const falhasDoChamado = buildFalhasDoChamado(chamadosNoPonto);
    const falhaConcatenada = falhasDoChamado.map((item) => item.falha).join(', ');

    return {
      id: chamadosNoPonto[0].id,
      ids: chamadosNoPonto.map((f) => f.id),
      setor,
      trave,
      ponto,
      falha: falhaConcatenada,
      falhasDisponiveis: falhasDoChamado,
      isMonitor: falhaConcatenada.toLowerCase().includes('monitor'),
    };
  }, [falhasPorSetorTrave]);

  const abrirModalPonto = useCallback((dadosPonto) => {
    if (!dadosPonto || isColaborador) return;
    setEtapaFechamento(false);
    setSolucaoTexto('');
    setModalData(dadosPonto);
  }, [isColaborador]);

  const abrirModalLote = useCallback((setor, trave) => {
    const chamadosDaTrave = getTraveChamados(setor, trave);
    if (!chamadosDaTrave.length) return;
    const falhasDoChamado = buildFalhasDoChamado(chamadosDaTrave);
    setEtapaFechamento(false);
    setSolucaoTexto('');
    setModalData({
      ids: chamadosDaTrave.map((f) => f.id),
      setor,
      trave,
      ponto: 'Todos',
      falha: falhasDoChamado.map((item) => item.falha).join(', '),
      falhasDisponiveis: falhasDoChamado,
      usuario: 'Equipe',
    });
  }, [getTraveChamados]);

  const fecharModal = useCallback(() => {
    setModalData(null);
    setEtapaFechamento(false);
    setSolucaoTexto('');
    setFalhasSelecionadas([]);
  }, []);

  const toggleFalhaSelecionada = useCallback((item) => {
    setFalhasSelecionadas((prev) => {
      const exists = prev.some((f) => f.key === item.key);
      if (exists) return prev.filter((f) => f.key !== item.key);
      return [...prev, item];
    });
  }, []);

  const handleFinalizarChamado = useCallback(async () => {
    if (!solucaoTexto.trim() || falhasSelecionadas.length === 0) return;
    if (isColaborador) {
      alert('Colaborador nao tem permissao para concluir falhas.');
      return;
    }

    setEnviando(true);
    try {
      const idsParaFechar = modalData?.ids || (modalData?.id ? [modalData.id] : []);
      const payloadFalhas = falhasSelecionadas.map((item) => ({ id: item.id, falha: item.falha }));
      await concluirFalhas({ ids: idsParaFechar, solucao: solucaoTexto, falhasSelecionadas: payloadFalhas });
      fecharModal();
      buscarFalhas();
    } catch (err) {
      alert(err?.message || 'Erro ao concluir');
    } finally {
      setEnviando(false);
    }
  }, [buscarFalhas, falhasSelecionadas, fecharModal, isColaborador, modalData, solucaoTexto]);

  const irParaTraveRecorrente = useCallback((setor, trave) => {
    setSetorAberto(setor);
    setTraveAberta(Number(trave));
    setShowNotifications(false);
    setTimeout(() => {
      const elemento = document.getElementById(`anchor-${normalizeText(setor)}-${trave}`);
      if (elemento) elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
  }, []);

  return {
    theme,
    toggleTheme,
    styles,
    user,
    isAdmin,
    isColaborador,
    loading,
    falhas,
    falhasPorSetor,
    traveAberta,
    setTraveAberta,
    setorAberto,
    setSetorAberto,
    setors: LISTA_SETORES,
    traves: TRAVES,
    pontos: PONTOS,
    getTraveChamados,
    getStatusTrave,
    countFalhasReais,
    getDadosPonto,
    alertasCriticos,
    falhasAtivasHoje,
    showNotifications,
    setShowNotifications,
    irParaTraveRecorrente,
    mobileMenuOpen,
    setMobileMenuOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    navigateAndCloseMobile,
    handleLogout,
    navigate,
    modalData,
    abrirModalPonto,
    abrirModalLote,
    fecharModal,
    etapaFechamento,
    setEtapaFechamento,
    solucaoTexto,
    setSolucaoTexto,
    enviando,
    falhasSelecionadas,
    toggleFalhaSelecionada,
    handleFinalizarChamado,
    historicoPonto,
    loadingHistoricoPonto,
    historicoVisivel,
    mostrarHistoricoCompleto,
    setMostrarHistoricoCompleto,
    isMobileView,
    formatDateTime,
  };
}
