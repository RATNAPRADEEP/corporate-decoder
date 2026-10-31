const rules: Array<{ pattern: RegExp; translation: string }> = [
  { pattern: /\bcompetitive salary|salary is competitive\b/i, translation: "They have a number. They would simply prefer you reveal your lowest acceptable number first." },
  { pattern: /\bfast-paced environment\b/i, translation: "Everything is urgent, planning is optional, and somehow this is your problem." },
  { pattern: /\bwear many hats|multiple hats\b/i, translation: "One job title, several people's responsibilities, and probably one salary." },
  { pattern: /\bself-starter|work independently\b/i, translation: "Training may be a treasure hunt. Bring initiative and a functioning search engine." },
  { pattern: /\brockstar|ninja|guru\b/i, translation: "They want a superhero, but the vacancy is listed under entry-level." },
  { pattern: /\bwe are like a family|family culture\b/i, translation: "They are selling emotional closeness. Check whether the contract includes actual boundaries." },
  { pattern: /\bflexible working hours|flexible schedule\b/i, translation: "Your hours are flexible in the direction that helps them." },
  { pattern: /\bwork hard\s*,?\s*play hard\b/i, translation: "The workload may be intense; the pizza party is standing by as a solution." },
  { pattern: /\bopportunity to grow|room for growth|growth opportunities\b/i, translation: "The promotion is a possibility. The extra responsibilities are probably immediate." },
  { pattern: /\bother duties as assigned\b/i, translation: "The job description has a trapdoor. Anything can fall through it." },
  { pattern: /\bsynergy|leverage|circle back\b/i, translation: "We could have said this in one sentence, but the meeting needed more vocabulary." },
  { pattern: /\blet's take this offline\b/i, translation: "Let's stop discussing this where everyone can hear the answer." },
  { pattern: /\bquick call|quick meeting\b/i, translation: "Please donate an unspecified amount of your calendar to a meeting that could have been a message." },
  { pattern: /\bjust checking in|gentle reminder\b/i, translation: "I am following up because this is still not done, but I am dressing the impatience in polite clothing." },
  { pattern: /\bASAP|urgent|high priority\b/i, translation: "This has suddenly become your emergency. The planning that could have prevented it is not invited." },
  { pattern: /\bno budget|budget constraints\b/i, translation: "They want the result. They would prefer not to pay what it costs." },
  { pattern: /\bexposure|great exposure\b/i, translation: "The compensation is visibility. Unfortunately, visibility does not pay bills." },
  { pattern: /\bfast learner\b/i, translation: "They expect you to become productive before they've finished explaining the job." },
  { pattern: /\bimmediate joiner|join immediately\b/i, translation: "Their timeline is urgent, so they hope your existing plans are fictional." },
  { pattern: /\bprobation period\b/i, translation: "They will evaluate you while keeping the commitment conveniently one-sided." },
  { pattern: /\bnot in the budget|cannot revise the offer\b/i, translation: "The number is fixed. Your enthusiasm is expected to remain flexible." },
  { pattern: /\bwe value work.life balance\b/i, translation: "They value the phrase. The calendar may have other opinions." },
  { pattern: /\bplease do the needful\b/i, translation: "Something needs doing. The details are apparently a treasure hunt." },
  { pattern: /\bper my last email\b/i, translation: "I already told you this. Please scroll up before I start attaching screenshots." },
  { pattern: /\bkindly revert\b/i, translation: "Please reply. The word 'revert' has been promoted to a full-time job." },
];

export function translateCorporateMessage(message: string): string {
  const text = message.trim();
  if (!text) return "Paste a workplace message and I'll translate the corporate poetry.";

  const isInternAd = /\b(intern|internship)\b/i.test(text) &&
    /\b(hiring|we are looking|we're looking|what you'll do|responsibilities|who can apply|apply now)\b/i.test(text);
  const isSocialContentRole = /\b(social media|content creator|digital marketing|instagram|reels|youtube|short.form video)\b/i.test(text);

  if (isInternAd && isSocialContentRole) {
    return "They want one intern to be the social media strategist, trend researcher, content creator, copywriter, designer, scheduler AND analytics team. The title says “Intern” because “entire marketing department” would look a little alarming on the poster. And since you already scroll Instagram, congratulations: your screen time has been promoted to market research. “Learn how strategies work” is doing a suspicious amount of heavy lifting here.";
  }

  if (isInternAd && /\b(research|create|design|write|manage|schedule|edit|publish|engagement|campaign|analytics)\b/i.test(text)) {
    return "A beginner-friendly role with a suspiciously senior-sized to-do list. They want you to learn, execute, create, coordinate and deliver results—ideally before the internship orientation slide finishes loading. At least the word “intern” keeps the expectations looking small.";
  }

  if (/\b(unpaid|without pay|no stipend|volunteer basis)\b/i.test(text) && /\b(intern|internship|role|position)\b/i.test(text)) {
    return "They are offering the rare opportunity to exchange your time, skills and electricity bill for “experience.” Your bank account may not be familiar with this compensation model.";
  }

  if (isInternAd) {
    return "They have wrapped a wish list in a cheerful internship poster. They want enthusiasm, initiative and useful output from someone who is still meant to be learning. Read the actual tasks and stipend carefully; the word “internship” does not automatically make the workload beginner-sized.";
  }

  const matches = rules.filter((rule) => rule.pattern.test(text));
  if (matches.length === 1) return matches[0].translation;
  if (matches.length > 1) {
    return matches.slice(0, 2).map((rule) => rule.translation).join(" Also, ");
  }

  if (/\b(job|role|position|salary|manager|team|meeting|deadline|project|employee|intern|offer|work|office|client|deliverable)\b/i.test(text)) {
    return "Corporate translation: “Please make this happen, absorb the ambiguity, and keep the update email upbeat.” A lot of words; one very familiar expectation.";
  }
  return "Translation: a perfectly ordinary message wearing a corporate suit. The extra formality is doing a lot of heavy lifting.";
}
