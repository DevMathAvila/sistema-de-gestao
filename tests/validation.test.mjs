import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sanitizeFalhasArray,
  sanitizePontosArray,
  sanitizeString,
  validateSolucao,
} from '../src/core/validation/validation.js';

test('sanitizeString trims, truncates and removes control chars', () => {
  assert.equal(sanitizeString('  abc\u0007def  ', 5), 'abcd');
});

test('sanitizeFalhasArray keeps only allowed failures', () => {
  assert.deepEqual(
    sanitizeFalhasArray(['Falha A', 'Falha X', 'Falha B'], ['Falha A', 'Falha B']),
    ['Falha A', 'Falha B'],
  );
});

test('sanitizePontosArray deduplicates and sorts valid points', () => {
  assert.deepEqual(sanitizePontosArray([5, '2', 2, 99, 1, 'x']), [1, 2, 5]);
});

test('validateSolucao requires non-empty text', () => {
  assert.equal(validateSolucao('Ajuste realizado'), true);
  assert.equal(validateSolucao(''), false);
});
