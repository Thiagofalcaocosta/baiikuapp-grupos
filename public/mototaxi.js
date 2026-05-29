function textoEstado(estado) {
    const estados = {
        pendiente: "pendente",
        aceptado: "aceito",
        em_andamento: "em andamento",
        completado: "completado"
    };

    return estados[estado] || estado;
}

function textoBoton(pedido) {
    if (pedido.estado === "pendiente") return "aceitar";
    if (pedido.estado === "aceptado") return "confirmar chegada";
    if (pedido.estado === "em_andamento") return "finalizar";
    return "";
}

function proximoEstado(pedido) {
    if (pedido.estado === "pendiente") return "aceptado";
    if (pedido.estado === "aceptado") return "em_andamento";
    if (pedido.estado === "em_andamento") return "completado";
    return "";
}

function deveMostrarBoton(pedido) {
    return pedido.estado !== "completado";
}

function precisaCodigo(pedido) {
    return pedido.estado === "aceptado" || pedido.estado === "em_andamento";
}

function codigoDesenvolvimento(pedido) {
    if (pedido.estado === "aceptado") return pedido.codigoChegada;
    if (pedido.estado === "em_andamento") return pedido.codigoFinalizacao;
    return "";
}

async function cargarDatos() {
    const res = await fetch('/solicitud');
    const datos = await res.json();

    const pedidos = document.getElementById('listPedidos');
    pedidos.innerHTML = "";

    datos.forEach(pedido => {
        const card = document.createElement('article');
        const contentBtn = document.createElement('article');

        card.classList.add('cartas');
        contentBtn.classList.add('containBtn');

        const origem = pedido.origen ? `<h3 class="origen">Origem: ${pedido.origen}</h3>` : "";
        const pago = pedido.pago ? `<h3 class="pago">Pagamento: ${pedido.pago}</h3>` : "";
        const mensagem = pedido.mensajeOriginal || pedido.mensagemOriginal
            ? `<h3 class="descripcion">Mensagem: ${pedido.mensajeOriginal || pedido.mensagemOriginal}</h3>`
            : "";
        const codigoDev = codigoDesenvolvimento(pedido)
            ? `<h3 class="codigo">Codigo teste: ${codigoDesenvolvimento(pedido)}</h3>`
            : "";

        if (pedido.tipo === "transporte") {
            card.innerHTML = `
                <h3 class="tipo">Servico: Transporte</h3>
                <h3 class="nombre">Nome: ${pedido.nombre}</h3>
                <h3 class="telefono">Telefone: ${pedido.telefono}</h3>
                ${origem}
                <h3 class="desttino">Destino: ${pedido.destino || ""}</h3>
                ${pago}
                ${mensagem}
                ${codigoDev}
                <h3 class="estate">Estado: ${textoEstado(pedido.estado)}</h3>
            `;
        } else {
            card.innerHTML = `
                <h3 class="tipo">Servico: Encargo</h3>
                <h3 class="nombre">Nome: ${pedido.nombre}</h3>
                <h3 class="descripcion">Descricao: ${pedido.descripcion || ""}</h3>
                <h3 class="telefono">Telefone: ${pedido.telefono}</h3>
                <h3 class="desttino">Destino: ${pedido.destino || ""}</h3>
                ${codigoDev}
                <h3 class="estate">Estado: ${textoEstado(pedido.estado)}</h3>
            `;
        }

        contentBtn.innerHTML = `
            <button class="verMapa">ver mapa</button>
            ${
                deveMostrarBoton(pedido)
                    ? `<button class="aceptar">${textoBoton(pedido)}</button>`
                    : ''
            }
        `;

        const btn = contentBtn.querySelector(".aceptar");

        if (btn) {
            btn.addEventListener("click", async () => {
                const estado = proximoEstado(pedido);
                const body = { estado };

                if (precisaCodigo(pedido)) {
                    const codigo = prompt("Digite o codigo informado ao cliente:");
                    if (!codigo) return;
                    body.codigo = codigo;
                }

                const response = await fetch(`/guardar/${pedido.id}`, {
                    method: 'PUT',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    alert(data.error || "Erro ao atualizar pedido");
                    return;
                }

                await cargarDatos();
            });
        }

        pedidos.appendChild(card);
        card.appendChild(contentBtn);
    });
}

cargarDatos();
setInterval(cargarDatos, 10000);
