/**
 * Lista mestra de setores — única fonte de verdade para o app.
 * Usado em Admin, Dashboard, Registrar, VisualizarFalhas e MonitorTV.
 */

function createRuninConfig(nome, traves = 23, pontosPorTrave = 15, options = {}) {
  return {
    nome,
    family: 'runin',
    traves: Array.from({ length: traves }, (_, idx) => idx + 1),
    pontos: Array.from({ length: pontosPorTrave }, (_, idx) => String(idx + 1)),
    pontosPorTrave,
    isSingleTrave: false,
    ...options,
  };
}

function createSingleTraveConfig(nome, pontos = 48, options = {}) {
  return {
    nome,
    family: 'single-trave',
    traves: [1],
    pontos: Array.from({ length: pontos }, (_, idx) => String(idx + 1)),
    pontosPorTrave: pontos,
    isSingleTrave: true,
    ...options,
  };
}

export const SETOR_CONFIG_MAP = {
  'Runin 01': createRuninConfig('Runin 01'),
  'Runin 02': createRuninConfig('Runin 02'),
  'Runin 03': createRuninConfig('Runin 03'),
  'Runin 04': createRuninConfig('Runin 04'),
  'Runin 05': createRuninConfig('Runin 05'),
  'Runin 06': createRuninConfig('Runin 06'),
  'Runin 07': createRuninConfig('Runin 07'),
  'Runin 08': createRuninConfig('Runin 08'),
  'Runin 09': createRuninConfig('Runin 09'),
  'Runin 10': createRuninConfig('Runin 10'),
  'AVT 01': createSingleTraveConfig('AVT 01'),
  'AVT 02': createSingleTraveConfig('AVT 02'),
  'AVT 03': createSingleTraveConfig('AVT 03'),
  'AVT 04': createSingleTraveConfig('AVT 04'),
  'AVT 05': createSingleTraveConfig('AVT 05'),
  'AVT 06': createSingleTraveConfig('AVT 06'),
  'AVT 07': createSingleTraveConfig('AVT 07'),
  'AVT 08': createSingleTraveConfig('AVT 08'),
  'AVT 09': createSingleTraveConfig('AVT 09'),
  'AVT 10': createSingleTraveConfig('AVT 10'),
  'Runin Hibrido': createRuninConfig('Runin Hibrido', 10, 8, { family: 'hybrid-runin' }),
  'AVT Hibrida 01': createSingleTraveConfig('AVT Hibrida 01', 15, { family: 'hybrid-avt' }),
  'AVT Hibrida 02': createSingleTraveConfig('AVT Hibrida 02', 18, { family: 'hybrid-avt' }),
};

export const LISTA_SETORES = [
  ...Object.keys(SETOR_CONFIG_MAP),
];

export const SETOR_TODOS = 'TODOS';

export function getSetorConfig(setor) {
  return SETOR_CONFIG_MAP[String(setor || '').trim()] || null;
}

export function isSingleTraveSetor(setor) {
  return Boolean(getSetorConfig(setor)?.isSingleTrave);
}

export function getPontosBySetorConfig(setor) {
  return getSetorConfig(setor)?.pontos || [];
}

export function getTravesBySetorConfig(setor) {
  return getSetorConfig(setor)?.traves || [];
}

export function getTotalPontosBySetorConfig(setor) {
  return getPontosBySetorConfig(setor).length;
}
