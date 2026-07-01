//agora o token é lido do cookie httponly pelo google automaticamente.
//não usamos mais localstorage para o token

const API_URL = 'http://localhost:3000';

function authHeaders() {
  return { 'Content-Type': 'application/json'};
  //o cookie é enviado automaticamente pelo google em cada requisição
  //para o mesmo dominio não precisa le-lo ou adicionar
}

export async function calcular(payload) {
  const res = await fetch(`${API_URL}/api/calculations`, {
    method: 'POST',
    credentials: 'include', //envia as credencial automaticamente
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro ao calcular.');
  return data.calculation;
}

export async function buscarHistorico() {
  const res = await fetch(`${API_URL}/api/calculations/history`, { credentials:'include', headers: authHeaders(), });
  if (res.status === 401) {
    window.location.href = 'autentication.html';
    return [];
  }
  const data = await res.json();
  return data.history || [];
}

//busca o ranking de operações mais usadas pelo usuario
export async function buscarRanking() {
  const res = await fetch(`${API_URL}/api/calculations/ranking`, { credentials: 'include', headers: authHeaders() });
  if (res.status === 401) {
    window.location.href = 'autentication.html';
    return [];
  }
  const data = await res.json();
  return data.ranking || [];
}


export async function login(body) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro na autenticação.');
  return data;
}

export async function registrar(body) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro no cadastro.');
  return data;
}

export async function logout() {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}