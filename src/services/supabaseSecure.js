/**
 * Camada segura sobre o Supabase: valida e sanitiza antes de qualquer escrita.
 * Sempre use este módulo em vez de supabase.js direto para insert/update/delete.
 */
import { supabase } from './supabase';
import { LISTA_SETORES } from '../data/setores';
import { FALHAS_COMUNS } from '../data/falhasComuns';
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

function getSessionUser() {
  try {
    const stored = localStorage.getItem('lenovo_user');
    if (!stored) return null;
    const user = JSON.parse(stored);
    return user && typeof user.username === 'string' ? user : null;
  } catch {
    return null;
  }
}

/**
 * Busca usuário para login — apenas SELECT por username.
 */
export async function getUsuarioParaLogin(username, senha) {
  if (!validateUsername(username) || !validateSenha(senha)) return { data: null, error: { message: 'Dados inválidos.' } };
  const clean = sanitizeString(username, LIMITS.MAX_USERNAME).toLowerCase();
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, username, senha, role')
    .eq('username', clean)
    .maybeSingle();
  return { data, error };
}

/**
 * Lista usuários — apenas para admin.
 */
export async function listarUsuarios() {
  const { data, error } = await supabase.from('usuarios').select('id, username, senha, role').order('username');
  return { data: data || [], error };
}

/**
 * Atualiza senha do usuario pelo username (case-insensitive).
 */
export const atualizarSenhaUsuario = async (username, novaSenha) => {
  const usernameLimpo = sanitizeString(username, LIMITS.MAX_USERNAME).trim();
  const usernameNormalizado = usernameLimpo.toLowerCase();
  const senhaLimpa = String(novaSenha || '');
  if (!usernameLimpo || !senhaLimpa) {
    return { success: false, error: { message: 'Dados invalidos para atualizar senha.' } };
  }

  const { data, error, count } = await supabase
    .from('usuarios')
    .update({ senha: senhaLimpa })
    .ilike('username', usernameNormalizado)
    .select('username', { count: 'exact' });

  if (error) return { success: false, error };
  if (typeof count === 'number' && count > 0) return { success: true };
  if (Array.isArray(data) && data.length > 0) return { success: true };
  return { success: false, error: { message: 'Nenhum usuario atualizado.' } };
};

/**
 * Cria usuário — apenas admin; validação rigorosa.
 */
export async function criarUsuario(payload) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') return { data: null, error: { message: 'Não autorizado.' } };
  const username = sanitizeString(payload?.username, LIMITS.MAX_USERNAME).toLowerCase();
  const senha = String(payload?.senha ?? '').slice(0, LIMITS.MAX_SENHA);
  const allowedRoles = ['admin', 'técnico', 'colaborador'];
  const desiredRole = typeof payload?.role === 'string' ? payload.role : 'técnico';
  const role = allowedRoles.includes(desiredRole) ? desiredRole : 'técnico';
  if (!username || !senha) return { data: null, error: { message: 'Username e senha obrigatórios.' } };
  const { data, error } = await supabase.from('usuarios').insert([{ username, senha, role }]).select().single();
  return { data, error };
}

/**
 * Remove um único usuário por ID — apenas admin.
 */
export async function removerUsuario(id) {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') return { error: { message: 'Não autorizado.' } };
  const idVal = Number(id);
  if (!Number.isInteger(idVal) && typeof id !== 'string') return { error: { message: 'ID inválido.' } };
  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  return { error };
}

/**
 * Lista registros de falhas abertos.
 */
export async function listarFalhasAbertas() {
  const { data, error } = await supabase
    .from('registros_falhas')
    .select('*')
    .eq('status', 'aberto');
  return { data: data || [], error };
}

/**
 * Lista chamados abertos de um setor (para tela Registrar).
 */
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

/**
 * Lista todos os registros (para estatísticas/filtro por setor).
 */
export async function listarRegistrosFalhas(filtroSetor = null) {
  let query = supabase.from('registros_falhas').select('falha');
  if (filtroSetor && filtroSetor !== 'TODOS' && validateSetor(filtroSetor, LISTA_SETORES)) {
    query = query.eq('setor', filtroSetor.trim());
  }
  const { data, error } = await query;
  return { data: data || [], error };
}

/**
 * Lista registros em aberto (status exatamente 'aberto') com filtro opcional por coluna data.
 */
