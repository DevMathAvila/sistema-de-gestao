import { useCallback, useMemo, useRef, useState } from 'react';
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
  'Quais setores estao com mais falhas abertas hoje?',
  'Resuma os KPIs do periodo entre 2026-03-01 e 2026-03-07.',
  'Quais avisos ativos merecem atencao agora?',
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

  const [messages, setMessages] = useState(() => [
    createUiMessage(
      'assistant',
      'Ola! Sou o assistente do sistema. Posso consultar falhas, gerar relatorios e responder perguntas sobre o sistema. Como posso ajudar?',
    ),
  ]);
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
        const limit = clampLimit(args.limit, 50, 100);
        const status = String(args.status || '').trim().toLowerCase();
        const setor = args.setor ? String(args.setor).trim() : null;

        if (status === 'aberto') {
          const { data, error } = await listarRegistrosAbertos(args.data_inicio || null, args.data_fim || null);
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
              status: item.status,
              data: item.data,
              ponto_inoperante: Boolean(item?.ponto_inoperante),
            }));
          return { total: rows.length, filtros: { setor, status, limit }, rows };
        }

        if (status === 'concluido') {
          const { data, error } = await listarOcorrenciasConcluidas(args.data_inicio || null, args.data_fim || null);
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
              status: item.status,
              resolvido_em: item.resolvido_em,
              resolvido_por: item.resolvido_por,
            }));
          return { total: rows.length, filtros: { setor, status, limit }, rows };
        }

        const [abertasRes, concluidasRes] = await Promise.all([
          listarRegistrosAbertos(args.data_inicio || null, args.data_fim || null),
          listarOcorrenciasConcluidas(args.data_inicio || null, args.data_fim || null),
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
            status: item.status,
            data: item.data,
            resolvido_em: item.resolvido_em || null,
          }));
        return { total: rows.length, filtros: { setor, status: status || 'todos', limit }, rows };
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
        if (!args.data_inicio || !args.data_fim) {
          throw new Error('data_inicio e data_fim sao obrigatorios para query_dashboard_kpis.');
        }
        const dataset = await fetchDashboardDataset(args.data_inicio, args.data_fim);
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
            data_inicio: args.data_inicio,
            data_fim: args.data_fim,
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

      for (let step = 0; step < 3; step += 1) {
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
