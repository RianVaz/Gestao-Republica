const prisma = require('../config/prisma');

const buscarTodas = async () => {
    return await prisma.punicoes.findMany();
};

const buscarPorId = async (id) => {
    return await prisma.punicoes.findUnique({
        where: { id: parseInt(id) }
    });
};

const criar = async (dadosPunicao) => {
    return await prisma.punicoes.create({
        data: dadosPunicao
    });
};

const atualizar = async (id, dadosPunicao) => {
    return await prisma.punicoes.update({
        where: { id: parseInt(id) },
        data: dadosPunicao
    });
};

const deletar = async (id) => {
    return await prisma.punicoes.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = { buscarTodas, buscarPorId, criar, atualizar, deletar };