export default function TaskCard({ title, prazo, responsaveis, urgente, status = 'Pendente' }) {
  
  const getStatusStyle = () => {
    switch(status) {
      case 'Em Andamento': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Atrasada': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-800 border-gray-700'; // Pendente
    }
  };

  return (
    // Mudamos pra flex-row e items-center pra alinhar tudo em uma linha horizontal
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(147,51,234,0.1)] transition-all flex items-center gap-4 group">
      
      {/* Indicador visual de urgência na lateral esquerda */}
      <div className={`w-1 h-10 rounded-full flex-shrink-0 ${urgente ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-gray-700'}`}></div>

      {/* Bloco 1: Título e Status tag (Esquerda) */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <p className="text-sm font-medium text-gray-200 group-hover:text-purple-400 transition-colors truncate">{title}</p>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border whitespace-nowrap flex-shrink-0 ${getStatusStyle()}`}>
          {status}
        </span>
      </div>

      {/* Bloco 2: Prazo (Centro, com separador visual) */}
      <div className="text-right whitespace-nowrap px-4 border-l border-gray-800">
        <p className="text-xs text-gray-500">Prazo</p>
        <p className={`text-sm font-semibold ${urgente ? 'text-red-400' : 'text-gray-300'}`}>{prazo}</p>
      </div>

      {/* Bloco 3: Avatares dos Responsáveis (Direita) */}
      <div className="flex -space-x-2.5 flex-shrink-0">
        {responsaveis.map((sigla, i) => (
          <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[11px] font-bold text-gray-300 transition-transform group-hover:scale-105" style={{zIndex: responsaveis.length - i}}>
            {sigla}
          </div>
        ))}
      </div>
    </div>
  );
}