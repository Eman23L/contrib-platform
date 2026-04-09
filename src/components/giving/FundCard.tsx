import type { PublicFund } from "@/types/domain";

type FundCardProps = {
  fund: PublicFund;
  isSelected: boolean;
  onSelect: (fundId: string) => void;
};

export function FundCard({ fund, isSelected, onSelect }: FundCardProps) {
  return (
    <button
      className={[
        "w-full rounded-2xl border px-4 py-4 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        isSelected
          ? "border-accent bg-accent text-white shadow-lg"
          : "border-black/10 bg-white text-ink hover:border-accent/40 hover:bg-accentSoft/30",
      ].join(" ")}
      onClick={() => onSelect(fund.id)}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{fund.name}</div>
          <p
            className={[
              "mt-1 text-sm leading-6",
              isSelected ? "text-white/85" : "text-black/65",
            ].join(" ")}
          >
            {fund.description ?? "General giving fund"}
          </p>
        </div>
        {fund.isDefault ? (
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
              isSelected ? "bg-white/20 text-white" : "bg-accentSoft text-accent",
            ].join(" ")}
          >
            Default
          </span>
        ) : null}
      </div>
    </button>
  );
}
