export default function StatusBadge({ label, variant = 'info', className = '' }) {
  return (
    <span className={`status-badge status-badge-${variant} ${className}`}>
      {label}
    </span>
  );
}
