import { MoreHorizontal } from 'lucide-react';

export default function MembrosTable({ data, onAcoes }) {
  const getHierarquiaStyle = (hierarquia) => {
    switch(hierarquia) {
      case 'Decano': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Morador': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Semi_bixo': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Bixo': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Agregado': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case 'Ex_morador': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="bg-gray-900/30 border border-gray-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900/50 text-gray-500 border-b border-gray-800">
            <tr>
              <th className="px-6 py-5 font-semibold">Membro</th>
              <th className="px-6 py-5 font-semibold">Curso</th>
              <th className="px-6 py-5 font-semibold">Hierarquia</th>
              <th className="px-6 py-5 font-semibold">Status</th>
              <th className="px-6 py-5 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {data.map((membro) => (
              <tr key={membro.id} className="hover:bg-gray-800/40 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center font-bold text-gray-300 border border-gray-700 shadow-sm group-hover:border-purple-500/30 transition-colors">
                      {membro.apelido.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-200 text-base">{membro.apelido}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{membro.nome_completo}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 font-medium">{membro.curso}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap ${getHierarquiaStyle(membro.hierarquia)}`}>
                    {membro.hierarquia.replace('_', '-')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${membro.status === 'Ativo' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${membro.status === 'Ativo' ? 'text-gray-300' : 'text-gray-500'}`}>
                      {membro.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onAcoes(membro)} className="p-2 text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}