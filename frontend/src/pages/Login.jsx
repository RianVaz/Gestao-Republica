import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Lock, User, Loader2 } from 'lucide-react';

export default function Login() {
  const [apelido, setApelido] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    const resultado = await login(apelido, senha);

    if (!resultado.sucesso) {
      setErro(resultado.erro);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900/50 border border-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-purple-600/20 text-purple-500 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.2)]">
            <Home className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-100">Gestão da República</h2>
          <p className="text-sm text-gray-500 mt-1">Faça login para acessar o painel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {erro && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
              {erro}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400 pl-1">Apelido</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                required
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-purple-500 text-gray-200" 
                placeholder="Seu apelido na casa" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-400 pl-1">Senha</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="password" 
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-purple-500 text-gray-200" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}