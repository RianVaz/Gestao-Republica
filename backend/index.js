require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importações atualizadas para o Prisma 7
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// 1. Configuração do Driver Adapter (Novo padrão Prisma)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 2. Inicialização do Express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// ROTAS
// ==========================================

app.get('/', (req, res) => {
    res.json({ mensagem: 'API da Gestão de República rodando! 🚀' });
});

app.get('/membros', async (req, res) => {
    try {
        const todosMembros = await prisma.membros.findMany();
        res.json(todosMembros);
    } catch (erro) {
        console.error("Erro ao buscar membros:", erro);
        res.status(500).json({ erro: 'Falha ao buscar dados no banco.' });
    }
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`Para testar os membros acesse: http://localhost:${PORT}/membros`);
});