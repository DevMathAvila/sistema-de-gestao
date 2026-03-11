import * as api from '../../../core/api/supabaseSecure';
import { supabase } from '../../../core/api/supabaseClient';
import { LISTA_SETORES } from '../../../shared/constants/setores';

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
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw new Error(sessionError.message || 'Falha ao obter sessao atual.');
    }

    const accessToken = sessionData?.session?.access_token || '';
    const { data, error } = await supabase.functions.invoke(fnName, {
      body: payload,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
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
      .select('id, username, role, setor_fixo, created_at, auth_user_id')
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

function normalizeHeader(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeTextKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function parseExcelDate(value) {
  if (value == null || value === '') return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = Math.round(value * 24 * 60 * 60 * 1000);
    const dt = new Date(excelEpoch.getTime() + ms);
    return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
  }

  const text = String(value).trim();
  if (!text) return null;

  const brDateTime = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (brDateTime) {
    const [, dd, mm, yyyy, hh = '00', min = '00', ss = '00'] = brDateTime;
    const dt = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`);
    return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
  }

  const iso = new Date(text);
  return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
}

function normalizeSetor(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const directMatch = LISTA_SETORES.find((item) => item.toLowerCase() === normalized);
  if (directMatch) return directMatch;

  const runinMatch = normalized.match(/^run\s*in\s*(\d{1,2})$/) || normalized.match(/^runin\s*(\d{1,2})$/);
  if (runinMatch) return `Runin ${String(Number(runinMatch[1])).padStart(2, '0')}`;

  const avtMatch = normalized.match(/^avt\s*(\d{1,2})$/);
  if (avtMatch) return `AVT ${String(Number(avtMatch[1])).padStart(2, '0')}`;

  return raw;
}

function parseTrave(value) {
  if (value == null || value === '') return null;
  const match = String(value).match(/\d+/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePonto(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const pointMatch = raw.match(/\d+/)?.[0];
  if (pointMatch) return `Ponto ${Number(pointMatch)}`;
  return raw;
}

function getRowValue(row, aliases) {
  const entries = Object.entries(row || {});
  for (const alias of aliases) {
    const found = entries.find(([key]) => normalizeHeader(key) === alias);
    if (found) return found[1];
  }
  return '';
}

function chunkArray(items, size) {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function buildConcludedFingerprint(row) {
  const rawPonto = String(row?.ponto ?? '').trim();
  const pontoNumero = rawPonto.match(/\d+/)?.[0] || '';
  const pontoKey = pontoNumero ? `ponto ${Number(pontoNumero)}` : normalizeTextKey(rawPonto);

  return [
    normalizeSetor(row?.setor),
    String(parseTrave(row?.trave) ?? row?.trave ?? '').trim(),
    pontoKey,
    normalizeTextKey(row?.falha),
  ].join('|');
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
    'Setor': item.setor || '',
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
    'Setor': item.setor || '',
    Trave: item.trave ?? '',
    Ponto: item.ponto ?? '',
    Falha: item.falha || '',
    Dia: item.data ? formatDateBr(item.data) : '',
    Solicitante: item.usuario || '',
  }));
  await exportRowsToExcel(rows, 'Abertas', 'falhas_em_aberto.xlsx');
}

export async function importHistoricoConcluidoExcel(file) {
  if (!(file instanceof File)) {
    throw new Error('Selecione um arquivo Excel valido para importar.');
  }

  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('A planilha enviada nao possui abas.');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: true });
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    throw new Error('Nenhuma linha encontrada na planilha.');
  }

  const rows = rawRows.map((row, index) => {
    const setor = normalizeSetor(getRowValue(row, ['setor', 'run in', 'runin']));
    const trave = parseTrave(getRowValue(row, ['trave']));
    const ponto = normalizePonto(getRowValue(row, ['ponto']));
    const falha = String(getRowValue(row, ['falha', 'tipo de falha'])).trim();
    const solucao = String(getRowValue(row, ['descricao', 'descricao curta', 'solucao'])).trim();
    const dataAberturaRaw = getRowValue(row, ['data', 'dia', 'data de abertura']);
    const dataConclusaoRaw = getRowValue(row, ['data de conclusao', 'finalizado em']);
    const resolvidoPor = String(getRowValue(row, ['finalizado por', 'finalizado', 'quem resolveu', 'resolvido por'])).trim();
    const criadoPor = String(getRowValue(row, ['criado por', 'usuario', 'solicitante'])).trim();
    const dataConclusao = parseExcelDate(dataConclusaoRaw || dataAberturaRaw);
    const dataAbertura = parseExcelDate(dataAberturaRaw || dataConclusaoRaw);

    return {
      rowNumber: index + 2,
      setor,
      trave,
      ponto,
      falha,
      solucao,
      dataAbertura,
      dataConclusao,
      resolvidoPor,
      criadoPor,
    };
  });

  const invalidRows = rows.filter((row) => {
    return !row.setor
      || !LISTA_SETORES.includes(row.setor)
      || row.trave == null
      || !row.ponto
      || !row.falha
      || !row.dataConclusao;
  });

  if (invalidRows.length > 0) {
    const preview = invalidRows.slice(0, 5).map((row) => row.rowNumber).join(', ');
    throw new Error(`Planilha invalida. Revise as linhas: ${preview}${invalidRows.length > 5 ? '...' : ''}. Campos obrigatorios: SETOR, TRAVE, PONTO, FALHA e data de conclusao.`);
  }

  const inserts = rows.map((row) => ({
    usuario: row.criadoPor || row.resolvidoPor || 'Importacao',
    setor: row.setor,
    trave: row.trave,
    ponto: row.ponto,
    falha: row.falha,
    solucao: row.solucao || 'Importado via Historico Geral',
    data: row.dataAbertura || row.dataConclusao,
    status: 'CONCLUIDO',
    resolvido_em: row.dataConclusao,
    resolvido_por: row.resolvidoPor || row.criadoPor || 'Importacao',
  }));

  const setoresImportados = [...new Set(inserts.map((item) => item.setor).filter(Boolean))];
  const existingFingerprints = new Set();

  for (const setorChunk of chunkArray(setoresImportados, 20)) {
    const { data, error } = await supabase
      .from('registros_falhas')
      .select('setor, trave, ponto, falha, status')
      .in('setor', setorChunk)
      .ilike('status', '%conclu%');

    if (error) {
      throw new Error(error.message || 'Erro ao validar duplicidades da importacao.');
    }

    (data || []).forEach((item) => {
      existingFingerprints.add(buildConcludedFingerprint(item));
    });
  }

  const uniqueInserts = [];
  let ignoredDuplicates = 0;

  inserts.forEach((item) => {
    const fingerprint = buildConcludedFingerprint(item);
    if (existingFingerprints.has(fingerprint)) {
      ignoredDuplicates += 1;
      return;
    }
    existingFingerprints.add(fingerprint);
    uniqueInserts.push(item);
  });

  for (const chunk of chunkArray(uniqueInserts, 200)) {
    const { error } = await supabase.from('registros_falhas').insert(chunk);
    if (error) {
      throw new Error(error.message || 'Erro ao importar falhas concluidas.');
    }
  }

  return {
    importedCount: uniqueInserts.length,
    ignoredDuplicates,
  };
}
