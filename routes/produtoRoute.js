const express = require('express');
const multer = require("multer");
const ProdutoController = require('../controllers/produtoController');
const Autenticacao = require('../middlewares/autenticacao');

class ProdutoRoute {

    #router;
    get router() {
        return this.#router;
    }
    set router(router) {
        this.#router = router
    }

    constructor() {
        this.#router = express.Router();

        let storage = multer.memoryStorage();
        let upload = multer({storage});
        let auth = new Autenticacao();
        let ctrl = new ProdutoController
        const acao = (metodo) => (req, res, next) => {
            Promise.resolve(metodo.call(ctrl, req, res, next)).catch(next);
        };

        this.#router.get('/', auth.usuarioIsAdmin, acao(ctrl.listarView));
        this.#router.get('/cadastro', auth.usuarioIsAdmin, acao(ctrl.cadastroView));
        this.#router.post("/cadastro", auth.usuarioIsAdmin, upload.single("inputImagem"), acao(ctrl.cadastrarProduto));
        this.#router.post("/excluir", auth.usuarioIsAdmin, acao(ctrl.excluirProduto));
        this.#router.get("/alterar/:id", auth.usuarioIsAdmin, acao(ctrl.alterarView));
        this.#router.post("/alterar", auth.usuarioIsAdmin, upload.single("inputImagem"), acao(ctrl.alterarProduto));
        this.#router.post("/buscar", acao(ctrl.buscaProduto));
    }
}

module.exports = ProdutoRoute;
