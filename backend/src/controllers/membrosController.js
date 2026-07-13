const membrosModel = require('../models/membrosModel');

const listarMembros = async (req, res) => {
    try {
        const membros = await membrosModel.buscarTodos();
        res.json(membros);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao buscar membros' });
    }
};

const buscarMembroPorId = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL
        const membro = await membrosModel.buscarPorId(id);

        // Se o Prisma não encontrar ninguém, ele retorna 'null'
        if (!membro) {
            return res.status(404).json({ erro: 'Morador não encontrado.' });
        }

        res.json(membro);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao buscar o membro.' });
    }
};


const criarMembro = async (req, res) => {
    try {
        const { apelido, nome_completo, hierarquia, data_entrada } = req.body;

        if (!apelido || !nome_completo || !hierarquia || !data_entrada) {
            return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
        }

        const novoMembro = await membrosModel.criar({
            ...req.body,
            data_entrada: new Date(data_entrada)
        });

        res.status(201).json(novoMembro);
    } catch (erro) {
        if (erro.code === 'P2002') {
            return res.status(400).json({ erro: 'Apelido ou email já cadastrado.' });
        }
        res.status(500).json({ erro: 'Falha ao salvar o membro.' });
    }
};

const atualizarMembro = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL
        const dadosAtualizados = req.body; // Pega os novos dados do Postman

        // Se o usuário mandar uma data nova, precisamos converter para o formato do banco
        if (dadosAtualizados.data_entrada) {
            dadosAtualizados.data_entrada = new Date(dadosAtualizados.data_entrada);
        }

        const membroAtualizado = await membrosModel.atualizar(id, dadosAtualizados);
        res.json(membroAtualizado);
    } catch (erro) {
        // P2025 é o erro do Prisma para "Registro não encontrado"
        if (erro.code === 'P2025') {
            return res.status(404).json({ erro: 'Morador não encontrado para edição.' });
        }
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao atualizar o membro.' });
    }
};

const deletarMembro = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL
        
        await membrosModel.deletar(id);
        
        res.json({ mensagem: 'Morador removido com sucesso da república!' });
    } catch (erro) {
        if (erro.code === 'P2025') {
            return res.status(404).json({ erro: 'Morador não encontrado para exclusão.' });
        }
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao remover o membro.' });
    }
};

module.exports = { listarMembros, criarMembro, atualizarMembro, deletarMembro, buscarMembroPorId };