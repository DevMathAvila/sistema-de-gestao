import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionUser, isAdminUser } from '../../../core/auth/session';
import { LISTA_SETORES } from '../../../shared/constants/setores';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';
import { PONTOS, TRAVES } from '../constants/failureConstants';
import {
  buildFalhasDoChamado,
  concluirFalhas,
  concluirSiga,
  countFalhasReais,
  enviarFalhasParaSiga,
  fetchFalhasAbertas,
  fetchHistoricoPonto,
  marcarComoInoperante,
  fetchSigaAguardando,
  fetchSigaFinalizados,
  formatDateTime,
  getStatusTrave,
  normalizeText,
  reativarInoperante,
  splitFalhas,
  traveTemParada,
  salvarRascunhoSiga,
} from '../services/failuresService';
import { getFailureTheme } from '../styles/failureTheme';
import { logoutUser } from '../../auth/services/authService';

const SIGA_PORTAL_URL = 'https://siga.auvo.com.br/Ticket/Novo';

function notifyKpiRefresh() {
  const version = String(Date.now());
  localStorage.setItem('kpiDataVersion', version);
  window.dispatchEvent(new Event('kpi:refresh-requested'));
}

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSigaDesk, setShowSigaDesk] = useState(false);
  const [abaFalhas, setAbaFalhas] = useState('abertas');
  const [sigaLoading, setSigaLoading] = useState(false);
  const [sigaTab, setSigaTab] = useState('aguardando');
  const [sigaAguardando, setSigaAguardando] = useState([]);
  const [sigaFinalizados, setSigaFinalizados] = useState([]);
  const [sigaDrafts, setSigaDrafts] = useState({});
  const [sigaSubmittingId, setSigaSubmittingId] = useState(null);
  const [sigaSavingId, setSigaSavingId] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mostrarHistoricoCompleto, setMostrarHistoricoCompleto] = useState(false);

  useBodyScrollLock(mobileMenuOpen);

  const user = getSessionUser() || { username: 'Tecnico', role: 'colaborador' };
  const isColaborador = user.role === 'colaborador' || user.role === 'runin_kiosk';
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

  const falhasOperacionais = useMemo(
    () => falhas.filter((f) => !Boolean(f?.ponto_inoperante)),
    [falhas],
  );

  const falhasInoperantes = useMemo(
    () => falhas.filter((f) => Boolean(f?.ponto_inoperante)),
    [falhas],
  );

  const falhasPorSetor = useMemo(() => {
    const grouped = {};
    const setorLookup = {};
    LISTA_SETORES.forEach((setor) => {
      grouped[setor] = [];
      setorLookup[normalizeText(setor)] = setor;
    });

    falhasOperacionais.forEach((f) => {
      const setorOriginal = setorLookup[normalizeText(f.setor)];
      if (!setorOriginal) return;
      grouped[setorOriginal].push(f);
    });

    return grouped;
  }, [falhasOperacionais]);

  const falhasPorSetorTrave = useMemo(() => {
    const map = {};
    falhasOperacionais.forEach((f) => {
      const key = `${normalizeText(f.setor)}|${String(f.trave)}`;
      if (!map[key]) map[key] = [];
      map[key].push(f);
    });
    return map;
  }, [falhasOperacionais]);

  const alertasCriticos = useMemo(() => {
    const grupos = {};
    falhasOperacionais.forEach((f) => {
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
  }, [falhasOperacionais]);

  // Mantem o contador consistente com o KPI de pendentes (abertos no momento).
  const falhasAtivasHoje = useMemo(() => falhasOperacionais.length, [falhasOperacionais]);

  const historicoVisivel = isMobileView && !mostrarHistoricoCompleto ? historicoPonto.slice(0, 3) : historicoPonto;

  const handleLogout = useCallback(async () => {
    await logoutUser();
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

  const handleMarcarInoperante = useCallback(async () => {
    if (falhasSelecionadas.length === 0 || isColaborador) return;

    setEnviando(true);
    try {
      const idsParaMarcar = modalData?.ids || (modalData?.id ? [modalData.id] : []);
      const payloadFalhas = falhasSelecionadas.map((item) => ({ id: item.id, falha: item.falha }));
      await marcarComoInoperante({ ids: idsParaMarcar, falhasSelecionadas: payloadFalhas });
      fecharModal();
      await buscarFalhas();
    } catch (err) {
      alert(err?.message || 'Erro ao marcar ponto inoperante');
    } finally {
      setEnviando(false);
    }
  }, [buscarFalhas, falhasSelecionadas, fecharModal, isColaborador, modalData]);

  const handleReativarInoperante = useCallback(async (id) => {
    if (!id || isColaborador) return;
    setEnviando(true);
    try {
      await reativarInoperante({ ids: [id] });
      await buscarFalhas();
      setAbaFalhas('abertas');
    } catch (err) {
      alert(err?.message || 'Erro ao reativar ponto');
    } finally {
      setEnviando(false);
    }
  }, [buscarFalhas, isColaborador]);

  const inoperantesPorSetor = useMemo(() => {
    const grouped = {};
    falhasInoperantes.forEach((item) => {
      const key = String(item?.setor || 'Sem setor');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    Object.keys(grouped).forEach((setor) => {
      grouped[setor].sort((a, b) => {
        const traveA = Number(a?.trave || 0);
        const traveB = Number(b?.trave || 0);
        if (traveA !== traveB) return traveA - traveB;
        return String(a?.ponto || '').localeCompare(String(b?.ponto || ''));
      });
    });

    return grouped;
  }, [falhasInoperantes]);

  const handleEnviarParaSiga = useCallback(async () => {
    if (!modalData || isColaborador) return;
    const idsParaEncaminhar = modalData?.ids || (modalData?.id ? [modalData.id] : []);
    if (!idsParaEncaminhar.length) return;

    // Abre o portal em gesto direto de clique para evitar bloqueio/pop-up em branco.
    window.open(SIGA_PORTAL_URL, '_blank', 'noopener,noreferrer');

    setEnviando(true);
    try {
      await enviarFalhasParaSiga({ ids: idsParaEncaminhar });
      fecharModal();
      await buscarFalhas();
      notifyKpiRefresh();
    } catch (err) {
      alert(err?.message || 'Erro ao enviar para SIGA');
    } finally {
      setEnviando(false);
    }
  }, [buscarFalhas, fecharModal, isColaborador, modalData]);

  const loadSigaDeskData = useCallback(async () => {
    try {
      setSigaLoading(true);
      const [openData, doneData] = await Promise.all([fetchSigaAguardando(), fetchSigaFinalizados()]);
      setSigaAguardando(openData);
      setSigaFinalizados(doneData);
      setSigaDrafts((prev) => {
        const next = { ...prev };
        openData.forEach((item) => {
          if (!next[item.id]) {
            next[item.id] = {
              diaAbertura: item?.siga_data_abertura || '',
              codigoChamado: item?.siga_codigo_chamado || '',
            };
          }
        });
        return next;
      });
    } catch (err) {
      alert(err?.message || 'Erro ao carregar painel SIGA');
      setSigaAguardando([]);
      setSigaFinalizados([]);
    } finally {
      setSigaLoading(false);
    }
  }, []);

  const openSigaDesk = useCallback(async () => {
    setShowSigaDesk(true);
    await loadSigaDeskData();
  }, [loadSigaDeskData]);

  const closeSigaDesk = useCallback(() => {
    setShowSigaDesk(false);
  }, []);

  const updateSigaDraft = useCallback((id, field, value) => {
    setSigaDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  }, []);

  const finalizeSigaItem = useCallback(async (item) => {
    const draft = sigaDrafts[item.id] || {};
    if (!draft.diaAbertura || !draft.codigoChamado) {
      alert('Preencha dia da abertura e codigo do chamado.');
      return;
    }

    setSigaSubmittingId(item.id);
    try {
      await concluirSiga({
        id: item.id,
        diaAbertura: draft.diaAbertura,
        codigoChamado: draft.codigoChamado,
      });
      await loadSigaDeskData();
      await buscarFalhas();
      notifyKpiRefresh();
      setSigaTab('finalizados');
    } catch (err) {
      alert(err?.message || 'Erro ao finalizar via SIGA');
    } finally {
      setSigaSubmittingId(null);
    }
  }, [buscarFalhas, loadSigaDeskData, sigaDrafts]);

  const saveSigaItem = useCallback(async (item) => {
    const draft = sigaDrafts[item.id] || {};
    if (!draft.diaAbertura || !draft.codigoChamado) {
      alert('Preencha dia da abertura e codigo do chamado.');
      return;
    }

    setSigaSavingId(item.id);
    try {
      await salvarRascunhoSiga({
        id: item.id,
        diaAbertura: draft.diaAbertura,
        codigoChamado: draft.codigoChamado,
      });
      setSigaAguardando((prev) => prev.map((row) => (
        row.id === item.id
          ? {
              ...row,
              siga_data_abertura: draft.diaAbertura,
              siga_codigo_chamado: draft.codigoChamado,
            }
          : row
      )));
      notifyKpiRefresh();
    } catch (err) {
      alert(err?.message || 'Erro ao salvar dados do chamado SIGA');
    } finally {
      setSigaSavingId(null);
    }
  }, [sigaDrafts]);

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
    abaFalhas,
    setAbaFalhas,
    styles,
    user,
    isAdmin,
    isColaborador,
    loading,
    falhas,
    falhasInoperantes,
    inoperantesPorSetor,
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
    showSigaDesk,
    openSigaDesk,
    closeSigaDesk,
    sigaLoading,
    sigaTab,
    setSigaTab,
    sigaAguardando,
    sigaFinalizados,
    sigaDrafts,
    updateSigaDraft,
    saveSigaItem,
    finalizeSigaItem,
    sigaSubmittingId,
    sigaSavingId,
    irParaTraveRecorrente,
    mobileMenuOpen,
    setMobileMenuOpen,
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
    handleMarcarInoperante,
    handleReativarInoperante,
    handleEnviarParaSiga,
    historicoPonto,
    loadingHistoricoPonto,
    historicoVisivel,
    mostrarHistoricoCompleto,
    setMostrarHistoricoCompleto,
    isMobileView,
    formatDateTime,
  };
}
