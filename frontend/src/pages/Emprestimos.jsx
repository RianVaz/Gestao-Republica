import { useState, useEffect } from 'react';
import { Search, Plus, X, ArrowRightLeft, Calendar, User, CheckCircle, AlertTriangle, Trash2, Edit, Package } from 'lucide-react';
import EmprestimosTable from '../components/EmprestimosTable';
import { useAuth } from '../contexts/AuthContext';

export default function Emprestimos() {
  const { usuario } = useAuth();
  const USUARIO_LOGADO_ID = usuario.id;
  const [emprestimos, setEmprestimos] = useState([]);
  const [itens, setItens] = useState([]);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [atualizarLista, setAtualizarLista] = useState(0);

  // --- ESTADO DA BARRA DE PESQUISA ---
  const [termoBusca, setTermoBusca] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);
  const [modalView, setModalView] = useState('view'); // 'view', 'create', 'edit'

  const [formData, setFormData] = useState({
    item_id: '',
    membro_autorizador_id: USUARIO_LOGADO_ID.toString(),
    responsavel_externo: '',
    previsao_devolucao: ''
  });

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resEmprestimos, resItens, resMembros] = await Promise.all([
          fetch('http://localhost:3001/emprestimos'),
          fetch('http://localhost:3001/itens'),
          fetch('http://localhost:3001/membros')
        ]);

        if (!resEmprestimos.ok || !resItens.ok || !resMembros.ok) {
          throw new Error('Falha ao buscar os dados do servidor.');
        }

        const dadosEmprestimos = await resEmprestimos.json();
        const dadosItens = await resItens.json();
        const dadosMembros = await resMembros.json();

        // Ordenar dos mais recentes (data_saida) para os mais antigos
        const emprestimosOrdenados = dadosEmprestimos.sort((a, b) => new Date(b.data_saida) - new Date(a.data_saida));

        setEmprestimos(emprestimosOrdenados);
        setItens(dadosItens);
        setMembros(dadosMembros);
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };
    buscarDados();
  }, [atualizarLista]);

  // --- FILTROS E FUNÇÕES AUXILIARES ---
  const membrosAtivos = membros.filter(m => 
    m.status?.toLowerCase() === 'ativo' && m.hierarquia !== 'Agregado' && m.hierarquia !== 'Ex_morador'
  );

  const itensDisponiveis = itens.filter(i => 
    i.status === 'Dispon_vel' || i.status === 'Disponível'
  );

  const formatarDataCompleta = (dataIso) => {
    if (!dataIso) return '-';
    const data = new Date(dataIso);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
  };

  const formatarDataInput = (dataIso) => {
    if (!dataIso) return '';
    return dataIso.split('T')[0];
  };

  const getItemNome = (id) => itens.find(i => i.id === id)?.nome || `Item ID ${id}`;
  const getMembroNome = (id) => membros.find(m => m.id === id)?.apelido || `Membro ID ${id}`;

  const isAtrasado = (emp) => {
    if (emp.data_devolucao || !emp.previsao_devolucao) return false;
    const previsao = new Date(emp.previsao_devolucao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return previsao < hoje;
  };

  // --- LÓGICA DE FILTRAGEM PELA BARRA DE PESQUISA ---
  const emprestimosFiltrados = emprestimos.filter((emp) => {
    if (!termoBusca) return true;

    const termo = termoBusca.toLowerCase();
    const matchResponsavel = emp.responsavel_externo?.toLowerCase().includes(termo);
    const matchItem = getItemNome(emp.item_id).toLowerCase().includes(termo);
    const matchMorador = getMembroNome(emp.membro_autorizador_id).toLowerCase().includes(termo);

    return matchResponsavel || matchItem || matchMorador;
  });

  // --- NAVEGAÇÃO DO MODAL ---
  const handleOpenView = (emprestimo) => {
    setEmprestimoSelecionado(emprestimo);
    setModalView('view');
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormData({
      item_id: itensDisponiveis.length > 0 ? itensDisponiveis[0].id.toString() : '',
      membro_autorizador_id: USUARIO_LOGADO_ID.toString(),
      responsavel_externo: '',
      previsao_devolucao: ''
    });
    setModalView('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    setFormData({
      item_id: emprestimoSelecionado.item_id?.toString() || '',
      membro_autorizador_id: emprestimoSelecionado.membro_autorizador_id?.toString() || '',
      responsavel_externo: emprestimoSelecionado.responsavel_externo,
      previsao_devolucao: formatarDataInput(emprestimoSelecionado.previsao_devolucao)
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
      ? `http://localhost:3001/emprestimos/${emprestimoSelecionado.id}` 
      : 'http://localhost:3001/emprestimos';

    const payload = {
      membro_autorizador_id: parseInt(formData.membro_autorizador_id),
      responsavel_externo: formData.responsavel_externo,
    };

    if (!isEditing) {
      payload.item_id = parseInt(formData.item_id);
    }

    if (formData.previsao_devolucao) {
      payload.previsao_devolucao = new Date(formData.previsao_devolucao).toISOString();
    }

    try {
      const resposta = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        const erroReq = await resposta.json();
        throw new Error(erroReq.erro || 'Erro ao salvar o empréstimo.');
      }

      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDevolver = async () => {
    if (!window.confirm('Confirmar o recebimento deste item?')) return;

    try {
      const payload = { data_devolucao: new Date().toISOString() };
      const resposta = await fetch(`http://localhost:3001/emprestimos/${emprestimoSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) throw new Error('Erro ao registrar devolução.');
      
      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja apagar o registro deste empréstimo?')) return;

    try {
      const resposta = await fetch(`http://localhost:3001/emprestimos/${emprestimoSelecionado.id}`, { method: 'DELETE' });
      if (!resposta.ok) throw new Error('Erro ao deletar registro.');
      
      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  // --- RESUMO PARA OS CARDS DO TOPO (Usa a lista total, sem filtro) ---
  const ativos = emprestimos.filter(e => !e.data_devolucao).length;
  const atrasados = emprestimos.filter(e => isAtrasado(e)).length;
  const concluidos = emprestimos.filter(e => e.data_devolucao).length;

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Carregando empréstimos...</div>;
  if (erro) return <div className="flex items-center justify-center h-full text-red-400">{erro}</div>;

  return (
    <div className="space-y-6 h-full flex flex-col pb-8">
      
      {/* Resumo Rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total de Registros</span>
          <span className="text-2xl font-black text-gray-200 mt-1">{emprestimos.length}</span>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-blue-500/70 text-xs font-bold uppercase tracking-wider">Ativos (Emprestados)</span>
          <span className="text-2xl font-black text-blue-400 mt-1">{ativos}</span>
        </div>
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-red-500/70 text-xs font-bold uppercase tracking-wider">Atrasados</span>
          <span className="text-2xl font-black text-red-400 mt-1">{atrasados}</span>
        </div>
        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-green-500/70 text-xs font-bold uppercase tracking-wider">Devolvidos</span>
          <span className="text-2xl font-black text-green-400 mt-1">{concluidos}</span>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/30 border border-gray-800 rounded-3xl p-4 md:px-6 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por item, responsável ou morador..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)} 
            className="w-full bg-gray-900 border border-gray-700 text-sm rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 text-gray-200" 
          />
        </div>
        <button onClick={handleOpenCreate} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20">
          <Plus className="w-5 h-5" /> Novo Empréstimo
        </button>
      </div>

      {/* Alerta de busca sem resultados */}
      {termoBusca && emprestimosFiltrados.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nenhum empréstimo encontrado para "{termoBusca}".
        </div>
      )}

      {/* Tabela */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-3xl overflow-hidden shadow-sm flex-1 flex flex-col">
        <EmprestimosTable 
          data={emprestimosFiltrados} 
          onView={handleOpenView} 
          formatarData={formatarDataCompleta}
          getItemNome={getItemNome}
          getMembroNome={getMembroNome}
        />
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
              <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                {modalView === 'view' && 'Detalhes do Empréstimo'}
                {modalView === 'create' && 'Registrar Saída'}
                {modalView === 'edit' && 'Editar Empréstimo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              {/* VISUALIZAÇÃO */}
              {modalView === 'view' && emprestimoSelecionado && (
                <div className="space-y-6">
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl shrink-0">
                      <Package className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Item Emprestado</span>
                      <h4 className="text-lg font-bold text-gray-100 mt-0.5">{getItemNome(emprestimoSelecionado.item_id)}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><User className="w-4 h-4"/> Autorizado por</span>
                      <p className="text-gray-200 font-medium">{getMembroNome(emprestimoSelecionado.membro_autorizador_id)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><User className="w-4 h-4 text-blue-400"/> Responsável (Externo)</span>
                      <p className="text-gray-200 font-bold text-blue-400">{emprestimoSelecionado.responsavel_externo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-800/50">
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Data de Saída</span>
                      <p className="text-gray-200 font-medium">{formatarDataCompleta(emprestimoSelecionado.data_saida)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        {emprestimoSelecionado.data_devolucao ? <CheckCircle className="w-4 h-4 text-green-500"/> : <AlertTriangle className="w-4 h-4 text-yellow-500"/>} 
                        {emprestimoSelecionado.data_devolucao ? 'Devolvido em' : 'Previsão de Retorno'}
                      </span>
                      <p className="text-gray-200 font-medium">
                        {emprestimoSelecionado.data_devolucao 
                          ? formatarDataCompleta(emprestimoSelecionado.data_devolucao) 
                          : formatarDataCompleta(emprestimoSelecionado.previsao_devolucao)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CRIAÇÃO E EDIÇÃO */}
              {(modalView === 'create' || modalView === 'edit') && (
                <form id="emprestimoForm" onSubmit={handleSubmit} className="space-y-5">
                  
                  {modalView === 'create' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Item a ser emprestado *</label>
                      <select required name="item_id" value={formData.item_id} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-200 appearance-none">
                        {itensDisponiveis.length === 0 && <option value="" disabled>Nenhum item disponível no momento.</option>}
                        {itensDisponiveis.map(i => (
                          <option key={i.id} value={i.id}>{i.nome}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-sm text-gray-300">
                      <span className="block text-gray-500 text-xs mb-1">Item vinculado (Não editável)</span>
                      {getItemNome(emprestimoSelecionado?.item_id)}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Morador Autorizador *</label>
                    <select required name="membro_autorizador_id" value={formData.membro_autorizador_id} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-200 appearance-none">
                      <option value="" disabled>Selecione quem autorizou...</option>
                      {membrosAtivos.map(m => (
                        <option key={m.id} value={m.id}>{m.apelido} ({m.nome_completo})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Pessoa/República que pegou emprestado *</label>
                    <input required name="responsavel_externo" value={formData.responsavel_externo} onChange={handleInputChange} type="text" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-200" placeholder="Ex: João da República X" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Previsão de Devolução (Opcional)</label>
                    <input name="previsao_devolucao" value={formData.previsao_devolucao} onChange={handleInputChange} type="date" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-200" />
                  </div>
                </form>
              )}
            </div>

            {/* FOOTER DO MODAL */}
            <div className="p-6 border-t border-gray-800 bg-gray-900/50 shrink-0 flex justify-end gap-3 items-center">
              
              {/* Botão para Devolver Item (Disponível na Visualização se não estiver devolvido) */}
              {modalView === 'view' && !emprestimoSelecionado?.data_devolucao && (
                <button onClick={handleDevolver} className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 transition-colors mr-auto">
                  <CheckCircle className="w-4 h-4" /> Marcar Devolvido
                </button>
              )}

              {/* Botão de Excluir Registro */}
              {modalView === 'view' && emprestimoSelecionado?.data_devolucao && (
                <button onClick={handleDelete} className="p-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors mr-auto">
                  <Trash2 className="w-5 h-5" />
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
                <button type="submit" form="emprestimoForm" className="px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/20">
                  {modalView === 'create' ? 'Registrar Saída' : 'Salvar Alterações'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}