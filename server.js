const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const DEFAULT_GROUP_SLUG = 'demo';

const lojas = {
  demo: {
    slug: 'demo',
    nome: 'Loja Demo',
    categoria: 'Variedades',
    cidade: 'Tres Coracoes',
    whatsapp: '5535999990000',
    logo: '/img/logoLogin.png',
    corPrimaria: '#7c3aed',
    corSecundaria: '#1f2937',
    corDestaque: '#f59e0b',
    descricao: 'Produtos selecionados para pedir direto pelo WhatsApp.',
    produtos: [
      {
        id: 'camiseta-basica',
        nome: 'Camiseta basica',
        descricao: 'Camiseta confortavel para o dia a dia.',
        preco: 39.9,
        categoria: 'Roupas'
      },
      {
        id: 'bone-classico',
        nome: 'Bone classico',
        descricao: 'Bone ajustavel em cores variadas.',
        preco: 29.9,
        categoria: 'Acessorios'
      },
      {
        id: 'kit-presente',
        nome: 'Kit presente',
        descricao: 'Combo pronto para presente.',
        preco: 79.9,
        categoria: 'Presentes'
      }
    ]
  },
  acai: {
    slug: 'acai',
    nome: 'Acai da Praca',
    categoria: 'Acai e lanches',
    cidade: 'Tres Coracoes',
    whatsapp: '5535999990000',
    logo: '/img/logoLogin.png',
    corPrimaria: '#6d28d9',
    corSecundaria: '#2e1065',
    corDestaque: '#facc15',
    descricao: 'Monte seu pedido e envie direto para o atendimento.',
    produtos: [
      {
        id: 'acai-300',
        nome: 'Acai 300ml',
        descricao: 'Acompanha banana, granola e leite condensado.',
        preco: 14.9,
        categoria: 'Acai'
      },
      {
        id: 'acai-500',
        nome: 'Acai 500ml',
        descricao: 'Acompanha 3 adicionais a escolha.',
        preco: 22.9,
        categoria: 'Acai'
      },
      {
        id: 'combo-casal',
        nome: 'Combo casal',
        descricao: '2 acais 500ml com adicionais.',
        preco: 42.0,
        categoria: 'Combos'
      }
    ]
  },
  moda: {
    slug: 'moda',
    nome: 'Moda Bella',
    categoria: 'Roupas e acessorios',
    cidade: 'Tres Coracoes',
    whatsapp: '5535999990000',
    logo: '/img/motoLogo.png',
    corPrimaria: '#be123c',
    corSecundaria: '#4c0519',
    corDestaque: '#f9a8d4',
    descricao: 'Escolha as pecas e envie seu pedido para a loja.',
    produtos: [
      {
        id: 'vestido-midi',
        nome: 'Vestido midi',
        descricao: 'Tamanhos P, M e G. Consulte cores disponiveis.',
        preco: 119.9,
        categoria: 'Vestidos'
      },
      {
        id: 'bolsa-transversal',
        nome: 'Bolsa transversal',
        descricao: 'Modelo casual com alca regulavel.',
        preco: 89.9,
        categoria: 'Bolsas'
      },
      {
        id: 'sandalia',
        nome: 'Sandalia feminina',
        descricao: 'Numeracao 34 ao 39.',
        preco: 99.9,
        categoria: 'Calcados'
      }
    ]
  }
};

