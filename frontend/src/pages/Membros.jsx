import { useState, useEffect } from 'react';
import { Search, Plus, X, Edit, UserMinus, Shield, ArrowLeft } from 'lucide-react';
import MembrosTable from '../components/MembrosTable';

export default function Membros() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  
  const [atualizarLista, setAtualizarLista] = useState(0);

  // --- ESTADO DA BARRA DE PESQUISA ---
  const [termoBusca, setTermoBusca] = useState('');

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState(null);
  const [modalView, setModalView] = useState('menu'); // 'menu', 'edit', 'hierarchy', 'status'

  // Estado geral de formulário
  const [formData, setFormData] = useState({
    apelido: '',
    nome_completo: '',
    telefone: '',
    email: '',
    curso: '',
    hierarquia: 'Bixo',
    data_entrada: new Date().toISOString().split('T')[0]
  });

  // Estados temporários para as telas rápidas
  const [tempHierarquia, setTempHierarquia] = useState('Bixo');
  const [tempStatusConfig, setTempStatusConfig] = useState({
    status: 'Inativo',
    hierarquia: 'Ex_morador',
    data_saida: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const buscarMembros = async () => {
      try {
        const resposta = await fetch('http://localhost:3001/membros');
        if (!resposta.ok) throw new Error('Falha ao buscar os dados do servidor.');
        const dados = await resposta.json();
        setMembros(dados);
      } catch (err) {
        setErro(err.message);
      } finally {
        setLoading(false);
      }
    };

    buscarMembros();
  }, [atualizarLista]); 

  // --- LÓGICA DE FILTRAGEM PELA BARRA DE PESQUISA ---
  const membrosFiltrados = membros.filter((membro) => {
    if (!termoBusca) return true;
    
    const termo = termoBusca.toLowerCase();
    const matchApelido = membro.apelido?.toLowerCase().includes(termo);
    const matchNome = membro.nome_completo?.toLowerCase().includes(termo);
    const matchCurso = membro.curso?.toLowerCase().includes(termo);

    return matchApelido || matchNome || matchCurso;
  });

  // Agora as listas separadas pegam de "membrosFiltrados" ao invés de "membros"
  const ativos = membrosFiltrados.filter(m => m.status === 'Ativo' && m.hierarquia !== 'Agregado' && m.hierarquia !== 'Ex_morador');
  const agregados = membrosFiltrados.filter(m => m.hierarquia === 'Agregado');
  const exMoradores = membrosFiltrados.filter(m => m.hierarquia === 'Ex_morador');
  const inativos = membrosFiltrados.filter(m => m.status !== 'Ativo' && m.hierarquia !== 'Ex_morador' && m.hierarquia !== 'Agregado');

  const handleOpenAcoes = (membro) => {
    setMembroSelecionado(membro);
    setModalView('menu'); // Abre sempre no menu principal
    setIsModalOpen(true);
  };

  const handleOpenNovo = () => {
    setMembroSelecionado(null);
    setFormData({
      apelido: '',
      nome_completo: '',
      telefone: '',
      email: '',
      curso: '',
      hierarquia: 'Bixo',
      data_entrada: new Date().toISOString().split('T')[0]
    });
    setModalView('create'); // Abre direto no form de criação
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // NAVEGAÇÃO INTERNA DO MODAL
  const handleGoToEdit = () => {
    setFormData({
      apelido: membroSelecionado.apelido,
      nome_completo: membroSelecionado.nome_completo,
      telefone: membroSelecionado.telefone || '',
      email: membroSelecionado.email || '',
      curso: membroSelecionado.curso || '',
      hierarquia: membroSelecionado.hierarquia,
      data_entrada: membroSelecionado.data_entrada ? membroSelecionado.data_entrada.split('T')[0] : ''
    });
    setModalView('edit');
  };

  const handleGoToHierarchy = () => {
    setTempHierarquia(membroSelecionado.hierarquia);
    setModalView('hierarchy');
  };

  const handleGoToStatus = () => {
    setTempStatusConfig({
      status: 'Inativo',
      hierarquia: membroSelecionado.hierarquia === 'Agregado' ? 'Agregado' : 'Ex_morador',
      data_saida: new Date().toISOString().split('T')[0]
    });
    setModalView('status');
  };

  // REQUISIÇÕES AO BACKEND
  const handleSubmitNovoMembro = async (e) => {
    e.preventDefault();
    const payload = { ...formData, data_entrada: new Date(formData.data_entrada).toISOString() };

    try {
      const resposta = await fetch('http://localhost:3001/membros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resposta.ok) throw new Error('Erro ao salvar.');
      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1); 
    } catch {
      alert('Falha ao salvar o membro.');
    }
  };

  const handleUpdateMembro = async (payload) => {
    try {
      const resposta = await fetch(`http://localhost:3001/membros/${membroSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resposta.ok) throw new Error('Erro ao atualizar.');
      setIsModalOpen(false);
      setAtualizarLista(prev => prev + 1); 
    } catch {
      alert('Falha ao atualizar o membro.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400">Carregando membros...</div>;
  if (erro) return <div className="flex items-center justify-center h-full text-red-400">{erro}</div>;

  return (
    <div className="space-y-8 h-full pb-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/30 border border-gray-800 rounded-3xl p-4 md:px-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar por apelido, nome ou curso..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)} // Atualiza o estado da busca
            className="w-full bg-gray-900 border border-gray-700 text-sm rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-gray-200 placeholder-gray-500" 
          />
        </div>
        <button onClick={handleOpenNovo} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-purple-600/20">
          <Plus className="w-5 h-5" /> Novo Membro
        </button>
      </div>

      {ativos.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-100 mb-4 tracking-tight px-2">Moradores Ativos</h2>
          <MembrosTable data={ativos} onAcoes={handleOpenAcoes} />
        </section>
      )}

      {agregados.length > 0 && (
        <section className="pt-2">
          <h2 className="text-xl font-bold text-gray-300 mb-4 tracking-tight px-2">Agregados</h2>
          <MembrosTable data={agregados} onAcoes={handleOpenAcoes} />
        </section>
      )}

      {exMoradores.length > 0 && (
        <section className="pt-6">
          <h2 className="text-xl font-bold text-gray-200 mb-4 tracking-tight px-2">Ex-moradores</h2>
          <MembrosTable data={exMoradores} onAcoes={handleOpenAcoes} />
        </section>
      )}

      {inativos.length > 0 && (
        <section className="pt-6">
          <h2 className="text-xl font-bold text-gray-500 mb-4 tracking-tight px-2">Moradores Inativos</h2>
          <MembrosTable data={inativos} onAcoes={handleOpenAcoes} />
        </section>
      )}

      {/* Caso a busca não retorne ninguém */}
      {termoBusca && membrosFiltrados.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Nenhum membro encontrado para "{termoBusca}".
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Dinâmico do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                {/* Mostra botão de voltar se não estiver no menu principal ou na tela de criação */}
                {modalView !== 'menu' && modalView !== 'create' && (
                  <button onClick={() => setModalView('menu')} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h3 className="text-xl font-bold text-gray-100">
                  {modalView === 'menu' && `Ações: ${membroSelecionado?.apelido}`}
                  {modalView === 'create' && 'Cadastrar Novo Membro'}
                  {modalView === 'edit' && 'Editar Perfil'}
                  {modalView === 'hierarchy' && 'Alterar Hierarquia'}
                  {modalView === 'status' && 'Atualizar Status'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              
              {/* VIEW 1: Menu de Ações */}
              {modalView === 'menu' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 mb-6 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                     <div className="w-14 h-14 rounded-2xl bg-gray-700 flex items-center justify-center font-bold text-xl text-gray-300 border border-gray-600 shadow-sm">
                      {membroSelecionado.apelido.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-100 text-lg">{membroSelecionado.nome_completo}</p>
                      <p className="text-sm text-gray-400">{membroSelecionado.curso}</p>
                    </div>
                  </div>
                  <button onClick={handleGoToEdit} className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-purple-500/50 rounded-2xl transition-all group">
                    <div className="flex items-center gap-3 text-gray-200 group-hover:text-purple-400"><Edit className="w-5 h-5" /><span className="font-medium">Editar Perfil</span></div>
                  </button>
                  <button onClick={handleGoToHierarchy} className="w-full flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-blue-500/50 rounded-2xl transition-all group">
                    <div className="flex items-center gap-3 text-gray-200 group-hover:text-blue-400"><Shield className="w-5 h-5" /><span className="font-medium">Alterar Hierarquia</span></div>
                  </button>
                  <button onClick={handleGoToStatus} className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/50 rounded-2xl transition-all group">
                    <div className="flex items-center gap-3 text-red-400"><UserMinus className="w-5 h-5" /><span className="font-medium">Marcar como Inativo / Ex-morador</span></div>
                  </button>
                </div>
              )}

              {/* VIEW 2: Formulário (Criação ou Edição) */}
              {(modalView === 'create' || modalView === 'edit') && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const payload = { ...formData, data_entrada: new Date(formData.data_entrada).toISOString() };
                    modalView === 'create' ? handleSubmitNovoMembro(e) : handleUpdateMembro(payload);
                  }} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Apelido *</label>
                      <input required name="apelido" value={formData.apelido} onChange={handleInputChange} type="text" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" placeholder="Ex: Vanish" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Nome Completo *</label>
                      <input required name="nome_completo" value={formData.nome_completo} onChange={handleInputChange} type="text" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" placeholder="Digite o nome..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Telefone</label>
                      <input name="telefone" value={formData.telefone} onChange={handleInputChange} type="text" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">E-mail</label>
                      <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" placeholder="email@exemplo.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Curso</label>
                      <input name="curso" value={formData.curso} onChange={handleInputChange} type="text" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" placeholder="Ex: Engenharia..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Data de Entrada *</label>
                      <input required name="data_entrada" value={formData.data_entrada} onChange={handleInputChange} type="date" className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Hierarquia *</label>
                    <select name="hierarquia" value={formData.hierarquia} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 text-gray-200 appearance-none">
                      <option value="Bixo">Bixo</option>
                      <option value="Semi_bixo">Semi-bixo</option>
                      <option value="Morador">Morador</option>
                      <option value="Decano">Decano</option>
                      <option value="Agregado">Agregado</option>
                      <option value="Ex_morador">Ex-morador</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-purple-600/20">
                    {modalView === 'create' ? 'Salvar Novo Membro' : 'Salvar Alterações'}
                  </button>
                </form>
              )}

              {/* VIEW 3: Alterar Hierarquia */}
              {modalView === 'hierarchy' && (
                <div className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-blue-400 text-sm mb-4">
                    Atualize a hierarquia do(a) <strong>{membroSelecionado.apelido}</strong> na república.
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Nova Hierarquia</label>
                    <select value={tempHierarquia} onChange={(e) => setTempHierarquia(e.target.value)} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-200 appearance-none">
                      <option value="Bixo">Bixo</option>
                      <option value="Semi_bixo">Semi-bixo</option>
                      <option value="Morador">Morador</option>
                      <option value="Decano">Decano</option>
                      <option value="Agregado">Agregado</option>
                      <option value="Ex_morador">Ex-morador</option>
                    </select>
                  </div>
                  <button onClick={() => handleUpdateMembro({ hierarquia: tempHierarquia })} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20">
                    Confirmar Mudança
                  </button>
                </div>
              )}

              {/* VIEW 4: Alterar Status / Inativar */}
              {modalView === 'status' && (
                <div className="space-y-6">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm mb-4">
                    Ao inativar um membro, defina a data de saída para manter o histórico da república.
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Novo Status</label>
                      <select value={tempStatusConfig.status} onChange={(e) => setTempStatusConfig({...tempStatusConfig, status: e.target.value})} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-gray-200 appearance-none">
                        <option value="Inativo">Inativo</option>
                        <option value="Afastado">Afastado (Intercâmbio/Temporário)</option>
                        <option value="Ativo">Reativar Membro (Ativo)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1.5">Nova Hierarquia Automática</label>
                      <select value={tempStatusConfig.hierarquia} onChange={(e) => setTempStatusConfig({...tempStatusConfig, hierarquia: e.target.value})} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-gray-200 appearance-none">
                        <option value="Ex_morador">Tornar Ex-morador</option>
                        <option value="Agregado">Manter como Agregado</option>
                        <option value={membroSelecionado.hierarquia}>Manter hierarquia atual ({membroSelecionado.hierarquia.replace('_', '-')})</option>
                      </select>
                    </div>
                    {tempStatusConfig.status !== 'Ativo' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Data de Saída / Afastamento</label>
                        <input type="date" value={tempStatusConfig.data_saida} onChange={(e) => setTempStatusConfig({...tempStatusConfig, data_saida: e.target.value})} className="w-full bg-gray-800/50 border border-gray-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-gray-200" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleUpdateMembro({ 
                      status: tempStatusConfig.status, 
                      hierarquia: tempStatusConfig.hierarquia,
                      data_saida: tempStatusConfig.status !== 'Ativo' ? new Date(tempStatusConfig.data_saida).toISOString() : null
                    })} 
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-600/20"
                  >
                    Salvar Novo Status
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}