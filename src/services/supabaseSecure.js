import { supabase } from './supabase';
import { LISTA_SETORES } from '../data/setores';
import { FALHAS_COMUNS } from '../data/falhasComuns';
import { getSessionUser as getStoredSessionUser } from '../lib/session';
import {
  sanitizeString,
  validateUsername,
  validateSenha,
  validateSetor,
  validateTrave,
  validateFalhaTexto,
  validateSolucao,
  sanitizeFalhasArray,
  sanitizePontosArray,
  LIMITS,
} from '../lib/validation';

function normalizeDate(value) {
  const s = sanitizeString(value, 20);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;

  return null;
}

function extractDateKey(value) {
  if (value == null) return null;
  const s = String(value).trim();

  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;

  const dt = new Date(s.replace(' ', 'T'));
  if (!Number.isNaN(dt.getTime())) {
    const year = dt.getUTCFullYear();
    const month = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dt.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

function getDateBounds(dataInicio, dataFim) {
  return {
    inicio: dataInicio ? normalizeDate(dataInicio) : null,
    fim: dataFim ? normalizeDate(dataFim) : null,
  };
}

function isInRange(dateValue, inicio, fim) {
  const key = extractDateKey(dateValue);
  if (!key) return false;
  if (inicio && key < inicio) return false;
  if (fim && key > fim) return false;
  return true;
}
function normalizeStatus(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function isConcludedRecord(item) {
  const status = normalizeStatus(item?.status);
  if (item?.resolvido_em) return true;
  return status.includes('conclu');
}

function isOpenRecord(item) {
  if (isConcludedRecord(item)) return false;
  const status = normalizeStatus(item?.status);
  if (!status) return true;
  return status.includes('aberto');
}

export async function getUsuarioParaLogin(username, senha) {
  if (!validateUsername(username) || !validateSenha(senha)) {
    return { data: null, error: { message: 'Dados invalidos.' } };
  }

  const clean = sanitizeString(username, LIMITS.MAX_USERNAME).toLowerCase();
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, senha, role')
    .eq('username', clean)
    .maybeSingle();

  return { data, error };
}

export async function listarUsuarios() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, senha, role')
    .order('username');

  return { data: data || [], error };
}

export async function atualizarSenhaUsuario(username, novaSenha) {
  const usernameLimpo = sanitizeString(username, LIMITS.MAX_USERNAME).trim();
  const usernameNormalizado = usernameLimpo.toLowerCase();
  const senhaLimpa = String(novaSenha || '');

  if (!usernameLimpo || !senhaLimpa) {
    return { success: false, error: { message: 'Dados invalidos para atualizar senha.' } };
  }

  try {
    const { data, error, count } = await supabase
      .from('usuarios')
      .update({ senha: senhaLimpa })
      .ilike('username', usernameNormalizado)
      .select('username', { count: 'exact' });

    if (error) return { success: false, error };
    if (typeof count === 'number' && count > 0) return { success: true };
    if (Array.isArray(data) && data.length > 0) return { success: true };

    return { success: false, error: { message: 'Nenhum usuario atualizado.' } };
  } catch (err) {
    return { success: false, error: { message: err?.message || 'Erro ao atualizar senha.' } };
  }
}

export async function criarUsuario(payload) {
  const user = getStoredSessionUser();
  if (!user || user.role !== 'admin') return { data: null, error: { message: 'Nao autorizado.' } };

  const username = sanitizeString(payload?.username, LIMITS.MAX_USERNAME).toLowerCase();
  const senha = String(payload?.senha ?? '').slice(0, LIMITS.MAX_SENHA);
  const allowedRoles = ['admin', 'tecnico', 'tÃ©cnico', 'colaborador'];
  const desiredRole = typeof payload?.role === 'string' ? payload.role : 'tecnico';
  const role = allowedRoles.includes(desiredRole) ? desiredRole : 'tecnico';
  if (!username || !senha) return { data: null, error: { message: 'Username e senha obrigatorios.' } };

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ username, senha, role }])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: { message: err?.message || 'Erro ao criar usuario.' } };
  }
}

export async function removerUsuario(id) {
  const user = getStoredSessionUser();
  if (!user || user.role !== 'admin') return { error: { message: 'Nao autorizado.' } };

  const idVal = Number(id);
  if (!Number.isInteger(idVal) && typeof id !== 'string') return { error: { message: 'ID invalido.' } };

  try {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    return { error };
  } catch (err) {
    return { error: { message: err?.message || 'Erro ao remover usuario.' } };
  }
}

export async function listarFalhasAbertas() {
  const { data, error } = await supabase
    .from('registros_falhas')
    .select('*')
    .eq('status', 'aberto');

  return { data: data || [], error };
}

export async function listarChamadosAbertosPorSetor(setor) {
  if (!validateSetor(setor, LISTA_SETORES)) return { data: [], error: null };

  const { data, error } = await supabase
    .from('registros_falhas')
    .select('trave, ponto, falha')
    .eq('setor', String(setor).trim())
    .eq('status', 'aberto')
    .not('trave', 'is', null)
    .not('ponto', 'is', null);

  return { data: data || [], error };
}