const grupos = {
  demo: {
    slug: 'demo',
    nome: 'Grupo Demo',
    cidade: 'Tres Coracoes',
    logo: '/img/motoLogo.png',
    corPrimaria: '#166534',
    corSecundaria: '#334155',
    corDestaque: '#f59e0b'
  },
  centro: {
    slug: 'centro',
    nome: 'Entregas e Mototaxi Centro',
    cidade: 'Tres Coracoes',
    logo: '/img/motoLogo.png',
    corPrimaria: '#166534',
    corSecundaria: '#0f172a',
    corDestaque: '#e11d48'
  },
  aeroporto: {
    slug: 'aeroporto',
    nome: 'Mototaxi Aeroporto',
    cidade: 'Tres Coracoes',
    logo: '/img/encargoLogo.png',
    corPrimaria: '#1d4ed8',
    corSecundaria: '#172554',
    corDestaque: '#f97316'
  }
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readDb() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDb(lista) {
  fs.writeFileSync(DB_FILE, JSON.stringify(lista, null, 2));
}

function nextId(lista) {
  return lista.reduce((max, pedido) => Math.max(max, Number(pedido.id) || 0), 0) + 1;
}

function makeCode() {
  return String(crypto.randomInt(1000, 10000));
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeSlug(value) {
  return String(value || DEFAULT_GROUP_SLUG)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || DEFAULT_GROUP_SLUG;
}

function getGrupo(slug) {
  const normalized = normalizeSlug(slug);
  return grupos[normalized] || {
    slug: normalized,
    nome: `Grupo ${normalized}`,
    cidade: 'Tres Coracoes',
    logo: '/img/motoLogo.png',
    corPrimaria: '#166534',
    corSecundaria: '#334155',
    corDestaque: '#f59e0b'
  };
}

function getLoja(slug) {
  const normalized = normalizeSlug(slug);
  return lojas[normalized] || null;
}

function publicLoja(loja) {
  return {
    slug: loja.slug,
    nome: loja.nome,
    categoria: loja.categoria,
    cidade: loja.cidade,
    whatsapp: loja.whatsapp,
    logo: loja.logo,
    corPrimaria: loja.corPrimaria,
    corSecundaria: loja.corSecundaria,
    corDestaque: loja.corDestaque,
    descricao: loja.descricao,
    produtos: loja.produtos
  };
}

function isEntregaTipo(tipo) {
  return ['entrega', 'encargo'].includes(normalizeText(tipo).toLowerCase());
}

function parseWhatsappPedido(text) {
  const pedido = {
    tipo: 'transporte',
    nombre: '',
    telefono: '',
    descripcion: '',
    origen: '',
    destino: '',
    pago: '',
    mensajeOriginal: text
  };

  for (const line of text.split(/\r?\n/)) {
    const match = line.trim().match(/^([^:]+):\s*(.+)$/);
    if (!match) continue;

    const key = match[1].toLowerCase();
    const value = match[2].trim();

    if (['nome', 'nombre', 'cliente'].includes(key)) pedido.nombre = value;
    if (['origem', 'origen', 'saida', 'salida'].includes(key)) pedido.origen = value;
    if (['destino', 'destino'].includes(key)) pedido.destino = value;
    if (['pagamento', 'pago'].includes(key)) pedido.pago = value;
    if (['obs', 'observacao', 'observacion'].includes(key)) pedido.descripcion = value;
  }

  const fromTo = text.replace(/\s+/g, ' ').match(/(?:de|da|do)\s+(.+?)\s+(?:para|ate|a)\s+(.+)/i);
  if (!pedido.origen && !pedido.destino && fromTo) {
    pedido.origen = fromTo[1].trim();
    pedido.destino = fromTo[2].trim();
  }

  return pedido;
}

function shouldCreatePedido(text) {
  const lowered = text.toLowerCase();
  return (
    lowered.includes('corrida') ||
    lowered.includes('moto') ||
    lowered.includes('mototaxi') ||
    lowered.includes('mototáxi') ||
    lowered.includes('origem:') ||
    lowered.includes('origen:') ||
    lowered.includes('destino:')
  );
}

async function sendWhatsAppText(to, body) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.log(`[WHATSAPP SIMULADO] Para ${to}: ${body}`);
    return;
  }

  const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body }
    })
  });

  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`Meta API ${response.status}: ${responseBody}`);
  }
}

function createPedidoFromWhatsapp({ customerPhone, customerName, text }) {
  const lista = readDb();
  const parsed = parseWhatsappPedido(text);
  const pedido = {
    id: nextId(lista),
    tipo: 'transporte',
    grupoSlug: DEFAULT_GROUP_SLUG,
    telefono: customerPhone,
    nombre: parsed.nombre || customerName || customerPhone,
    origen: parsed.origen,
    destino: parsed.destino,
    descripcion: parsed.descripcion,
    pago: parsed.pago,
    mensajeOriginal: text,
    estado: 'pendiente',
    codigoChegada: makeCode(),
    codigoFinalizacao: makeCode(),
    criadoEm: new Date().toISOString(),
    aceitoEm: null,
    chegadaConfirmadaEm: null,
    finalizadoEm: null
  };

  lista.push(pedido);
  writeDb(lista);
  return pedido;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'marketplace.html'));
});

