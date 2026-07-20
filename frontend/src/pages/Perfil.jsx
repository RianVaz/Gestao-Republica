import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Key, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function Perfil() {
  const { usuario } = useAuth();
  
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null); // { tipo: 'sucesso' | 'erro', texto: '' }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem(null);

    if (novaSenha !== confirmarSenha) {
      return setMensagem({ tipo: 'erro', texto: 'A nova senha e a confirmação não batem.' });
    }
    if (novaSenha.length < 6) {
      return setMensagem({ tipo: 'erro', texto: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    setLoading(true);
    try {
      const resposta = await fetch(`http://localhost:3001/membros/${usuario.id}/senha`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, novaSenha })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao alterar a senha.');
      }

      setMensagem({ tipo: 'sucesso', texto: 'Sua senha foi alterada com sucesso!' });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      
      {/* Card de Informações do Usuário */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full flex items-center justify-center shrink-0">
          <User className="w-10 h-10" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-gray-100">{usuario?.nome_completo}</h2>
          <p className="text-purple-400 font-medium mb-4">"{usuario?.apelido}" • {usuario?.hierarquia?.replace('_', '-')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            {usuario?.email && <p><strong>Email:</strong> {usuario.email}</p>}
            {usuario?.telefone && <p><strong>Telefone:</strong> {usuario.telefone}</p>}
            {usuario?.curso && <p><strong>Curso:</strong> {usuario.curso}</p>}
          </div>
        </div>
      </div>

      {/* Card de Alteração de Senha */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gray-800 rounded-xl">
            <Key className="w-5 h-5 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-100">Alterar Senha</h3>
        </div>

        {mensagem && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${mensagem.tipo === 'sucesso' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {mensagem.tipo === 'sucesso' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <p className="text-sm font-medium">{mensagem.texto}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Senha Atual</label>
            <input 
              required type="password" 
              value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Nova Senha</label>
            <input 
              required type="password" 
              value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Confirmar Nova Senha</label>
            <input 
              required type="password" 
              value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" 
            />
          </div>

          <button disabled={loading} type="submit" className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-purple-600/20 w-full sm:w-auto mt-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Nova Senha'}
          </button>
        </form>
      </div>

    </div>
  );
}