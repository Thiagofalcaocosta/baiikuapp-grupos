const slug = location.pathname.split('/').filter(Boolean)[1] || 'demo';
const lists = {
  pending: document.getElementById('pendingList'),
  active: document.getElementById('activeList'),
  done: document.getElementById('doneList')
};
const counts = {
  pending: document.getElementById('pendingCount'),
  active: document.getElementById('activeCount'),
  done: document.getElementById('doneCount')
};

document.getElementById('pedidoLink').href = `/g/${slug}`;
document.getElementById('refreshButton').addEventListener('click', loadPedidos);

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function labelEstado(estado) {
  const estados = {
    pendiente: 'Pendente',
    aceptado: 'Aceito',
    em_andamento: 'Em andamento',
    completado: 'Finalizado'
  };
  return estados[estado] || estado;
}

function labelTipo(tipo) {
  return tipo === 'entrega' || tipo === 'encargo' ? 'Entrega' : 'Corrida';
}

function detail(label, value) {
  if (!value) return '';
  return `<div><strong>${label}:</strong> ${escapeHtml(value)}</div>`;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Erro na operacao');
  return data;
}

function nextAction(pedido) {
  if (pedido.estado === 'pendiente') {
    return {
      label: 'Aceitar',
      run: () => api(`/guardar/${pedido.id}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'aceptado' })
      })
    };
  }

  if (pedido.estado === 'aceptado') {
    return {
      label: 'Confirmar chegada/coleta',
      run: () => askCode(pedido, 'em_andamento', 'Digite o codigo de chegada/coleta')
    };
  }

  if (pedido.estado === 'em_andamento') {
    return {
      label: 'Finalizar',
      run: () => askCode(pedido, 'completado', 'Digite o codigo de finalizacao')
    };
  }

  return null;
}

async function askCode(pedido, estado, message) {
  const code = prompt(`${message}\n\nCodigo teste: ${estado === 'em_andamento' ? pedido.codigoChegada : pedido.codigoFinalizacao}`);
  if (!code) return;
  await api(`/guardar/${pedido.id}`, {
    method: 'PUT',
    body: JSON.stringify({ estado, codigo: code.trim() })
  });
}

function renderPedido(pedido) {
  const card = document.createElement('article');
  card.className = 'card';
  const isEntrega = pedido.tipo === 'entrega' || pedido.tipo === 'encargo';
  const action = nextAction(pedido);

  card.innerHTML = `
    <div class="cardHeader">
      <strong>#${escapeHtml(pedido.id)} ${escapeHtml(pedido.nombre)}</strong>
      <span class="tag">${labelTipo(pedido.tipo)}</span>
    </div>
    <span class="status ${escapeHtml(pedido.estado)}">${labelEstado(pedido.estado)}</span>
    <div class="details">
      ${detail('Telefone', pedido.telefono)}
      ${detail(isEntrega ? 'Retirada' : 'Origem', pedido.origen)}
      ${detail(isEntrega ? 'Entrega' : 'Destino', pedido.destino)}
      ${detail(isEntrega ? 'Item' : 'Obs', pedido.descripcion)}
      ${detail('Pagamento', pedido.pago)}
      ${pedido.estado === 'aceptado' ? detail('Codigo teste', pedido.codigoChegada) : ''}
      ${pedido.estado === 'em_andamento' ? detail('Codigo teste', pedido.codigoFinalizacao) : ''}
    </div>
    <div class="actions"></div>
  `;

  const actions = card.querySelector('.actions');
  if (action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action.label;
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await action.run();
        await loadPedidos();
      } catch (error) {
        alert(error.message);
      } finally {
        button.disabled = false;
      }
    });
    actions.appendChild(button);
  }

  return card;
}

function renderList(target, pedidos) {
  target.innerHTML = '';
  if (!pedidos.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Nenhum pedido aqui.';
    target.appendChild(empty);
    return;
  }
  pedidos.forEach((pedido) => target.appendChild(renderPedido(pedido)));
}

async function loadGrupo() {
  const { grupo } = await api(`/api/grupos/${slug}`);
  applyBrand(grupo);
  document.getElementById('grupoNome').textContent = grupo.nome;
  document.getElementById('grupoCidade').textContent = `${grupo.cidade} - painel do grupo`;
}

function applyBrand(grupo) {
  document.documentElement.style.setProperty('--primary', grupo.corPrimaria || '#166534');
  document.documentElement.style.setProperty('--secondary', grupo.corSecundaria || '#334155');
  document.documentElement.style.setProperty('--accent', grupo.corDestaque || '#f59e0b');
  document.getElementById('grupoLogo').src = grupo.logo || '/img/motoLogo.png';
}

async function loadPedidos() {
  const pedidos = await api(`/api/grupos/${slug}/pedidos`);
  const pending = pedidos.filter((pedido) => pedido.estado === 'pendiente');
  const active = pedidos.filter((pedido) => ['aceptado', 'em_andamento'].includes(pedido.estado));
  const done = pedidos.filter((pedido) => pedido.estado === 'completado');

  counts.pending.textContent = pending.length;
  counts.active.textContent = active.length;
  counts.done.textContent = done.length;
  document.getElementById('summary').textContent = `${pedidos.length} pedidos neste grupo`;

  renderList(lists.pending, pending);
  renderList(lists.active, active);
  renderList(lists.done, done);
}

loadGrupo();
loadPedidos();
setInterval(loadPedidos, 10000);
