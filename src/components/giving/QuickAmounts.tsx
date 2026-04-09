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
              "rounded-2xl border px-4 py-4 text-base font-semibold transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              isSelected
                ? "border-accent bg-accent text-white"
                : "border-black/10 bg-white text-ink hover:border-accent/40 hover:bg-accentSoft/30",
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
