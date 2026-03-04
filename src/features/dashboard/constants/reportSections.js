export const DASHBOARD_REPORT_SECTIONS = [
  { key: 'closedFailures', label: 'Falhas fechadas' },
  { key: 'ranking', label: 'Ranking de falhas' },
  { key: 'setorInsights', label: 'Insights por setor' },
  { key: 'aging', label: 'Aging de pendencias' },
  { key: 'historyPoints', label: 'Pontos com mais historico de registros' },
];

export const DASHBOARD_REPORT_PRESETS = {
  daily: {
    closedFailures: true,
    ranking: false,
    setorInsights: false,
    aging: true,
    historyPoints: false,
  },
  weeklyExecutive: {
    closedFailures: true,
    ranking: true,
    setorInsights: true,
    aging: true,
    historyPoints: false,
  },
  weeklyFull: {
    closedFailures: true,
    ranking: true,
    setorInsights: true,
    aging: true,
    historyPoints: true,
  },
};
