const prisma = require('../config/prisma');

const buscarTodas = async () => {
    return await prisma.tarefas.findMany({
        include: {
            tarefas_responsaveis: true
        }
    });
};

const buscarPorId = async (id) => {
    return await prisma.tarefas.findUnique({
        where: { id: parseInt(id) },
        include: {
            tarefas_responsaveis: true
        }
    });
};

const criar = async (dadosTarefa) => {
    return await prisma.tarefas.create({
        data: dadosTarefa
    });
};

const atualizar = async (id, dadosTarefa, novosResponsaveis) => {
    if (novosResponsaveis && Array.isArray(novosResponsaveis)) {
        dadosTarefa.tarefas_responsaveis = {
            deleteMany: {}, // 🧹 Apaga os responsáveis antigos desta tarefa
            create: novosResponsaveis.map(membro_id => ({ membro_id: parseInt(membro_id) })) // ➕ Adiciona os novos
        };
    }
    
    return await prisma.tarefas.update({
        where: { id: parseInt(id) },
        data: dadosTarefa,
        include: { tarefas_responsaveis: true } // Retorna a tarefa já com a nova lista
    });
};

const deletar = async (id) => {
    return await prisma.tarefas.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = { buscarTodas, buscarPorId, criar, atualizar, deletar };