/**
 * Lista mestra de setores — única fonte de verdade para o app.
 * Usado em Admin, Dashboard, Registrar, VisualizarFalhas e MonitorTV.
 */

export const LISTA_SETORES = [
  'Runin 01', 'Runin 02', 'Runin 03', 'Runin 04', 'Runin 05',
  'Runin 06', 'Runin 07', 'Runin 08', 'Runin 09', 'Runin 10',
  'AVT',
];

export const SETOR_TODOS = 'TODOS';

export function isSetorValido(setor) {
  if (!setor || typeof setor !== 'string') return false;
  const s = setor.trim();
  return LISTA_SETORES.includes(s);
}
