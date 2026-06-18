type CheckoutRedirectButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
};

export function CheckoutRedirectButton({
  disabled = false,
  isLoading = false,
}: CheckoutRedirectButtonProps) {
  return (
    <button
      className="w-full rounded-[1.35rem] bg-[#6f9f77] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_36px_rgba(111,159,119,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#5f8f67] hover:shadow-[0_22px_42px_rgba(111,159,119,0.34)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7ca982]/25 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white disabled:shadow-none disabled:hover:translate-y-0"
      disabled={disabled}
      type="submit"
    >
      {isLoading ? "Preparing secure checkout..." : "Continue to secure payment"}
    </button>
  );
}
