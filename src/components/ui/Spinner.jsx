export default function Spinner({ size = 16, className = '' }) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-border-em border-t-transparent animate-spin ${className}`}
      style={{ width: size, height: size, animationDuration: '0.7s' }}
      role="status"
      aria-label="Loading"
    />
  );
}
