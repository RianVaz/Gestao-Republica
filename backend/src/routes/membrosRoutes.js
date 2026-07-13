const express = require('express');
const router = express.Router();
const membrosController = require('../controllers/membrosController');

router.get('/', membrosController.listarMembros);
router.get('/:id', membrosController.buscarMembroPorId);
router.post('/', membrosController.criarMembro);
router.put('/:id', membrosController.atualizarMembro);
router.delete('/:id', membrosController.deletarMembro);

module.exports = router;