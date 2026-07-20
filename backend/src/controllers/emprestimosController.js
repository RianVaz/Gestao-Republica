const emprestimosModel = require('../models/emprestimosModel');
const itensModel = require('../models/itensModel');

const listarEmprestimos = async (req, res) => {
    try {
        const emprestimos = await emprestimosModel.buscarTodos();
        res.json(emprestimos);
    } catch (erro) {
        console.error("Erro ao listar empréstimos:", erro);
        res.status(500).json({ erro: 'Falha ao buscar empréstimos no banco.' });
    }
};

const buscarEmprestimoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ erro: 'ID inválido.' });

        const emprestimo = await emprestimosModel.buscarPorId(id);
        if (!emprestimo) return res.status(404).json({ erro: 'Empréstimo não encontrado.' });

        res.json(emprestimo);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao buscar o empréstimo.' });
    }
};

const criarEmprestimo = async (req, res) => {
    try {
        const { item_id, membro_autorizador_id, responsavel_externo, previsao_devolucao } = req.body;

        if (!item_id || !membro_autorizador_id || !responsavel_externo) {
            return res.status(400).json({ erro: 'Campos obrigatórios ausentes.' });
        }

        if (previsao_devolucao) {
            const dataPrevisao = new Date(previsao_devolucao);
            const dataAtual = new Date();
            dataAtual.setHours(0, 0, 0, 0);

            if (dataPrevisao < dataAtual) {
                return res.status(400).json({ erro: 'A previsão de devolução não pode ser uma data no passado.' });
            }
        }
        
        const item = await itensModel.buscarPorId(item_id);
        if (!item) {
            return res.status(404).json({ erro: 'Item não encontrado no inventário.' });
        }

        if (item.status !== 'Dispon_vel' && item.status !== 'Disponível') {
            return res.status(400).json({ erro: `Este item não pode ser emprestado. Status atual: ${item.status}` });
        }

        const novoEmprestimo = await emprestimosModel.criar({
            item_id: parseInt(item_id),
            membro_autorizador_id: parseInt(membro_autorizador_id),
            responsavel_externo,
            ...(previsao_devolucao && { previsao_devolucao: new Date(previsao_devolucao) })
        });

        await itensModel.atualizar(item_id, { status: 'Emprestado' }); 

        res.status(201).json(novoEmprestimo);
    } catch (erro) {
        console.error("Erro ao criar empréstimo:", erro);
        res.status(500).json({ erro: 'Falha ao salvar o empréstimo. Verifique os IDs.' });
    }
};

const atualizarEmprestimo = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;

        const emprestimoAtual = await emprestimosModel.buscarPorId(id);
        if (!emprestimoAtual) {
            return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
        }

        if (dadosAtualizados.previsao_devolucao) {
            dadosAtualizados.previsao_devolucao = new Date(dadosAtualizados.previsao_devolucao);
        }

        // CORREÇÃO AQUI TAMBÉM: Se for devolvido, volta pro status 'Dispon_vel'
        if (dadosAtualizados.data_devolucao) {
            dadosAtualizados.data_devolucao = new Date(dadosAtualizados.data_devolucao);
            await itensModel.atualizar(emprestimoAtual.item_id, { status: 'Dispon_vel' });
        }

        const emprestimoAtualizado = await emprestimosModel.atualizar(id, dadosAtualizados);
        res.json(emprestimoAtualizado);
    } catch (erro) {
        if (erro.code === 'P2025') return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
        console.error("Erro no PUT:", erro);
        res.status(500).json({ erro: 'Falha ao atualizar o empréstimo.' });
    }
};

const deletarEmprestimo = async (req, res) => {
    try {
        const { id } = req.params;
        await emprestimosModel.deletar(id);
        res.json({ mensagem: 'Empréstimo removido com sucesso!' });
    } catch (erro) {
        if (erro.code === 'P2025') return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao remover o empréstimo.' });
    }
};

module.exports = { listarEmprestimos, buscarEmprestimoPorId, criarEmprestimo, atualizarEmprestimo, deletarEmprestimo };