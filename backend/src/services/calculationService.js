//aqui ta os serviços do calculo que vai fazer

const OPERADORES_UNARIOS = ['sqrt'];

function calcular(n1, n2, operador) {
  switch (operador) {
    case '+': return n1 + n2;
    case '-': return n1 - n2;
    case '*': return n1 * n2;
    case '/':
      if (n2 === 0) throw new Error('Não é possível dividir por zero.');
      return n1 / n2;
    case '^': return Math.pow(n1, n2);
    //case raiz n-ésima
    case 'nroot': {
      if (n2 === 0) throw new Error('O índice da raiz não pode ser zero.');
      if (n1 < 0) {
        // Raiz de número negativo só existe (nos reais) se o índice for ímpar. então tratei manualmente: -raiz(|n1|, n2)
        if (Number.isInteger(n2) && Math.abs(n2) % 2 === 1) {
          return -Math.pow(-n1, 1 / n2);
        }
        throw new Error('Raiz de número negativo com índice par é indefinida.');
      }
      return Math.pow(n1, 1 / n2);
    }

      if (n1 < 0) throw new Error('Raiz de número negativo é indefinida.');
      return Math.sqrt(n1);
    default:
      throw new Error('Operador inválido.');
  }
}

function validarECalcular({ firstNumber, secondNumber, operator }) {
  if (firstNumber === undefined || !operator) {
    throw Object.assign(new Error('Informe o número e o operador.'), { status: 400 });
  }

  const n1 = Number(firstNumber);
  if (Number.isNaN(n1)) {
    throw Object.assign(new Error('O primeiro valor precisa ser um número.'), { status: 400 });
  }

  const ehUnario = OPERADORES_UNARIOS.includes(operator);
  const n2 = ehUnario ? null : Number(secondNumber);

  if (!ehUnario && (secondNumber === undefined || Number.isNaN(n2))) {
    throw Object.assign(new Error('Informe o segundo número.'), { status: 400 });
  }

  const resultado = calcular(n1, n2, operator);
  return { n1, n2, resultado };
}

module.exports = { validarECalcular };