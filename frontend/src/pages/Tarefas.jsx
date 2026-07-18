import { useState, useEffect } from 'react';
import { Search, Plus, X, AlignLeft, Clock, Users, CalendarCheck, User, Trash2 } from 'lucide-react';
import KanbanCard from '../components/KanbanCard';

// SIMULAÇÃO DE LOGIN: Coloque aqui o ID do usuário que está usando o sistema no momento.
// Apenas tarefas criadas por este ID poderão ser editadas e apagadas.
const USUARIO_LOGADO_ID = 2; 

export default function Tarefas() {
  const [tarefas, setTarefas] = useState([]);
  const [membros, setMembros] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [atualizarLista, setAtualizarLista] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [modalView, setModalView] = useState('view'); // 'view', 'create', 'edit'

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prazo: '',
    status: 'Pendente',
    responsaveis: [] // Array de IDs
  });

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resTarefas, resMembros] = await Promise.all([
          fetch('http://localhost:3001/tarefas'),
          fetch('http://localhost:3001/membros')
        ]);

        if (!resTarefas.ok || !resMembros.ok) throw new Error('Falha ao buscar os dados.');
        
        const dadosTarefas = await resTarefas.json();
        const dadosMembros = await resMembros.json();
        
        setTarefas(dadosTarefas);
        // Filtramos apenas membros ativos, excluindo agregados e ex-moradores
        setMembros(dadosMembros.filter(m => 
          m.status?.toLowerCase() === 'ativo' && 
          m.hierarquia !== 'Agregado' && 
          m.hierarquia !== 'Ex_morador'
        ));
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, [atualizarLista]);

  // Divisão das colunas baseada nos Enums corretos do banco
  const pendentes = tarefas.filter(t => t.status === 'Pendente');
  const emAndamento = tarefas.filter(t => t.status === 'Em_Andamento' || t.status === 'Em andamento' || t.status === 'Em_andamento');
  const atrasadas = tarefas.filter(t => t.status === 'Atrasada');
  const concluidas = tarefas.filter(t => t.status === 'Conclu_da' || t.status === 'Concluída' || t.status === 'Concluida');

  const formatarDataCompleta = (dataIso) => {
    if (!dataIso) return 'Sem data definida';
    const data = new Date(dataIso);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatarDataInput = (dataIso) => {
    if (!dataIso) return '';
    return dataIso.split('T')[0];
  };

  // --- NAVEGAÇÃO DO MODAL ---
  const handleOpenView = (tarefa) => {
    setTarefaSelecionada(tarefa);
    setModalView('view');
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormData({
      titulo: '',
      descricao: '',
      prazo: '',
      status: 'Pendente',
      responsaveis: []
    });
    setModalView('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    setFormData({
      titulo: tarefaSelecionada.titulo,
      descricao: tarefaSelecionada.descricao || '',
      prazo: formatarDataInput(tarefaSelecionada.prazo),
      status: tarefaSelecionada.status,
      responsaveis: tarefaSelecionada.tarefas_responsaveis.map(tr => tr.membro_id.toString())
    });
    setModalView('edit');
  };

  // --- APAGAR TAREFA ---
  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja apagar esta tarefa? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const resposta = await fetch(`http://localhost:3001/tarefas/${tarefaSelecionada.id}`, {
        method: 'DELETE',
      });

      if (!resposta.ok) {
        const erroReq = await resposta.json();
        throw new Error(erroReq.erro || 'Erro ao deletar a tarefa.');
      }

      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- DRAG AND DROP (ARRASTAR E SOLTAR) ---
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('tarefaId', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, novoStatus) => {
    e.preventDefault();
    const tarefaId = e.dataTransfer.getData('tarefaId');
    if (!tarefaId) return;

    // Atualização otimista (muda na tela na mesma hora, antes do banco responder)
    setTarefas(prev => prev.map(t => 
      t.id === Number(tarefaId) ? { ...t, status: novoStatus } : t
    ));

    try {
      const payload = { status: novoStatus };
      if (novoStatus === 'Conclu_da' || novoStatus === 'Concluida') {
        payload.data_conclusao = new Date().toISOString();
      }

      await fetch(`http://localhost:3001/tarefas/${tarefaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      setAtualizarLista(prev => prev + 1);
    } catch {
      alert('Erro ao mover a tarefa.');
      setAtualizarLista(prev => prev + 1);
    }
  };

  // --- HANDLERS DO FORMULÁRIO ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResponsavelToggle = (membroId) => {
    const idStr = membroId.toString();
    setFormData(prev => {
      const isSelected = prev.responsaveis.includes(idStr);
      return {
        ...prev,
        responsaveis: isSelected 
          ? prev.responsaveis.filter(id => id !== idStr) 
          : [...prev.responsaveis, idStr]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = modalView === 'edit';
    const url = isEditing 
      ? `http://localhost:3001/tarefas/${tarefaSelecionada.id}` 
      : 'http://localhost:3001/tarefas';
    
    // O Prisma exige números para as relações
    const responsaveisNumeros = formData.responsaveis.map(id => Number(id));

    const payload = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      prazo: new Date(formData.prazo).toISOString(),
      status: formData.status,
      responsaveis: responsaveisNumeros
    };

    // Só envia o criador se for uma tarefa nova (Criação)
    if (!isEditing) {
      payload.criador_id = USUARIO_LOGADO_ID;
    }

    // Envia a data de conclusão se a tarefa foi finalizada pelo formulário
    if (formData.status === 'Conclu_da') {
      payload.data_conclusao = new Date().toISOString();
    }

    try {
      const resposta = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        const erroReq = await resposta.json();
        throw new Error(erroReq.erro || 'Erro ao salvar a tarefa no banco de dados.');
      }

      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1);
    } catch (err) {
      console.error("Erro completo:", err);
      alert(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Carregando...</div>;
  if (erro) return <div className="flex items-center justify-center h-full text-red-400">{erro}</div>;

  return (
    <div className="space-y-6 h-full flex flex-col pb-8">
      
      {/* Barra de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/30 border border-gray-800 rounded-3xl p-4 md:px-6 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Buscar tarefas..." className="w-full bg-gray-900 border border-gray-700 text-sm rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" />
        </div>
        <button onClick={handleOpenCreate} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-purple-600/20">
          <Plus className="w-5 h-5" /> Nova Tarefa
        </button>
      </div>

      {/* Quadro Kanban */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-w-[1000px] xl:min-w-0 h-full">
          
          {/* Coluna 1: Pendentes */}
          <div 
            className="bg-gray-900/20 rounded-2xl p-4 border border-gray-800/50 flex flex-col h-full transition-colors hover:bg-gray-800/30"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Pendente')}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-gray-300 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"></span>Pendente</h3>
              <span className="text-xs font-bold text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">{pendentes.length}</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {pendentes.map(t => <KanbanCard key={t.id} tarefa={t} onClick={handleOpenView} onDragStart={handleDragStart} />)}
            </div>
          </div>

          {/* Coluna 2: Em andamento */}
          <div 
            className="bg-gray-900/20 rounded-2xl p-4 border border-gray-800/50 flex flex-col h-full transition-colors hover:bg-gray-800/30"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Em_Andamento')}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-gray-300 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></span>Em andamento</h3>
              <span className="text-xs font-bold text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">{emAndamento.length}</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {emAndamento.map(t => <KanbanCard key={t.id} tarefa={t} onClick={handleOpenView} onDragStart={handleDragStart} />)}
            </div>
          </div>

          {/* Coluna 3: Atrasadas */}
          <div 
            className="bg-gray-900/20 rounded-2xl p-4 border border-gray-800/50 flex flex-col h-full transition-colors hover:bg-gray-800/30"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Atrasada')}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-gray-300 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>Atrasada</h3>
              <span className="text-xs font-bold text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">{atrasadas.length}</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {atrasadas.map(t => <KanbanCard key={t.id} tarefa={t} onClick={handleOpenView} onDragStart={handleDragStart} />)}
            </div>
          </div>

          {/* Coluna 4: Concluídas */}
          <div 
            className="bg-gray-900/20 rounded-2xl p-4 border border-gray-800/50 flex flex-col h-full transition-colors hover:bg-gray-800/30"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'Conclu_da')}
          >
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-gray-300 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>Concluída</h3>
              <span className="text-xs font-bold text-gray-500 bg-gray-800 px-2.5 py-1 rounded-full">{concluidas.length}</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {concluidas.map(t => <KanbanCard key={t.id} tarefa={t} onClick={handleOpenView} onDragStart={handleDragStart} />)}
            </div>
          </div>

        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
              <h3 className="text-xl font-bold text-gray-100 pr-4">
                {modalView === 'view' && tarefaSelecionada?.titulo}
                {modalView === 'create' && 'Criar Nova Tarefa'}
                {modalView === 'edit' && 'Editar Tarefa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              {/* TELA DE VISUALIZAÇÃO */}
              {modalView === 'view' && tarefaSelecionada && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4"/> Prazo Final</span>
                      <p className="text-gray-200 capitalize">{formatarDataCompleta(tarefaSelecionada.prazo)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><CalendarCheck className="w-4 h-4"/> Status Atual</span>
                      <span className="inline-block px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm font-semibold">
                        {tarefaSelecionada.status === 'Conclu_da' || tarefaSelecionada.status === 'Concluida' ? 'Concluída' : tarefaSelecionada.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Exibição dos Responsáveis e Criador */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800/50">
                    <div className="space-y-3">
                       <h4 className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                        <Users className="w-4 h-4" /> Responsáveis
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tarefaSelecionada.tarefas_responsaveis?.map((tr, idx) => (
                          <span key={idx} className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-lg text-sm">
                            {tr.membro?.apelido || `Membro ${tr.membro_id}`}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                       <h4 className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                        <User className="w-4 h-4" /> Criada por
                      </h4>
                      <div className="flex items-center gap-2 text-gray-300 font-medium">
                        {/* Utilizando a nomenclatura exata do Prisma para puxar o apelido do criador */}
                        {tarefaSelecionada.membros_tarefas_criador_idTomembros?.apelido || `ID ${tarefaSelecionada.criador_id}`}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-gray-800/50 pt-6">
                    <h4 className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                      <AlignLeft className="w-4 h-4" /> Descrição
                    </h4>
                    <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {tarefaSelecionada.descricao || 'Nenhuma descrição fornecida.'}
                    </div>
                  </div>
                </div>
              )}

              {/* TELA DE CRIAÇÃO / EDIÇÃO */}
              {(modalView === 'create' || modalView === 'edit') && (
                <form id="taskForm" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Título da Tarefa *</label>
                    <input required name="titulo" value={formData.titulo} onChange={handleInputChange} type="text" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" placeholder="Ex: Limpar a geladeira" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Prazo *</label>
                      <input required name="prazo" value={formData.prazo} onChange={handleInputChange} type="date" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
                      <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200 appearance-none">
                        <option value="Pendente">Pendente</option>
                        <option value="Em_Andamento">Em andamento</option>
                        <option value="Atrasada">Atrasada</option>
                        <option value="Conclu_da">Concluída</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Responsáveis *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-800/30 p-3 rounded-xl border border-gray-700/50 max-h-40 overflow-y-auto custom-scrollbar">
                      {membros.map(membro => (
                        <div 
                          key={membro.id} 
                          onClick={() => handleResponsavelToggle(membro.id)} 
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.responsaveis.includes(membro.id.toString()) ? 'bg-purple-500 border-purple-500' : 'border-gray-500 group-hover:border-purple-400'}`}>
                            {formData.responsaveis.includes(membro.id.toString()) && <span className="w-2 h-2 bg-white rounded-sm"></span>}
                          </div>
                          <span className="text-sm text-gray-300 group-hover:text-gray-100">{membro.apelido}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Descrição</label>
                    <textarea name="descricao" value={formData.descricao} onChange={handleInputChange} rows="4" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200 resize-none" placeholder="Detalhes da tarefa..."></textarea>
                  </div>
                </form>
              )}

            </div>

            {/* --- FOOTER DO MODAL --- */}
            <div className="p-6 border-t border-gray-800 bg-gray-900/50 shrink-0 flex justify-end gap-3">
              
              {/* Botão de Apagar (Aparece apenas para o criador e na aba de visualização) */}
              {modalView === 'view' && tarefaSelecionada?.criador_id === USUARIO_LOGADO_ID && (
                <button 
                  onClick={handleDelete} 
                  className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/50 transition-colors mr-auto"
                >
                  <Trash2 className="w-4 h-4" /> Apagar
                </button>
              )}

              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:bg-gray-800 transition-colors">
                {modalView === 'view' ? 'Fechar' : 'Cancelar'}
              </button>
              
              {/* Botão Dinâmico (Editar ou Salvar) */}
              {modalView === 'view' && tarefaSelecionada?.criador_id === USUARIO_LOGADO_ID && (
                <button onClick={handleOpenEdit} className="px-5 py-2.5 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-lg shadow-purple-600/20">
                  Editar Tarefa
                </button>
              )}
              {(modalView === 'create' || modalView === 'edit') && (
                <button type="submit" form="taskForm" className="px-5 py-2.5 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-lg shadow-purple-600/20">
                  {modalView === 'create' ? 'Salvar Tarefa' : 'Atualizar Tarefa'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}