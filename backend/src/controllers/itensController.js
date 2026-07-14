const itensModel = require('../models/itensModel');

const listarItens = async (req, res) => {
    try {
        const itens = await itensModel.buscarTodos();
        res.json(itens);
    } catch (erro) {
        console.error("Erro ao listar itens:", erro);
        res.status(500).json({ erro: 'Falha ao buscar itens do inventário.' });
    }
};

const buscarItemPorId = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });

        const item = await itensModel.buscarPorId(id);
        if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });

        res.json(item);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao buscar o item.' });
    }
};

const criarItem = async (req, res) => {
    try {
        const { nome, categoria, status, estado_conservacao, data_aquisicao } = req.body;

        if (!nome || !categoria) {
            return res.status(400).json({ erro: 'Campos obrigatórios ausentes: nome e categoria.' });
        }

        const novoItem = await itensModel.criar({
            nome,
            categoria, // Lembrete: Prisma pode aplicar regras aos Enums aqui também
            ...(status && { status }), // Só envia se vier preenchido, senão usa o Default do DB
            estado_conservacao,
            ...(data_aquisicao && { data_aquisicao: new Date(data_aquisicao) })
        });

        res.status(201).json(novoItem);
    } catch (erro) {
        console.error("Erro ao criar item:", erro);
        res.status(500).json({ erro: 'Falha ao salvar o item no inventário.' });
    }
};

const atualizarItem = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;

        if (dadosAtualizados.data_aquisicao) {
            dadosAtualizados.data_aquisicao = new Date(dadosAtualizados.data_aquisicao);
        }

        const itemAtualizado = await itensModel.atualizar(id, dadosAtualizados);
        res.json(itemAtualizado);
    } catch (erro) {
        if (erro.code === 'P2025') return res.status(404).json({ erro: 'Item não encontrado.' });
        console.error("Erro no PUT:", erro);
        res.status(500).json({ erro: 'Falha ao atualizar o item.' });
    }
};

const deletarItem = async (req, res) => {
    try {
        const { id } = req.params;
        await itensModel.deletar(id);
        res.json({ mensagem: 'Item removido do inventário com sucesso!' });
    } catch (erro) {
        if (erro.code === 'P2025') return res.status(404).json({ erro: 'Item não encontrado.' });
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao remover o item.' });
    }
};

module.exports = { listarItens, buscarItemPorId, criarItem, atualizarItem, deletarItem };