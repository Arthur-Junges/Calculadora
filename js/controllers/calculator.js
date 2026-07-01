import { calcular, buscarHistorico, buscarRanking } from '../services/api.js';

import {
  ehOperador,
  ehParenteseAbre,
  ehParenteseFecha,
  ehNaoNumerico,
  formatarExpressao,
  operadorParaDisplay,
  normalizarOperador,
} from '../utils/format.js';

//se o cookie estiver ausente ou expirado, a primeira chamada retorna 401 e é direcionado automaticamente
let expressao = [];
let digitandoNumero = false;
let acabouDeCalcular = false;

const displayExpressao = document.getElementById('display-expressao');
const displayValor     = document.getElementById('display-value');
const historyList      = document.getElementById('history-list');
const sectionRanking = document.getElementById('section-ranking');

function atualizarDisplay() {
  const ultimo = expressao.at(-1);
  //agora "(" e ")" também fazem o display mostrar '0' em vez do próprio parêntese.
  displayValor.innerText = (ultimo && !ehNaoNumerico(ultimo)) ? ultimo : '0';
  displayExpressao.innerText = formatarExpressao(expressao);
}

function adicionarHistoricoLocal(texto, resultado) {
  document.querySelector('.empty-msg')?.remove();
  const item = document.createElement('div');
  item.className = 'history-item';
  item.style.cssText = 'padding:15px;border-bottom:1px solid #e2e8f0;text-align:right;';
  item.innerHTML = `<span style="color:#888;font-size:.85em">${texto}</span><br><strong>${resultado}</strong>`;
  historyList?.prepend(item);
}

// Números
document.querySelectorAll('.number').forEach((btn) => {
  btn.addEventListener('click', () => {
    const digito = btn.innerText;
    if (acabouDeCalcular) { expressao = []; acabouDeCalcular = false; digitandoNumero = false; }

    if (!digitandoNumero || !expressao.length || ehNaoNumerico(expressao.at(-1))) {
      expressao.push(digito === '.' ? '0.' : digito);
      digitandoNumero = true;
    } else {
      const atual = expressao.at(-1);
      if (digito === '.' && atual.includes('.')) return;
      expressao[expressao.length - 1] = atual + digito;
    }
    atualizarDisplay();
  });
});

// Operadores binários
document.querySelectorAll('[data-op]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const op = btn.dataset.op;
    if (!op) return;
    acabouDeCalcular = false;
    if (ehParenteseAbre(expressao.at(-1))) return;
    if (!expressao.length) expressao.push('0');
    if (ehOperador(expressao.at(-1))) expressao[expressao.length - 1] = op;
    else expressao.push(op);
    digitandoNumero = false;
    atualizarDisplay();
  });
});

document.querySelectorAll('[data-paren]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const paren = btn.dataset.paren;
    if (acabouDeCalcular) { expressao = []; acabouDeCalcular = false; digitandoNumero = false; }

    if (paren === '(') {
      const ultimo = expressao.at(-1);
      // Só deixa abrir parêntese em certos casos para não quebrear ex: 2() não entende que é 2 x o que esta dentro do ()
      if (ultimo !== undefined && !ehOperador(ultimo) && !ehParenteseAbre(ultimo)) return;
      expressao.push('(');
      digitandoNumero = false;
    } else {
      const abertos  = expressao.filter(ehParenteseAbre).length;
      const fechados = expressao.filter(ehParenteseFecha).length;
      const ultimo = expressao.at(-1);
      // Só fecha se: um parenteses ficou sem fechar, ai compelta e se o token anterior não for operador nem "(" (senão o  parêntese ficaria vazio, tipo "()").
      if (abertos <= fechados) return;
      if (ultimo === undefined || ehOperador(ultimo) || ehParenteseAbre(ultimo)) return;
      expressao.push(')');
      digitandoNumero = true;
    }
    atualizarDisplay();
  });
});

// Funções unárias (√ e log)
async function aplicarUnaria(operador) {
  const ultimo = expressao.at(-1);
  // não deixa usar raiz em parenteses sozinho
  if (!ultimo || ehNaoNumerico(ultimo)) return;
//normaliza operador garantindo que chegue sqrt e log na api
  const opNormalizado = normalizarOperador(operador);

  try {
    const calc = await calcular({ firstNumber: Number(ultimo), operator: opNormalizado});
    const resultado = String(parseFloat(calc.result));
    const texto = `${opNormalizado}(${ultimo})`;
    displayExpressao.innerText = texto + ' =';
    displayValor.innerText = resultado;
    expressao = [resultado];
    digitandoNumero = true;
    acabouDeCalcular = true;
    adicionarHistoricoLocal(texto, resultado);
  } catch (err) { alert(err.message); }
}

