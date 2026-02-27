/**
 * Tipos de falha permitidos no registro — única fonte de verdade.
 */

export const FALHAS_COMUNS = [
  'Rede (RJ45)',
  'VGA',
  'AC Adapter',
  'Energia Y',
  'Pino Retangular',
  'HDMI',
  'DisplayPort',
  'Monitor',
];

export function isFalhaPermitida(falha) {
  if (!falha || typeof falha !== 'string') return false;
  return FALHAS_COMUNS.includes(falha.trim());
}
