import { useState } from 'react';
import { Menu, ArrowLeft, LogOut } from 'lucide-react';
import { menuItems } from './constants'; 
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Membros from './pages/Membros';
import Tarefas from './pages/Tarefas';
import Punicoes from './pages/Punicoes';
import Inventario from './pages/Inventario';
import Emprestimos from './pages/Emprestimos';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Perfil from './pages/Perfil';

function AppContent() {
  const { usuario, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'membros': return <Membros />;
      case 'tarefas': return <Tarefas />;
      case 'punicoes': return <Punicoes />;
      case 'inventario': return <Inventario />;
      case 'emprestimos': return <Emprestimos />;
      case 'perfil': return <Perfil />;
      default: return <div className="text-center mt-10 text-gray-500">Módulo em construção</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="flex-shrink-0 flex items-center justify-between p-4 lg:px-8 lg:py-5 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white mr-2">
              <Menu className="w-6 h-6" />
            </button>
            {activeTab !== 'dashboard' && (
              <button onClick={() => setActiveTab('dashboard')} className="hidden sm:block p-1.5 bg-gray-800/50 text-gray-400 hover:text-purple-400 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100 capitalize">
              {menuItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Perfil Rápido do Usuário Logado */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-200">{usuario?.apelido}</p>
              <p className="text-xs text-gray-500">{usuario?.hierarquia?.replace('_', '-')}</p>
            </div>
            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

function AuthWrapper() {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">Carregando...</div>;
  }

  if (!usuario) {
    return <Login />;
  }

  return <AppContent />;
}