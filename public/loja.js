const slug = location.pathname.split('/').filter(Boolean)[1] || 'demo';
const cart = new Map();
let loja = null;

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function applyTheme(data) {
  document.documentElement.style.setProperty('--primary', data.corPrimaria || '#7c3aed');
  document.documentElement.style.setProperty('--secondary', data.corSecundaria || '#1f2937');
  document.documentElement.style.setProperty('--accent', data.corDestaque || '#f59e0b');
}

function renderProducts() {
  const products = document.getElementById('products');
  products.innerHTML = '';

  loja.produtos.forEach((produto) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="productTitle">
        <div>
          <h3>${escapeHtml(produto.nome)}</h3>
          <span class="pill">${escapeHtml(produto.categoria)}</span>
        </div>
        <span class="price">${money(produto.preco)}</span>
      </div>
      <p class="muted">${escapeHtml(produto.descricao)}</p>
      <button type="button">Adicionar</button>
    `;

    card.querySelector('button').addEventListener('click', () => {
      const current = cart.get(produto.id);
      cart.set(produto.id, {
        produto,
        quantidade: current ? current.quantidade + 1 : 1
      });
      renderCart();
    });

    products.appendChild(card);
  });
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  cartItems.innerHTML = '';

  if (!cart.size) {
    cartItems.innerHTML = '<div class="empty">Nenhum produto no pedido.</div>';
  }

  let total = 0;
  for (const item of cart.values()) {
    total += item.produto.preco * item.quantidade;
    const row = document.createElement('div');
    row.className = 'cartItem';
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.produto.nome)}</strong>
        <div class="muted">${item.quantidade} x ${money(item.produto.preco)}</div>
      </div>
      <div class="cartControls">
        <button class="secondary" type="button" data-action="minus">-</button>
        <button type="button" data-action="plus">+</button>
      </div>
    `;

    row.querySelector('[data-action="minus"]').addEventListener('click', () => {
      if (item.quantidade <= 1) cart.delete(item.produto.id);
      else cart.set(item.produto.id, { ...item, quantidade: item.quantidade - 1 });
      renderCart();
    });

    row.querySelector('[data-action="plus"]').addEventListener('click', () => {
      cart.set(item.produto.id, { ...item, quantidade: item.quantidade + 1 });
      renderCart();
    });

    cartItems.appendChild(row);
  }

  document.getElementById('total').textContent = money(total);
}

function buildWhatsAppMessage() {
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const note = document.getElementById('customerNote').value.trim();

  if (!cart.size) throw new Error('Adicione pelo menos um produto.');
  if (!name) throw new Error('Informe seu nome.');

  let total = 0;
  const lines = [
    `Ola, quero fazer um pedido na ${loja.nome}.`,
    '',
    `Cliente: ${name}`,
    phone ? `WhatsApp: ${phone}` : '',
    '',
    'Produtos:'
  ].filter(Boolean);

  for (const item of cart.values()) {
    const subtotal = item.produto.preco * item.quantidade;
    total += subtotal;
    lines.push(`- ${item.quantidade}x ${item.produto.nome} - ${money(subtotal)}`);
  }

  lines.push('');
  lines.push(`Total: ${money(total)}`);
  if (note) {
    lines.push('');
    lines.push(`Observacao: ${note}`);
  }

  return lines.join('\n');
}

function sendOrder() {
  try {
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  } catch (error) {
    alert(error.message);
  }
}

async function loadStore() {
  const response = await fetch(`/api/lojas/${slug}`);
  const data = await response.json();
  if (!response.ok) {
    document.querySelector('.shell').innerHTML = '<div class="card">Loja nao encontrada.</div>';
    return;
  }

  loja = data.loja;
  applyTheme(loja);
  document.title = loja.nome;
  document.getElementById('logo').src = loja.logo;
  document.getElementById('storeName').textContent = loja.nome;
  document.getElementById('storeInfo').textContent = `${loja.categoria} - ${loja.cidade}`;
  document.getElementById('heroTitle').textContent = `Produtos da ${loja.nome}`;
  document.getElementById('heroDescription').textContent = loja.descricao;

  renderProducts();
  renderCart();
}

document.getElementById('sendOrder').addEventListener('click', sendOrder);
loadStore();
