export default function StoreLogo({
  light = false,
  compact = false,
  tagline = 'Electronics, faster',
  className = '',
}) {
  const iconShell = light
    ? 'bg-white text-[#2874f0] shadow-[0_8px_24px_rgba(15,23,42,0.16)]'
    : 'bg-[linear-gradient(135deg,#0f56d9,#2874f0_58%,#4791ff)] text-white shadow-[0_10px_24px_rgba(40,116,240,0.24)]';
  const headingClass = light ? 'text-white' : 'text-slate-950';
  const tagClass = light ? 'text-blue-100/80' : 'text-slate-500';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${iconShell}`}>
        <span className="text-sm font-extrabold tracking-[-0.08em]">TZ</span>
        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#ffb400]" />
      </div>
      {!compact ? (
        <div className="min-w-0">
          <span className={`block text-xl font-extrabold tracking-[-0.04em] ${headingClass}`}>
            TechZone
          </span>
          <span className={`block text-[11px] font-semibold uppercase tracking-[0.24em] ${tagClass}`}>
            {tagline}
          </span>
        </div>
      ) : null}
    </div>
  );
}
