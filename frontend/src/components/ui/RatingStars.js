import { FiStar } from 'react-icons/fi';

export default function RatingStars({
  rating = 0,
  count = 0,
  compact = false,
  showValue = true,
  className = '',
}) {
  const normalized = Number(rating || 0);

  return (
    <div className={`inline-flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} ${className}`}>
      <div className="flex items-center gap-1 text-amber-400">
        {Array.from({ length: 5 }).map((_, index) => {
          const active = index + 1 <= Math.round(normalized || 0);

          return (
            <FiStar
              key={index}
              className={active ? 'fill-current' : 'text-slate-300'}
              size={compact ? 12 : 14}
            />
          );
        })}
      </div>
      {showValue ? <span className="font-semibold text-slate-800">{normalized.toFixed(1)}</span> : null}
      <span className="text-slate-500">({count || 0})</span>
    </div>
  );
}
