export default function EmptyState({ icon: Icon, title = 'No data', description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {Icon && <Icon className="size-8 text-text-tertiary mb-3" />}
      <p className="text-[13px] font-semibold text-text-primary">{title}</p>
      {description && <p className="text-[12px] text-text-tertiary mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
