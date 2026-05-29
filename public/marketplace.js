function applyCardTheme(card, loja) {
  card.style.setProperty('--primary', loja.corPrimaria || '#7c3aed');
  card.style.setProperty('--secondary', loja.corSecundaria || '#1f2937');
  card.style.setProperty('--accent', loja.corDestaque || '#f59e0b');
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadStores() {
  const response = await fetch('/api/lojas');
  const data = await response.json();
  const stores = document.getElementById('stores');
  stores.innerHTML = '';

  data.lojas.forEach((loja) => {
    const card = document.createElement('article');
    card.className = 'card storeCard';
    applyCardTheme(card, loja);
    card.innerHTML = `
      <div class="storeHeader">
        <img src="${escapeHtml(loja.logo)}" alt="">
        <div>
          <h3>${escapeHtml(loja.nome)}</h3>
          <p class="muted">${escapeHtml(loja.cidade)}</p>
        </div>
      </div>
      <span class="pill">${escapeHtml(loja.categoria)}</span>
      <p class="muted">${escapeHtml(loja.descricao)}</p>
      <a class="button" href="/loja/${escapeHtml(loja.slug)}">Ver produtos</a>
    `;
    stores.appendChild(card);
  });
}

loadStores();
