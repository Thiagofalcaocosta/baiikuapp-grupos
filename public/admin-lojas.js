const form = document.getElementById('storeForm');
const items = document.getElementById('items');
const result = document.getElementById('result');

function addItem(values = {}) {
  const row = document.createElement('div');
  row.className = 'card';
  row.innerHTML = `
    <input name="itemNome" placeholder="Nome do produto/servico" value="${values.nome || ''}">
    <input name="itemCategoria" placeholder="Categoria do item" value="${values.categoria || 'Geral'}">
    <input name="itemPreco" placeholder="Preco, ex: 39.90" inputmode="decimal" value="${values.preco || ''}">
    <textarea name="itemDescricao" placeholder="Descricao">${values.descricao || ''}</textarea>
    <button class="secondary" type="button">Remover item</button>
  `;
  row.querySelector('button').addEventListener('click', () => row.remove());
  items.appendChild(row);
}

function collectItems() {
  return [...items.querySelectorAll('.card')]
    .map((row) => ({
      nome: row.querySelector('[name="itemNome"]').value.trim(),
      categoria: row.querySelector('[name="itemCategoria"]').value.trim(),
      preco: Number(row.querySelector('[name="itemPreco"]').value.replace(',', '.')) || 0,
      descricao: row.querySelector('[name="itemDescricao"]').value.trim()
    }))
    .filter((item) => item.nome);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  data.produtos = collectItems();

  const response = await fetch('/api/lojas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    alert(body.error || 'Erro ao cadastrar');
    return;
  }

  const link = `${location.origin}/loja/${body.loja.slug}`;
  result.style.display = 'grid';
  result.innerHTML = `
    <h2>Vitrine cadastrada</h2>
    <p class="muted">Envie este link para a loja divulgar:</p>
    <input value="${link}" readonly>
    <a class="button" href="${link}">Abrir vitrine</a>
  `;
});

document.getElementById('addItem').addEventListener('click', () => addItem());
addItem({ nome: 'Produto exemplo', categoria: 'Geral', preco: '29.90', descricao: 'Descricao do produto ou servico.' });
