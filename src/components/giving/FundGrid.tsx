import { FundCard } from "@/components/giving/FundCard";
import type { PublicFund } from "@/types/domain";

type FundGridProps = {
  funds: PublicFund[];
  selectedFundId: string | null;
  onSelectFund: (fundId: string) => void;
};

export function FundGrid({
  funds,
  selectedFundId,
  onSelectFund,
}: FundGridProps) {
  return (
    <div className="grid gap-3">
      {funds.map((fund) => (
        <FundCard
          fund={fund}
          isSelected={fund.id === selectedFundId}
          key={fund.id}
          onSelect={onSelectFund}
        />
      ))}
    </div>
  );
}
