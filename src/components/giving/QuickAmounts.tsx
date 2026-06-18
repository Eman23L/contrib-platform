type QuickAmountsProps = {
  amounts: number[];
  selectedAmount: number | null;
  onSelectAmount: (amount: number) => void;
  currencyCode: string;
};

function formatAmount(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function QuickAmounts({
  amounts,
  selectedAmount,
  onSelectAmount,
  currencyCode,
}: QuickAmountsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {amounts.map((amount) => {
        const isSelected = selectedAmount === amount;

        return (
          <button
            className={[
              "min-h-14 rounded-[1.15rem] border px-4 py-4 text-base font-semibold transition duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ca982] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              isSelected
                ? "border-[#7ca982] bg-[#7ca982] text-white shadow-[0_12px_28px_rgba(124,169,130,0.28)]"
                : "border-slate-200/80 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-[#b7d9bd] hover:bg-[#fbfefb]",
            ].join(" ")}
            key={amount}
            onClick={() => onSelectAmount(amount)}
            type="button"
          >
            {formatAmount(amount, currencyCode)}
          </button>
        );
      })}
    </div>
  );
}