export async function listarRegistrosFalhas(filtroSetor = null) {
  let query = supabase.from('registros_falhas').select('falha');
  if (filtroSetor && filtroSetor !== 'TODOS' && validateSetor(filtroSetor, LISTA_SETORES)) {
    query = query.eq('setor', filtroSetor.trim());
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function listarRegistrosAbertos(dataInicio = null, dataFim = null) {
  const { inicio, fim } = getDateBounds(dataInicio, dataFim);

  let query = supabase
    .from('registros_falhas')
    .select('id, usuario, setor, trave, ponto, falha, data, status, resolvido_em');

  const { data, error } = await query.order('data', { ascending: false });
  if (error) return { data: [], error };

  const base = (data || []).filter((item) => isOpenRecord(item));
  const dataFiltrada = inicio || fim
    ? base.filter((item) => isInRange(item?.data, inicio, fim))
    : base;

  return { data: dataFiltrada, error: null };
}

export async function listarRegistrosParaKPI(dataInicio = null, dataFim = null) {
  const { inicio, fim } = getDateBounds(dataInicio, dataFim);

  let query = supabase
    .from('registros_falhas')
    .select('id, setor, status, falha, data, resolvido_em, usuario');

  const { data, error } = await query.order('data', { ascending: false });
  if (error) return { data: [], error };

  const dataFiltrada = inicio || fim
    ? (data || []).filter((item) => {
        const referenciaTempo = isConcludedRecord(item) ? (item?.resolvido_em || item?.data) : item?.data;
        return isInRange(referenciaTempo, inicio, fim);
      })
    : (data || []);

  return { data: dataFiltrada, error: null };
}

export async function listarOcorrenciasConcluidas(dataInicio = null, dataFim = null) {
  const { inicio, fim } = getDateBounds(dataInicio, dataFim);

  let query = supabase
    .from('registros_falhas')
    .select('id, usuario, setor, trave, ponto, falha, solucao, resolvido_em, resolvido_por, status, data');

  const { data, error } = await query.order('resolvido_em', { ascending: false });
  if (error) return { data: [], error };

  const base = (data || []).filter((item) => isConcludedRecord(item));
  const dataFiltrada = inicio || fim
    ? base.filter((item) => isInRange(item?.resolvido_em || item?.data, inicio, fim))
    : base;

  return { data: dataFiltrada, error: null };
}

export async function inserirRegistrosFalha(setor, trave, pontos, falhas) {
  if (!validateSetor(setor, LISTA_SETORES)) return { error: { message: 'Setor invalido.' } };
  if (!validateTrave(trave)) return { error: { message: 'Trave invalida.' } };

  const falhasSanit = sanitizeFalhasArray(falhas, FALHAS_COMUNS);
  const pontosSanit = sanitizePontosArray(pontos);
  if (falhasSanit.length === 0 || pontosSanit.length === 0) {
    return { error: { message: 'Selecione ao menos um ponto e uma falha.' } };
  }

  const falhaTexto = falhasSanit.join(', ');
  if (!validateFalhaTexto(falhaTexto)) return { error: { message: 'Texto de falha invalido.' } };

  const usuario = getStoredSessionUser();
  const username = usuario?.username || 'Tecnico';
  const setorTrim = String(setor).trim();
  const traveNum = Number(trave);
  const listaPontos = [...Array(15)].map((_, i) => i + 1);
  const todosPontos = listaPontos.length === pontosSanit.length;
  const inserts = todosPontos
    ? [{ usuario: username, setor: setorTrim, trave: traveNum, ponto: '1-15 (Inteira)', falha: falhaTexto, status: 'aberto' }]
    : pontosSanit.map((p) => ({
        usuario: username,
        setor: setorTrim,
        trave: traveNum,
        ponto: `Ponto ${p}`,
        falha: falhaTexto,
        status: 'aberto',
      }));

  try {
    const { error } = await supabase.from('registros_falhas').insert(inserts);
    return { error };
  } catch (err) {
    return { error: { message: err?.message || 'Erro ao registrar falha.' } };
  }
}

export async function fecharRegistros(ids, solucao) {
  if (!Array.isArray(ids) || ids.length === 0) return { error: { message: 'IDs obrigatorios.' } };
  if (!validateSolucao(solucao)) return { error: { message: 'Solucao invalida.' } };

  const sessionUser = getStoredSessionUser();
  if (!sessionUser || sessionUser.role === 'colaborador') {
    return { error: { message: 'Nao autorizado.' } };
  }

  const idList = ids.filter((id) => id != null && id !== '');
  if (idList.length === 0) return { error: { message: 'Nenhum ID valido.' } };
  const resolvidoPorSanit = sanitizeString(sessionUser.username, LIMITS.MAX_USERNAME) || 'Sistema';

  try {
    const { error } = await supabase
      .from('registros_falhas')
      .update({
        status: 'CONCLUIDO',
        solucao: sanitizeString(solucao, LIMITS.MAX_SOLUCAO),
        resolvido_por: resolvidoPorSanit,
        resolvido_em: new Date().toISOString(),
      })
      .in('id', idList);

    return { error };
  } catch (err) {
    return { error: { message: err?.message || 'Erro ao fechar chamado.' } };
  }
}


