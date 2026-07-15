export default function StatCard({ title, value, icon: Icon, color, onClick }) {
  const colors = {
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 group-hover:bg-yellow-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20 group-hover:bg-red-500/20',
  };

  return (
    <div 
      onClick={onClick}
      // Mudamos para flex-row (horizontal), alinhamento ao centro e removemos o aspect-square
      className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer transition-all hover:bg-gray-800/80 hover:border-gray-700 flex items-center gap-5 shadow-sm"
    >
      {/* Bloco da Esquerda: Ícone Grande */}
      <div className={`p-4 rounded-2xl border transition-colors flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-8 h-8" />
      </div>
      
      {/* Bloco da Direita: Textos Alinhados à Esquerda */}
      <div className="flex flex-col text-left">
        <p className="text-3xl font-extrabold text-gray-100 tracking-tight leading-none mb-1">
          {value}
        </p>
        <h3 className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
          {title}
        </h3>
      </div>
    </div>
  );
}