// precedencia é pra dar prioridade para as operações serem resolvidas
const PRECEDENCIA = { '^': 3, 'nroot': 3, '*': 2, '/': 2, '+': 1, '-': 1 };

//infixa é o jeito que a gente escreve e posfixa é o jeito modificado mais facil para o algoritmo calcular
function infixaParaPosfixa(tokens) {
  const saida = [];
  const pilha = [];

  for (const token of tokens) {
    if (ehParenteseAbre(token)) {
      pilha.push(token);
    } else if (ehParenteseFecha(token)) {
      // desempilha tudo até achar o "(" correspondente
      while (pilha.length && !ehParenteseAbre(pilha.at(-1))) {
        saida.push(pilha.pop());
      }
      pilha.pop(); // descarta o "(" correspondente
    } else if (ehOperador(token)) {
      const op = normalizarOperador(token);
      // desempilha operadores de precedência >= antes de empilhar o novo
      while (
        pilha.length &&
        !ehParenteseAbre(pilha.at(-1)) &&
        PRECEDENCIA[normalizarOperador(pilha.at(-1))] >= PRECEDENCIA[op]
      ) {
        saida.push(pilha.pop());
      }
      pilha.push(token);
    } else {
      saida.push(token); // número vai direto pra saída
    }
  }

  while (pilha.length) saida.push(pilha.pop());
  return saida;
}


// Percorre a notação posfixa com uma pilha e, a cada operador encontrado, resolve os dois números do topo da pilha chamando  a API do backend (que continua fazendo só uma operação por vez).
async function avaliarPosfixa(posfixa) {
  const pilha = [];

  for (const token of posfixa) {
    if (ehOperador(token)) {
      const op = normalizarOperador(token);
      const n2 = pilha.pop();
      const n1 = pilha.pop();
      const calc = await calcular({
        firstNumber: Number(n1),
        secondNumber: Number(n2),
        operator: op,
      });
      pilha.push(String(parseFloat(calc.result)));
    } else {
      pilha.push(token);
    }
  }

  return pilha[0]; // sobra só o resultado final na pilha
}

// fecha parentesis automaticamente se esqueceu de fechar
function fecharParentesesPendentes(itens) {
  const abertos  = itens.filter(ehParenteseAbre).length;
  const fechados = itens.filter(ehParenteseFecha).length;
  const faltando = abertos - fechados;
  return faltando > 0 ? [...itens, ...Array(faltando).fill(')')] : itens;
}

async function avaliarExpressao(itens) {
  const completa = fecharParentesesPendentes(itens);
  const posfixa = infixaParaPosfixa(completa);
  return avaliarPosfixa(posfixa);
}

document.getElementById('equals-btn')?.addEventListener('click', async () => {
  if (expressao.length < 3) return;
  // limpa operador ou "(" solto no final antes de calcular
  while (ehOperador(expressao.at(-1)) || ehParenteseAbre(expressao.at(-1))) expressao.pop();
  if (expressao.length < 3) return;

  const textoCompleto = formatarExpressao(expressao);

  let resultadoFinal;
  try {
    resultadoFinal = await avaliarExpressao(expressao);
  } catch (err) {
    displayValor.innerText = 'Erro';
    alert(err.message);
    return;
  }

  displayExpressao.innerText = textoCompleto + ' =';
  displayValor.innerText = resultadoFinal;
  expressao = [resultadoFinal];
  digitandoNumero = true;
  acabouDeCalcular = true;
  adicionarHistoricoLocal(textoCompleto, resultadoFinal);
});

