const tarefasModel = require('../models/tarefasModel');

const listarTarefas = async (req, res) => {
    try {
        const tarefas = await tarefasModel.buscarTodas();
        res.json(tarefas);
    } catch (erro) {
        console.error("Erro ao listar tarefas:", erro);
        res.status(500).json({ erro: 'Falha ao buscar tarefas no banco.' });
    }
};

const buscarTarefaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });

        const tarefa = await tarefasModel.buscarPorId(id);
        if (!tarefa) return res.status(404).json({ erro: 'Tarefa não encontrada.' });

        res.json(tarefa);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao buscar a tarefa.' });
    }
};

const criarTarefa = async (req, res) => {
    try {
        const { titulo, descricao, prazo, status, responsaveis, criador_id } = req.body;

        // Validação
        if (!titulo || !responsaveis || !Array.isArray(responsaveis) || responsaveis.length === 0 || !prazo) {
            return res.status(400).json({ erro: 'Campos obrigatórios ausentes: titulo, responsaveis (array) e prazo.' });
        }

        const novaTarefa = await tarefasModel.criar({
            titulo,
            descricao,
            prazo: new Date(prazo),
            status: status || 'Pendente',
            criador_id: parseInt(criador_id),
            tarefas_responsaveis: {
                create: responsaveis.map(id => ({
                    membro_id: parseInt(id)
                }))
            }
        });

        res.status(201).json(novaTarefa);
    } catch (erro) {
        console.error("Erro ao criar tarefa:", erro);
        res.status(500).json({ erro: 'Falha ao salvar a tarefa. Verifique se os IDs informados existem.' });
    }
};

const atualizarTarefa = async (req, res) => {
    try {
        const { id } = req.params;
        const { responsaveis, ...dadosAtualizados } = req.body; // Separa os responsáveis do resto dos dados

        // Converte a data se ela vier na edição
        if (dadosAtualizados.prazo) {
            dadosAtualizados.prazo = new Date(dadosAtualizados.prazo);
        }
        
        // Converte data_conclusao se a tarefa for marcada como concluída
        if (dadosAtualizados.data_conclusao) {
            dadosAtualizados.data_conclusao = new Date(dadosAtualizados.data_conclusao);
        }

        const tarefaAtualizada = await tarefasModel.atualizar(id, dadosAtualizados, responsaveis);
        res.json(tarefaAtualizada);
    } catch (erro) {
        if (erro.code === 'P2025') return res.status(404).json({ erro: 'Tarefa não encontrada.' });
        console.error("Erro no PUT:", erro);
        res.status(500).json({ erro: 'Falha ao atualizar a tarefa.' });
    }
};

const deletarTarefa = async (req, res) => {
    try {
        const { id } = req.params;
        await tarefasModel.deletar(id);
        res.json({ mensagem: 'Tarefa removida com sucesso!' });
    } catch (erro) {
        if (erro.code === 'P2025') return res.status(404).json({ erro: 'Tarefa não encontrada.' });
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao remover a tarefa.' });
    }
};

module.exports = { listarTarefas, buscarTarefaPorId, criarTarefa, atualizarTarefa, deletarTarefa };