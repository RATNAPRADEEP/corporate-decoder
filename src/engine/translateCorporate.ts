const rules: Array<{ pattern: RegExp; translation: string }> = [
  { pattern: /\bcompetitive salary|salary is competitive\b/i, translation: "We'd rather not say the number until we've seen how little you'll accept." },
  { pattern: /\bfast-paced environment\b/i, translation: "Everything is urgent, planning is optional, and somehow this is your problem." },
  { pattern: /\bwear many hats|multiple hats\b/i, translation: "One job title, several people's responsibilities, and probably one salary." },
  { pattern: /\bself-starter|work independently\b/i, translation: "There may be very little guidance. Please learn by guessing." },
  { pattern: /\brockstar|ninja|guru\b/i, translation: "We used a dramatic nickname because a clear job description was apparently too ordinary." },
  { pattern: /\bwe are like a family|family culture\b/i, translation: "Expect emotional loyalty to do some of the work that a proper policy should be doing." },
  { pattern: /\bflexible working hours|flexible schedule\b/i, translation: "Your hours are flexible in the direction that helps us." },
  { pattern: /\bwork hard\s*,?\s*play hard\b/i, translation: "We may celebrate surviving the workload instead of reducing it." },
  { pattern: /\bopportunity to grow|room for growth|growth opportunities\b/i, translation: "The promotion is a possibility. The extra responsibilities are probably immediate." },
  { pattern: /\bother duties as assigned\b/i, translation: "The job description has a trapdoor. Anything can fall through it." },
  { pattern: /\bsynergy|leverage|circle back\b/i, translation: "We could have said this in one sentence, but the meeting needed more vocabulary." },
  { pattern: /\blet's take this offline\b/i, translation: "Let's stop discussing this where everyone can hear the answer." },
  { pattern: /\bquick call|quick meeting\b/i, translation: "Please donate an unspecified amount of your calendar to a meeting that could have been a message." },
  { pattern: /\bjust checking in|gentle reminder\b/i, translation: "I am following up because this is still not done, but I am dressing the impatience in polite clothing." },
  { pattern: /\bASAP|urgent|high priority\b/i, translation: "This has suddenly become your emergency. The planning that could have prevented it is not invited." },
  { pattern: /\bno budget|budget constraints\b/i, translation: "We want the result. We would prefer not to pay what it costs." },
  { pattern: /\bexposure|great exposure\b/i, translation: "The compensation is visibility. Unfortunately, visibility does not pay bills." },
  { pattern: /\bfast learner\b/i, translation: "We expect you to become productive before we've finished explaining the job." },
  { pattern: /\bimmediate joiner|join immediately\b/i, translation: "Our timeline is urgent, so we hope your existing plans are fictional." },
  { pattern: /\bprobation period\b/i, translation: "We'll evaluate you while keeping the commitment conveniently one-sided." },
  { pattern: /\bnot in the budget|cannot revise the offer\b/i, translation: "The number is fixed. Your enthusiasm is expected to remain flexible." },
  { pattern: /\bwe value work.life balance\b/i, translation: "We value the phrase. The calendar may have other opinions." },
  { pattern: /\bplease do the needful\b/i, translation: "Something needs doing. The details are apparently a treasure hunt." },
  { pattern: /\bper my last email\b/i, translation: "I already told you this. Please scroll up before I start attaching screenshots." },
  { pattern: /\bkindly revert\b/i, translation: "Please reply. The word 'revert' has been promoted to a full-time job." },
];

export function translateCorporateMessage(message: string): string {
  const text = message.trim();
  if (!text) return "Paste a workplace message and I'll translate the corporate poetry.";

  const matches = rules.filter((rule) => rule.pattern.test(text));
  if (matches.length === 1) return matches[0].translation;
  if (matches.length > 1) {
    return matches.slice(0, 2).map((rule) => rule.translation).join(" Also, ");
  }

  if (/\b(job|role|position|salary|manager|team|meeting|deadline|project|employee|intern|offer|work|office|client|deliverable)\b/i.test(text)) {
    return "They've wrapped an ordinary workplace request in professional wording. Translation: they want this handled, preferably yesterday, with everyone smiling in the follow-up email.";
  }
  return "Translation: a perfectly ordinary message wearing a corporate suit. The extra formality is doing a lot of heavy lifting.";
}
