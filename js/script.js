const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'autentication.html'; return; }

  let expressao = [];
  let digitandoNumero = false;
  let acabouDeCalcular = false;

  const displayExpressao = document.getElementById('display-expressao');
  const displayValor     = document.getElementById('display-value');
  const btnCalc          = document.getElementById('btn-show-calc');
  const btnHistory       = document.getElementById('btn-show-history');
  const sectionCalc      = document.getElementById('section-calc');
  const sectionHistory   = document.getElementById('section-history');
  const historyList      = document.getElementById('history-list');

  function authHeaders() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }

  // Sair 
  const btnExit = document.getElementById('btn-exit');
  if (btnExit) {
    btnExit.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'autentication.html';
    });
  }

  // Navegação 
  const showPage = (page) => {
    if (!sectionCalc || !sectionHistory) return;
    if (page === 'calc') {
      sectionCalc.style.display = 'block';
      sectionHistory.style.display = 'none';
      if (btnCalc) btnCalc.classList.add('active');
      if (btnHistory) btnHistory.classList.remove('active');
    } else {
      sectionCalc.style.display = 'none';
      sectionHistory.style.display = 'block';
      if (btnHistory) btnHistory.classList.add('active');
      if (btnCalc) btnCalc.classList.remove('active');
      carregarHistorico();
    }
  };
  if (btnCalc) btnCalc.addEventListener('click', () => showPage('calc'));
  if (btnHistory) btnHistory.addEventListener('click', () => showPage('history'));

  // Helpers 
  const OPERADORES = ['+', '-', '*', '÷', '^'];
  const ehOperador = (val) => OPERADORES.includes(val);

  const atualizarDisplay = () => {
    const ultimo = expressao[expressao.length - 1];
    if (displayValor) {
      displayValor.innerText = (ultimo !== undefined && !ehOperador(ultimo)) ? ultimo : '0';
    }
    if (displayExpressao) {
      displayExpressao.innerText = expressao.join(' ');
    }
  };

  // Números 
  document.querySelectorAll('.number').forEach((button) => {
    button.addEventListener('click', () => {
      const digito = button.innerText;
      if (acabouDeCalcular) {
        expressao = [];
        acabouDeCalcular = false;
        digitandoNumero = false;
      }
      if (!digitandoNumero || expressao.length === 0 || ehOperador(expressao[expressao.length - 1])) {
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

  //  Operadores binários (incluindo potência ^) 
  document.querySelectorAll('.operator').forEach((button) => {
    button.addEventListener('click', () => {
      const op = button.getAttribute('data-op');
      if (!op) return;
      acabouDeCalcular = false;
      if (expressao.length === 0) expressao.push('0');
      if (ehOperador(expressao[expressao.length - 1])) {
        expressao[expressao.length - 1] = op;
      } else {
        expressao.push(op);
      }
      digitandoNumero = false;
      atualizarDisplay();
    });
  });

  //  Funções unárias 
  async function aplicarFuncaoUnaria(funcao) {
    if (expressao.length === 0) return;
    const ultimo = expressao[expressao.length - 1];
    if (ehOperador(ultimo)) return;

    try {
      const response = await fetch(`${API_URL}/api/calculations`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ firstNumber: ultimo, operator: funcao })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || 'Erro ao realizar cálculo');
        return;
      }
      const resultado = data.calculation.result;
      const expressaoTexto = `${funcao}(${ultimo})`;
      if (displayExpressao) displayExpressao.innerText = expressaoTexto + ' =';
      if (displayValor) displayValor.innerText = resultado;
      expressao = [resultado.toString()];
      digitandoNumero = true;
      acabouDeCalcular = true;
      adicionarHistoricoLocal(expressaoTexto, resultado);
    } catch (err) {
      if (displayValor) displayValor.innerText = 'Erro';
      alert('Erro ao conectar com o servidor.');
    }
  }

  // Resolve a expressão passo a passo, da esquerda para a direita,
  // enviando cada operação ao backend.
  const equalsBtn = document.getElementById('equals-btn');
  if (equalsBtn) {
    equalsBtn.addEventListener('click', async () => {
      if (expressao.length < 3) return;

      // Remove operador solto no final
      if (ehOperador(expressao[expressao.length - 1])) expressao.pop();
      if (expressao.length < 3) return;

      // Faz os cálculos em sequência (ex: 2 + 3 + 4 → (2+3)+4)
      let expressaoCompleta = expressao.join(' ');
      let acumulador = expressao[0];

      for (let i = 1; i < expressao.length; i += 2) {
        const operatorOriginal = expressao[i];
        const segundoNumero    = expressao[i + 1];
        if (!operatorOriginal || !segundoNumero) break;

        const operator = operatorOriginal === '÷' ? '/' : operatorOriginal;

        try {
          const response = await fetch(`${API_URL}/api/calculations`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              firstNumber: acumulador,
              secondNumber: segundoNumero,
              operator
            })
          });
          const data = await response.json();
          if (!response.ok) {
            if (displayValor) displayValor.innerText = 'Erro';
            alert(data.message || 'Erro ao realizar cálculo');
            return;
          }
          acumulador = data.calculation.result.toString();
        } catch (err) {
          if (displayValor) displayValor.innerText = 'Erro';
          alert('Erro ao conectar com o servidor.');
          return;
        }
      }

      if (displayExpressao) displayExpressao.innerText = expressaoCompleta + ' =';
      if (displayValor)     displayValor.innerText = acumulador;
      expressao = [acumulador];
      digitandoNumero = true;
      acabouDeCalcular = true;
      adicionarHistoricoLocal(expressaoCompleta, acumulador);
    });
  }

  // --- Botões de ação especial ---
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');

      if (action === 'clear') {
        expressao = []; digitandoNumero = false; acabouDeCalcular = false;
        if (displayValor)     displayValor.innerText = '0';
        if (displayExpressao) displayExpressao.innerText = '';
      }

      else if (action === 'sign') {
        if (!expressao.length) return;
        const ultimo = expressao[expressao.length - 1];
        if (!ehOperador(ultimo)) {
          expressao[expressao.length - 1] = (parseFloat(ultimo) * -1).toString();
          atualizarDisplay();
        }
      }

      else if (action === 'percent') {
        if (!expressao.length) return;
        const ultimo = expressao[expressao.length - 1];
        if (!ehOperador(ultimo)) {
          expressao[expressao.length - 1] = (parseFloat(ultimo) / 100).toString();
          atualizarDisplay();
        }
      }

      else if (action === 'backspace') {
        if (acabouDeCalcular || expressao.length === 0) return;
        const ultimo = expressao[expressao.length - 1];
        if (ehOperador(ultimo)) {
          expressao.pop(); digitandoNumero = true;
        } else if (ultimo.length > 1) {
          expressao[expressao.length - 1] = ultimo.slice(0, -1);
        } else {
          expressao.pop();
          const novoUltimo = expressao[expressao.length - 1];
          digitandoNumero = novoUltimo ? !ehOperador(novoUltimo) : false;
        }
        atualizarDisplay();
      }

      else if (action === 'sqrt') {
        aplicarFuncaoUnaria('sqrt');
      }

      else if (action === 'log') {
        aplicarFuncaoUnaria('log');
      }
    });
  });

  // --- Histórico local ---
  const adicionarHistoricoLocal = (expressaoTexto, resultado) => {
    const emptyMsg = document.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();
    const item = document.createElement('div');
    item.className = 'history-item';
    item.style.cssText = 'padding:15px; border-bottom:1px solid #e2e8f0; text-align:right;';
    item.innerHTML = `<span style="color:#888;font-size:0.85em">${expressaoTexto}</span><br><strong>${resultado}</strong>`;
    if (historyList) historyList.prepend(item);
  };

  // --- Histórico do backend ---
  async function carregarHistorico() {
    if (!historyList) return;
    historyList.innerHTML = '<p style="text-align:center;color:#888;padding:20px">Carregando...</p>';
    try {
      const response = await fetch(`${API_URL}/api/calculations/history`, {
        method: 'GET', headers: authHeaders()
      });
      if (response.status === 401) {
        localStorage.removeItem('token'); localStorage.removeItem('user');
        window.location.href = 'autentication.html'; return;
      }
      const data = await response.json();
      historyList.innerHTML = '';
      if (!data.history || data.history.length === 0) {
        historyList.innerHTML = '<p class="empty-msg" style="text-align:center;color:#888;padding:20px">Nenhum cálculo ainda.</p>';
        return;
      }
      data.history.forEach((calc) => {
        const op = calc.operator === '/' ? '÷' : calc.operator;
        const item = document.createElement('div');
        item.className = 'history-item';
        item.style.cssText = 'padding:15px; border-bottom:1px solid #e2e8f0; text-align:right;';
        const expr = calc.second_number === null
          ? `${calc.operator}(${calc.first_number})`
          : `${calc.first_number} ${op} ${calc.second_number}`;
        item.innerHTML = `<span style="color:#888;font-size:0.85em">${expr}</span><br><strong>${calc.result}</strong>`;
        historyList.appendChild(item);
      });
    } catch (err) {
      historyList.innerHTML = '<p style="text-align:center;color:#aaa;padding:20px">Servidor offline — histórico indisponível.</p>';
    }
  }

  atualizarDisplay();
});