export default function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-3.5 py-[10px] border-b border-border">
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="skeleton h-3" style={{ width: c === 0 ? '18%' : `${100 / cols}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
