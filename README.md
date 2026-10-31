# Corporate Decoder

Understand the message. Spot the leverage. Protect your decision.

Corporate Decoder is a responsive, installable web app for Android, Windows, and desktop browsers. It helps inspect messages for potential scams, unfair terms, financial disadvantages, manipulative pressure, and missing critical information.

> First release: local demo only. It does not connect to inboxes, send notifications, or make decisions on your behalf.

## Included
- Responsive React + TypeScript app (Vite).
- PWA foundation for Android and desktop browsers.
- Explainable rule-based risk engine with evidence, severity, confidence, and verification steps.
- Balanced default sensitivity and savage-but-clear translations.
- Demo examples, editable message analysis, and unit tests.
- Warn-only behavior: no auto-replies, payments, link opening, or other actions.

## Run locally
Requires Node.js 20+ and npm.

```bash
npm install
npm run dev
```

## Test and build
```bash
npm test
npm run build
npm run preview
```

## Product principles
1. Evidence before labels: indicators are not proof.
2. The user stays in control: the app warns only.
3. Privacy by default: this demo processes text in the browser. Do not paste passwords, OTPs, full card numbers, or secrets.
4. Uncertainty is explicit: confidence represents pattern-match strength, not probability of malicious intent.
5. No inbox integration yet. Gmail, WhatsApp, Android notification access, and push notifications need explicit consent, provider-compliant APIs, and secure credential handling.

## Risk categories
- Scam or fraud
- Financial disadvantage
- Unfair terms
- Manipulation or pressure
- Missing critical information

## Roadmap
- [x] Initial repo and responsive PWA foundation
- [x] Local explainable risk engine and tests
- [ ] Secure backend and authentication
- [ ] Gmail OAuth with least-privilege scopes and disconnect/delete controls
- [ ] Browser push notifications for Android and Windows
- [ ] Investigate WhatsApp Business API workflows; do not assume personal inbox access
- [ ] Explore a separate opt-in Android notification-listener integration
- [ ] User feedback and false-positive review loop

## Security
Never commit API keys, OAuth secrets, access tokens, private keys, or real message dumps. Use environment variables and a managed secret store for future integrations. Report vulnerabilities privately.

No license has been selected yet.