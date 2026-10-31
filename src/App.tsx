import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Bell, CheckCircle2, ChevronDown, CircleHelp, ClipboardCheck, Copy, Eye, FileText, LockKeyhole, MessageSquareText, ScanSearch, Shield, ShieldAlert, Sparkles, X } from "lucide-react";
import DeepReading from "./DeepReading";
import { analyzeMessage } from "./engine/analyzeMessage";
import { translateCorporateMessage } from "./engine/translateCorporate";
import type { Sensitivity } from "./engine/types";

const samples = [
  {
    label: "Urgent OTP request",
    text: "FINAL WARNING: Your bank account will be suspended in 10 minutes. Send your OTP immediately to verify your identity. Do not tell anyone.",
  },
  {
    label: "Investment offer",
    text: "Guaranteed risk-free returns of 20% every month. Pay a small upfront fee to release your investment profits today.",
  },
  {
    label: "Contract clause",
    text: "Your new subscription offer is non-refundable and renews automatically. A penalty applies if you cancel before the end of the annual term.",
  },
  {
    label: "Ordinary message",
    text: "Hi, the team review is scheduled for 3 PM tomorrow. Please bring the updated project notes.",
  },
];

const severityClass: Record<string, string> = {
  Critical: "critical", High: "high", Medium: "medium", Low: "low", None: "none",
};

