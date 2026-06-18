type AdminStatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <article className="gf-card p-5">
      <p className="text-sm font-medium text-[#5f7f66]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="gf-helper mt-2">{hint}</p> : null}
    </article>
  );
}
