import { Users, ClipboardList, AlertTriangle, ArrowRightLeft, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';

export default function Dashboard({ setActiveTab }) {
  return (
    <div className="space-y-8 h-full">
      
      {/* Seção Superior: Resumo da Casa */}
      <section className="bg-gray-900/30 border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col">
        <h2 className="text-xl font-bold text-gray-100 mb-6 tracking-tight">Resumo da Casa</h2>
        
        {/* Grade ocupando 100% da largura (sem travas horizontais) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
          <StatCard 
            title="Moradores Ativos" 
            value="5" 
            icon={Users} 
            color="purple" 
            onClick={() => setActiveTab('membros')} 
          />
          <StatCard 
            title="Tarefas Atrasadas" 
            value="2" 
            icon={ClipboardList} 
            color="yellow" 
            onClick={() => setActiveTab('tarefas')} 
          />
          <StatCard 
            title="Punições Acumuladas" 
            value="3" 
            icon={AlertTriangle} 
            color="red" 
            onClick={() => setActiveTab('punicoes')} 
          />
          <StatCard 
            title="Itens Emprestados" 
            value="4" 
            icon={ArrowRightLeft} 
            color="purple" 
            onClick={() => setActiveTab('emprestimos')} 
          />
        </div>
      </section>

      {/* Seção Inferior: Área de Tarefas Deitadas (Inalterada) */}
      <section className="bg-gray-900/30 border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col h-full max-h-[600px]">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-xl text-gray-100 tracking-tight">Tarefas Recentes</h3>
          <button onClick={() => setActiveTab('tarefas')} className="ml-auto text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
            Ver todas
          </button>
        </div>
        
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          <TaskCard title="Limpar a geladeira e organizar freezers" prazo="Hoje" responsaveis={['VN', 'CT']} urgente={true} status="Atrasada" />
          <TaskCard title="Comprar gás de cozinha e galões de água" prazo="15/Jul" responsaveis={['VN']} urgente={false} status="Em Andamento" />
          <TaskCard title="Consertar porta do banheiro social" prazo="20/Jul" responsaveis={['CT']} urgente={false} status="Pendente" />
          <TaskCard title="Pagar conta de luz do mês" prazo="25/Jul" responsaveis={['MTS']} urgente={false} status="Pendente" />
        </div>
      </section>

    </div>
  );
}