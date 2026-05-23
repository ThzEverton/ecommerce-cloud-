const express = require('express');
const VitrineController = require('../controllers/vitrineController');

class VitrineRoute {

    #router;

    get router() {
        return this.#router;
    }
    set router(router) {
        this.#router = router
    }

    constructor() {

        this.#router = express.Router();

        let ctrl = new VitrineController();

        const acao = (metodo) => (req, res, next) => {
            Promise.resolve(metodo.call(ctrl, req, res, next)).catch(next);
        };

        this.#router.get('/', acao(ctrl.listarProdutosView));
        this.#router.post('/gravar-pedido', acao(ctrl.gravarPedido));
    }
}

module.exports = VitrineRoute;
