const prisma = require('../config/prisma');

const buscarTodos = async () => {
    return await prisma.membros.findMany();
};

const buscarPorId = async (id) => {
    return await prisma.membros.findUnique({
        where: { id: parseInt(id) }
    });
};

const criar = async (dadosMembro) => {
    return await prisma.membros.create({
        data: dadosMembro
    });
};

const atualizar = async (id, dadosMembro) => {
    return await prisma.membros.update({
        where: { id: parseInt(id) },
        data: dadosMembro
    });
};

const deletar = async (id) => {
    return await prisma.membros.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = { buscarTodos, criar, atualizar, deletar, buscarPorId };