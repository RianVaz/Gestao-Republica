const express = require('express');
const router = express.Router();
const emprestimosController = require('../controllers/emprestimosController');

router.get('/', emprestimosController.listarEmprestimos);
router.post('/', emprestimosController.criarEmprestimo);
router.get('/:id', emprestimosController.buscarEmprestimoPorId);
router.put('/:id', emprestimosController.atualizarEmprestimo);
router.delete('/:id', emprestimosController.deletarEmprestimo);

module.exports = router;