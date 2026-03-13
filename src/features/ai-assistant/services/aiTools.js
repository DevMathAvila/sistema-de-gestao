export const AI_TOOL_DECLARATIONS = [
  {
    name: 'query_registros_falhas',
    description: 'Consulta registros de falhas com filtros opcionais por setor, status e periodo.',
    parameters: {
      type: 'OBJECT',
      properties: {
        setor: { type: 'STRING', description: 'Nome do setor, ex: Runin 01 ou AVT 01.' },
        status: { type: 'STRING', description: 'aberto ou concluido.' },
        data_inicio: { type: 'STRING', description: 'Data inicial no formato YYYY-MM-DD.' },
        data_fim: { type: 'STRING', description: 'Data final no formato YYYY-MM-DD.' },
        limit: { type: 'NUMBER', description: 'Quantidade maxima de registros a retornar. Padrao 50.' },
      },
    },
  },
  {
    name: 'query_avisos',
    description: 'Consulta avisos recentes do sistema.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'NUMBER', description: 'Quantidade maxima de avisos a retornar. Padrao 10.' },
      },
    },
  },
  {
    name: 'query_dashboard_kpis',
    description: 'Retorna metricas agregadas de falhas para um periodo.',
    parameters: {
      type: 'OBJECT',
      properties: {
        data_inicio: { type: 'STRING', description: 'Data inicial no formato YYYY-MM-DD.' },
        data_fim: { type: 'STRING', description: 'Data final no formato YYYY-MM-DD.' },
        setor: { type: 'STRING', description: 'Filtro opcional por setor.' },
      },
      required: ['data_inicio', 'data_fim'],
    },
  },
  {
    name: 'query_historico_concluidas',
    description: 'Consulta o historico de falhas concluidas.',
    parameters: {
      type: 'OBJECT',
      properties: {
        setor: { type: 'STRING', description: 'Setor opcional.' },
        data_inicio: { type: 'STRING', description: 'Data inicial no formato YYYY-MM-DD.' },
        data_fim: { type: 'STRING', description: 'Data final no formato YYYY-MM-DD.' },
        limit: { type: 'NUMBER', description: 'Quantidade maxima de registros. Padrao 50.' },
      },
    },
  },
];

export function normalizeToolArgs(args = {}) {
  if (!args) return {};

  if (typeof args === 'string') {
    try {
      const parsed = JSON.parse(args);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  if (typeof args !== 'object') return {};
  return args;
}
