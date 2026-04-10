export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'between',
  className = '',
}) {
  const layoutClass =
    align === 'start'
      ? 'items-start'
      : 'items-end justify-between';

  return (
    <div className={`flex flex-wrap gap-4 ${layoutClass} ${className}`}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="section-kicker">{eyebrow}</p>
        ) : null}
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.2rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
