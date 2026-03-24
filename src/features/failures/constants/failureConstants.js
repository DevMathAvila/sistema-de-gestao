import {
  getPontosBySetorConfig,
  getSetorConfig,
  getTotalPontosBySetorConfig,
  getTravesBySetorConfig,
  isSingleTraveSetor,
} from '../../../shared/constants/setores.js';

export const TRAVES = Array.from({ length: 23 }, (_, idx) => idx + 1);
export const PONTOS = Array.from({ length: 15 }, (_, idx) => String(idx + 1));
export const TRAVES_AVT = [1];
export const TOTAL_PONTOS_AVT = 48;
export const PONTOS_AVT = Array.from({ length: TOTAL_PONTOS_AVT }, (_, idx) => String(idx + 1));

export function isAvtSetor(setor) {
  const family = getSetorConfig(setor)?.family || '';
  return family === 'single-trave' || family === 'hybrid-avt';
}

export function getPontosBySetor(setor) {
  const pontos = getPontosBySetorConfig(setor);
  return pontos.length ? pontos : PONTOS;
}

export function getTravesBySetor(setor) {
  const traves = getTravesBySetorConfig(setor);
  return traves.length ? traves : TRAVES;
}

export function getTotalPontosBySetor(setor) {
  return getTotalPontosBySetorConfig(setor) || PONTOS.length;
}

export function isSingleTraveFailureSetor(setor) {
  return isSingleTraveSetor(setor);
}

export function isTraveInteiraLabel(value) {
  const texto = String(value || '').toLowerCase();
  return texto.includes('inteira')
    || texto.includes('travetoda')
    || texto.includes('1-8')
    || texto.includes('1-15')
    || texto.includes('1-18')
    || texto.includes('1-40')
    || texto.includes('1-48');
}
