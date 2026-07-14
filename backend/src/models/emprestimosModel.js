const prisma = require('../config/prisma');

const buscarTodos = async () => {
    // Trazendo os dados do item e do membro que autorizou para ficar mais completo
    return await prisma.emprestimos.findMany({
        include: {
            itens_inventario: true,
            membros: true
        }
    });
};

const buscarPorId = async (id) => {
    return await prisma.emprestimos.findUnique({
        where: { id: parseInt(id) },
        include: {
            itens_inventario: true,
            membros: true
        }
    });
};

const criar = async (dadosEmprestimo) => {
    return await prisma.emprestimos.create({
        data: dadosEmprestimo
    });
};

const atualizar = async (id, dadosEmprestimo) => {
    return await prisma.emprestimos.update({
        where: { id: parseInt(id) },
        data: dadosEmprestimo
    });
};

const deletar = async (id) => {
    return await prisma.emprestimos.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = { buscarTodos, buscarPorId, criar, atualizar, deletar };