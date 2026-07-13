const express = require('express');
const router = express.Router();
const tarefasController = require('../controllers/tarefasController');

router.get('/', tarefasController.listarTarefas);
router.post('/', tarefasController.criarTarefa);
router.get('/:id', tarefasController.buscarTarefaPorId);
router.put('/:id', tarefasController.atualizarTarefa);
router.delete('/:id', tarefasController.deletarTarefa);

module.exports = router;