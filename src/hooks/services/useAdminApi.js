import { useCallback } from 'react';
import * as api from '../../services/supabaseSecure';

export function useAdminApi() {
  const listarUsuarios = useCallback(async () => {
    const { data, error } = await api.listarUsuarios();
    if (error) throw error;
    return data || [];
  }, []);

  const listarRegistrosFalhas = useCallback(async (setorFiltro) => {
    const { data, error } = await api.listarRegistrosFalhas(setorFiltro);
    if (error) throw error;
    return data || [];
  }, []);

  const listarRegistrosParaKPI = useCallback(async (dataInicio, dataFim) => {
    const { data, error } = await api.listarRegistrosParaKPI(dataInicio || null, dataFim || null);
    if (error) throw error;
    return data || [];
  }, []);

  const listarConcluidas = useCallback(async (dataInicio, dataFim) => {
    const { data, error } = await api.listarOcorrenciasConcluidas(dataInicio || null, dataFim || null);
    if (error) throw error;
    return data || [];
  }, []);

  const listarAbertas = useCallback(async (dataInicio, dataFim) => {
    const { data, error } = await api.listarRegistrosAbertos(dataInicio || null, dataFim || null);
    if (error) throw error;
    return data || [];
  }, []);

  const criarUsuario = useCallback(async (payload) => {
    const { error } = await api.criarUsuario(payload);
    if (error) throw error;
  }, []);

  const removerUsuario = useCallback(async (id) => {
    const { error } = await api.removerUsuario(id);
    if (error) throw error;
  }, []);

  const atualizarSenha = useCallback(async (username, novaSenha) => {
    const { success, error } = await api.atualizarSenhaUsuario(username, novaSenha);
    if (error || success === false) throw error || new Error('Falha ao atualizar senha.');
  }, []);

  return {
    listarUsuarios,
    listarRegistrosFalhas,
    listarRegistrosParaKPI,
    listarConcluidas,
    listarAbertas,
    criarUsuario,
    removerUsuario,
    atualizarSenha,
  };
}
