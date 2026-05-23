const PedidoItemModel = require("../models/pedidoItemModel");
const PedidoModel = require("../models/pedidoModel");
const ProdutoModel = require("../models/produtoModel");
const queueService = require("../services/queueService");

class VitrineController {

    async listarProdutosView(req, res) {
        let produto = new ProdutoModel();
        let listaProdutos = await produto.listarProdutos();

        res.render('vitrine/index', { produtos: listaProdutos, layout: 'vitrine/index' });
    }

    async gravarPedido(req, res){
        var ok = false;
        var msg = "";
        if(req.body != null && req.body != ""){
            const email = req.body.email;
            const listaPedido = Array.isArray(req.body) ? req.body : req.body.itens;

            if(email == null || email == "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) == false) {
                msg = "Informe um e-mail valido para receber o pedido.";
            }
            else if(listaPedido != null && listaPedido.length > 0) {
                let pedido = new PedidoModel();
                let listaErros = await pedido.validarPedido(listaPedido);
                if(listaErros.length == 0){
                    await pedido.gravar();
                    if(pedido.pedidoId > 0){
                        const itensEmail = [];
                        let total = 0;
                        for(let i = 0; i<listaPedido.length; i++){
                            let pedidoItem = new PedidoItemModel();
                            pedidoItem.pedidoId = pedido.pedidoId;
                            pedidoItem.produtoId = listaPedido[i].id;
                            pedidoItem.pedidoQuantidade = listaPedido[i].quantidade;

                            ok = await pedidoItem.gravar();
                            if(ok){
                                const produto = await pedido.debitarQuantidade(pedidoItem.produtoId, pedidoItem.pedidoQuantidade);
                                const valor = Number(produto.produtoPreco || 0);
                                const quantidade = Number(pedidoItem.pedidoQuantidade || 0);
                                total += valor * quantidade;
                                itensEmail.push({
                                    nome: produto.produtoNome,
                                    quantidade: quantidade,
                                    valor: valor
                                });
                            }
                        }

                        if(ok) {
                            await queueService.publishOrderEmailEvent({
                                pedidoId: pedido.pedidoId,
                                email: email,
                                itens: itensEmail,
                                total: total
                            });
                        }
                    }
                    else{
                        msg = "Erro ao gerar pedido!";
                    }
                }
                else{
                    var msgErro = listaErros.join("\n");  
                    msgErro = msgErro.trim(",");
                    msg = "Os seguintes produtos não possuem a quantidade desejada: \n" + msgErro;  
                }
            }
            else{
                msg = "Carrinho vazio!";
            }
        }
        else{
            msg = "Parâmetros inválidos";
        }

        res.send({ok: ok, msg: msg});
    }
}

module.exports = VitrineController;
