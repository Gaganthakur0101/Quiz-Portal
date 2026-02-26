
export default function StatCard({ label, value, icon: Icon, gradient, description }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
        >
          <Icon className="text-white text-xl" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-3xl text-white font-bold">{value}</p>
        {description && <p className="text-gray-500 text-xs">{description}</p>}
      </div>
    </div>
  );
}
