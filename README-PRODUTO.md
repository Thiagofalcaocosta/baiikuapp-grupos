# BaiikuApp para grupos de mototaxi e entregas

Produto simples para donos de grupos de WhatsApp organizarem pedidos sem depender da API oficial do WhatsApp.

## Ideia

O dono do grupo divulga um link fixo no WhatsApp:

```txt
http://localhost:3000/g/centro
```

O cliente preenche corrida ou entrega. O pedido cai no painel:

```txt
http://localhost:3000/painel/centro
```

## Links de exemplo

Cliente pede no grupo demo:

```txt
http://localhost:3000/g/demo
```

Painel do grupo demo:

```txt
http://localhost:3000/painel/demo
```

Cliente pede no grupo centro:

```txt
http://localhost:3000/g/centro
```

Painel do grupo centro:

```txt
http://localhost:3000/painel/centro
```

## Personalizar grupo

No arquivo `server.js`, edite o objeto `grupos`.

Exemplo:

```js
centro: {
  slug: 'centro',
  nome: 'Entregas e Mototaxi Centro',
  cidade: 'Tres Coracoes',
  logo: '/img/motoLogo.png',
  corPrimaria: '#166534',
  corSecundaria: '#0f172a',
  corDestaque: '#e11d48'
}
```

Para colocar a logo de um cliente:

1. Salve a imagem em `public/img`.
2. Troque o campo `logo`.

Exemplo:

```js
logo: '/img/logo-grupo-joao.png'
```

## Publicar no Render

1. Suba o projeto para o GitHub.
2. Acesse `https://render.com`.
3. Clique em `New +`.
4. Escolha `Web Service`.
5. Conecte o repositorio `mototaxiApp`.
6. Use:

```txt
Build Command: npm install
Start Command: npm start
```

O arquivo `render.yaml` ja deixa isso pronto para o Render.

Depois de publicar, os links ficam assim:

```txt
https://nome-do-app.onrender.com/g/centro
https://nome-do-app.onrender.com/painel/centro
```

Observacao: nesta primeira versao, os pedidos ficam em `database.json`. Em hospedagem gratuita, isso serve para demonstracao e primeiros testes. Para vender para varios clientes de verdade, o proximo passo e trocar para banco online, como PostgreSQL ou Supabase.

## Como vender

Mensagem curta para dono de grupo:

```txt
Seu grupo recebe pedidos de mototaxi e entrega, mas muita coisa se perde no WhatsApp?

Eu tenho um painel simples:
- cliente pede por link
- pedido cai em uma fila
- motoboy aceita
- voce acompanha pendente, em atendimento e finalizado
- serve para corrida e entrega

Posso configurar um link para seu grupo.
```

## Modelo de preco inicial

```txt
Instalacao: R$ 100
Mensalidade simples: R$ 49 por grupo
Mensalidade profissional: R$ 99 por grupo
```

## Rodar local

```bash
npm install
npm start
```

Abra:

```txt
http://localhost:3000/g/centro
```