app.get('/lojas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'marketplace.html'));
});

app.get('/loja/:lojaSlug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loja.html'));
});

app.get('/mototaxi', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'panelMototaxi.html'));
});

app.get('/cliente', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'panelCliente.html'));
});

app.get('/teste-whatsapp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'teste-whatsapp.html'));
});

app.get('/g/:grupoSlug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pedido-grupo.html'));
});

app.get('/painel/:grupoSlug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'painel-grupo.html'));
});

app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/solicitud', (req, res) => {
  res.json(readDb());
});

app.get('/api/grupos/:grupoSlug', (req, res) => {
  res.json({ grupo: getGrupo(req.params.grupoSlug) });
});

app.get('/api/lojas', (req, res) => {
  res.json({
    lojas: Object.values(lojas).map((loja) => ({
      slug: loja.slug,
      nome: loja.nome,
      categoria: loja.categoria,
      cidade: loja.cidade,
      logo: loja.logo,
      corPrimaria: loja.corPrimaria,
      corSecundaria: loja.corSecundaria,
      corDestaque: loja.corDestaque,
      descricao: loja.descricao
    }))
  });
});

app.get('/api/lojas/:lojaSlug', (req, res) => {
  const loja = getLoja(req.params.lojaSlug);
  if (!loja) return res.status(404).json({ error: 'Loja nao encontrada' });
  res.json({ loja: publicLoja(loja) });
});

app.get('/api/grupos/:grupoSlug/pedidos', (req, res) => {
  const grupoSlug = normalizeSlug(req.params.grupoSlug);
  const lista = readDb().filter((pedido) => normalizeSlug(pedido.grupoSlug) === grupoSlug);
  res.json(lista);
});

app.post('/api/grupos/:grupoSlug/pedidos', (req, res) => {
  const grupo = getGrupo(req.params.grupoSlug);
  const { tipo, telefone, telefono, nome, nombre, descricao, descripcion, origem, destino, pagamento, pago, item } = req.body;
  const lista = readDb();
  const pedidoTipo = isEntregaTipo(tipo) ? 'entrega' : 'transporte';

  if (!normalizeText(nome || nombre) || !normalizeText(telefone || telefono) || !normalizeText(destino)) {
    return res.status(400).json({ error: 'Nome, telefone e destino sao obrigatorios' });
  }

  if (pedidoTipo === 'transporte' && !normalizeText(origem)) {
    return res.status(400).json({ error: 'Origem e obrigatoria para corrida' });
  }

  const objeto = {
    id: nextId(lista),
    grupoSlug: grupo.slug,
    grupoNome: grupo.nome,
    tipo: pedidoTipo,
    telefono: normalizeText(telefone || telefono),
    nombre: normalizeText(nome || nombre),
    descripcion: normalizeText(descricao || descripcion || item),
    origen: normalizeText(origem),
    destino: normalizeText(destino),
    pago: normalizeText(pagamento || pago),
    estado: 'pendiente',
    codigoChegada: makeCode(),
    codigoFinalizacao: makeCode(),
    criadoEm: new Date().toISOString(),
    aceitoEm: null,
    chegadaConfirmadaEm: null,
    finalizadoEm: null
  };

  lista.push(objeto);
  writeDb(lista);

  res.status(201).json({ message: 'Pedido criado', pedido: objeto });
});

app.post('/guardar', (req, res) => {
  const { tipo, telefono, nombre, descripcion, destino, origen, pago, grupoSlug } = req.body;
  const lista = readDb();

  const objeto = {
    id: nextId(lista),
    grupoSlug: normalizeSlug(grupoSlug),
    tipo,
    telefono,
    nombre,
    descripcion,
    origen: origen || '',
    destino,
    pago: pago || '',
    estado: 'pendiente',
    codigoChegada: makeCode(),
    codigoFinalizacao: makeCode(),
    criadoEm: new Date().toISOString(),
    aceitoEm: null,
    chegadaConfirmadaEm: null,
    finalizadoEm: null
  };

  lista.push(objeto);
  writeDb(lista);

  res.status(200).json({ message: 'Guardado', pedido: objeto });
});

