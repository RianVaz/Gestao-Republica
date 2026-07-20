const cron = require('node-cron');
const prisma = require('../config/prisma');
const tarefasService = require('../services/tarefasService'); // ⬅️ Importando o nosso Service

const iniciarRoboDeTarefas = () => {
    cron.schedule('*  * * * *', async () => {
        console.log('[Cron Job] Verificando tarefas atrasadas...');

        try {
            const dataAtual = new Date();

            // Busca todas as tarefas que venceram e ainda não foram marcadas como atrasadas
            const tarefasAtrasadas = await prisma.tarefas.findMany({
                where: {
                    prazo: { lt: dataAtual },
                    status: { in: ['Pendente', 'Em_Andamento'] }
                }
            });

            if (tarefasAtrasadas.length > 0) {
                // Loop para rodar a regra de negócio em cada tarefa vencida
                for (const tarefa of tarefasAtrasadas) {
                    await tarefasService.processarAtrasoDeTarefa(tarefa.id);
                    console.log(`⚠️  Atenção: Tarefa ID ${tarefa.id} atrasou! Punições geradas.`);
                }
            } else {
                console.log('✅ Nenhuma tarefa recém-atrasada encontrada.');
            }

        } catch (erro) {
            console.error('❌ Erro ao rodar o Cron Job:', erro);
        }
    });
};

module.exports = iniciarRoboDeTarefas;