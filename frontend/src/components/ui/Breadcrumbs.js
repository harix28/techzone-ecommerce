import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export default function Breadcrumbs({ items = [], className = '' }) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-2 text-sm text-slate-500 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link to={item.href} className="transition hover:text-slate-900">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-slate-900' : ''}>{item.label}</span>
            )}
            {!isLast ? <FiChevronRight size={14} className="text-slate-300" /> : null}
          </span>
        );
      })}
    </nav>
  );
}
