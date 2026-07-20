// src/components/EmprestimosTable.jsx
import { Info, ArrowRightLeft } from 'lucide-react';

export default function EmprestimosTable({ data, onView, formatarData, getItemNome, getMembroNome }) {
  
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 text-gray-500">
        <ArrowRightLeft className="w-16 h-16 mb-4 opacity-20 text-blue-500" />
        <p className="text-lg font-medium text-gray-400">Nenhum empréstimo registrado.</p>
        <p className="text-sm">Todos os itens estão na república!</p>
      </div>
    );
  }

  // Função interna para determinar o status e a cor da tag
  const getStatusInfo = (emprestimo) => {
    if (emprestimo.data_devolucao) {
      return { label: 'Devolvido', color: 'text-green-400 bg-green-500/10 border-green-500/20' };
    }
    
    if (emprestimo.previsao_devolucao) {
      const previsao = new Date(emprestimo.previsao_devolucao);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (previsao < hoje) {
        return { label: 'Atrasado', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
      }
    }

    return { label: 'Ativo', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
  };

  return (
    <div className="overflow-x-auto custom-scrollbar flex-1">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-gray-900/50 text-gray-500 border-b border-gray-800">
          <tr>
            <th className="px-6 py-5 font-semibold">Item</th>
            <th className="px-6 py-5 font-semibold">Resp. Externo</th>
            <th className="px-6 py-5 font-semibold">Autorizado por</th>
            <th className="px-6 py-5 font-semibold">Saída</th>
            <th className="px-6 py-5 font-semibold">Status</th>
            <th className="px-6 py-5 font-semibold text-right">Detalhes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {data.map((emp) => {
            const status = getStatusInfo(emp);
            return (
              <tr key={emp.id} onClick={() => onView(emp)} className="hover:bg-gray-800/40 transition-colors group cursor-pointer">
                <td className="px-6 py-4 font-medium text-gray-200 truncate max-w-[150px]">
                  {getItemNome(emp.item_id)}
                </td>
                <td className="px-6 py-4 font-medium text-blue-400">
                  {emp.responsavel_externo}
                </td>
                <td className="px-6 py-4">
                  {getMembroNome(emp.membro_autorizador_id)}
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {formatarData(emp.data_saida)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-500 group-hover:text-blue-400 group-hover:bg-blue-500/10 rounded-xl transition-all">
                    <Info className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}