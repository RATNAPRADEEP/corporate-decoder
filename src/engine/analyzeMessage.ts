import type { AnalysisResult, RiskFinding, Sensitivity } from "./types";

type Rule = {
  category: RiskFinding["category"];
  title: string;
  pattern: RegExp;
  points: number;
  whyItMatters: string;
  verify: string[];
};

const RULES: Rule[] = [
  {
    category: "Scam or fraud",
    title: "Credential or one-time-code request",
    pattern: /\b(?:share|send|tell|confirm|verify)\b.{0,45}\b(?:otp|one[- ]time password|password|pin|cvv|passcode)\b|\b(?:otp|one[- ]time password|password|pin|cvv|passcode)\b.{0,45}\b(?:share|send|tell|confirm)\b/i,
    points: 48,
    whyItMatters: "Legitimate support should not need you to disclose a password, OTP, PIN, or CVV in a message.",
    verify: ["Do not share the code or secret.", "Contact the organization using its official app or a known phone number."],
  },
  {
    category: "Scam or fraud",
    title: "Unusual payment or transfer request",
    pattern: /\b(?:send|transfer|pay|deposit|wire)\b.{0,55}\b(?:crypto|cryptocurrency|gift card|personal account|unknown account|upi id|wallet)\b|\b(?:gift card|crypto|cryptocurrency)\b.{0,45}\b(?:payment|pay|transfer)\b/i,
    points: 34,
    whyItMatters: "Hard-to-reverse payment methods and unfamiliar recipient accounts can make recovery difficult.",
    verify: ["Independently confirm the recipient and payment reason.", "Use a payment method with a documented dispute process."],
  },
  {
    category: "Scam or fraud",
    title: "Suspicious link or account warning",
    pattern: /\b(?:account suspended|account blocked|unusual login|verify your account|click here|limited access)\b/i,
    points: 24,
    whyItMatters: "Unexpected account warnings can push you toward lookalike login pages.",
    verify: ["Do not use the message link.", "Open the official website or app yourself and check account status."],
  },
  {
    category: "Manipulation or pressure",
    title: "Urgency or pressure tactic",
    pattern: /\b(?:act now|immediately|right now|within \d+ minutes|last chance|final warning|expires today|don't tell anyone|do not tell anyone)\b/i,
    points: 20,
    whyItMatters: "Urgency or secrecy can stop you from checking facts or seeking a second opinion.",
    verify: ["Pause before responding or paying.", "Ask for the deadline and consequences in writing."],
  },
  {
    category: "Financial disadvantage",
    title: "Advance fee or guaranteed return",
    pattern: /\b(?:guaranteed|risk[- ]free|assured)\b.{0,45}\b(?:profit|return|income|investment)\b|\b(?:processing fee|release fee|upfront fee|advance fee)\b/i,
    points: 30,
    whyItMatters: "Guaranteed returns and fees paid before funds are released deserve independent verification.",
    verify: ["Check the provider and relevant regulator independently.", "Get every fee, risk, and refund condition in writing."],
  },
  {
    category: "Unfair terms",
    title: "Waiver, penalty, or one-sided term",
    pattern: /\b(?:non[- ]refundable|no refund|waive all claims|waive your rights|unlimited liability|penalty applies|automatic renewal)\b/i,
    points: 22,
    whyItMatters: "This wording may limit refunds, remedies, or your ability to exit. The full contract determines its effect.",
    verify: ["Read the complete agreement and cancellation terms.", "Ask for any exception or negotiated change in writing."],
  },
  {
    category: "Missing critical information",
    title: "Key commercial details may be missing",
    pattern: /\b(?:offer|deal|contract|subscription|investment|loan|job)\b/i,
    points: 12,
    whyItMatters: "The message mentions a consequential offer but may not establish all material terms.",
    verify: ["Confirm total cost, duration, eligibility, obligations, and exit conditions.", "Request the complete written terms before agreeing."],
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
function severityFor(score: number): AnalysisResult["severity"] {
  if (score >= 65) return "Critical";
  if (score >= 45) return "High";
  if (score >= 25) return "Medium";
  if (score > 0) return "Low";
  return "None";
}
function extractEvidence(message: string, pattern: RegExp): string {
  const match = message.match(pattern);
  if (!match || match.index === undefined) return message.slice(0, 140);
  const start = Math.max(0, match.index - 45);
  return message.slice(start, Math.min(message.length, match.index + match[0].length + 45)).trim();
}

export function analyzeMessage(message: string, sensitivity: Sensitivity = "balanced"): AnalysisResult {
  const normalized = message.trim();
  if (!normalized) return {
    originalMessage: message, severity: "None", score: 0, confidence: 0,
    findings: [], summary: "Paste a message to inspect it.",
    translation: "No message, no decoding. The crystal ball is on lunch break.",
    suggestedChecks: [], disclaimer: "This is an indicator-based assistant, not a fraud determination.",
  };

  const multiplier = sensitivity === "strict" ? 1.2 : sensitivity === "relaxed" ? 0.8 : 1;
  const findings: RiskFinding[] = RULES.filter((rule) => rule.pattern.test(normalized)).map((rule) => ({
    category: rule.category,
    severity: severityFor(clamp(Math.round(rule.points * multiplier), 0, 100)) as RiskFinding["severity"],
    title: rule.title,
    evidence: extractEvidence(normalized, rule.pattern),
    whyItMatters: rule.whyItMatters,
    verify: rule.verify,
    points: Math.round(rule.points * multiplier),
  }));
  const score = clamp(Math.round(findings.reduce((sum, item) => sum + item.points, 0) * 0.72), 0, 100);
  const severity = severityFor(score);
  const confidence = findings.length === 0 ? 18 : clamp(42 + findings.length * 11, 42, 86);
  const categories = [...new Set(findings.map((item) => item.category))];
  const suggestedChecks = [...new Set(findings.flatMap((item) => item.verify))];
  const translation = severity === "None"
    ? "No obvious red flags matched our starter rules. That is not a certificate of trustworthiness."
    : severity === "Critical" || severity === "High"
      ? "They want your decision before your brain gets a calendar invite. Pause. Verify independently."
      : severity === "Medium"
        ? "Something here deserves a second look. Ask for the details before you commit."
        : "A small yellow flag. Not a conviction—just your cue to read the fine print.";
  return {
    originalMessage: normalized, severity, score, confidence, findings,
    summary: findings.length ? `Matched ${findings.length} indicator(s): ${categories.join(", ")}.` : "No configured risk patterns were detected in this message.",
    translation, suggestedChecks,
    disclaimer: "Pattern-based screening only. Confidence reflects rule matches, not probability that the sender is malicious. A clean result does not prove a message is safe.",
  };
}