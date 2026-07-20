export default function Page({ title, action, children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h1 className="text-[22px] font-bold text-text-primary">{title}</h1>}
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
