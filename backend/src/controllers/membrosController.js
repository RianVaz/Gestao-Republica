const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const membrosModel = require('../models/membrosModel');
const prisma = require('../config/prisma'); // Importamos para buscar o apelido direto no login

// --- FUNÇÃO DE LOGIN ---
const login = async (req, res) => {
    try {
        const { apelido, senha } = req.body;

        if (!apelido || !senha) {
            return res.status(400).json({ erro: 'Apelido e senha são obrigatórios.' });
        }

        const membro = await prisma.membros.findUnique({
            where: { apelido: apelido }
        });

        if (!membro) {
            return res.status(404).json({ erro: 'Morador não encontrado.' });
        }

        if (!membro.senha) {
            return res.status(403).json({ erro: 'Seu usuário ainda não possui senha. Fale com o administrador.' });
        }

        const senhaValida = await bcrypt.compare(senha, membro.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Senha incorreta.' });
        }

        const secret = process.env.JWT_SECRET || 'chave_super_secreta_republica';
        const token = jwt.sign(
            { id: membro.id, apelido: membro.apelido, hierarquia: membro.hierarquia },
            secret,
            { expiresIn: '7d' }
        );

        delete membro.senha;

        res.json({
            mensagem: 'Login realizado com sucesso!',
            token,
            usuario: membro
        });

    } catch (erro) {
        console.error("Erro no login:", erro);
        res.status(500).json({ erro: 'Falha interna ao realizar login.' });
    }
};

const listarMembros = async (req, res) => {
    try {
        const membros = await membrosModel.buscarTodos();
        
        const membrosSemSenha = membros.map(m => {
            const { senha, ...resto } = m;
            return resto;
        });

        res.json(membrosSemSenha);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao buscar membros' });
    }
};

const buscarMembroPorId = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL
        const membro = await membrosModel.buscarPorId(id);

        if (!membro) {
            return res.status(404).json({ erro: 'Morador não encontrado.' });
        }

        delete membro.senha;
        res.json(membro);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao buscar o membro.' });
    }
};

const criarMembro = async (req, res) => {
    try {
        const { apelido, nome_completo, hierarquia, data_entrada, senha } = req.body;

        if (!apelido || !nome_completo || !hierarquia || !data_entrada) {
            return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
        }

        // Se o frontend não enviar uma senha, define uma padrão (123456)
        const senhaParaSalvar = senha || '123456';
        const senhaCriptografada = await bcrypt.hash(senhaParaSalvar, 10);

        const dadosParaSalvar = {
            ...req.body,
            senha: senhaCriptografada,
            data_entrada: new Date(data_entrada)
        };

        const novoMembro = await membrosModel.criar(dadosParaSalvar);

        delete novoMembro.senha; // Segurança
        res.status(201).json(novoMembro);
    } catch (erro) {
        if (erro.code === 'P2002') {
            return res.status(400).json({ erro: 'Apelido ou email já cadastrado.' });
        }
        res.status(500).json({ erro: 'Falha ao salvar o membro.' });
    }
};

const atualizarMembro = async (req, res) => {
    try {
        const { id } = req.params;
        const dadosAtualizados = req.body;

        if (dadosAtualizados.data_entrada) {
            dadosAtualizados.data_entrada = new Date(dadosAtualizados.data_entrada);
        }
        if (dadosAtualizados.data_saida) {
            dadosAtualizados.data_saida = new Date(dadosAtualizados.data_saida);
        }

        if (dadosAtualizados.senha) {
            dadosAtualizados.senha = await bcrypt.hash(dadosAtualizados.senha, 10);
        }

        const membroAtualizado = await membrosModel.atualizar(id, dadosAtualizados);
        
        delete membroAtualizado.senha; // Segurança
        res.json(membroAtualizado);
    } catch (erro) {
        // P2025 é o erro do Prisma para "Registro não encontrado"
        if (erro.code === 'P2025') {
            return res.status(404).json({ erro: 'Morador não encontrado para edição.' });
        }
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao atualizar o membro.' });
    }
};

const deletarMembro = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL
        
        await membrosModel.deletar(id);
        
        res.json({ mensagem: 'Morador removido com sucesso da república!' });
    } catch (erro) {
        if (erro.code === 'P2025') {
            return res.status(404).json({ erro: 'Morador não encontrado para exclusão.' });
        }
        console.error(erro);
        res.status(500).json({ erro: 'Falha ao remover o membro.' });
    }
};

const alterarSenha = async (req, res) => {
    try {
        const { id } = req.params;
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ erro: 'A senha atual e a nova senha são obrigatórias.' });
        }

        const membro = await prisma.membros.findUnique({
            where: { id: parseInt(id) }
        });

        if (!membro) {
            return res.status(404).json({ erro: 'Morador não encontrado.' });
        }

        const senhaValida = await bcrypt.compare(senhaAtual, membro.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Sua senha atual está incorreta.' });
        }

        const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
        await prisma.membros.update({
            where: { id: parseInt(id) },
            data: { senha: senhaCriptografada }
        });

        res.json({ mensagem: 'Senha atualizada com sucesso!' });
    } catch (erro) {
        console.error("Erro ao alterar senha:", erro);
        res.status(500).json({ erro: 'Falha interna ao tentar alterar a senha.' });
    }
};

module.exports = { login, listarMembros, criarMembro, atualizarMembro, deletarMembro, buscarMembroPorId, alterarSenha };