app.put('/guardar/:id', async (req, res) => {
  const lista = readDb();
  const id = Number(req.params.id);
  const { estado, codigo } = req.body;
  const pedido = lista.find((p) => Number(p.id) === id);

  if (!pedido) {
    return res.status(404).json({ error: 'No encontrado' });
  }

  if (estado === 'aceptado' && pedido.estado === 'pendiente') {
    pedido.estado = 'aceptado';
    pedido.aceitoEm = new Date().toISOString();
    writeDb(lista);

    await sendWhatsAppText(pedido.telefono, [
      `Corrida #${pedido.id} aceita.`,
      'Quando o motoboy chegar, informe este codigo de chegada:',
      '',
      pedido.codigoChegada
    ].join('\n'));

    return res.json({ mensaje: 'Pedido aceptado', pedido });
  }

  if (estado === 'em_andamento' && pedido.estado === 'aceptado') {
    if (normalizeText(codigo) !== pedido.codigoChegada) {
      return res.status(400).json({ error: 'Codigo de chegada invalido' });
    }

    pedido.estado = 'em_andamento';
    pedido.chegadaConfirmadaEm = new Date().toISOString();
    writeDb(lista);

    await sendWhatsAppText(pedido.telefono, [
      `Chegada confirmada na corrida #${pedido.id}.`,
      'No destino, informe este codigo para finalizar:',
      '',
      pedido.codigoFinalizacao
    ].join('\n'));

    return res.json({ mensaje: 'Chegada confirmada', pedido });
  }

  if (estado === 'completado' && pedido.estado === 'em_andamento') {
    if (normalizeText(codigo) !== pedido.codigoFinalizacao) {
      return res.status(400).json({ error: 'Codigo de finalizacao invalido' });
    }

    pedido.estado = 'completado';
    pedido.finalizadoEm = new Date().toISOString();
    writeDb(lista);

    await sendWhatsAppText(pedido.telefono, `Corrida #${pedido.id} finalizada. Obrigado pela preferencia.`);
    return res.json({ mensaje: 'Estado actualizado', pedido });
  }

  return res.status(409).json({ error: 'Transicao de estado invalida', pedido });
});

app.get('/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post('/webhooks/whatsapp', async (req, res) => {
  res.sendStatus(200);

  try {
    for (const entry of req.body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        for (const message of value.messages || []) {
          if (message.type !== 'text') continue;

          const customerPhone = message.from;
          const customerName = (value.contacts || []).find((contact) => contact.wa_id === customerPhone)?.profile?.name || '';
          const text = normalizeText(message.text?.body);

          if (!text) continue;

          if (!shouldCreatePedido(text)) {
            await sendWhatsAppText(customerPhone, [
              'Para pedir uma corrida, envie assim:',
              '',
              'CORRIDA',
              'Nome: seu nome',
              'Origem: endereco de partida',
              'Destino: endereco de destino',
              'Pagamento: Pix/Dinheiro'
            ].join('\n'));
            continue;
          }

          const pedido = createPedidoFromWhatsapp({ customerPhone, customerName, text });
          await sendWhatsAppText(customerPhone, [
            `Pedido recebido. Corrida #${pedido.id} criada.`,
            'Aguarde um motoboy aceitar.'
          ].join('\n'));
        }
      }
    }
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
  }
});

app.post('/api/test/receive-whatsapp', (req, res) => {
  const text = normalizeText(req.body.text);
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const pedido = createPedidoFromWhatsapp({
    customerPhone: normalizeText(req.body.customerPhone || '5511999999999'),
    customerName: normalizeText(req.body.customerName || 'Cliente Teste'),
    text
  });

  res.json({ pedido });
});

app.listen(PORT, () => {
  console.log(`SERVIDOR CORRIENDO EN EL PUERTO ${PORT}`);
});
