type AdminStatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-black/10 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-6 text-black/60">{hint}</p> : null}
    </article>
  );
}
