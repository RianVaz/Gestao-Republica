import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function PunicoesTable({ 
  data, 
  onView, 
  formatarData, 
  getMembroNome, 
  getTarefaNome 
}) {
  
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 text-gray-500">
        <CheckCircle className="w-16 h-16 mb-4 opacity-20 text-green-500" />
        <p className="text-lg font-medium text-gray-400">Nenhuma punição registrada.</p>
        <p className="text-sm">A república está em paz!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-gray-900/50 text-gray-500 border-b border-gray-800">
          <tr>
            <th className="px-6 py-5 font-semibold">Data</th>
            <th className="px-6 py-5 font-semibold">Morador</th>
            <th className="px-6 py-5 font-semibold">Motivo</th>
            <th className="px-6 py-5 font-semibold">Tarefa Relacionada</th>
            <th className="px-6 py-5 font-semibold text-right">Detalhes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {data.map((p) => (
            <tr key={p.id} onClick={() => onView(p)} className="hover:bg-gray-800/40 transition-colors group cursor-pointer">
              <td className="px-6 py-4 font-medium text-gray-300">
                {formatarData(p.data_aplicacao)}
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20">
                  {getMembroNome(p.membro_id)}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-300 truncate max-w-xs">{p.motivo}</td>
              <td className="px-6 py-4 text-gray-500 text-xs">
                {p.tarefa_id ? (
                   <span className="truncate block max-w-xs">{getTarefaNome(p.tarefa_id)}</span>
                ) : (
                  <span className="opacity-50">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-gray-500 group-hover:text-red-400 group-hover:bg-red-500/10 rounded-xl transition-all">
                  <AlertTriangle className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}