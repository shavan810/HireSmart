const TONES = {
  blue: 'bg-blue-50 text-blue-600',
  navy: 'bg-navy-50 text-navy-700',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-600',
  slate: 'bg-slate-100 text-slate-600',
};

export default function DashboardStats({ items, columns = 'sm:grid-cols-2 xl:grid-cols-4' }) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {items.map(({ label, value, icon: Icon, tone = 'blue', hint }) => (
        <div key={label} className="card flex items-center gap-4 p-5">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-extrabold text-navy-800">{value}</p>
            {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
