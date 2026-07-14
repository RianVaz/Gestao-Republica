require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importando rotas
const membrosRoutes = require('./routes/membrosRoutes');
const tarefasRoutes = require('./routes/tarefasRoutes');
const punicoesRoutes = require('./routes/punicoesRoutes');
const itensRoutes = require('./routes/itensRoutes');
const emprestimosRoutes = require('./routes/emprestimosRoutes');
const iniciarRoboDeTarefas = require('./jobs/verificarAtrasos');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`➡️  Chegou uma requisição: ${req.method} ${req.url}`);
    next();
});

// Rotas
app.use('/membros', membrosRoutes);
app.use('/tarefas', tarefasRoutes);
app.use('/punicoes', punicoesRoutes);
app.use('/itens', itensRoutes);
app.use('/emprestimos', emprestimosRoutes);
iniciarRoboDeTarefas();

module.exports = app;