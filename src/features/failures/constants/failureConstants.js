export const TRAVES = Array.from({ length: 23 }, (_, idx) => idx + 1);
export const PONTOS = Array.from({ length: 15 }, (_, idx) => String(idx + 1));
export const TRAVES_AVT = [1];
export const TOTAL_PONTOS_AVT = 48;
export const PONTOS_AVT = Array.from({ length: TOTAL_PONTOS_AVT }, (_, idx) => String(idx + 1));

export function isAvtSetor(setor) {
  return /^AVT(\s|$)/i.test(String(setor || '').trim());
}

export function getPontosBySetor(setor) {
  return isAvtSetor(setor) ? PONTOS_AVT : PONTOS;
}

export function getTravesBySetor(setor) {
  return isAvtSetor(setor) ? TRAVES_AVT : TRAVES;
}

export function isTraveInteiraLabel(value) {
  const texto = String(value || '').toLowerCase();
  return texto.includes('inteira')
    || texto.includes('travetoda')
    || texto.includes('1-15')
    || texto.includes('1-40')
    || texto.includes('1-48');
}
