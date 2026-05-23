let carrinho = [];

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".btnAddCarrinho").forEach(function(botao) {
        botao.addEventListener("click", adicionarProduto);
    });

    document.getElementById("btnGravarPedido").addEventListener("click", gravarPedido);
    renderizarCarrinho();
});

async function adicionarProduto() {
    const produtoId = this.dataset.produto;
    const itemAtual = carrinho.find(function(item) {
        return item.id == produtoId;
    });

    if(itemAtual != null) {
        itemAtual.quantidade++;
        renderizarCarrinho();
        return;
    }

    const resposta = await fetch("/admin/produto/buscar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: produtoId })
    });
    const dados = await resposta.json();

    if(dados.ok) {
        carrinho.push({
            id: dados.retorno.id,
            nome: dados.retorno.nome,
            preco: Number(dados.retorno.preco || 0),
            quantidade: 1
        });
        renderizarCarrinho();
    }
}

function renderizarCarrinho() {
    const corpo = document.getElementById("corpoTabelaCarrinho");
    const contador = document.getElementById("contadorCarrinho");
    const valorTotal = document.getElementById("valorTotalCarrinho");

    corpo.innerHTML = "";
    let total = 0;
    let quantidadeTotal = 0;

    carrinho.forEach(function(item) {
        total += item.preco * item.quantidade;
        quantidadeTotal += item.quantidade;

        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${item.nome}</td>
            <td>R$ ${item.preco.toFixed(2).replace(".", ",")}</td>
            <td>${item.quantidade}</td>
            <td>
                <button class="btn btn-sm btn-outline-secondary" type="button" onclick="alterarQuantidade(${item.id}, -1)">-</button>
                <button class="btn btn-sm btn-outline-secondary" type="button" onclick="alterarQuantidade(${item.id}, 1)">+</button>
                <button class="btn btn-sm btn-outline-danger" type="button" onclick="removerItem(${item.id})">Remover</button>
            </td>`;
        corpo.appendChild(linha);
    });

    contador.innerText = quantidadeTotal;
    valorTotal.innerHTML = `<strong>Total: R$ ${total.toFixed(2).replace(".", ",")}</strong>`;
}

function alterarQuantidade(produtoId, quantidade) {
    const item = carrinho.find(function(produto) {
        return produto.id == produtoId;
    });

    if(item == null) {
        return;
    }

    item.quantidade += quantidade;
    if(item.quantidade <= 0) {
        removerItem(produtoId);
        return;
    }

    renderizarCarrinho();
}

function removerItem(produtoId) {
    carrinho = carrinho.filter(function(item) {
        return item.id != produtoId;
    });
    renderizarCarrinho();
}

async function gravarPedido() {
    const email = document.getElementById("inputEmailPedido").value.trim();
    if(email == "") {
        alert("Informe o e-mail para receber os dados do pedido.");
        return;
    }

    if(carrinho.length == 0) {
        alert("Carrinho vazio!");
        return;
    }

    const resposta = await fetch("/gravar-pedido", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            itens: carrinho.map(function(item) {
                return {
                    id: item.id,
                    quantidade: item.quantidade
                };
            })
        })
    });
    const dados = await resposta.json();

    if(dados.ok) {
        alert(dados.msg || "Pedido confirmado! Voce recebera os detalhes por e-mail.");
        carrinho = [];
        renderizarCarrinho();
    }
    else {
        alert(dados.msg || "Erro ao confirmar pedido.");
    }
}
