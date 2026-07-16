export default function EmptyState({ icon: Icon, title = 'No data', description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-10 px-4 m-3 rounded-xl border border-dashed border-border-em bg-surface2/30 ${className}`}>
      {Icon && (
        <div className="size-12 rounded-full bg-surface2 border border-border flex items-center justify-center mb-3">
          <Icon className="size-5 text-text-tertiary/70" />
        </div>
      )}
      <p className="text-[13px] font-semibold text-text-primary">{title}</p>
      {description && <p className="text-[11px] text-text-tertiary mt-1 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
