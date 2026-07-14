const prisma = require('../config/prisma');

const buscarTodos = async () => {
    return await prisma.itens_inventario.findMany();
};

const buscarPorId = async (id) => {
    return await prisma.itens_inventario.findUnique({
        where: { id: parseInt(id) }
    });
};

const criar = async (dadosItem) => {
    return await prisma.itens_inventario.create({
        data: dadosItem
    });
};

const atualizar = async (id, dadosItem) => {
    return await prisma.itens_inventario.update({
        where: { id: parseInt(id) },
        data: dadosItem
    });
};

const deletar = async (id) => {
    return await prisma.itens_inventario.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = { buscarTodos, buscarPorId, criar, atualizar, deletar };