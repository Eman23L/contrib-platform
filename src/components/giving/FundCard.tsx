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
        "group w-full rounded-[1.35rem] border px-4 py-4 text-left transition duration-200 sm:px-5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ca982] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        isSelected
          ? "border-[#8fb996] bg-[#f3faf2] text-slate-950 shadow-[0_16px_40px_rgba(124,169,130,0.18)]"
          : "border-slate-200/80 bg-white/90 text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-[#b7d9bd] hover:bg-[#fbfefb] hover:shadow-[0_14px_34px_rgba(45,64,55,0.08)]",
      ].join(" ")}
      onClick={() => onSelect(fund.id)}
      type="button"
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className={[
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
                isSelected
                  ? "border-[#6f9f77] bg-[#7ca982]"
                  : "border-slate-300 bg-white group-hover:border-[#9fc7a6]",
              ].join(" ")}
              aria-hidden="true"
            >
              {isSelected ? (
                <span className="h-2 w-2 rounded-full bg-white" />
              ) : null}
            </span>
            <div className="min-w-0 break-words text-base font-semibold leading-6">
              {fund.name}
            </div>
          </div>
          <p
            className={[
              "mt-2 break-words pl-8 text-sm leading-6",
              isSelected ? "text-slate-700" : "text-slate-600",
            ].join(" ")}
          >
            {fund.description ?? "General giving fund"}
          </p>
        </div>
        {fund.isDefault ? (
          <span
            className={[
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
              isSelected
                ? "bg-white text-[#5f7f66] shadow-sm"
                : "bg-[#eff7f0] text-[#5f7f66]",
            ].join(" ")}
          >
            Suggested
          </span>
        ) : null}
      </div>
    </button>
  );
}
