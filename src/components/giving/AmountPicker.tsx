import { QuickAmounts } from "@/components/giving/QuickAmounts";

type AmountPickerProps = {
  currencyCode: string;
  quickAmounts: number[];
  selectedAmount: number | null;
  customAmount: string;
  onSelectAmount: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
};

export function AmountPicker({
  currencyCode,
  quickAmounts,
  selectedAmount,
  customAmount,
  onSelectAmount,
  onCustomAmountChange,
}: AmountPickerProps) {
  return (
    <div className="space-y-3">
      <QuickAmounts
        amounts={quickAmounts}
        currencyCode={currencyCode}
        onSelectAmount={onSelectAmount}
        selectedAmount={selectedAmount}
      />
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-black/70">
          Custom amount
        </span>
        <div className="flex items-center overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <span className="px-4 text-lg font-semibold text-black/55">
            {currencyCode === "GBP" ? "£" : currencyCode}
          </span>
          <input
            className="w-full border-0 bg-transparent px-0 py-4 pr-4 text-lg text-ink outline-none placeholder:text-black/35"
            inputMode="decimal"
            min="1"
            onChange={(event) => onCustomAmountChange(event.target.value)}
            placeholder="Enter amount"
            type="number"
            value={customAmount}
          />
        </div>
      </label>
    </div>
  );
}
