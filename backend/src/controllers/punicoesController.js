const punicoesModel = require('../models/punicoesModel');

const listarPunicoes = async (req, res) => {
    try {
        const punicoes = await punicoesModel.buscarTodas();
        res.json(punicoes);
    } catch (erro) {
        console.error("Erro ao listar punições:", erro);
        res.status(500).json({ erro: 'Falha ao buscar punições no banco.' });
    }
};

const buscarPunicaoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });

        const punicao = await punicoesModel.buscarPorId(id);
        if (!punicao) return res.status(404).json({ erro: 'Punição não encontrada.' });

        res.json(punicao);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao buscar a punição.' });
    }
};

const criarPunicao = async (req, res) => {
    try {
        const { membro_id, tarefa_id, motivo, data_aplicacao } = req.body;

        // Validação: Alguém tem que receber a punição e tem que haver um motivo
        if (!membro_id || !motivo) {
            return res.status(400).json({ erro: 'Campos obrigatórios ausentes: membro_id e motivo.' });
        }

        const novaPunicao = await punicoesModel.criar({
            membro_id: parseInt(membro_id),
            // Se vier um tarefa_id, é convertido, se não, manda nulo
            tarefa_id: tarefa_id ? parseInt(tarefa_id) : null,
            motivo,
            // Se o usuário não mandar a data, o PostgreSQL já preenche com a data/hora atual
            ...(data_aplicacao && { data_aplicacao: new Date(data_aplicacao) })
        });

        res.status(201).json(novaPunicao);
    } catch (erro) {
        console.error("Erro ao criar punição:", erro);
        res.status(500).json({ erro: 'Falha ao salvar a punição. Verifique se o membro ou tarefa existem.' });
    }
};

const atualizarPunicao = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;

        if (dadosAtualizados.data_aplicacao) {
            dadosAtualizados.data_aplicacao = new Date(dadosAtualizados.data_aplicacao);
        }

        const punicaoAtualizada = await punicoesModel.atualizar(id, dadosAtualizados);
        res.json(punicaoAtualizada);
    } catch (erro) {
        if (erro.code === 'P2025') return res.status(404).json({ erro: 'Punição não encontrada.' });
        console.error("Erro no PUT:", erro);
        res.status(500).json({ erro: 'Falha ao atualizar a punição.' });
    }
};

const deletarPunicao = async (req, res) => {
    try {
        const { id } = req.params;
        await punicoesModel.deletar(id);
        res.json({ mensagem: 'Punição removida (ou perdoada) com sucesso!' });
    } catch (erro) {
        if (erro.code === 'P2025') return res.status(404).json({ erro: 'Punição não encontrada.' });
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao remover a punição.' });
    }
};

module.exports = { listarPunicoes, buscarPunicaoPorId, criarPunicao, atualizarPunicao, deletarPunicao };