export default function App() {
  const [message, setMessage] = useState(samples[0].text);
  const [mode, setMode] = useState<"deep" | "translator">("deep");
  const [hasTranslated, setHasTranslated] = useState(false);
  const [includeRiskAssessment, setIncludeRiskAssessment] = useState(true);
  const [sensitivity, setSensitivity] = useState<Sensitivity>("balanced");
  const [hasAnalyzed, setHasAnalyzed] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const result = useMemo(() => analyzeMessage(message, sensitivity), [message, sensitivity]);
  const severity = hasAnalyzed ? result.severity : "None";
  const translatedMessage = useMemo(() => translateCorporateMessage(message), [message]);
  const translatorRiskResult = useMemo(() => analyzeMessage(message, sensitivity), [message, sensitivity]);

  async function copyReport() {
    const report = [
      "CORPORATE DECODER",
      `Risk: ${result.severity} (${result.score}/100)`,
      result.summary,
      "",
      ...result.findings.map((f) => `- ${f.category}: ${f.title}\n  Evidence: ${f.evidence}\n  Why: ${f.whyItMatters}`),
      "",
      "Verification steps:",
      ...result.suggestedChecks.map((item) => `- ${item}`),
      "",
      result.disclaimer,
    ].join("\n");
    try { await navigator.clipboard.writeText(report); } catch { /* Clipboard may be unavailable in insecure contexts. */ }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Corporate Decoder home">
          <span className="brand-icon"><Shield size={22} /></span>
          <span>corporate<span className="brand-light">decoder</span><small>YOUR PERSONAL ADVANTAGE CHECK</small></span>
        </a>
        <div className="top-actions">
          <span className="local-pill"><span className="pulse-dot" /> LOCAL DEMO</span>
          <button className="icon-button" onClick={() => setShowPrivacy(true)} aria-label="Privacy details"><LockKeyhole size={18} /></button>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="eyebrow"><Sparkles size={14} /> READ BETWEEN THE LINES</div>
          <h1>Before you say <em>yes</em>,<br className="desktop-break" /> decode what they really mean.</h1>
          <p>Spot pressure, hidden costs, suspicious requests, and terms that put you at a disadvantage.</p>
          <div className="hero-note"><ShieldAlert size={16} /> A second opinion for messages that want an answer too quickly.</div>
        </section>

        <div className="workspace">
          <section className="panel composer-panel">
            <div className="panel-heading">
              <div><span className="step-label">01 / INPUT</span><h2>Drop the message</h2></div>
              <span className="privacy-inline"><LockKeyhole size={13} /> Stays in this browser</span>
            </div>
            <div className="mode-switch" role="group" aria-label="Choose decoder mode">
              <button className={mode === "deep" ? "active" : ""} onClick={() => setMode("deep")}><FileText size={15} /> Deep Reading</button>
              <button className={mode === "translator" ? "active" : ""} onClick={() => setMode("translator")}><Sparkles size={15} /> Funny Translator</button>
            </div>
            {mode === "deep" && <div className="sample-row">
              <span>TRY AN EXAMPLE</span>
              {samples.map((sample) => <button key={sample.label} className="sample-chip" onClick={() => { setMessage(sample.text); setHasAnalyzed(true); }}>{sample.label}</button>)}
            </div>}
            <label className="sr-only" htmlFor="message">Message to analyze</label>
            <textarea id="message" value={message} onChange={(event) => { setMessage(event.target.value); setHasAnalyzed(false); setHasTranslated(false); }} placeholder={mode === "deep" ? "Paste a long document or message here, or upload a file above…" : "Paste an email, job ad, offer, payment request, contract clause, or workplace message..."} maxLength={250000} />
            <div className="composer-footer">
              <span>{message.length.toLocaleString()} / 250,000 characters</span>
              {mode === "deep" ? <span className="deep-inline-hint">Local document reading</span> : <button className="analyze-button translator-button" disabled={!message.trim()} onClick={() => setHasTranslated(true)}><Sparkles size={17} /> Translate the corporate <ArrowRight size={16} /></button>}
            </div>
            {mode === "translator" && <label className="merge-option"><input type="checkbox" checked={includeRiskAssessment} onChange={(event) => setIncludeRiskAssessment(event.target.checked)} /><span><strong>Also run Detailed Analysis</strong><small>Assess this same message alongside the funny translation.</small></span></label>}
            {(mode === "translator" && includeRiskAssessment) && <div className="sensitivity-row">
              <span>DETECTION SENSITIVITY</span>
              <div className="segmented">
                {(["relaxed", "balanced", "strict"] as const).map((value) => <button key={value} className={sensitivity === value ? "selected" : ""} onClick={() => { setSensitivity(value); setHasAnalyzed(true); }}>{value}</button>)}
              </div>
            </div>}
          </section>

          <section className={`result-column ${mode === "translator" ? "translator-result-column" : ""}`} aria-live="polite">
            {mode === "deep" ? <><div className="result-header"><div><span className="step-label">02 / DOCUMENT INTELLIGENCE</span><h2>Deep Reading</h2></div></div><DeepReading text={message} onTextChange={(value) => { setMessage(value); setHasAnalyzed(true); setHasTranslated(true); }} sensitivity={sensitivity} /></> : mode === "translator" ? (
              <><div className="result-header"><div><span className="step-label">02 / TRANSLATION</span><h2>Corporate, decoded.</h2></div></div>
                {hasTranslated ? <>
                  <div className="funny-translation"><div><strong>🤖 THE REAL TRANSLATION:</strong><p>{translatedMessage}</p></div></div>
                  {includeRiskAssessment && <div className="translator-risk-block">
                    <div className="section-caption"><span>DETAILED ANALYSIS · SAME MESSAGE</span><span>{translatorRiskResult.findings.length} SIGNALS</span></div>
                    <div className={`risk-card ${severityClass[translatorRiskResult.severity]}`}>
                      <div className="risk-topline"><span>OVERALL RISK INDICATOR</span><span className="risk-status">{translatorRiskResult.severity === "None" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{translatorRiskResult.severity.toUpperCase()}</span></div>
                      <div className="risk-score-row"><strong>{translatorRiskResult.score}<small>/100</small></strong><div className="score-track"><span style={{ width: `${translatorRiskResult.score}%` }} /></div></div>
                      <p>{translatorRiskResult.summary}</p>
                      <div className="risk-foot"><span>{translatorRiskResult.findings.length} signal(s) matched</span><span>Match confidence: {translatorRiskResult.confidence}%</span></div>
                    </div>
                    {translatorRiskResult.findings.length === 0 ? <div className="finding-card clean"><CheckCircle2 size={19} /><div><strong>No configured indicators found</strong><p>This is not proof the message is safe. The detector only checks its current rules.</p></div></div> : translatorRiskResult.findings.map((finding, index) => <article className="finding-card" key={finding.title}>
                      <div className="finding-index">0{index + 1}</div><div className="finding-body">
                        <div className="finding-meta"><span>{finding.category}</span><span className={`mini-severity ${severityClass[finding.severity]}`}>{finding.severity}</span></div>
                        <h3>{finding.title}</h3><blockquote>“{finding.evidence}”</blockquote><p>{finding.whyItMatters}</p>
                        <details><summary><ClipboardCheck size={14} /> What to verify <ChevronDown size={14} /></summary><ul>{finding.verify.map((item) => <li key={item}>{item}</li>)}</ul></details>
                      </div>
                    </article>)}
                    {translatorRiskResult.suggestedChecks.length > 0 && <div className="checks-card"><h3><ClipboardCheck size={16} /> Before you respond</h3><ul>{translatorRiskResult.suggestedChecks.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                    <p className="disclaimer"><CircleHelp size={14} /> {translatorRiskResult.disclaimer}</p>
                  </div>}
                </> : <div className="empty-result"><div className="empty-icon"><Sparkles size={25} /></div><h3>Corporate subtitles, incoming.</h3><p>Paste a message and hit translate. Switch modes to assess the same text.</p></div>}
              </>
            ) : <>
            <div className="result-header"><div><span className="step-label">02 / INTELLIGENCE</span><h2>Detailed risk report</h2></div><button className="text-button" onClick={copyReport} disabled={!hasAnalyzed}><Copy size={14} /> Copy report</button></div>
            {!hasAnalyzed ? (
              <div className="empty-result"><div className="empty-icon"><MessageSquareText size={25} /></div><h3>Message changed</h3><p>Decode it to refresh the risk assessment.</p><button className="analyze-button" onClick={() => setHasAnalyzed(true)}><ScanSearch size={16} /> Analyze now</button></div>
            ) : (
              <>
                <div className={`risk-card ${severityClass[severity]}`}>
                  <div className="risk-topline"><span>OVERALL RISK INDICATOR</span><span className="risk-status">{severity === "None" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{severity.toUpperCase()}</span></div>
                  <div className="risk-score-row"><strong>{result.score}<small>/100</small></strong><div className="score-track"><span style={{ width: `${result.score}%` }} /></div></div>
                  <p>{result.summary}</p>
                  <div className="risk-foot"><span>{result.findings.length} signal(s) matched</span><span>Match confidence: {result.confidence}%</span></div>
                </div>
                <div className="translation-card">
                  <div className="translation-label"><Sparkles size={14} /> MESSAGE FOR YOU</div>
                  <p>{result.translation}</p>
                </div>
                <div className="section-caption"><span>WHAT THEY FLAGGED</span><span>{result.findings.length} ITEMS</span></div>
                {result.findings.length === 0 ? (
                  <div className="finding-card clean"><CheckCircle2 size={19} /><div><strong>No configured indicators found</strong><p>That is not proof the sender or offer is trustworthy. Read the full context.</p></div></div>
                ) : result.findings.map((finding, index) => (
                  <article className="finding-card" key={finding.title}>
                    <div className="finding-index">0{index + 1}</div>
                    <div className="finding-body">
                      <div className="finding-meta"><span>{finding.category}</span><span className={`mini-severity ${severityClass[finding.severity]}`}>{finding.severity}</span></div>
                      <h3>{finding.title}</h3>
                      <blockquote>“{finding.evidence}”</blockquote>
                      <p>{finding.whyItMatters}</p>
                      <details><summary><ClipboardCheck size={14} /> What to verify <ChevronDown size={14} /></summary><ul>{finding.verify.map((item) => <li key={item}>{item}</li>)}</ul></details>
                    </div>
                  </article>
                ))}
                {result.suggestedChecks.length > 0 && <div className="checks-card"><h3><ClipboardCheck size={16} /> Before you respond</h3><ul>{result.suggestedChecks.map((item) => <li key={item}>{item}</li>)}</ul></div>}
                <p className="disclaimer"><CircleHelp size={14} /> {result.disclaimer}</p>
              </>
            )}
            </>}
          </section>
        </div>

        <section className="bottom-strip">
          <div><Bell size={17} /><span><strong>Notifications: not connected yet</strong><small>Push alerts will be added after the risk engine is evaluated.</small></span></div>
          <span className="warn-only"><Eye size={15} /> WARN ONLY · YOU STAY IN CONTROL</span>
        </section>
      </main>

      {showPrivacy && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPrivacy(false); }}>
        <div className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
          <button className="modal-close" onClick={() => setShowPrivacy(false)} aria-label="Close privacy details"><X size={18} /></button>
          <div className="modal-icon"><LockKeyhole size={22} /></div>
          <h2 id="privacy-title">Privacy in this demo</h2>
          <p>Your message is processed in this browser. Document extraction and OCR run locally; no document is uploaded to a Corporate Decoder backend. OCR may download open-source language data.</p>
          <ul><li>No inbox access or OAuth connection.</li><li>No notification permission requested.</li><li>No message history saved.</li><li>PDF, DOCX and image extraction happens on your device.</li><li>Do not paste passwords, OTPs, or payment secrets.</li></ul>
          <button className="analyze-button full-button" onClick={() => setShowPrivacy(false)}>Got it</button>
        </div>
      </div>}
      <footer>© {new Date().getFullYear()} CORPORATE DECODER <span>LESS GUESSING. MORE LEVERAGE.</span></footer>
    </div>
  );
}