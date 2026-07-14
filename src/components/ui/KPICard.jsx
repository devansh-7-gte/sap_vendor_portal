export default function KPICard({ label, value, delta, sub, icon: Icon, className = '' }) {
  return (
    <div className={`metric-panel animate-fadeUp ${className}`}>
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {Icon && <Icon className="size-4 text-text-tertiary" />}
      </div>
      <span className="text-2xl font-bold tabular-nums text-text-primary">{value}</span>
      {(delta || sub) && (
        <div className="flex items-center gap-1.5 mt-0.5">
          {delta && <span className="text-[11px] font-semibold text-emerald-text">{delta}</span>}
          {sub && <span className="text-[11px] text-text-tertiary">{sub}</span>}
        </div>
      )}
    </div>
  );
}
