export const AI_TOOL_DECLARATIONS = [
  {
    name: 'query_registros_falhas',
    description: 'Consulta registros de falhas abertas ou concluidas com filtros opcionais. Retorna `total` como quantidade total de falhas, nao de registros. Tambem retorna `totalRegistros`, `totalFalhas` e `porFalha`, contando falhas combinadas dentro do mesmo registro. Use isso para responder quantidades por tipo de falha com precisao. Se o usuario nao informar periodo, use hoje como padrao. Se nao informar status, busque todos.',
    parameters: {
      type: 'OBJECT',
      properties: {
        setor: {
          type: 'STRING',
          description: 'Nome exato do setor conforme banco: "Runin 01" a "Runin 10", "AVT 01" a "AVT 10", "Runin Hibrido", "AVT Hibrida 01" ou "AVT Hibrida 02". Normalize qualquer variacao do usuario para esse formato antes de passar.',
        },
        status: {
          type: 'STRING',
          description: 'aberto (falhas em aberto) ou concluido (falhas resolvidas). Se nao informado, retorna todos.',
        },
        data_inicio: {
          type: 'STRING',
          description: 'Data inicial no formato YYYY-MM-DD. Se nao informada, usa hoje.',
        },
        data_fim: {
          type: 'STRING',
          description: 'Data final no formato YYYY-MM-DD. Se nao informada, usa hoje.',
        },
        limit: {
          type: 'NUMBER',
          description: 'Quantidade maxima de registros a retornar. Padrao 50.',
        },
      },
    },
  },
  {
    name: 'query_pontos_inoperantes',
    description: 'Consulta pontos inoperantes em aberto. Inoperantes sao um estado persistente — NUNCA use filtro de data nesta tool. Nao passe data_inicio nem data_fim. Use para perguntas como: quantos pontos inoperantes temos, quais setores tem inoperantes, tem algum inoperante agora.',
    parameters: {
      type: 'OBJECT',
      properties: {
        setor: {
          type: 'STRING',
          description: 'Filtro opcional por setor. Formato exato: "Runin 01" a "Runin 10", "AVT 01" a "AVT 10", "Runin Hibrido", "AVT Hibrida 01" ou "AVT Hibrida 02". Se nao informado, retorna todos os setores.',
        },
        limit: {
          type: 'NUMBER',
          description: 'Quantidade maxima de registros. Padrao 100.',
        },
      },
    },
  },
  {
    name: 'query_avisos',
    description: 'Consulta avisos e comunicados recentes do sistema.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: {
          type: 'NUMBER',
          description: 'Quantidade maxima de avisos a retornar. Padrao 10.',
        },
      },
    },
  },
  {
    name: 'query_dashboard_kpis',
    description: 'Retorna metricas e KPIs agregados de falhas para um periodo. Use para resumos gerais, totais, top falhas, ranking de setores e taxa de resolucao. Se o usuario nao informar periodo, use hoje como padrao.',
    parameters: {
      type: 'OBJECT',
      properties: {
        data_inicio: {
          type: 'STRING',
          description: 'Data inicial no formato YYYY-MM-DD. Se nao informada, usa hoje.',
        },
        data_fim: {
          type: 'STRING',
          description: 'Data final no formato YYYY-MM-DD. Se nao informada, usa hoje.',
        },
        setor: {
          type: 'STRING',
          description: 'Filtro opcional por setor. Se nao informado, agrega todos os setores.',
        },
      },
    },
  },
  {
    name: 'query_historico_concluidas',
    description: 'Consulta o historico completo de falhas concluidas, incluindo registros antigos. Use quando o usuario quiser ver historico amplo ou dados de periodos anteriores.',
    parameters: {
      type: 'OBJECT',
      properties: {
        setor: {
          type: 'STRING',
          description: 'Filtro opcional por setor.',
        },
        data_inicio: {
          type: 'STRING',
          description: 'Data inicial no formato YYYY-MM-DD.',
        },
        data_fim: {
          type: 'STRING',
          description: 'Data final no formato YYYY-MM-DD.',
        },
        limit: {
          type: 'NUMBER',
          description: 'Quantidade maxima de registros. Padrao 50.',
        },
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