export async function listarRegistrosAbertos(dataInicio = null, dataFim = null) {
  const normalizeDate = (value) => {
    const s = sanitizeString(value, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  };
  const inicio = dataInicio ? normalizeDate(dataInicio) : null;
  const fim = dataFim ? normalizeDate(dataFim) : null;

  let query = supabase
    .from('registros_falhas')
    .select('id, usuario, setor, trave, ponto, falha, data')
    .eq('status', 'aberto');

  if (inicio) query = query.gte('data', `${inicio}T00:00:00.000Z`);
  if (fim) query = query.lte('data', `${fim}T23:59:59.999Z`);

  const { data, error } = await query.order('data', { ascending: false });
  return { data: data || [], error };
}

/**
 * Lista todos os registros para Dashboard KPI. Busca registros_falhas com filtro opcional por data.
 * Sem filtros retorna todo o período. Campos: id, setor, status, falha, data, usuario.
 */
export async function listarRegistrosParaKPI(dataInicio = null, dataFim = null) {
  const normalizeDate = (value) => {
    const s = sanitizeString(value, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  };
  const inicio = dataInicio ? normalizeDate(dataInicio) : null;
  const fim = dataFim ? normalizeDate(dataFim) : null;

  let query = supabase
    .from('registros_falhas')
    .select('id, setor, status, falha, data, usuario');

  if (inicio) query = query.gte('data', `${inicio}T00:00:00.000Z`);
  if (fim) query = query.lte('data', `${fim}T23:59:59.999Z`);

  const { data, error } = await query.order('data', { ascending: false });
  return { data: data || [], error };
}

/**
 * Lista registros concluídos da tabela registros_falhas (status CONCLUÍDO) com filtro opcional por intervalo de datas.
 */
export async function listarOcorrenciasConcluidas(dataInicio = null, dataFim = null) {
  const normalizeDate = (value) => {
    const s = sanitizeString(value, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
  };

  const inicio = dataInicio ? normalizeDate(dataInicio) : null;
  const fim = dataFim ? normalizeDate(dataFim) : null;

  let query = supabase
    .from('registros_falhas')
    .select('id, usuario, setor, trave, ponto, falha, solucao, resolvido_em, resolvido_por, status')
    .eq('status', 'CONCLUÍDO');

  if (inicio) query = query.gte('resolvido_em', `${inicio}T00:00:00.000Z`);
  if (fim) query = query.lte('resolvido_em', `${fim}T23:59:59.999Z`);

  const { data, error } = await query.order('resolvido_em', { ascending: false });
  return { data: data || [], error };
}

/**
 * Insere registros de falha — um setor por vez, validado.
 */
export async function inserirRegistrosFalha(setor, trave, pontos, falhas) {
  if (!validateSetor(setor, LISTA_SETORES)) return { error: { message: 'Setor inválido.' } };
  if (!validateTrave(trave)) return { error: { message: 'Trave inválida.' } };
  const falhasSanit = sanitizeFalhasArray(falhas, FALHAS_COMUNS);
  const pontosSanit = sanitizePontosArray(pontos);
  if (falhasSanit.length === 0 || pontosSanit.length === 0) return { error: { message: 'Selecione ao menos um ponto e uma falha.' } };
  const falhaTexto = falhasSanit.join(', ');
  if (!validateFalhaTexto(falhaTexto)) return { error: { message: 'Texto de falha inválido.' } };
  const usuario = getSessionUser();
  const username = usuario?.username || 'Técnico';
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
  const { error } = await supabase.from('registros_falhas').insert(inserts);
  return { error };
}

/**
 * Atualiza registros para CONCLUÍDO (resolver) — apenas por IDs explícitos.
 */
export async function fecharRegistros(ids, solucao, resolvidoPor) {
  if (!Array.isArray(ids) || ids.length === 0) return { error: { message: 'IDs obrigatórios.' } };
  if (!validateSolucao(solucao)) return { error: { message: 'Solução inválida.' } };

  const sessionUser = getSessionUser();
  if (!sessionUser || sessionUser.role === 'colaborador') {
    return { error: { message: 'Não autorizado.' } };
  }

  const idList = ids.filter((id) => id != null && id !== '');
  if (idList.length === 0) return { error: { message: 'Nenhum ID válido.' } };
  const resolvidoPorSanit = sanitizeString(sessionUser.username, LIMITS.MAX_USERNAME) || 'Sistema';
  const { error } = await supabase
    .from('registros_falhas')
    .update({
      status: 'CONCLUÍDO',
      solucao: sanitizeString(solucao, LIMITS.MAX_SOLUCAO),
      resolvido_por: resolvidoPorSanit,
      resolvido_em: new Date().toISOString(),
    })
    .in('id', idList);
  return { error };
}

/**
 * Leitura bruta para telas que precisam de todos os campos (ex.: Monitor TV).
 * Não expõe operações de escrita.
 */
export { supabase } from './supabase';
