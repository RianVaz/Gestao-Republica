export default function KanbanCard({ tarefa, onClick, onDragStart, getMembroNome }) {
  const status = tarefa.status || 'Pendente';

  const getStatusStyle = () => {
    switch(status) {
      case 'Em_Andamento':
      case 'Em andamento': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Atrasada': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Conclu_da':
      case 'Concluida':
      case 'Concluída': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const formatarData = (dataIso) => {
    if (!dataIso) return 'Sem data';
    const data = new Date(dataIso);
    data.setMinutes(data.getMinutes() + data.getTimezoneOffset());
    return data.toLocaleDateString('pt-BR');
  };

  const isUrgente = status === 'Atrasada';

  // Usa a função getMembroNome se ela existir, senão usa o fallback antigo
  const siglasResponsaveis = tarefa.tarefas_responsaveis && tarefa.tarefas_responsaveis.length > 0
    ? tarefa.tarefas_responsaveis.map((tr, index) => {
        const nomeReal = getMembroNome ? getMembroNome(tr.membro_id) : (tr.membro?.apelido || `M${index + 1}`);
        return nomeReal.substring(0, 2).toUpperCase();
      })
    : [];

return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, tarefa.id)}
      onClick={() => onClick(tarefa)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(147,51,234,0.1)] transition-all flex flex-col gap-3 group relative overflow-hidden active:cursor-grabbing"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isUrgente ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-transparent group-hover:bg-purple-500/50'}`}></div>

      <div className="pl-1 space-y-3">
        <div className="flex flex-col items-start gap-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border whitespace-nowrap ${getStatusStyle()}`}>
            {status === 'Conclu_da' || status === 'Concluida' ? 'Concluída' : status.replace('_', ' ')}
          </span>
          <p className="text-sm font-medium text-gray-200 group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
            {tarefa.titulo}
          </p>
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-gray-800/80">
          <div className="whitespace-nowrap">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Prazo</p>
            <p className={`text-xs font-semibold ${isUrgente ? 'text-red-400' : 'text-gray-300'}`}>
              {formatarData(tarefa.prazo)}
            </p>
          </div>

          <div className="flex -space-x-2.5 flex-shrink-0">
            {siglasResponsaveis.length > 0 ? siglasResponsaveis.map((sigla, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-300 transition-transform group-hover:scale-105 shadow-sm" style={{zIndex: siglasResponsaveis.length - i}}>
                {sigla}
              </div>
            )) : (
              <div className="w-7 h-7 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-600">
                --
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}