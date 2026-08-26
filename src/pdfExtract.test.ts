import { describe, it, expect } from "vitest";
import { extractHeuristics } from "./pdfExtract";

describe("extractHeuristics", () => {
  it("extracts amount and due date from a PECO-style bill", () => {
    const text = `
      PECO Energy Company
      Account Summary
      Amount Due: $145.32
      Due Date: 09/15/2026
      Service Address: 123 Main St
    `;
    const result = extractHeuristics(text, "peco-bill.pdf");
    expect(result.guessedAmount).toBe(145.32);
    expect(result.guessedDueDate).toBe("2026-09-15");
    expect(result.guessedName).toBe("PECO Energy Company");
  });

  it("extracts total due for a gas company bill", () => {
    const text = `
      City Gas Co.
      Total Due $89.10
      Payment Due By: October 3, 2026
    `;
    const result = extractHeuristics(text, "gas-bill.pdf");
    expect(result.guessedAmount).toBe(89.1);
    expect(result.guessedDueDate).toBe("2026-10-03");
  });

  it("extracts balance due for a water authority bill", () => {
    const text = `
      Municipal Water Authority
      Balance Due: $54.00
      Due By 08/28/2026
    `;
    const result = extractHeuristics(text, "water-bill.pdf");
    expect(result.guessedAmount).toBe(54.0);
    expect(result.guessedDueDate).toBe("2026-08-28");
  });

  it("extracts new charges for an internet provider bill", () => {
    const text = `
      Internet Co
      New Charges: $79.99
      Due Date: 09/01/2026
    `;
    const result = extractHeuristics(text, "internet-bill.pdf");
    expect(result.guessedAmount).toBe(79.99);
    expect(result.guessedDueDate).toBe("2026-09-01");
  });

  it("falls back to filename when the PDF text is empty", () => {
    const text = "   \n   \n  ";
    const result = extractHeuristics(text, "unknown_provider.pdf");
    expect(result.guessedName).toBe("unknown provider");
  });

  it("returns null guesses when nothing matches", () => {
    const text = "No relevant content here.";
    const result = extractHeuristics(text, "mystery.pdf");
    expect(result.guessedAmount).toBeNull();
    expect(result.guessedDueDate).toBeNull();
  });
});
