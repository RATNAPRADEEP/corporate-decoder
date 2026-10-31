export type RiskCategory =
  | "Scam or fraud"
  | "Financial disadvantage"
  | "Unfair terms"
  | "Manipulation or pressure"
  | "Missing critical information";
export type Severity = "Critical" | "High" | "Medium" | "Low" | "None";
export interface RiskFinding {
  category: RiskCategory;
  severity: Exclude<Severity, "None">;
  title: string;
  evidence: string;
  whyItMatters: string;
  verify: string[];
  points: number;
}
export interface AnalysisResult {
  originalMessage: string;
  severity: Severity;
  score: number;
  confidence: number;
  findings: RiskFinding[];
  summary: string;
  translation: string;
  suggestedChecks: string[];
  disclaimer: string;
}
export type Sensitivity = "balanced" | "strict" | "relaxed";