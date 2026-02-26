function ListCard({ title, children, icon: Icon }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-700 shadow-lg">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-700">
        <Icon className="text-white text-xl" />
        <h3 className="text-white text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-700 hover:border-zinc-500 transition-all duration-300 shadow-lg hover:shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center shadow-lg border border-zinc-600">
          <Icon className="text-white text-xl" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-zinc-400 text-sm font-medium">{label}</p>
        <p className="text-3xl text-white font-bold">{value}</p>
      </div>
    </div>
  );
}

export { ListCard, StatCard };
