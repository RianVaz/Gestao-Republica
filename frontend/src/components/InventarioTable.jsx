import { Info, PackageX } from 'lucide-react';

export default function InventarioTable({ data, onView, formatarData, formatarEnum }) {
  
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 text-gray-500">
        <PackageX className="w-16 h-16 mb-4 opacity-20 text-purple-500" />
        <p className="text-lg font-medium text-gray-400">O inventário está vazio.</p>
        <p className="text-sm">Registre os itens e patrimônios da casa!</p>
      </div>
    );
  }

  // Define as cores das tags de status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Dispon_vel': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Emprestado': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Em_Manuten__o': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Descartado': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="overflow-x-auto custom-scrollbar flex-1">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="bg-gray-900/50 text-gray-500 border-b border-gray-800">
          <tr>
            <th className="px-6 py-5 font-semibold">Item</th>
            <th className="px-6 py-5 font-semibold">Categoria</th>
            <th className="px-6 py-5 font-semibold">Status</th>
            <th className="px-6 py-5 font-semibold">Conservação</th>
            <th className="px-6 py-5 font-semibold">Aquisição</th>
            <th className="px-6 py-5 font-semibold text-right">Detalhes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {data.map((item) => (
            <tr key={item.id} onClick={() => onView(item)} className="hover:bg-gray-800/40 transition-colors group cursor-pointer">
              <td className="px-6 py-4 font-medium text-gray-200">
                {item.nome}
              </td>
              <td className="px-6 py-4">
                {formatarEnum(item.categoria)}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${getStatusColor(item.status)}`}>
                  {formatarEnum(item.status)}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400 truncate max-w-[150px]">
                {item.estado_conservacao || '-'}
              </td>
              <td className="px-6 py-4 text-gray-500 text-xs">
                {formatarData(item.data_aquisicao)}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-gray-500 group-hover:text-purple-400 group-hover:bg-purple-500/10 rounded-xl transition-all">
                  <Info className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}