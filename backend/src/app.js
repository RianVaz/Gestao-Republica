require('dotenv').config();
const express = require('express');
const cors = require('cors');
const membrosRoutes = require('./routes/membrosRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// 🕵️‍♂️ Espião de Requisições: Vai mostrar no terminal tudo que chegar
app.use((req, res, next) => {
    console.log(`➡️  Chegou uma requisição: ${req.method} ${req.url}`);
    next();
});

// Montagem da rota
app.use('/membros', membrosRoutes);

module.exports = app;