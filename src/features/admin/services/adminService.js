import * as api from '../../../core/api/supabaseSecure';
import { supabase } from '../../../core/api/supabaseClient';

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data?.session?.access_token || '';
  if (!token) throw new Error('Sessao expirada. Faca login novamente.');
  return token;
}

async function invokeAdminFunction(fnName, payload) {
  const accessToken = await getAccessToken();
  const { data, error } = await supabase.functions.invoke(fnName, {
    body: payload,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) {
    if (error?.context) {
      try {
        const body = await error.context.json();
        throw new Error(body?.error || body?.message || error.message || 'Falha na Edge Function.');
      } catch {
        throw new Error(error.message || 'Falha na Edge Function.');
      }
    }
    throw new Error(error.message || 'Falha na Edge Function.');
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function loadUsuarios() {
  const data = await invokeAdminFunction('admin-users-list');
  return Array.isArray(data?.users) ? data.users : [];
}

export async function createUsuario(payload) {
  await invokeAdminFunction('admin-users-create', payload);
}

export async function removeUsuario(authUserId) {
  if (!authUserId) throw new Error('Usuario invalido.');
  await invokeAdminFunction('admin-users-delete', { authUserId });
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
