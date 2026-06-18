import { QuickAmounts } from "@/components/giving/QuickAmounts";

type AmountPickerProps = {
  currencyCode: string;
  quickAmounts: number[];
  selectedAmount: number | null;
  customAmount: string;
  onSelectAmount: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
};

function getCurrencyPrefix(currencyCode: string) {
  return currencyCode === "GBP" ? "GBP" : currencyCode;
}

export function AmountPicker({
  currencyCode,
  quickAmounts,
  selectedAmount,
  customAmount,
  onSelectAmount,
  onCustomAmountChange,
}: AmountPickerProps) {
  return (
    <div className="space-y-4">
      <QuickAmounts
        amounts={quickAmounts}
        currencyCode={currencyCode}
        onSelectAmount={onSelectAmount}
        selectedAmount={selectedAmount}
      />
      <label className="block">
        <span className="gf-label">
          Or enter another amount
        </span>
        <div className="flex min-h-16 items-center overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white shadow-sm transition focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15">
          <span className="px-4 text-sm font-semibold text-slate-500 sm:text-base">
            {getCurrencyPrefix(currencyCode)}
          </span>
          <input
            className="w-full border-0 bg-transparent px-0 py-4 pr-4 text-lg text-slate-950 outline-none placeholder:text-slate-400"
            inputMode="decimal"
            min="1"
            onChange={(event) => onCustomAmountChange(event.target.value)}
            placeholder="Amount"
            type="number"
            value={customAmount}
          />
        </div>
      </label>
    </div>
  );
}
