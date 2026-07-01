export function formatarExpressao(expressao) {

  return expressao.join(' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
}

export function operadorParaDisplay(op) {

  if ( op === 'nroot') return 'ⁿ√'

  return op === '/' ? '÷' : op;
}

export function ehOperador(val) {
  return ['+', '-', '*', '÷', '^', 'ⁿ√'].includes(val);
}

export function ehParenteseAbre(val) {
  return val === '(';
}

export function ehParenteseFecha(val) {
  return val === ')';
}

// Qualquer token que não represente um número (operador ou parêntese)
export function ehNaoNumerico(val) {
  return ehOperador(val) || ehParenteseAbre(val) || ehParenteseFecha(val);
}

export function normalizarOperador(op) {
  if (op === '÷') return '/';
  if (op === 'ⁿ√') return 'nroot'
  return op;
}