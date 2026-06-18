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
      className="gf-button-primary w-full"
      disabled={disabled}
      type="submit"
    >
      {isLoading ? "Preparing secure checkout..." : "Continue to secure payment"}
    </button>
  );
}
