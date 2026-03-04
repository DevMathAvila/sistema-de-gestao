import { supabase } from './supabaseClient';
import { LISTA_SETORES } from '../../shared/constants/setores';
import { FALHAS_COMUNS } from '../../shared/constants/falhasComuns';
import { getSessionUser as getStoredSessionUser } from '../auth/session';
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
} from '../validation/validation';

function normalizeDate(value) {
  const s = sanitizeString(value, 20);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;

  return null;
}

function getLocalDayStartUtcIso(dateKey) {
  const normalized = normalizeDate(dateKey);
  if (!normalized) return null;
  const dt = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

function getNextLocalDayStartUtcIso(dateKey) {
  const normalized = normalizeDate(dateKey);
  if (!normalized) return null;
  const dt = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setDate(dt.getDate() + 1);
  return dt.toISOString();
}

function toEpochMs(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;

  const onlyDate = normalizeDate(s);
  if (onlyDate) {
    const dt = new Date(`${onlyDate}T00:00:00`);
    return Number.isNaN(dt.getTime()) ? null : dt.getTime();
  }

  const dt = new Date(s.replace(' ', 'T'));
  if (!Number.isNaN(dt.getTime())) return dt.getTime();
  return null;
}

function getDateBounds(dataInicio, dataFim) {
  const inicio = dataInicio ? normalizeDate(dataInicio) : null;
  const fim = dataFim ? normalizeDate(dataFim) : null;
  const inicioIso = inicio ? getLocalDayStartUtcIso(inicio) : null;
  const fimExclusiveIso = fim ? getNextLocalDayStartUtcIso(fim) : null;
  const inicioMs = inicioIso ? toEpochMs(inicioIso) : null;
  const fimExclusiveMs = fimExclusiveIso ? toEpochMs(fimExclusiveIso) : null;

  return {
    inicio,
    fim,
    inicioIso,
    fimExclusiveIso,
    inicioMs,
    fimExclusiveMs,
  };
}

function isInRange(dateValue, inicioMs, fimExclusiveMs) {
  const timestamp = toEpochMs(dateValue);
  if (timestamp == null) return false;
  if (inicioMs != null && timestamp < inicioMs) return false;
  if (fimExclusiveMs != null && timestamp >= fimExclusiveMs) return false;
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
  return status.includes('conclu');
}

function isOpenRecord(item) {
  const status = normalizeStatus(item?.status);
  return status.includes('aberto');
}

function splitFalhas(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeString(item, LIMITS.MAX_FALHA_TEXTO))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return sanitizeString(value, LIMITS.MAX_FALHA_TEXTO)
    .split(/[,+]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function removeFalhasSelecionadas(originais, selecionadas) {
  const counts = {};
  selecionadas.forEach((falha) => {
    counts[falha] = (counts[falha] || 0) + 1;
  });

  const restante = [];
  originais.forEach((falha) => {
    if (counts[falha] > 0) {
      counts[falha] -= 1;
      return;
    }
    restante.push(falha);
  });

  return restante;
}

const SIGA_SCHEMA_HINT = "Colunas SIGA nao encontradas em 'registros_falhas'. Execute a migracao de schema.";

function withSigaSchemaHint(error) {
  const message = String(error?.message || '');
  const isSigaColumnMissing = message.includes("Could not find the 'siga_")
    || message.includes('schema cache')
    || message.includes('siga_enviado')
    || message.includes('siga_status');

  if (!isSigaColumnMissing) return error;
  return { ...error, message: `${SIGA_SCHEMA_HINT} (${message})` };
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
  const roleSolicitante = String(user?.role || '').toLowerCase();
  if (roleSolicitante !== 'admin' && roleSolicitante !== 'master') {
    return { data: null, error: { message: 'Nao autorizado.' } };
  }

  const username = sanitizeString(payload?.username, LIMITS.MAX_USERNAME).toLowerCase();
  const senha = String(payload?.senha ?? '').slice(0, LIMITS.MAX_SENHA);
  const desiredRole = String(payload?.role || 'tecnico').toLowerCase();

  const rolesPermitidas = roleSolicitante === 'master'
    ? ['master', 'admin', 'tecnico', 'técnico', 'tÃ©cnico', 'colaborador']
    : ['tecnico', 'técnico', 'tÃ©cnico', 'colaborador'];
  const roleNormalizada = desiredRole === 'técnico' || desiredRole === 'tÃ©cnico' ? 'tecnico' : desiredRole;
  const role = rolesPermitidas.includes(desiredRole) || rolesPermitidas.includes(roleNormalizada)
    ? roleNormalizada
    : 'tecnico';

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
  if (!user || user.role !== 'master') return { error: { message: 'Nao autorizado.' } };

  const idVal = Number(id);
  if (!Number.isInteger(idVal) && typeof id !== 'string') return { error: { message: 'ID invalido.' } };

  try {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    return { error };
  } catch (err) {
    return { error: { message: err?.message || 'Erro ao remover usuario.' } };
  }
}

export async function listarAvisos(limite = 50) {
  const limitSafe = Number.isInteger(limite) ? Math.min(Math.max(limite, 1), 200) : 50;
  const { data, error } = await supabase
    .from('avisos')
    .select('id, titulo, mensagem, autor, created_at')
    .order('created_at', { ascending: false })
    .limit(limitSafe);

  return { data: data || [], error };
}

export async function criarAviso(payload) {
  const user = getStoredSessionUser();
  const role = String(user?.role || '').toLowerCase();
  if (role !== 'master' && role !== 'admin') {
    return { data: null, error: { message: 'Nao autorizado.' } };
  }

  const titulo = sanitizeString(payload?.titulo, 120).trim();
  const mensagem = sanitizeString(payload?.mensagem, 1000).trim();
  if (!titulo || !mensagem) {
    return { data: null, error: { message: 'Titulo e mensagem obrigatorios.' } };
  }

  const autor = sanitizeString(user?.username, LIMITS.MAX_USERNAME) || 'Sistema';

  const { data, error } = await supabase
    .from('avisos')
    .insert([{ titulo, mensagem, autor }])
    .select()
    .single();

  return { data: data || null, error };
}
export async function listarFalhasAbertas() {
  const { data, error } = await supabase
    .from('registros_falhas')
    .select('*')
    .ilike('status', '%aberto%');

  return { data: data || [], error };
}

export async function listarChamadosAbertosPorSetor(setor) {
  if (!validateSetor(setor, LISTA_SETORES)) return { data: [], error: null };

  const { data, error } = await supabase
    .from('registros_falhas')
    .select('trave, ponto, falha')
    .eq('setor', String(setor).trim())
    .ilike('status', '%aberto%')
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
  const { inicioMs, fimExclusiveMs } = getDateBounds(dataInicio, dataFim);
  const selectBase = 'id, usuario, setor, trave, ponto, falha, data, status, resolvido_em';
  const selectWithSiga = `${selectBase}, siga_enviado, siga_status, siga_enviado_em, siga_codigo_chamado, siga_data_abertura, siga_finalizado_em`;

  const loadBySelect = async (selectCols) => {
    return supabase
      .from('registros_falhas')
      .select(selectCols)
      .ilike('status', '%aberto%')
      .order('data', { ascending: false });
  };

  let { data, error } = await loadBySelect(selectWithSiga);
  const maybeMissingSigaColumns = String(error?.message || '').includes('siga_');
  if (error && maybeMissingSigaColumns) {
    const fallback = await loadBySelect(selectBase);
    data = fallback.data;
    error = fallback.error;
  }
  if (error) return { data: [], error };

  const base = (data || []).filter((item) => isOpenRecord(item));
  const dataFiltrada = inicioMs != null || fimExclusiveMs != null
    ? base.filter((item) => isInRange(item?.data, inicioMs, fimExclusiveMs))
    : base;

  return { data: dataFiltrada, error: null };
}

export async function listarRegistrosParaKPI(dataInicio = null, dataFim = null) {
  const { inicioMs, fimExclusiveMs } = getDateBounds(dataInicio, dataFim);

  let query = supabase
    .from('registros_falhas')
    .select('id, setor, status, falha, data, resolvido_em, usuario');

  const { data, error } = await query.order('data', { ascending: false });
  if (error) return { data: [], error };

  const dataFiltrada = inicioMs != null || fimExclusiveMs != null
    ? (data || []).filter((item) => {
        const referenciaTempo = isConcludedRecord(item) ? (item?.resolvido_em || item?.data) : item?.data;
        return isInRange(referenciaTempo, inicioMs, fimExclusiveMs);
      })
    : (data || []);

  return { data: dataFiltrada, error: null };
}

export async function listarOcorrenciasConcluidas(dataInicio = null, dataFim = null) {
  const { inicioMs, fimExclusiveMs } = getDateBounds(dataInicio, dataFim);
  const selectBase = 'id, usuario, setor, trave, ponto, falha, solucao, resolvido_em, resolvido_por, status, data';
  const selectWithSiga = `${selectBase}, siga_enviado, siga_status, siga_enviado_em, siga_codigo_chamado, siga_data_abertura, siga_finalizado_em`;

  const loadBySelect = async (selectCols) => {
    return supabase
      .from('registros_falhas')
      .select(selectCols)
      .order('resolvido_em', { ascending: false });
  };

  let { data, error } = await loadBySelect(selectWithSiga);
  const maybeMissingSigaColumns = String(error?.message || '').includes('siga_');
  if (error && maybeMissingSigaColumns) {
    const fallback = await loadBySelect(selectBase);
    data = fallback.data;
    error = fallback.error;
  }
  if (error) return { data: [], error };

  const base = (data || []).filter((item) => isConcludedRecord(item));
  const dataFiltrada = inicioMs != null || fimExclusiveMs != null
    ? base.filter((item) => isInRange(item?.resolvido_em || item?.data, inicioMs, fimExclusiveMs))
    : base;

  return { data: dataFiltrada, error: null };
}

function pontoCorrespondeAoAlvo(pontoRegistro, pontoAlvo) {
  const registro = String(pontoRegistro || '').trim();
  const alvo = String(pontoAlvo || '').trim();
  if (!registro || !alvo) return false;

  const registroNorm = registro.toLowerCase();
  if (registroNorm.includes('1-15')) return true;
  if (registroNorm.includes('travetoda')) return true;

  const alvoNum = alvo.match(/\d+/)?.[0];
  if (!alvoNum) return registroNorm === alvo.toLowerCase();

  const registroNum = registro.match(/\d+/)?.[0];
  return registroNum === alvoNum;
}

export async function listarHistoricoRecentePorPonto(setor, trave, ponto, limite = 5) {
  if (!validateSetor(setor, LISTA_SETORES)) return { data: [], error: null };
  if (!validateTrave(trave)) return { data: [], error: null };

  const setorSanit = String(setor).trim();
  const traveNum = Number(trave);
  const pontoSanit = sanitizeString(ponto, 50).trim();
  const limiteSeguro = Number.isInteger(limite) ? Math.max(1, Math.min(limite, 20)) : 5;

  const selectCols = 'id, setor, trave, ponto, falha, solucao, resolvido_em, resolvido_por, usuario';

  try {
    const { data, error } = await supabase
      .from('historico_concluidas')
      .select(selectCols)
      .eq('setor', setorSanit)
      .eq('trave', traveNum)
      .order('resolvido_em', { ascending: false })
      .limit(60);

    if (!error) {
      const filtrado = (data || [])
        .filter((item) => pontoCorrespondeAoAlvo(item?.ponto, pontoSanit))
        .slice(0, limiteSeguro);
      return { data: filtrado, error: null };
    }
  } catch {
    // fallback abaixo
  }

  const { data, error } = await supabase
    .from('registros_falhas')
    .select(selectCols)
    .eq('setor', setorSanit)
    .eq('trave', traveNum)
    .ilike('status', '%conclu%')
    .order('resolvido_em', { ascending: false })
    .limit(60);

  if (error) return { data: [], error };
  const filtrado = (data || [])
    .filter((item) => pontoCorrespondeAoAlvo(item?.ponto, pontoSanit))
    .slice(0, limiteSeguro);

  return { data: filtrado, error: null };
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

export async function fecharRegistros(ids, solucao, falhasSelecionadas = null) {
  if (!Array.isArray(ids) || ids.length === 0) return { error: { message: 'IDs obrigatorios.' } };
  if (!validateSolucao(solucao)) return { error: { message: 'Solucao invalida.' } };

  const sessionUser = getStoredSessionUser();
  if (!sessionUser || sessionUser.role === 'colaborador') {
    return { error: { message: 'Nao autorizado.' } };
  }

  const idList = ids.filter((id) => id != null && id !== '');
  if (idList.length === 0) return { error: { message: 'Nenhum ID valido.' } };
  const idSet = new Set(idList.map((id) => String(id)));
  const resolvidoPorSanit = sanitizeString(sessionUser.username, LIMITS.MAX_USERNAME) || 'Sistema';
  const solucaoSanit = sanitizeString(solucao, LIMITS.MAX_SOLUCAO);
  const resolvidoEmIso = new Date().toISOString();

  const selecaoValida = Array.isArray(falhasSelecionadas)
    ? falhasSelecionadas
        .map((item) => ({
          id: item?.id,
          falha: sanitizeString(item?.falha, LIMITS.MAX_FALHA_TEXTO).trim(),
        }))
        .filter((item) => item.id != null && item.id !== '' && item.falha)
        .filter((item) => idSet.has(String(item.id)))
    : [];

  if (selecaoValida.length === 0) {
    try {
      const { error } = await supabase
        .from('registros_falhas')
        .update({
          status: 'CONCLUIDO',
          solucao: solucaoSanit,
          resolvido_por: resolvidoPorSanit,
          resolvido_em: resolvidoEmIso,
        })
        .in('id', idList);

      return { error };
    } catch (err) {
      return { error: { message: err?.message || 'Erro ao fechar chamado.' } };
    }
  }

  try {
    const idsSelecao = [...new Set(selecaoValida.map((item) => item.id))];
    const idsConsulta = [...new Set([...idList, ...idsSelecao])];
    const { data: registros, error: errorFetch } = await supabase
      .from('registros_falhas')
      .select('id, usuario, setor, trave, ponto, falha, data, status')
      .in('id', idsConsulta);

    if (errorFetch) return { error: errorFetch };
    const rows = Array.isArray(registros) ? registros : [];
    if (rows.length === 0) return { error: { message: 'Nenhum registro encontrado para concluir.' } };

    const selecaoPorId = new Map();
    selecaoValida.forEach((item) => {
      const bucket = selecaoPorId.get(item.id) || [];
      bucket.push(item.falha);
      selecaoPorId.set(item.id, bucket);
    });

    for (const row of rows) {
      const falhasRow = splitFalhas(row?.falha);
      const falhasDesejadas = selecaoPorId.get(row.id) || [];
      if (falhasDesejadas.length === 0 || falhasRow.length === 0) continue;

      const setDesejadas = new Set(falhasDesejadas);
      const falhasResolvidas = falhasRow.filter((falha) => setDesejadas.has(falha));
      if (falhasResolvidas.length === 0) continue;

      const falhasRestantes = removeFalhasSelecionadas(falhasRow, falhasResolvidas);
      const falhasResolvidasTexto = falhasResolvidas.join(', ');

      if (falhasRestantes.length === 0) {
        const { error: errorUpdateConcluido } = await supabase
          .from('registros_falhas')
          .update({
            status: 'CONCLUIDO',
            falha: falhasResolvidasTexto,
            solucao: solucaoSanit,
            resolvido_por: resolvidoPorSanit,
            resolvido_em: resolvidoEmIso,
          })
          .eq('id', row.id);
        if (errorUpdateConcluido) return { error: errorUpdateConcluido };
        continue;
      }

      const { error: errorUpdateAberto } = await supabase
        .from('registros_falhas')
        .update({
          status: 'aberto',
          falha: falhasRestantes.join(', '),
          solucao: null,
          resolvido_por: null,
          resolvido_em: null,
        })
        .eq('id', row.id);
      if (errorUpdateAberto) return { error: errorUpdateAberto };

      const { error: errorInsertConcluido } = await supabase
        .from('registros_falhas')
        .insert([{
          usuario: row.usuario || 'Tecnico',
          setor: row.setor,
          trave: row.trave,
          ponto: row.ponto,
          falha: falhasResolvidasTexto,
          data: row.data,
          status: 'CONCLUIDO',
          solucao: solucaoSanit,
          resolvido_por: resolvidoPorSanit,
          resolvido_em: resolvidoEmIso,
        }]);
      if (errorInsertConcluido) return { error: errorInsertConcluido };
    }

    return { error: null };
  } catch (err) {
    return { error: { message: err?.message || 'Erro ao fechar chamado.' } };
  }
}

export async function marcarFalhasParaSiga(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return { error: { message: 'IDs obrigatorios.' } };

  const idsValidos = [...new Set(ids.filter((id) => id != null && id !== ''))];
  if (idsValidos.length === 0) return { error: { message: 'Nenhum ID valido.' } };

  const payload = {
    siga_enviado: true,
    siga_status: 'AGUARDANDO',
    siga_enviado_em: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('registros_falhas')
      .update(payload)
      .in('id', idsValidos)
      .ilike('status', '%aberto%');

    return { error: withSigaSchemaHint(error) };
  } catch (err) {
    return { error: withSigaSchemaHint({ message: err?.message || 'Erro ao enviar para SIGA.' }) };
  }
}

export async function listarFalhasSigaAguardando() {
  try {
    const { data, error } = await supabase
      .from('registros_falhas')
      .select('id, usuario, setor, trave, ponto, falha, data, status, siga_status, siga_enviado, siga_enviado_em, siga_codigo_chamado, siga_data_abertura')
      .eq('siga_enviado', true)
      .ilike('status', '%aberto%')
      .order('data', { ascending: false });

    if (error) return { data: [], error: withSigaSchemaHint(error) };
    const aguardando = (data || []).filter((item) => String(item?.siga_status || 'AGUARDANDO').toUpperCase() !== 'FINALIZADO');
    return { data: aguardando, error: null };
  } catch (err) {
    return { data: [], error: withSigaSchemaHint({ message: err?.message || 'Erro ao listar SIGA (aguardando).' }) };
  }
}

export async function listarFalhasSigaFinalizados() {
  try {
    const { data, error } = await supabase
      .from('registros_falhas')
      .select('id, usuario, setor, trave, ponto, falha, data, status, solucao, resolvido_em, resolvido_por, siga_status, siga_enviado, siga_enviado_em, siga_codigo_chamado, siga_data_abertura, siga_finalizado_em')
      .eq('siga_enviado', true)
      .ilike('status', '%conclu%')
      .order('resolvido_em', { ascending: false });

    if (error) return { data: [], error: withSigaSchemaHint(error) };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: withSigaSchemaHint({ message: err?.message || 'Erro ao listar SIGA (finalizados).' }) };
  }
}

export async function finalizarFalhaViaSiga({ id, diaAbertura, codigoChamado }) {
  if (id == null || id === '') return { error: { message: 'ID obrigatorio.' } };
  const codigo = sanitizeString(codigoChamado, 120).trim();
  const dia = normalizeDate(diaAbertura);
  if (!codigo || !dia) return { error: { message: 'Dia da abertura e codigo do chamado sao obrigatorios.' } };

  const sessionUser = getStoredSessionUser();
  if (!sessionUser || sessionUser.role === 'colaborador') {
    return { error: { message: 'Nao autorizado.' } };
  }

  const resolvidoEmIso = new Date().toISOString();
  const resolvidoPorSanit = sanitizeString(sessionUser.username, LIMITS.MAX_USERNAME) || 'Sistema';
  const solucaoTexto = `Finalizado via SIGA - Chamado ${codigo}`;

  try {
    const { error } = await supabase
      .from('registros_falhas')
      .update({
        status: 'CONCLUIDO',
        solucao: solucaoTexto,
        resolvido_por: resolvidoPorSanit,
        resolvido_em: resolvidoEmIso,
        siga_status: 'FINALIZADO',
        siga_codigo_chamado: codigo,
        siga_data_abertura: dia,
        siga_finalizado_em: resolvidoEmIso,
      })
      .eq('id', id)
      .eq('siga_enviado', true);

    return { error: withSigaSchemaHint(error) };
  } catch (err) {
    return { error: withSigaSchemaHint({ message: err?.message || 'Erro ao finalizar falha via SIGA.' }) };
  }
}




