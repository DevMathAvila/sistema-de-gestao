import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../core/api/supabaseClient';
import { getSessionUser, isAdminUser } from '../../../core/auth/session';
import {
  listarAvisos,
  listarOcorrenciasConcluidas,
  listarRegistrosAbertos,
} from '../../../core/api/supabaseSecure';
import { useBodyScrollLock } from '../../../shared/hooks/useBodyScrollLock';
import { usePersistentTheme } from '../../../shared/hooks/usePersistentTheme';
import { fetchDashboardDataset, computeDashboardMetrics } from '../../dashboard/services/dashboardAnalyticsService';
import { logoutUser } from '../../auth/services/authService';
import {
  createGeminiFunctionResponse,
  createGeminiTextEntry,
  generateAssistantTurn,
} from '../services/aiService';
import { normalizeToolArgs } from '../services/aiTools';

const QUICK_PROMPTS = [
  'Quais setores têm mais falhas abertas agora?',
  'Me dá um resumo da semana',
  'Tem algum ponto inoperante agora?',
];
const MIN_INTERVAL_MS = 2000;

function createUiMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

function clampLimit(value, fallback = 50, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}

function sanitizeField(value, maxLength = 500) {
  if (!value) return '';
  return String(value)
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function matchesSetor(value, expected) {
  if (!expected) return true;
  return String(value || '').trim().toLowerCase() === String(expected || '').trim().toLowerCase();
}

function matchesStatus(value, expected) {
  if (!expected) return true;
  return String(value || '').trim().toLowerCase() === String(expected || '').trim().toLowerCase();
}

function sortByLatestDate(items, fieldA, fieldB = null) {
  return [...items].sort((a, b) => {
    const valueB = new Date(b?.[fieldA] || (fieldB ? b?.[fieldB] : '') || 0).getTime();
    const valueA = new Date(a?.[fieldA] || (fieldB ? a?.[fieldB] : '') || 0).getTime();
    return valueB - valueA;
  });
}

async function queryHistoricoConcluidas(args = {}) {
  const limit = clampLimit(args.limit, 50, 100);
  const setor = args.setor ? String(args.setor).trim() : null;
  let query = supabase
    .from('historico_concluidas')
    .select('id, setor, trave, ponto, falha, solucao, resolvido_em, resolvido_por, data')
    .order('resolvido_em', { ascending: false })
    .limit(limit);

  if (setor) {
    query = query.eq('setor', setor);
  }

  if (args.data_inicio) {
    query = query.gte('resolvido_em', `${args.data_inicio}T00:00:00`);
  }

  if (args.data_fim) {
    query = query.lte('resolvido_em', `${args.data_fim}T23:59:59.999`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return {
    total: (data || []).length,
    filtros: { ...args, setor, limit },
    rows: (data || []).map((item) => ({
      id: item.id,
      setor: item.setor,
      trave: item.trave,
      ponto: item.ponto,
      falha: item.falha,
      solucao: item.solucao,
      resolvido_em: item.resolvido_em,
      resolvido_por: item.resolvido_por,
      data: item.data,
    })),
  };
}

export function useAIAssistant() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = usePersistentTheme();
  const user = getSessionUser() || { username: 'Usuario', role: 'colaborador' };
  const isAdmin = isAdminUser(user);

  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastMessageTime = useRef(0);

  useBodyScrollLock(mobileMenuOpen);

  const styles = useMemo(() => ({
    bg: theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50',
    sidebar: theme === 'dark' ? 'bg-black/60 border-white/5 shadow-none' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
    text: theme === 'dark' ? 'text-white' : 'text-slate-900',
    subtext: theme === 'dark' ? 'text-gray-500' : 'text-slate-500',
    card: theme === 'dark' ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200',
  }), [theme]);

  useEffect(() => {
    const sessionKey = 'leia_briefing_done';

    if (sessionStorage.getItem(sessionKey)) {
      const hora = new Date().getHours();
      const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
      setMessages([
        createUiMessage('assistant', `${saudacao}, ${user.username}! Como posso te ajudar?`),
      ]);
      return;
    }

    const hoje = new Date();
    const dataInicio = hoje.toISOString().split('T')[0];
    const dataFim = dataInicio;

    setLoading(true);
    setMessages([createUiMessage('assistant', '...')]);

    fetchDashboardDataset(dataInicio, dataFim)
      .then((dataset) => {
        const metrics = computeDashboardMetrics(
          dataset.kpiRows || [],
          dataset.concluidasRows || [],
          dataset.abertasRows || [],
          dataset.inseridosRows || [],
          hoje,
          dataset.abertasAtuaisRows || [],
        );

        const hora = hoje.getHours();
        const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
        const pendentes = metrics.totalPendentes ?? 0;
        const concluidas = metrics.totalConcluidas ?? 0;
        const inoperantes = metrics.inoperantesAbertosResumo?.length ?? 0;

        let briefing = `${saudacao}, ${user.username}! Aqui esta o resumo de hoje:\n`;

        if (pendentes === 0 && concluidas === 0 && inoperantes === 0) {
          briefing += 'Nenhuma falha registrada hoje. Linha limpa.';
        } else {
          if (pendentes > 0) briefing += `→ ${pendentes} falha${pendentes > 1 ? 's' : ''} aberta${pendentes > 1 ? 's' : ''} no momento\n`;
          if (concluidas > 0) briefing += `→ ${concluidas} falha${concluidas > 1 ? 's' : ''} resolvida${concluidas > 1 ? 's' : ''} hoje\n`;
          if (inoperantes > 0) briefing += `→ ${inoperantes} ponto${inoperantes > 1 ? 's' : ''} inoperante${inoperantes > 1 ? 's' : ''} em aberto\n`;

          const topSetor = (metrics.porSetor || [])[0];
          if (topSetor?.setor && topSetor?.total > 0) {
            briefing += `→ Setor mais ativo: ${topSetor.setor} (${topSetor.total} ocorrencia${topSetor.total > 1 ? 's' : ''})\n`;
          }
        }

        briefing += '\nNo que posso te ajudar?';

        sessionStorage.setItem(sessionKey, '1');
        setMessages([createUiMessage('assistant', briefing.trim())]);
      })
      .catch(() => {
        const hora = new Date().getHours();
        const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
        setMessages([
          createUiMessage('assistant', `${saudacao}, ${user.username}! Como posso te ajudar hoje?`),
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = useCallback(async () => {
    await logoutUser();
    navigate('/', { replace: true });
  }, [navigate]);

  const navigateAndCloseMobile = useCallback((path) => {
    setMobileMenuOpen(false);
    navigate(path);
  }, [navigate]);

  const executeTool = useCallback(async (functionCall) => {
    const toolName = functionCall?.name;
    const args = normalizeToolArgs(functionCall?.args);

    switch (toolName) {
      case 'query_registros_falhas': {
        const limit = clampLimit(args.limit, 500, 1000);
        const status = String(args.status || '').trim().toLowerCase();
        const setor = args.setor ? String(args.setor).trim() : null;

        // Falhas ABERTAS = estado atual, nao filtrar por data
        // Falhas CONCLUIDAS = evento no tempo, filtrar por data faz sentido
        if (status === 'aberto') {
          const { data, error } = await listarRegistrosAbertos(null, null);
          if (error) throw error;
          const rows = (data || [])
            .filter((item) => matchesSetor(item?.setor, setor))
            .slice(0, limit)
            .map((item) => ({
              id: item.id,
              setor: item.setor,
              trave: item.trave,
              ponto: item.ponto,
              falha: item.falha,
              status: String(item.status || '').trim().toLowerCase(),
              data: item.data,
              ponto_inoperante: Boolean(item?.ponto_inoperante),
            }));
          return { total: rows.length, filtros: { setor, status, limit }, rows };
        }

        if (status === 'concluido') {
          // Concluidas filtram por data — se nao informada, assume hoje
          const hoje = new Date().toISOString().split('T')[0];
          const dataInicio = args.data_inicio !== undefined ? (args.data_inicio || null) : hoje;
          const dataFim = args.data_fim !== undefined ? (args.data_fim || null) : hoje;

          const { data, error } = await listarOcorrenciasConcluidas(dataInicio, dataFim);
          if (error) throw error;
          const rows = (data || [])
            .filter((item) => matchesSetor(item?.setor, setor))
            .slice(0, limit)
            .map((item) => ({
              id: item.id,
              setor: item.setor,
              trave: item.trave,
              ponto: item.ponto,
              falha: item.falha,
              status: String(item.status || '').trim().toLowerCase(),
              resolvido_em: item.resolvido_em,
              resolvido_por: item.resolvido_por,
            }));
          return { total: rows.length, filtros: { setor, status, limit }, rows };
        }

        // Sem status: traz abertas (sem filtro data) + concluidas (com filtro data)
        const hoje = new Date().toISOString().split('T')[0];
        const dataInicio = args.data_inicio !== undefined ? (args.data_inicio || null) : hoje;
        const dataFim = args.data_fim !== undefined ? (args.data_fim || null) : hoje;

        const [abertasRes, concluidasRes] = await Promise.all([
          listarRegistrosAbertos(null, null),
          listarOcorrenciasConcluidas(dataInicio, dataFim),
        ]);
        if (abertasRes.error) throw abertasRes.error;
        if (concluidasRes.error) throw concluidasRes.error;

        const rows = sortByLatestDate([
          ...(abertasRes.data || []),
          ...(concluidasRes.data || []),
        ], 'resolvido_em', 'data')
          .filter((item) => matchesSetor(item?.setor, setor))
          .slice(0, limit)
          .map((item) => ({
            id: item.id,
            setor: item.setor,
            trave: item.trave,
            ponto: item.ponto,
            falha: item.falha,
            status: String(item.status || '').trim().toLowerCase(),
            data: item.data,
            resolvido_em: item.resolvido_em || null,
          }));
        return { total: rows.length, filtros: { setor, status: status || 'todos', limit }, rows };
      }

      case 'query_pontos_inoperantes': {
        // CRITICO: inoperantes sao estado persistente — NUNCA filtrar por data
        const limit = clampLimit(args.limit, 500, 1000);
        const setor = args.setor ? String(args.setor).trim() : null;

        const { data, error } = await listarRegistrosAbertos(null, null);
        if (error) throw error;

        const rows = (data || [])
          .filter((item) => item.ponto_inoperante === true)
          .filter((item) => matchesSetor(item?.setor, setor))
          .slice(0, limit)
          .map((item) => ({
            id: item.id,
            setor: item.setor,
            trave: item.trave,
            ponto: item.ponto,
            falha: item.falha,
            status: String(item.status || '').trim().toLowerCase(),
            ponto_inoperante: true,
            inoperante_motivo: item.inoperante_motivo || null,
            inoperante_por: item.inoperante_por || null,
            inoperante_em: item.inoperante_em || null,
          }));

        const porSetor = rows.reduce((acc, item) => {
          const key = item.setor || 'Desconhecido';
          if (!acc[key]) acc[key] = [];
          acc[key].push(`${item.trave || ''} - ${item.ponto || ''}`);
          return acc;
        }, {});

        return {
          total: rows.length,
          filtros: { setor, sem_filtro_de_data: true },
          porSetor,
          rows,
        };
      }

      case 'query_avisos': {
        const limit = clampLimit(args.limit, 10, 20);
        const { data, error } = await listarAvisos(limit);
        if (error) throw error;
        const rows = (data || []).slice(0, limit).map((item) => ({
          id: item.id,
          titulo: item.titulo,
          mensagem: item.mensagem,
          autor: item.autor,
          created_at: item.created_at,
        }));
        return { total: rows.length, limit, rows };
      }

      case 'query_dashboard_kpis': {
        const hoje = new Date().toISOString().split('T')[0];
        const dataInicio = args.data_inicio || hoje;
        const dataFim = args.data_fim || hoje;

        const dataset = await fetchDashboardDataset(dataInicio, dataFim);
        const setor = args.setor ? String(args.setor).trim() : null;
        const filterBySetor = (rows) => (
          setor ? rows.filter((item) => matchesSetor(item?.setor, setor)) : rows
        );

        const metrics = computeDashboardMetrics(
          filterBySetor(dataset.kpiRows || []),
          filterBySetor(dataset.concluidasRows || []),
          filterBySetor(dataset.abertasRows || []),
          filterBySetor(dataset.inseridosRows || []),
          new Date(),
          filterBySetor(dataset.abertasAtuaisRows || []),
        );

        return {
          periodo: {
            data_inicio: dataInicio,
            data_fim: dataFim,
            setor,
          },
          resumo: {
            totalGeral: metrics.totalGeral,
            totalPendentes: metrics.totalPendentes,
            totalConcluidas: metrics.totalConcluidas,
            chamadosInseridosNoSistema: metrics.chamadosInseridosNoSistema,
            conversionRate: Number(metrics.conversionRate?.toFixed?.(2) || 0),
          },
          topFalhas: (metrics.top5 || []).slice(0, 5),
          porSetor: (metrics.porSetor || []).slice(0, 10),
          sigaResumo: metrics.sigaResumo,
        };
      }

      case 'query_historico_concluidas': {
        try {
          return await queryHistoricoConcluidas(args);
        } catch {
          const limit = clampLimit(args.limit, 50, 100);
          const { data, error } = await listarOcorrenciasConcluidas(args.data_inicio || null, args.data_fim || null);
          if (error) throw error;
          const rows = (data || [])
            .filter((item) => matchesSetor(item?.setor, args.setor))
            .slice(0, limit)
            .map((item) => ({
              id: item.id,
              setor: item.setor,
              trave: item.trave,
              ponto: item.ponto,
              falha: item.falha,
              solucao: item.solucao,
              resolvido_em: item.resolvido_em,
              resolvido_por: item.resolvido_por,
            }));
          return { total: rows.length, filtros: { ...args, limit }, rows };
        }
      }

      default:
        throw new Error(`Tool nao suportada: ${toolName}`);
    }
  }, []);

  const sendMessage = useCallback(async (rawText) => {
    const text = sanitizeField(rawText, 2000);
    if (!text || loading) return;

    const now = Date.now();
    if (now - lastMessageTime.current < MIN_INTERVAL_MS) {
      setMessages((prev) => [
        ...prev,
        createUiMessage('assistant', 'Aguarde 2 segundos antes de enviar outra mensagem.'),
      ]);
      return;
    }
    lastMessageTime.current = now;

    const nextUiUserMessage = createUiMessage('user', text);
    const nextHistory = [...history, createGeminiTextEntry('user', text)];

    setMessages((prev) => [...prev, nextUiUserMessage]);
    setHistory(nextHistory);
    setInput('');
    setLoading(true);

    try {
      let currentHistory = nextHistory;
      let finalText = '';

      for (let step = 0; step < 6; step += 1) {
        const turn = await generateAssistantTurn(currentHistory);
        currentHistory = [...currentHistory, turn.modelMessage];

        if (turn.functionCall?.name) {
          const toolResult = await executeTool(turn.functionCall);
          currentHistory = [
            ...currentHistory,
            createGeminiFunctionResponse(turn.functionCall.name, toolResult),
          ];
          continue;
        }

        finalText = turn.text || 'Nao encontrei dados suficientes para responder com seguranca.';
        break;
      }

      if (!finalText) {
        finalText = 'Consegui consultar os dados, mas nao recebi uma resposta final utilizavel do modelo.';
      }

      setHistory(currentHistory);
      setMessages((prev) => [...prev, createUiMessage('assistant', finalText)]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        createUiMessage('assistant', err?.message || 'Nao foi possivel consultar o assistente agora.'),
      ]);
    } finally {
      setLoading(false);
    }
  }, [executeTool, history, loading]);

  return {
    user,
    isAdmin,
    theme,
    toggleTheme,
    styles,
    messages,
    loading,
    input,
    setInput,
    sendMessage,
    quickPrompts: QUICK_PROMPTS,
    mobileMenuOpen,
    setMobileMenuOpen,
    navigateAndCloseMobile,
    navigate,
    handleLogout,
  };
}