// Botões de ação especial
document.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;

    if (action === 'clear') {
      expressao = []; digitandoNumero = false; acabouDeCalcular = false;
      displayValor.innerText = '0'; displayExpressao.innerText = '';

    } else if (action === 'sign') {
      const u = expressao.at(-1);
      
      if (u && !ehNaoNumerico(u)) {
        expressao[expressao.length - 1] = (parseFloat(u) * -1).toString();
        atualizarDisplay();
      }

    } else if (action === 'percent') {
      const u = expressao.at(-1);
       
      if (u && !ehNaoNumerico(u)) {
        expressao[expressao.length - 1] = (parseFloat(u) / 100).toString();
        atualizarDisplay();
      }

    } else if (action === 'backspace') {
      if (acabouDeCalcular || !expressao.length) return;
      const u = expressao.at(-1);
      // Agora apagar um "()"" some com o token inteiro de uma vez,
      // igual já acontecia com operador.
      if (ehNaoNumerico(u)) {
        expressao.pop(); digitandoNumero = true;
      } else if (u.length > 1) {
        expressao[expressao.length - 1] = u.slice(0, -1);
      } else {
        expressao.pop();
        const nu = expressao.at(-1);
        digitandoNumero = nu ? !ehNaoNumerico(nu) : false;
      }
      atualizarDisplay();

    } else if (action === 'sqrt') {
      aplicarUnaria('sqrt');
    } else if (action === 'log') {
      aplicarUnaria('log');
    }
  });
});

// Navegação entre abas
const sectionCalc    = document.getElementById('section-calc');
const sectionHistory = document.getElementById('section-history');

document.getElementById('btn-show-calc')?.addEventListener('click', () => {
  sectionCalc.style.display    = 'block';
  sectionHistory.style.display = 'none';
  sectionRanking.style.display = 'none';
});

//Aba de Ranking de operações usadas   
document.getElementById('btn-show-ranking')?.addEventListener('click', async () => {
  sectionCalc.style.display    = 'none';
  sectionHistory.style.display = 'none';
  sectionRanking.style.display = 'block';

  const rankingList = document.getElementById('ranking-list');
  rankingList.innerHTML = '<p style="text-align:center;color:#888;padding:20px">Carregando...</p>';

  const ranking = await buscarRanking();
  rankingList.innerHTML = '';

  if (!ranking.length) {
    rankingList.innerHTML = '<p class="empty-msg" style="text-align:center;color:#888;padding:20px">Nenhum cálculo ainda.</p>';
    return;
  }

  // total de cálculos, usado só pra desenhar a barrinha de proporção
  const total = ranking.reduce((soma, item) => soma + item.quantidade, 0);

  ranking.forEach((item, index) => {
    const simbolo = operadorParaDisplay(item.operator);
    const percentual = ((item.quantidade / total) * 100).toFixed(1);

    const linha = document.createElement('div');
    linha.style.cssText = 'padding:15px;border-bottom:1px solid #e2e8f0;';
    linha.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span><strong>#${index + 1}</strong> &nbsp; "${simbolo}"</span>
        <span>${item.quantidade}x (${percentual}%)</span>
      </div>
      <div style="background:#e2e8f0;border-radius:6px;height:8px;overflow:hidden;">
        <div style="background:#4f46e5;height:100%;width:${percentual}%;"></div>
      </div>
    `;
    rankingList.appendChild(linha);
  });
});


document.getElementById('btn-exit')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'autentication.html';
});

// Suporte ao teclado físico 
document.addEventListener('keydown', (e) => {
  // Ignora se o usuário estiver digitando em um input
  if (e.target.tagName === 'INPUT') return;

  const tecla = e.key;

  // Números e ponto decimal
  if (/^[0-9]$/.test(tecla) || tecla === '.') {
    const btn = [...document.querySelectorAll('.number')]
      .find(b => b.innerText === tecla);
    btn?.click();
    return;
  }

  // Operadores
  const mapaOperador = {
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '÷',
    '^': '^',
  };

  if (mapaOperador[tecla]) {
    const opAlvo = mapaOperador[tecla];
    const btn = [...document.querySelectorAll('[data-op]')]
      .find(b => b.dataset.op === opAlvo);
    btn?.click();
    return;
  }

  // Igual — Enter ou =
  if (tecla === 'Enter' || tecla === '=') {
    e.preventDefault();
    document.getElementById('equals-btn')?.click();
    return;
  }

  // Backspace
  if (tecla === 'Backspace') {
    document.querySelector('[data-action="backspace"]')?.click();
    return;
  }

  // Escape ou Delete — limpar
  if (tecla === 'Escape' || tecla === 'Delete') {
    document.querySelector('[data-action="clear"]')?.click();
    return;
  }

 
  // Parênteses
  if (tecla === '(' || tecla === ')') {
    const btn = document.querySelector(`[data-paren="${tecla}"]`);
    btn?.click();
    return;
  }

  // % — porcentagem
  if (tecla === '%') {
    document.querySelector('[data-action="percent"]')?.click();
    return;
  }
});

atualizarDisplay();