# Baiiku Lojas

Marketplace simples para lojas venderem pelo WhatsApp.

## Ideia

A loja recebe um link de vitrine:

```txt
https://seu-app.onrender.com/loja/demo
```

O cliente abre, ve os produtos, adiciona ao pedido e clica em:

```txt
Enviar pedido no WhatsApp
```

O pedido vai direto para o WhatsApp da loja, ja formatado com produtos, quantidades, total, nome do cliente e observacao.

## Links

Marketplace com todas as lojas:

```txt
http://localhost:3000/lojas
```

Vitrine de uma loja:

```txt
http://localhost:3000/loja/demo
http://localhost:3000/loja/acai
http://localhost:3000/loja/moda
```

## Como vender

Mensagem curta para lojista:

```txt
Oi, fiz uma vitrine simples para loja vender pelo WhatsApp.

Voce recebe um link com seus produtos.
O cliente escolhe os itens, monta o pedido e manda direto no seu WhatsApp.

Nao precisa baixar app, nao precisa pagar taxa de marketplace e nao precisa mexer com sistema complicado.
Quer que eu monte uma demonstracao com a logo e cores da sua loja?
```

## Personalizar loja

No arquivo `server.js`, edite o objeto `lojas`.

Exemplo:

```js
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
    }
  ]
}
```

O campo `whatsapp` precisa ter DDI e DDD, sem simbolos:

```txt
5535999990000
```

## Publicar no Render

O projeto ja tem `render.yaml`.

No Render:

```txt
Build Command: npm install
Start Command: npm start
```

Depois de publicar:

```txt
https://baiikuapp-grupos.onrender.com/lojas
https://baiikuapp-grupos.onrender.com/loja/demo
```
