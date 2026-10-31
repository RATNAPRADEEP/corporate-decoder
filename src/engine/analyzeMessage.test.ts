import { describe, expect, it } from "vitest";
import { analyzeMessage } from "./analyzeMessage";

describe("analyzeMessage", () => {
  it("returns empty guidance for an empty message", () => {
    expect(analyzeMessage(" ").severity).toBe("None");
  });
  it("flags OTP disclosure and urgency", () => {
    const result = analyzeMessage("Act now. Send your OTP immediately to prevent account suspension.");
    expect(result.findings.some((finding) => finding.title === "Credential or one-time-code request")).toBe(true);
    expect(result.findings.some((finding) => finding.category === "Manipulation or pressure")).toBe(true);
    expect(["High", "Critical"]).toContain(result.severity);
  });
  it("flags guaranteed returns and advance fees", () => {
    const result = analyzeMessage("Guaranteed risk-free profit. Pay an upfront fee to release your investment.");
    expect(result.findings.some((finding) => finding.category === "Financial disadvantage")).toBe(true);
  });
  it("does not label a neutral message as a scam", () => {
    const result = analyzeMessage("The team meeting is at 3 PM in conference room two.");
    expect(result.severity).toBe("None");
    expect(result.findings).toHaveLength(0);
  });
  it("keeps contract concerns distinct from proof of wrongdoing", () => {
    const result = analyzeMessage("This subscription offer is non-refundable.");
    expect(result.findings.some((finding) => finding.category === "Unfair terms")).toBe(true);
    expect(result.disclaimer).toContain("does not prove");
  });
});