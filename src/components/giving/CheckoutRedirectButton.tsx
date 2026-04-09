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
      className="w-full rounded-2xl bg-accent px-5 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-black/20 disabled:shadow-none"
      disabled={disabled}
      type="submit"
    >
      {isLoading ? "Creating contribution..." : "Continue to secure checkout"}
    </button>
  );
}
