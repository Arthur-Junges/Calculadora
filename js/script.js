const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  // --- Proteção de rota ---
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = 'autentication.html';
    return;
  }

  // --- Estado da calculadora ---
  let expressao = [];
  let digitandoNumero = false;
  let acabouDeCalcular = false;

  // --- Elementos do DOM ---
  const displayExpressao = document.getElementById('display-expressao');
  const displayValor = document.getElementById('display-value');
  const btnCalc = document.getElementById('btn-show-calc');
  const btnHistory = document.getElementById('btn-show-history');
  const sectionCalc = document.getElementById('section-calc');
  const sectionHistory = document.getElementById('section-history');
  const historyList = document.getElementById('history-list');

  // --- Botão Sair ---
  const btnExit = document.getElementById('btn-exit');

  if (btnExit) {
    btnExit.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'autentication.html';
    });
  }

  // --- Cabeçalho com token para rotas protegidas ---
  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }

  // --- Navegação entre abas ---
  const showPage = (page) => {
    if (page === 'calc') {
      sectionCalc.style.display = 'block';
      sectionHistory.style.display = 'none';
      btnCalc.classList.add('active');
      btnHistory.classList.remove('active');
    } else {
      sectionCalc.style.display = 'none';
      sectionHistory.style.display = 'block';
      btnHistory.classList.add('active');
      btnCalc.classList.remove('active');
      carregarHistorico();
    }
  };

  if (btnCalc) {
    btnCalc.addEventListener('click', () => showPage('calc'));
  }

  if (btnHistory) {
    btnHistory.addEventListener('click', () => showPage('history'));
  }

  // --- Display ---
  const ehOperador = (val) => ['+', '-', '*', '÷'].includes(val);

  const atualizarDisplay = () => {
    const ultimo = expressao[expressao.length - 1];

    displayValor.innerText =
      ultimo !== undefined && !ehOperador(ultimo) ? ultimo : '0';

    if (displayExpressao) {
      displayExpressao.innerText = expressao.join(' ');
    }
  };

  // --- Números ---
  document.querySelectorAll('.number').forEach((button) => {
    button.addEventListener('click', () => {
      const digito = button.innerText;

      if (acabouDeCalcular) {
        expressao = [];
        acabouDeCalcular = false;
        digitandoNumero = false;
      }

      if (
        !digitandoNumero ||
        expressao.length === 0 ||
        ehOperador(expressao[expressao.length - 1])
      ) {
        expressao.push(digito === '.' ? '0.' : digito);
        digitandoNumero = true;
      } else {
        const atual = expressao[expressao.length - 1];

        if (digito === '.' && atual.includes('.')) return;

        expressao[expressao.length - 1] = atual + digito;
      }

      atualizarDisplay();
    });
  });

  // --- Operadores ---
  document.querySelectorAll('.operator').forEach((button) => {
    button.addEventListener('click', () => {
      const op = button.getAttribute('data-op');
      acabouDeCalcular = false;

      if (expressao.length === 0) {
        expressao.push('0');
      }

      if (ehOperador(expressao[expressao.length - 1])) {
        expressao[expressao.length - 1] = op;
      } else {
        expressao.push(op);
      }

      digitandoNumero = false;
      atualizarDisplay();
    });
  });

  // --- Igual: cálculo feito no backend ---
  const equalsBtn = document.getElementById('equals-btn');

  if (equalsBtn) {
    equalsBtn.addEventListener('click', async () => {
      if (expressao.length < 3) return;

      if (ehOperador(expressao[expressao.length - 1])) {
        expressao.pop();
      }

      const firstNumber = expressao[0];
      const operatorOriginal = expressao[1];
      const secondNumber = expressao[2];

      if (!firstNumber || !operatorOriginal || !secondNumber) {
        displayValor.innerText = 'Erro';
        return;
      }

      const operator = operatorOriginal === '÷' ? '/' : operatorOriginal;

      try {
        const response = await fetch(`${API_URL}/api/calculations`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            firstNumber,
            secondNumber,
            operator
          })
        });

        const data = await response.json();

        if (!response.ok) {
          displayValor.innerText = 'Erro';
          console.error(data);
          alert(data.message || 'Erro ao realizar cálculo');
          return;
        }

        const resultado = data.calculation.result;
        const expressaoTexto = `${firstNumber} ${operatorOriginal} ${secondNumber}`;

        if (displayExpressao) {
          displayExpressao.innerText = expressaoTexto + ' =';
        }

        displayValor.innerText = resultado;

        expressao = [resultado.toString()];
        digitandoNumero = true;
        acabouDeCalcular = true;

        adicionarHistoricoLocal(expressaoTexto, resultado);
      } catch (error) {
        console.error('Erro ao conectar com o backend:', error);
        displayValor.innerText = 'Erro';
        alert('Erro ao conectar com o servidor.');
      }
    });
  }

  // --- AC ---
  const clearBtn = document.querySelector('[data-action="clear"]');

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      expressao = [];
      digitandoNumero = false;
      acabouDeCalcular = false;
      displayValor.innerText = '0';

      if (displayExpressao) {
        displayExpressao.innerText = '';
      }
    });
  }

  // --- +/- ---
  const signBtn = document.querySelector('[data-action="sign"]');

  if (signBtn) {
    signBtn.addEventListener('click', () => {
      if (!expressao.length) return;

      const ultimo = expressao[expressao.length - 1];

      if (!ehOperador(ultimo)) {
        expressao[expressao.length - 1] = (
          parseFloat(ultimo) * -1
        ).toString();

        atualizarDisplay();
      }
    });
  }

  // --- % ---
  const percentBtn = document.querySelector('[data-action="percent"]');

  if (percentBtn) {
    percentBtn.addEventListener('click', () => {
      if (!expressao.length) return;

      const ultimo = expressao[expressao.length - 1];

      if (!ehOperador(ultimo)) {
        expressao[expressao.length - 1] = (
          parseFloat(ultimo) / 100
        ).toString();

        atualizarDisplay();
      }
    });
  }

  // --- Backspace ---
  const backspaceBtn = document.querySelector('[data-action="backspace"]');

  if (backspaceBtn) {
    backspaceBtn.addEventListener('click', () => {
      if (acabouDeCalcular || expressao.length === 0) return;

      const ultimo = expressao[expressao.length - 1];

      if (ehOperador(ultimo)) {
        expressao.pop();
        digitandoNumero = true;
      } else if (ultimo.length > 1) {
        expressao[expressao.length - 1] = ultimo.slice(0, -1);
      } else {
        expressao.pop();

        const novoUltimo = expressao[expressao.length - 1];
        digitandoNumero = novoUltimo ? !ehOperador(novoUltimo) : false;
      }

      atualizarDisplay();
    });
  }

  // --- Histórico local ---
  const adicionarHistoricoLocal = (expressaoTexto, resultado) => {
    const emptyMsg = document.querySelector('.empty-msg');

    if (emptyMsg) {
      emptyMsg.remove();
    }

    const item = document.createElement('div');
    item.className = 'history-item';
    item.style.cssText =
      'padding:15px; border-bottom:1px solid #e2e8f0; text-align:right;';

    item.innerHTML = `
      <span style="color:#888;font-size:0.85em">${expressaoTexto}</span>
      <br>
      <strong>${resultado}</strong>
    `;

    if (historyList) {
      historyList.prepend(item);
    }
  };

  // --- Carregar histórico do backend ---
  async function carregarHistorico() {
    if (!historyList) return;

    historyList.innerHTML =
      '<p style="text-align:center;color:#888;padding:20px">Carregando...</p>';

    try {
      const response = await fetch(`${API_URL}/api/calculations/history`, {
        method: 'GET',
        headers: authHeaders()
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'autentication.html';
        return;
      }

      const data = await response.json();

      historyList.innerHTML = '';

      if (!data.history || data.history.length === 0) {
        historyList.innerHTML =
          '<p class="empty-msg" style="text-align:center;color:#888;padding:20px">Nenhum cálculo ainda.</p>';
        return;
      }

      data.history.forEach((calc) => {
        const operador = calc.operator === '/' ? '÷' : calc.operator;

        const item = document.createElement('div');
        item.className = 'history-item';
        item.style.cssText =
          'padding:15px; border-bottom:1px solid #e2e8f0; text-align:right;';

        item.innerHTML = `
          <span style="color:#888;font-size:0.85em">
            ${calc.first_number} ${operador} ${calc.second_number}
          </span>
          <br>
          <strong>${calc.result}</strong>
        `;

        historyList.appendChild(item);
      });
    } catch (err) {
      historyList.innerHTML =
        '<p style="text-align:center;color:#aaa;padding:20px">Servidor offline — histórico indisponível.</p>';
    }
  }

  // Estado inicial
  atualizarDisplay();
});