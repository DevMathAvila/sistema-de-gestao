export const ADMIN_TABS = ['indicadores', 'usuarios', 'estatisticas', 'historico'];

export const ADMIN_NAV_ITEMS = [
  { id: 'indicadores', label: 'Dashboard KPI' },
  { id: 'usuarios', label: 'Gestao de Equipe' },
  { id: 'estatisticas', label: 'Pareto de Falhas' },
  { id: 'historico', label: 'Historico Geral' },
];

export function resolveAdminTab(value) {
  return ADMIN_TABS.includes(value) ? value : 'indicadores';
}

export function getRoleOptions(isMaster) {
  if (isMaster) {
    return [
      { value: 'master', label: 'Master' },
      { value: 'admin', label: 'Administrador' },
      { value: 'tecnico', label: 'Tecnico Operador' },
      { value: 'runin_kiosk', label: 'Run In Kiosk' },
      { value: 'colaborador', label: 'Colaborador' },
    ];
  }
  return [
    { value: 'tecnico', label: 'Tecnico Operador' },
    { value: 'runin_kiosk', label: 'Run In Kiosk' },
    { value: 'colaborador', label: 'Colaborador' },
  ];
}
