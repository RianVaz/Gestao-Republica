const express = require('express');
const router = express.Router();
const itensController = require('../controllers/itensController');

router.get('/', itensController.listarItens);
router.post('/', itensController.criarItem);
router.get('/:id', itensController.buscarItemPorId);
router.put('/:id', itensController.atualizarItem);
router.delete('/:id', itensController.deletarItem);

module.exports = router;