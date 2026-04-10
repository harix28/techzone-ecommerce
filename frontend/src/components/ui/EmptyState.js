export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  tone = 'default',
  className = '',
}) {
  const toneClass =
    tone === 'rose'
      ? 'bg-rose-50 text-rose-500'
      : tone === 'blue'
        ? 'bg-blue-50 text-blue-600'
        : 'bg-slate-100 text-slate-500';

  return (
    <div className={`mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 ${className}`}>
      {Icon ? (
        <div className={`mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full ${toneClass}`}>
          <Icon size={28} />
        </div>
      ) : null}
      <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-slate-950">{title}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">{description}</p>
      {(action || secondaryAction) ? (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
