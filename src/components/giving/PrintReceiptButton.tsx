"use client";

export function PrintReceiptButton() {
  return (
    <button
      className="gf-button-secondary print:hidden"
      onClick={() => window.print()}
      type="button"
    >
      Print / Save as PDF
    </button>
  );
}
