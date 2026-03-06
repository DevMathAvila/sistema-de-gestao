import { postApiAction } from '../http/apiClient';
import { getSessionUser } from '../../utils/session';

export function getUsuarioParaLogin(username, senha) {
  return postApiAction('getUsuarioParaLogin', { username, senha });
}

export function listarUsuarios() {
  return postApiAction('listarUsuarios');
}

export function atualizarSenhaUsuario(username, novaSenha) {
  return postApiAction('atualizarSenhaUsuario', { username, novaSenha });
}

export function criarUsuario(payload) {
  return postApiAction('criarUsuario', { payload, sessionUser: getSessionUser() });
}

export function removerUsuario(id) {
  return postApiAction('removerUsuario', { id, sessionUser: getSessionUser() });
}

export function listarFalhasAbertas() {
  return postApiAction('listarFalhasAbertas');
}

export function listarChamadosAbertosPorSetor(setor) {
  return postApiAction('listarChamadosAbertosPorSetor', { setor, sessionUser: getSessionUser() });
}

export function listarRegistrosFalhas(filtroSetor = null) {
  return postApiAction('listarRegistrosFalhas', { filtroSetor });
}

export function listarRegistrosAbertos(dataInicio = null, dataFim = null) {
  return postApiAction('listarRegistrosAbertos', { dataInicio, dataFim });
}

export function listarRegistrosParaKPI(dataInicio = null, dataFim = null) {
  return postApiAction('listarRegistrosParaKPI', { dataInicio, dataFim });
}

export function listarOcorrenciasConcluidas(dataInicio = null, dataFim = null) {
  return postApiAction('listarOcorrenciasConcluidas', { dataInicio, dataFim });
}

export function listarHistoricoRecentePorPonto(setor, trave, ponto, limite = 5) {
  return postApiAction('listarHistoricoRecentePorPonto', { setor, trave, ponto, limite });
}

export function inserirRegistrosFalha(setor, trave, pontos, falhas) {
  return postApiAction('inserirRegistrosFalha', {
    setor,
    trave,
    pontos,
    falhas,
    sessionUser: getSessionUser(),
  });
}

export function fecharRegistros(ids, solucao, falhasSelecionadas = null) {
  return postApiAction('fecharRegistros', {
    ids,
    solucao,
    falhasSelecionadas,
    sessionUser: getSessionUser(),
  });
}
