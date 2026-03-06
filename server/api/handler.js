import {
  atualizarSenhaUsuario,
  criarUsuario,
  fecharRegistros,
  getUsuarioParaLogin,
  inserirRegistrosFalha,
  listarChamadosAbertosPorSetor,
  listarFalhasAbertas,
  listarHistoricoRecentePorPonto,
  listarOcorrenciasConcluidas,
  listarRegistrosAbertos,
  listarRegistrosFalhas,
  listarRegistrosParaKPI,
  listarUsuarios,
  removerUsuario,
} from '../services/supabaseSecureService.js';

const actionMap = {
  getUsuarioParaLogin: ({ username, senha }) => getUsuarioParaLogin(username, senha),
  listarUsuarios: () => listarUsuarios(),
  atualizarSenhaUsuario: ({ username, novaSenha }) => atualizarSenhaUsuario(username, novaSenha),
  criarUsuario: ({ payload, sessionUser }) => criarUsuario(payload, sessionUser),
  removerUsuario: ({ id, sessionUser }) => removerUsuario(id, sessionUser),
  listarFalhasAbertas: () => listarFalhasAbertas(),
  listarChamadosAbertosPorSetor: ({ setor, sessionUser }) => listarChamadosAbertosPorSetor(setor, sessionUser),
  listarRegistrosFalhas: ({ filtroSetor }) => listarRegistrosFalhas(filtroSetor),
  listarRegistrosAbertos: ({ dataInicio, dataFim }) => listarRegistrosAbertos(dataInicio, dataFim),
  listarRegistrosParaKPI: ({ dataInicio, dataFim }) => listarRegistrosParaKPI(dataInicio, dataFim),
  listarOcorrenciasConcluidas: ({ dataInicio, dataFim }) => listarOcorrenciasConcluidas(dataInicio, dataFim),
  listarHistoricoRecentePorPonto: ({ setor, trave, ponto, limite }) => listarHistoricoRecentePorPonto(setor, trave, ponto, limite),
  inserirRegistrosFalha: ({ setor, trave, pontos, falhas, sessionUser }) => inserirRegistrosFalha(setor, trave, pontos, falhas, sessionUser),
  fecharRegistros: ({ ids, solucao, falhasSelecionadas, sessionUser }) => fecharRegistros(ids, solucao, falhasSelecionadas, sessionUser),
};

function parseBody(rawBody) {
  if (!rawBody) return {};
  if (typeof rawBody === 'object') return rawBody;
  try {
    return JSON.parse(rawBody);
  } catch {
    return {};
  }
}

export async function handleApiRequest(rawBody) {
  const body = parseBody(rawBody);
  const action = String(body?.action || '').trim();
  const payload = body?.payload || {};

  if (!action || !actionMap[action]) {
    return { status: 400, body: { error: { message: 'Acao invalida.' } } };
  }

  try {
    const result = await actionMap[action](payload);
    return { status: 200, body: result ?? {} };
  } catch (err) {
    return {
      status: 500,
      body: { error: { message: err?.message || 'Erro interno na API.' } },
    };
  }
}
