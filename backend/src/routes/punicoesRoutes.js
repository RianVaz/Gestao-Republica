const express = require('express');
const router = express.Router();
const punicoesController = require('../controllers/punicoesController');

router.get('/', punicoesController.listarPunicoes);
router.post('/', punicoesController.criarPunicao);
router.get('/:id', punicoesController.buscarPunicaoPorId);
router.put('/:id', punicoesController.atualizarPunicao);
router.delete('/:id', punicoesController.deletarPunicao);

module.exports = router;