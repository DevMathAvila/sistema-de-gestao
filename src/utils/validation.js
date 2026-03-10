/**
 * Validação e sanitização de entradas — reduz risco de injeção e dados inválidos.
 * Todos os valores enviados ao Supabase devem passar por aqui quando aplicável.
 */

const MAX_USERNAME = 80;
const MAX_SENHA = 120;
const MAX_FALHA_TEXTO = 500;
const MAX_SOLUCAO = 2000;
const TRAVE_MIN = 1;
const TRAVE_MAX = 23;
const PONTO_MIN = 1;
const PONTO_MAX = 48;

/**
 * Remove caracteres perigosos e limita tamanho.
 */
export function sanitizeString(str, maxLength = 1000) {
  if (str == null) return '';
  const s = String(str).trim();
  return s.slice(0, maxLength).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function validateUsername(username) {
  const s = sanitizeString(username, MAX_USERNAME);
  return s.length >= 1 && s.length <= MAX_USERNAME;
}

export function validateSenha(senha) {
  const s = String(senha ?? '');
  return s.length >= 1 && s.length <= MAX_SENHA;
}

export function validateSetor(setor, listaSetores) {
  return listaSetores && listaSetores.includes(String(setor).trim());
}

export function validateTrave(trave) {
  const n = Number(trave);
  return Number.isInteger(n) && n >= TRAVE_MIN && n <= TRAVE_MAX;
}

export function validatePonto(ponto) {
  const n = Number(ponto);
  return Number.isInteger(n) && n >= PONTO_MIN && n <= PONTO_MAX;
}

export function validateFalhaTexto(texto) {
  const s = sanitizeString(texto, MAX_FALHA_TEXTO);
  return s.length >= 1 && s.length <= MAX_FALHA_TEXTO;
}

export function validateSolucao(texto) {
  const s = sanitizeString(texto, MAX_SOLUCAO);
  return s.length >= 1 && s.length <= MAX_SOLUCAO;
}

export function sanitizeFalhasArray(falhas, listaPermitida) {
  if (!Array.isArray(falhas)) return [];
  const set = new Set(listaPermitida || []);
  return falhas
    .filter((f) => typeof f === 'string' && set.has(f.trim()))
    .map((f) => f.trim())
    .slice(0, 20);
}

export function sanitizePontosArray(pontos) {
  if (!Array.isArray(pontos)) return [];
  const out = [];
  const seen = new Set();
  for (const p of pontos) {
    const n = Number(p);
    if (Number.isInteger(n) && n >= PONTO_MIN && n <= PONTO_MAX && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  return out.sort((a, b) => a - b);
}

export const LIMITS = {
  MAX_USERNAME,
  MAX_SENHA,
  MAX_FALHA_TEXTO,
  MAX_SOLUCAO,
  TRAVE_MIN,
  TRAVE_MAX,
  PONTO_MIN,
  PONTO_MAX,
};
