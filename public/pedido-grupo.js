const slug = location.pathname.split('/').filter(Boolean)[1] || 'demo';
const form = document.getElementById('pedidoForm');
const success = document.getElementById('success');
const tipo = document.getElementById('tipo');
const origem = document.getElementById('origem');

document.getElementById('painelLink').href = `/painel/${slug}`;

async function loadGrupo() {
  const response = await fetch(`/api/grupos/${slug}`);
  const data = await response.json();
  applyBrand(data.grupo);
  document.getElementById('grupoNome').textContent = data.grupo.nome;
  document.getElementById('grupoCidade').textContent = `${data.grupo.cidade} - link oficial do grupo`;
}

function applyBrand(grupo) {
  document.documentElement.style.setProperty('--primary', grupo.corPrimaria || '#166534');
  document.documentElement.style.setProperty('--secondary', grupo.corSecundaria || '#334155');
  document.documentElement.style.setProperty('--accent', grupo.corDestaque || '#f59e0b');
  document.getElementById('grupoLogo').src = grupo.logo || '/img/motoLogo.png';
}

function updatePlaceholders() {
  const isEntrega = tipo.value === 'entrega';
  origem.placeholder = isEntrega ? 'Endereco de retirada' : 'Endereco de partida';
  document.getElementById('destino').placeholder = isEntrega ? 'Endereco de entrega' : 'Endereco de destino';
  document.getElementById('descricao').placeholder = isEntrega ? 'O que deve buscar ou entregar?' : 'Referencia, observacao ou detalhes';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;

  const body = Object.fromEntries(new FormData(form));

  try {
    const response = await fetch(`/api/grupos/${slug}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Erro ao enviar pedido');

    success.style.display = 'block';
    success.textContent = `Pedido #${data.pedido.id} enviado. Aguarde o motoboy aceitar.`;
    form.reset();
    tipo.value = 'transporte';
    updatePlaceholders();
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
  }
});

tipo.addEventListener('change', updatePlaceholders);
updatePlaceholders();
loadGrupo();
