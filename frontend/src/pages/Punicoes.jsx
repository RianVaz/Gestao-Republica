import { useState, useEffect } from 'react';
import { Search, Plus, X, AlertTriangle, Calendar, User, FileText, Trash2, Edit } from 'lucide-react';
import PunicoesTable from '../components/PunicoesTable'; // <-- Importação do novo componente

export default function Punicoes() {
  const [punicoes, setPunicoes] = useState([]);
  const [membros, setMembros] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [atualizarLista, setAtualizarLista] = useState(0);

  // --- ESTADO DA BARRA DE PESQUISA ---
  const [termoBusca, setTermoBusca] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [punicaoSelecionada, setPunicaoSelecionada] = useState(null);
  const [modalView, setModalView] = useState('view'); 

  const [formData, setFormData] = useState({
    membro_id: '',
    tarefa_id: '',
    motivo: '',
    data_aplicacao: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resPunicoes, resMembros, resTarefas] = await Promise.all([
          fetch('http://localhost:3001/punicoes'),
          fetch('http://localhost:3001/membros'),
          fetch('http://localhost:3001/tarefas')
        ]);

        if (!resPunicoes.ok || !resMembros.ok || !resTarefas.ok) {
          throw new Error('Falha ao buscar os dados do servidor.');
        }

        const dadosPunicoes = await resPunicoes.json();
        const dadosMembros = await resMembros.json();
        const dadosTarefas = await resTarefas.json();

        setPunicoes(dadosPunicoes);
        setMembros(dadosMembros); 
        setTarefas(dadosTarefas);
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, [atualizarLista]);

  // Funções para resgatar os nomes reais cruzando os IDs
  const getMembroNome = (id) => membros.find(m => m.id === id)?.apelido || `Membro ID ${id}`;
  const getTarefaNome = (id) => tarefas.find(t => t.id === id)?.titulo || `Tarefa ID ${id}`;

  // --- LÓGICA DE FILTRAGEM PELA BARRA DE PESQUISA ---
  const punicoesFiltradas = punicoes.filter((punicao) => {
    if (!termoBusca) return true;
    
    const termo = termoBusca.toLowerCase();
    const matchMotivo = punicao.motivo?.toLowerCase().includes(termo);
    
    // Busca também pelo apelido/nome do morador usando a função getMembroNome
    const nomeMorador = getMembroNome(punicao.membro_id).toLowerCase();
    const matchMorador = nomeMorador.includes(termo);

    return matchMotivo || matchMorador;
  });

  // --- REGRAS DE EXIBIÇÃO E ORDENAÇÃO ---
  // Agora ordena as punições FILTRADAS
  const punicoesOrdenadas = [...punicoesFiltradas].sort((a, b) => new Date(b.data_aplicacao) - new Date(a.data_aplicacao));

  const membrosAtivos = membros.filter(m => 
    m.status?.toLowerCase() === 'ativo' && m.hierarquia !== 'Agregado' && m.hierarquia !== 'Ex_morador'
  );

  const rankingPunicoes = membrosAtivos.map(membro => {
    const total = punicoes.filter(p => p.membro_id === membro.id).length;
    return { ...membro, totalPunicoes: total };
  })
  .filter(m => m.totalPunicoes > 0)
  .sort((a, b) => b.totalPunicoes - a.totalPunicoes);

  const membrosParaFormulario = membros.filter(m => 
    (m.status?.toLowerCase() === 'ativo' && m.hierarquia !== 'Agregado' && m.hierarquia !== 'Ex_morador') ||
    (modalView === 'edit' && punicaoSelecionada && m.id === punicaoSelecionada.membro_id)
  );

  const formatarDataCompleta = (dataIso) => {
    if (!dataIso) return 'Sem data definida';
    const data = new Date(dataIso);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
  };

  const formatarDataInput = (dataIso) => {
    if (!dataIso) return '';
    return dataIso.split('T')[0];
  };

  // --- NAVEGAÇÃO DO MODAL ---
  const handleOpenView = (punicao) => {
    setPunicaoSelecionada(punicao);
    setModalView('view');
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormData({
      membro_id: membrosAtivos.length > 0 ? membrosAtivos[0].id.toString() : '',
      tarefa_id: '',
      motivo: '',
      data_aplicacao: new Date().toISOString().split('T')[0]
    });
    setModalView('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    setFormData({
      membro_id: punicaoSelecionada.membro_id?.toString() || '',
      tarefa_id: punicaoSelecionada.tarefa_id?.toString() || '',
      motivo: punicaoSelecionada.motivo,
      data_aplicacao: formatarDataInput(punicaoSelecionada.data_aplicacao)
    });
    setModalView('edit');
  };

  // --- REQUISIÇÕES AO BACKEND ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = modalView === 'edit';
    const url = isEditing 
      ? `http://localhost:3001/punicoes/${punicaoSelecionada.id}` 
      : 'http://localhost:3001/punicoes';

    const payload = {
      membro_id: parseInt(formData.membro_id),
      motivo: formData.motivo,
      data_aplicacao: new Date(formData.data_aplicacao).toISOString()
    };

    if (formData.tarefa_id) payload.tarefa_id = parseInt(formData.tarefa_id);
    else payload.tarefa_id = null;

    try {
      const resposta = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) throw new Error('Erro ao salvar a punição.');

      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja perdoar/apagar esta punição?')) return;

    try {
      const resposta = await fetch(`http://localhost:3001/punicoes/${punicaoSelecionada.id}`, { method: 'DELETE' });
      if (!resposta.ok) throw new Error('Erro ao deletar a punição.');
      
      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Carregando punições...</div>;
  if (erro) return <div className="flex items-center justify-center h-full text-red-400">{erro}</div>;

  return (
    <div className="space-y-6 h-full flex flex-col pb-8">
      
      {/* Barra de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/30 border border-gray-800 rounded-3xl p-4 md:px-6 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por morador ou motivo..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)} // Vincula a busca aqui
            className="w-full bg-gray-900 border border-gray-700 text-sm rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-red-500 text-gray-200" 
          />
        </div>
        <button onClick={handleOpenCreate} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-red-600/20">
          <Plus className="w-5 h-5" /> Nova Punição
        </button>
      </div>

      {/* Alerta de busca sem resultados */}
      {termoBusca && punicoesFiltradas.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nenhuma punição encontrada para "{termoBusca}".
        </div>
      )}

      {/* Mural de Punições por Morador */}
      {rankingPunicoes.length > 0 && (
        <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-5 shrink-0 overflow-x-auto custom-scrollbar">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Total de Punições por Morador
          </h3>
          <div className="flex gap-4 min-w-max">
            {rankingPunicoes.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-gray-800/50 border border-red-500/20 rounded-2xl p-3 pr-6 hover:bg-gray-800 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-black text-lg border border-red-500/20 shadow-sm">
                  {m.totalPunicoes}
                </div>
                <div>
                  <p className="font-bold text-gray-200">{m.apelido}</p>
                  <p className="text-[10px] uppercase text-gray-500 font-medium">Punições</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista / Tabela de Punições EXTRAÍDA */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-3xl overflow-hidden shadow-sm flex-1 flex flex-col">
        <PunicoesTable 
          data={punicoesOrdenadas} 
          onView={handleOpenView} 
          formatarData={formatarDataCompleta}
          getMembroNome={getMembroNome}
          getTarefaNome={getTarefaNome}
        />
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
              <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {modalView === 'view' && 'Detalhes da Punição'}
                {modalView === 'create' && 'Registrar Punição'}
                {modalView === 'edit' && 'Editar Punição'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              {/* VISUALIZAÇÃO */}
              {modalView === 'view' && punicaoSelecionada && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><User className="w-4 h-4"/> Morador</span>
                      <p className="text-gray-200 font-bold text-lg text-red-400">{getMembroNome(punicaoSelecionada.membro_id)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Data da Aplicação</span>
                      <p className="text-gray-200">{formatarDataCompleta(punicaoSelecionada.data_aplicacao)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-800/50 pt-4">
                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><FileText className="w-4 h-4"/> Motivo da Punição</span>
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-gray-300 text-sm leading-relaxed">
                      {punicaoSelecionada.motivo}
                    </div>
                  </div>

                  {punicaoSelecionada.tarefa_id && (
                    <div className="space-y-2 border-t border-gray-800/50 pt-4">
                      <span className="text-sm font-medium text-gray-500">Tarefa Geradora (Atraso)</span>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-gray-300 text-sm">
                        {getTarefaNome(punicaoSelecionada.tarefa_id)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CRIAÇÃO E EDIÇÃO */}
              {(modalView === 'create' || modalView === 'edit') && (
                <form id="punicaoForm" onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Infrator *</label>
                    <select required name="membro_id" value={formData.membro_id} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-gray-200 appearance-none">
                      <option value="" disabled>Selecione um morador...</option>
                      {membrosParaFormulario.map(m => (
                        <option key={m.id} value={m.id}>{m.apelido} ({m.nome_completo})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Data da Punição *</label>
                    <input required name="data_aplicacao" value={formData.data_aplicacao} onChange={handleInputChange} type="date" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-gray-200" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Motivo *</label>
                    <textarea required name="motivo" value={formData.motivo} onChange={handleInputChange} rows="3" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-gray-200 resize-none" placeholder="Descreva a infração..."></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Vincular a uma Tarefa Atrasada? (Opcional)</label>
                    <select name="tarefa_id" value={formData.tarefa_id} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-gray-200 appearance-none">
                      <option value="">Nenhuma tarefa / Outro motivo</option>
                      {tarefas.map(t => (
                        <option key={t.id} value={t.id}>[ID {t.id}] - {t.titulo}</option>
                      ))}
                    </select>
                  </div>
                </form>
              )}
            </div>

            {/* FOOTER DO MODAL */}
            <div className="p-6 border-t border-gray-800 bg-gray-900/50 shrink-0 flex justify-end gap-3">
              {modalView === 'view' && (
                <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 transition-colors mr-auto">
                  <Trash2 className="w-4 h-4" /> Perdoar Punição
                </button>
              )}

              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:bg-gray-800 transition-colors">
                {modalView === 'view' ? 'Fechar' : 'Cancelar'}
              </button>
              
              {modalView === 'view' && (
                <button onClick={handleOpenEdit} className="px-5 py-2.5 rounded-xl font-medium bg-gray-800 hover:bg-gray-700 text-white transition-colors border border-gray-700">
                  <Edit className="w-4 h-4 inline mr-2" /> Editar
                </button>
              )}
              {(modalView === 'create' || modalView === 'edit') && (
                <button type="submit" form="punicaoForm" className="px-5 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-500 text-white transition-colors shadow-lg shadow-red-600/20">
                  {modalView === 'create' ? 'Aplicar Punição' : 'Atualizar'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}