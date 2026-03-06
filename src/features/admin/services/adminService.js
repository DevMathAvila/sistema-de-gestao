import * as api from '../../../core/api/supabaseSecure';
import { supabase } from '../../../core/api/supabaseClient';

async function parseEdgeInvokeError(error) {
  const status = error?.context?.status;
  if (error?.context) {
    try {
      const body = await error.context.json();
      const msg = body?.error || body?.message || error.message || 'Falha na Edge Function.';
      return { status, message: status ? `Edge Function (${status}): ${msg}` : msg };
    } catch {
      try {
        const raw = await error.context.text();
        const msg = raw || error.message || 'Falha na Edge Function.';
        return { status, message: status ? `Edge Function (${status}): ${msg}` : msg };
      } catch {
        const msg = error.message || 'Falha na Edge Function.';
        return { status, message: status ? `Edge Function (${status}): ${msg}` : msg };
      }
    }
  }
  return { status, message: error?.message || 'Falha na Edge Function.' };
}

async function invokeAdminFunction(fnName, payload) {
  const invoke = async () => {
    const { data, error } = await supabase.functions.invoke(fnName, {
      body: payload,
    });
    if (!error) return { data, error: null };
    const parsed = await parseEdgeInvokeError(error);
    return { data: null, error: parsed };
  };

  let result = await invoke();

  if (result.error?.status === 401) {
    await supabase.auth.refreshSession();
    result = await invoke();
  }

  if (result.error) throw new Error(result.error.message);
  if (result.data?.error) throw new Error(result.data.error);
  return result.data;
}

export async function loadUsuarios() {
  try {
    const data = await invokeAdminFunction('admin-users-list');
    return Array.isArray(data?.users) ? data.users : [];
  } catch {
    // Fallback operacional: leitura direta via RLS (admin/master pode listar todos).
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, username, role, created_at, auth_user_id')
      .order('username');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
}

export async function createUsuario(payload) {
  await invokeAdminFunction('admin-users-create', payload);
}

export async function removeUsuario(authUserId) {
  if (!authUserId) throw new Error('Usuario invalido.');
  try {
    await invokeAdminFunction('admin-users-delete', { authUserId });
  } catch (err) {
    const msg = String(err?.message || '');
    if (msg.includes('Invalid JWT')) {
      throw new Error('Falha de autenticacao da Edge Function (Invalid JWT). Refaça login e confirme deploy da funcao admin-users-delete no mesmo projeto do .env.');
    }
    throw err;
  }
}

export async function loadParetoStats(setorFiltro) {
  const { data, error } = await api.listarRegistrosFalhas(setorFiltro);
  if (error) throw error;

  const counter = {};
  data?.forEach((item) => {
    if (!item?.falha) return;
    item.falha
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((falha) => {
        counter[falha] = (counter[falha] || 0) + 1;
      });
  });

  return Object.entries(counter)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total);
}

export async function loadHistoricoConcluido(dataInicio, dataFim) {
  const { data, error } = await api.listarOcorrenciasConcluidas(dataInicio || null, dataFim || null);
  if (error) throw error;
  return data || [];
}

export async function loadHistoricoAberto(dataInicio, dataFim) {
  const { data, error } = await api.listarRegistrosAbertos(dataInicio || null, dataFim || null);
  if (error) throw error;
  return data || [];
}

export function formatDateBr(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

async function exportRowsToExcel(rows, sheetName, filename) {
  const XLSX = await import('xlsx');
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

export async function exportHistoricoConcluidoExcel(historico) {
  if (!Array.isArray(historico) || historico.length === 0) return;
  const rows = historico.map((item) => ({
    'Run In': item.setor || '',
    Trave: item.trave ?? '',
    Ponto: item.ponto ?? '',
    Falha: item.falha || '',
    Descricao: item.solucao || '',
    Dia: item.resolvido_em ? formatDateBr(item.resolvido_em) : '',
    'Finalizado por': item.resolvido_por || '',
    'Criado por': item.usuario || '',
  }));
  await exportRowsToExcel(rows, 'Concluidas', 'historico_registros_falhas.xlsx');
}

export async function exportHistoricoAbertoExcel(historicoAbertas) {
  if (!Array.isArray(historicoAbertas) || historicoAbertas.length === 0) return;
  const rows = historicoAbertas.map((item) => ({
    'Run In': item.setor || '',
    Trave: item.trave ?? '',
    Ponto: item.ponto ?? '',
    Falha: item.falha || '',
    Dia: item.data ? formatDateBr(item.data) : '',
    Solicitante: item.usuario || '',
  }));
  await exportRowsToExcel(rows, 'Abertas', 'falhas_em_aberto.xlsx');
}
