import { useState, useEffect } from 'react';
import { Search, Plus, X, Box, Edit, Trash2, Calendar, ClipboardList } from 'lucide-react';
import InventarioTable from '../components/InventarioTable';

export default function Inventario() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [atualizarLista, setAtualizarLista] = useState(0);

  // --- ESTADO DA BARRA DE PESQUISA ---
  const [termoBusca, setTermoBusca] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [modalView, setModalView] = useState('view'); // 'view', 'create', 'edit'

  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'Eventos', // Valor default
    status: 'Dispon_vel', 
    estado_conservacao: '',
    data_aquisicao: ''
  });

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const resposta = await fetch('http://localhost:3001/itens');
        if (!resposta.ok) throw new Error('Falha ao buscar os itens do inventário.');
        const dados = await resposta.json();
        setItens(dados);
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };
    buscarDados();
  }, [atualizarLista]);

  // --- TRADUTORES DE ENUM ---
  const formatarEnum = (valor) => {
    const dicionario = {
      'Dispon_vel': 'Disponível',
      'Emprestado': 'Emprestado',
      'Em_Manuten__o': 'Em Manutenção',
      'Descartado': 'Descartado',
      'M_veis': 'Móveis',
      'Eletrodom_sticos': 'Eletrodomésticos',
      'Eventos': 'Eventos',
      'Ferramentas': 'Ferramentas',
      'Estudos': 'Estudos'
    };
    return dicionario[valor] || valor;
  };

  // --- LÓGICA DE FILTRAGEM PELA BARRA DE PESQUISA ---
  const itensFiltrados = itens.filter((item) => {
    if (!termoBusca) return true;
    
    const termo = termoBusca.toLowerCase();
    const matchNome = item.nome?.toLowerCase().includes(termo);
    const matchCategoria = formatarEnum(item.categoria).toLowerCase().includes(termo);

    return matchNome || matchCategoria;
  });

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

  // --- NAVEGAÇÃO DO MODAL ---
  const handleOpenView = (item) => {
    setItemSelecionado(item);
    setModalView('view');
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setFormData({
      nome: '',
      categoria: 'M_veis',
      status: 'Dispon_vel',
      estado_conservacao: '',
      data_aquisicao: ''
    });
    setModalView('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    setFormData({
      nome: itemSelecionado.nome,
      categoria: itemSelecionado.categoria,
      status: itemSelecionado.status,
      estado_conservacao: itemSelecionado.estado_conservacao || '',
      data_aquisicao: formatarDataInput(itemSelecionado.data_aquisicao)
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
      ? `http://localhost:3001/itens/${itemSelecionado.id}` 
      : 'http://localhost:3001/itens';

    const payload = {
      nome: formData.nome,
      categoria: formData.categoria,
      status: formData.status,
      estado_conservacao: formData.estado_conservacao,
    };

    if (formData.data_aquisicao) {
      payload.data_aquisicao = new Date(formData.data_aquisicao).toISOString();
    }

    try {
      const resposta = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        const erroReq = await resposta.json();
        throw new Error(erroReq.erro || 'Erro ao salvar o item.');
      }

      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja remover este item permanentemente?')) return;

    try {
      const resposta = await fetch(`http://localhost:3001/itens/${itemSelecionado.id}`, { method: 'DELETE' });
      if (!resposta.ok) throw new Error('Erro ao deletar o item.');
      
      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  // Resumo para as "cartinhas" do topo (Mantém com base no total de itens, não no filtro)
  const disponiveis = itens.filter(i => i.status === 'Dispon_vel').length;
  const emprestados = itens.filter(i => i.status === 'Emprestado').length;
  const emManutencao = itens.filter(i => i.status === 'Em_Manuten__o').length;

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Carregando inventário...</div>;
  if (erro) return <div className="flex items-center justify-center h-full text-red-400">{erro}</div>;

  return (
    <div className="space-y-6 h-full flex flex-col pb-8">
      
      {/* Resumo Rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total de Itens</span>
          <span className="text-2xl font-black text-gray-200 mt-1">{itens.length}</span>
        </div>
        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-green-500/70 text-xs font-bold uppercase tracking-wider">Disponíveis</span>
          <span className="text-2xl font-black text-green-400 mt-1">{disponiveis}</span>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-blue-500/70 text-xs font-bold uppercase tracking-wider">Emprestados</span>
          <span className="text-2xl font-black text-blue-400 mt-1">{emprestados}</span>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 flex flex-col justify-center">
          <span className="text-yellow-500/70 text-xs font-bold uppercase tracking-wider">Em Manutenção</span>
          <span className="text-2xl font-black text-yellow-400 mt-1">{emManutencao}</span>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/30 border border-gray-800 rounded-3xl p-4 md:px-6 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou categoria..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)} // Vincula a busca aqui
            className="w-full bg-gray-900 border border-gray-700 text-sm rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" 
          />
        </div>
        <button onClick={handleOpenCreate} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-purple-600/20">
          <Plus className="w-5 h-5" /> Adicionar Item
        </button>
      </div>

      {/* Alerta de busca sem resultados */}
      {termoBusca && itensFiltrados.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nenhum item encontrado para "{termoBusca}".
        </div>
      )}

      {/* Lista / Tabela */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-3xl overflow-hidden shadow-sm flex-1 flex flex-col">
        <InventarioTable 
          data={itensFiltrados} 
          onView={handleOpenView} 
          formatarData={formatarDataCompleta}
          formatarEnum={formatarEnum}
        />
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
              <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <Box className="w-5 h-5 text-purple-500" />
                {modalView === 'view' && 'Detalhes do Item'}
                {modalView === 'create' && 'Adicionar Novo Item'}
                {modalView === 'edit' && 'Editar Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              
              {/* VISUALIZAÇÃO */}
              {modalView === 'view' && itemSelecionado && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">{itemSelecionado.nome}</h2>
                    <div className="flex gap-2">
                      <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-sm font-semibold border border-gray-700">
                        {formatarEnum(itemSelecionado.categoria)}
                      </span>
                      <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-sm font-semibold border border-purple-500/20">
                        {formatarEnum(itemSelecionado.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-800/50">
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Aquisição</span>
                      <p className="text-gray-200 font-medium">{formatarDataCompleta(itemSelecionado.data_aquisicao)}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2"><ClipboardList className="w-4 h-4"/> ID do Sistema</span>
                      <p className="text-gray-400 font-mono">#{itemSelecionado.id}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-800/50 pt-4">
                    <span className="text-sm font-medium text-gray-500">Estado de Conservação / Observações</span>
                    <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 text-gray-300 text-sm leading-relaxed min-h-[80px]">
                      {itemSelecionado.estado_conservacao || 'Nenhuma observação registrada.'}
                    </div>
                  </div>
                </div>
              )}

              {/* CRIAÇÃO E EDIÇÃO */}
              {(modalView === 'create' || modalView === 'edit') && (
                <form id="inventarioForm" onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Nome do Item *</label>
                    <input required name="nome" value={formData.nome} onChange={handleInputChange} type="text" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" placeholder="Ex: Furadeira" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Categoria *</label>
                      <select required name="categoria" value={formData.categoria} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200 appearance-none">
                        <option value="M_veis">Móveis</option>
                        <option value="Eletrodom_sticos">Eletrodomésticos</option>
                        <option value="Eventos">Eventos</option>
                        <option value="Ferramentas">Ferramentas</option>
                        <option value="Estudos">Estudos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Status *</label>
                      <select required name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200 appearance-none">
                        <option value="Dispon_vel">Disponível</option>
                        <option value="Emprestado">Emprestado</option>
                        <option value="Em_Manuten__o">Em Manutenção</option>
                        <option value="Descartado">Descartado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Data de Aquisição (Opcional)</label>
                    <input name="data_aquisicao" value={formData.data_aquisicao} onChange={handleInputChange} type="date" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Estado de Conservação (Opcional)</label>
                    <textarea name="estado_conservacao" value={formData.estado_conservacao} onChange={handleInputChange} rows="3" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200 resize-none" placeholder="Ex: Possui um risco na lateral, mas funciona perfeitamente."></textarea>
                  </div>
                </form>
              )}
            </div>

            {/* FOOTER DO MODAL */}
            <div className="p-6 border-t border-gray-800 bg-gray-900/50 shrink-0 flex justify-end gap-3">
              {modalView === 'view' && (
                <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors mr-auto">
                  <Trash2 className="w-4 h-4" /> Excluir
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
                <button type="submit" form="inventarioForm" className="px-5 py-2.5 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-lg shadow-purple-600/20">
                  {modalView === 'create' ? 'Adicionar Item' : 'Salvar Alterações'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}