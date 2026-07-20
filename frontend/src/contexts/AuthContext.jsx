import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem('@Republica:usuario');
    const tokenSalvo = localStorage.getItem('@Republica:token');

    if (usuarioSalvo && tokenSalvo) {
      return JSON.parse(usuarioSalvo);
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (apelido, senha) => {
    setLoading(true);
    try {
      const resposta = await fetch('http://localhost:3001/membros/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apelido, senha })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao fazer login.');
      }

      localStorage.setItem('@Republica:token', dados.token);
      localStorage.setItem('@Republica:usuario', JSON.stringify(dados.usuario));
      
      setUsuario(dados.usuario);
      return { sucesso: true };
    } catch (erro) {
      return { sucesso: false, erro: erro.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('@Republica:token');
    localStorage.removeItem('@Republica:usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}