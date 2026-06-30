import { login, registrar } from '../services/api.js';

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const authForm = document.getElementById('auth-form');
const mainBtn = document.getElementById('main-btn');

const inputNameGroup = document.createElement('div');
inputNameGroup.className = 'input-group';
inputNameGroup.innerHTML = `

  <label for="name">Nome</label>
  <input type="text" id="name" placeholder="Seu nome" minlength="2" maxlength="80">

  <label for="instituicao">Instituição</label>
  <input type="text" id="instituicao" placeholder="Nome da instituição" minlength="2" maxlength="100">

  <label for="escolaridade">Escolaridade</label>
  <input type="text" id="escolaridade" placeholder="Sua escolaridade" minlength="2" maxlength="50">

  <label for="endereco">Endereço</label>
  <input type="text" id="endereco" placeholder="Seu endereço" minlength="5" maxlength="150">

`

let modo = 'login';

tabLogin?.addEventListener('click', () => {
  modo = 'login';
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  inputNameGroup.remove();
  mainBtn.textContent = 'Entrar';
});

tabRegister?.addEventListener('click', () => {
  modo = 'register';
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  authForm.insertBefore(inputNameGroup, authForm.firstChild);
  mainBtn.textContent = 'Cadastrar';
});

authForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const name = document.getElementById('name')?.value.trim();

  // validações basicas no front
  if (!email || !password) return alert('Preencha todos os campos');
  if (password.length > 72) return alert('Senha muito longa (max 72 caractere)');

  try {
    if (modo === 'register') {
      if (!name) return alert('Informe seu nome');
      await registrar({ name, email, password});
      alert('Cadastro realizado! agora faça login');
      tabLogin.click();
      return;
    }
    //login - back seta o cookie automaticamente
    const data = await login({ email, password });
    //salva apenas dados não-sensiveis do usuario para exibição
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'index.html';
  } catch (err) {
    alert(err.message);
  }
})