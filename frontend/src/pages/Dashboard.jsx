import { useState, useEffect } from 'react';
import { Users, ClipboardList, AlertTriangle, ArrowRightLeft, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';

// SIMULAÇÃO DE LOGIN: Mesmo ID usado na página de Tarefas e Punições
const USUARIO_LOGADO_ID = 2; 

export default function Dashboard({ setActiveTab }) {
  const [tarefas, setTarefas] = useState([]);
  const [membrosAtivos, setMembrosAtivos] = useState(0);
  const [minhasPunicoes, setMinhasPunicoes] = useState(0); // Novo estado para as punições
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        // Busca Tarefas, Membros e Punições simultaneamente
        const [resTarefas, resMembros, resPunicoes] = await Promise.all([
          fetch('http://localhost:3001/tarefas'),
          fetch('http://localhost:3001/membros'),
          fetch('http://localhost:3001/punicoes') // Nova requisição
        ]);

        if (resTarefas.ok && resMembros.ok && resPunicoes.ok) {
          const dadosTarefas = await resTarefas.json();
          const dadosMembros = await resMembros.json();
          const dadosPunicoes = await resPunicoes.json();

          setTarefas(dadosTarefas);
          
          // Conta apenas os moradores reais e ativos para a estatística
          const ativos = dadosMembros.filter(m => 
            m.status?.toLowerCase() === 'ativo' && 
            m.hierarquia !== 'Agregado' && 
            m.hierarquia !== 'Ex_morador'
          );
          setMembrosAtivos(ativos.length);

          // Filtra as punições para contar apenas as do usuário logado
          const punicoesDoUsuario = dadosPunicoes.filter(p => p.membro_id === USUARIO_LOGADO_ID);
          setMinhasPunicoes(punicoesDoUsuario.length);
        }
      } catch (erro) {
        console.error("Erro ao buscar dados do Dashboard:", erro);
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, []);

  // --- REGRA DE EXIBIÇÃO DAS TAREFAS ---
  // Filtra apenas as tarefas criadas pelo usuário logado OU atribuídas a ele
  const minhasTarefas = tarefas.filter(tarefa => {
    const souCriador = tarefa.criador_id === USUARIO_LOGADO_ID;
    const souResponsavel = tarefa.tarefas_responsaveis?.some(tr => tr.membro_id === USUARIO_LOGADO_ID);
    return souCriador || souResponsavel;
  });

  // Conta quantas das MINHAS tarefas estão pendentes, em andamento ou atrasadas
  const minhasTarefasPendentes = minhasTarefas.filter(t => 
    t.status === 'Pendente' || t.status === 'Em_Andamento' || t.status === 'Em andamento' || t.status === 'Atrasada'
  ).length;

  // Formatação de data específica para o card reduzido do Dashboard (Ex: "15/Jul")
  const formatarDataCurta = (dataIso) => {
    if (!dataIso) return 'Sem data';
    const data = new Date(dataIso);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    
    // Verifica se a data é hoje
    const hoje = new Date();
    if (data.toDateString() === hoje.toDateString()) return 'Hoje';

    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('. de', '').replace('.', '');
  };

  // Formatação do status para remover underlines na tela
  const formatarStatus = (status) => {
    if (status === 'Conclu_da' || status === 'Concluida') return 'Concluída';
    return status.replace('_', ' ');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400">Carregando painel...</div>;
  }

  return (
    <div className="space-y-8 h-full">
      
      {/* Seção Superior: Resumo da Casa */}
      <section className="bg-gray-900/30 border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col">
        <h2 className="text-xl font-bold text-gray-100 mb-6 tracking-tight">Resumo da Casa</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
          <StatCard 
            title="Moradores Ativos" 
            value={membrosAtivos.toString()} 
            icon={Users} 
            color="purple" 
            onClick={() => setActiveTab('membros')} 
          />
          <StatCard 
            title="Minhas Pendências" 
            value={minhasTarefasPendentes.toString()} 
            icon={ClipboardList} 
            color="yellow" 
            onClick={() => setActiveTab('tarefas')} 
          />
          <StatCard 
            title="Minhas Punições" 
            value={minhasPunicoes.toString()} 
            icon={AlertTriangle} 
            color="red" 
            onClick={() => setActiveTab('punicoes')} 
          />
          {/* Valor estático até criarmos o módulo de Empréstimos */}
          <StatCard 
            title="Itens Emprestados" 
            value="0" 
            icon={ArrowRightLeft} 
            color="purple" 
            onClick={() => setActiveTab('emprestimos')} 
          />
        </div>
      </section>

      {/* Seção Inferior: Área de Tarefas Deitadas */}
      <section className="bg-gray-900/30 border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col h-full max-h-[600px]">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-xl text-gray-100 tracking-tight">Minhas Tarefas Recentes</h3>
          <button onClick={() => setActiveTab('tarefas')} className="ml-auto text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium">
            Ver todas
          </button>
        </div>
        
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {minhasTarefas.length > 0 ? (
            minhasTarefas.map((tarefa) => {
              const isUrgente = tarefa.status === 'Atrasada';
              
              // Extrai as siglas dos responsáveis (Ex: "RV", "CT") para os avatares redondos
              const siglas = tarefa.tarefas_responsaveis?.map(tr => 
                tr.membro?.apelido?.substring(0, 2).toUpperCase() || 'M'
              ) || [];

              return (
                <TaskCard 
                  key={tarefa.id}
                  title={tarefa.titulo} 
                  prazo={formatarDataCurta(tarefa.prazo)} 
                  responsaveis={siglas} 
                  urgente={isUrgente} 
                  status={formatarStatus(tarefa.status)} 
                />
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <ClipboardList className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">Você não possui tarefas recentes.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}