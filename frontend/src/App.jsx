import { useState } from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import { menuItems } from './constants'; // Importando do novo arquivo
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Membros from './pages/Membros';
import Tarefas from './pages/Tarefas';
import Punicoes from './pages/Punicoes';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Renderiza a tela correta baseada na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'membros':
        return <Membros />;
      case 'tarefas':
        return <Tarefas />;
      case 'punicoes':
        return <Punicoes />;
      default:
        return <div className="text-center mt-10 text-gray-500">Módulo em construção</div>;
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
        
        <header className="flex-shrink-0 flex items-center p-4 lg:px-8 lg:py-5 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm z-30">
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white mr-4">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            {activeTab !== 'dashboard' && (
              <button onClick={() => setActiveTab('dashboard')} className="p-1.5 bg-gray-800/50 text-gray-400 hover:text-purple-400 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-100 capitalize">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}