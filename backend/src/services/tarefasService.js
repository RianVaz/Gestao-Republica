const prisma = require('../config/prisma');

const processarAtrasoDeTarefa = async (tarefaId) => {
    // 1. Busca a tarefa junto com a lista de membros responsáveis
    const tarefa = await prisma.tarefas.findUnique({
        where: { id: parseInt(tarefaId) },
        include: { tarefas_responsaveis: true } 
    });

    // Se a tarefa não existir ou já estiver atrasada, cancela a operação
    if (!tarefa || tarefa.status === 'Atrasada') return;

    // 2. Atualiza o status da tarefa para 'Atrasada'
    await prisma.tarefas.update({
        where: { id: parseInt(tarefaId) },
        data: { status: 'Atrasada' }
    });

    // 3. Punição em massa! Gera os registros para cada responsável encontrado
    if (tarefa.tarefas_responsaveis && tarefa.tarefas_responsaveis.length > 0) {
        const punicoesData = tarefa.tarefas_responsaveis.map(responsavel => ({
            membro_id: responsavel.membro_id,
            tarefa_id: tarefa.id,
            motivo: `Sistema automático: Atraso na tarefa "${tarefa.titulo}"`
        }));

        // Salva todas as punições no banco de uma vez só
        await prisma.punicoes.createMany({
            data: punicoesData
        });
    }
};

module.exports = { processarAtrasoDeTarefa };