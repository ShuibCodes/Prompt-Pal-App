/**
 * Agent challenge lessons.
 *
 * The mechanic: the user reads a plain-text brief framed as "you're a busy
 * founder who wants to automate X", plus a description of what the agent should
 * PRODUCE. They are never shown the ideal prompt itself — only the outcome — so
 * there is nothing to copy/paste (avoids the "parrot" problem). They write the
 * prompt that would make the agent work well, and Gemini judges that prompt
 * directly against the hidden `whatUserSees` rubric + `grading.criteria` (the
 * same prompt-only LLM-judge path as coding in ai.ts — no generation step).
 *
 * SCAFFOLDING FADE (core of the difficulty curve):
 *   - easy   → fill-in-the-blank template (scaffoldType "template")
 *   - medium → short starter sentence with a couple of gaps (template, fewer gaps)
 *   - hard   → empty box, no template, no checklist (scaffoldType "none")
 *
 * ROLLOUT: we're building the agent batch first, starting with just these 2 easy
 * challenges so the mechanic can be validated before scaling to the full set.
 * (Tools — naming/wiring the tools an agent connects — are deferred to the
 * medium/hard batch where that skill actually matters.)
 *
 * IMPORTANT: Never change lesson IDs. User progress (userProgress table) is keyed
 * by levelId. Editing copy, briefs, grading, or hints is safe — only ID changes
 * would orphan progress.
 *
 * IDs: agent-1-easy, agent-2-easy, agent-3-medium, agent-4-medium,
 *      agent-5-hard, agent-6-hard (boss)
 */

const AGENT_IDS = [
	"agent-1-easy",
	"agent-2-easy",
	"agent-3-medium",
	"agent-4-medium",
	"agent-5-hard",
	"agent-6-hard",
];

/**
 * Scaffolding fades with difficulty:
 *   - easy   → fill-in-the-blank template; `checklistItems` map ordinally to the
 *              [bracket] slots (labels + prompt-quality heuristic).
 *   - medium → a partial starter template, shown as a guidance card above a
 *              free-text box (NO checklist — the user writes the rest themselves).
 *   - hard   → no scaffold at all (empty box); not listed here.
 * The bracket gap a hint targets is named directly in the hint text (and on the
 * harder tiers the hint instead names the tools to connect).
 */
const agentLessonScaffolds: Record<
	string,
	{ scaffoldTemplate?: string; checklistItems?: string[] }
> = {
	[AGENT_IDS[0]]: {
		scaffoldTemplate:
			"Take the post and rewrite it for [each channel], matching [the right length and tone], and keep [the core message].",
		checklistItems: [
			"Name each channel",
			"Set length and tone per channel",
			"Keep the core message",
		],
	},
	[AGENT_IDS[1]]: {
		scaffoldTemplate:
			"Sort each email into [folder A] or [folder B] based on [the rule]. When unsure, [default action].",
		// One item per grading criterion (in order) so the result screen can show
		// honest tick/cross feedback. Not shown on the challenge screen (template tier).
		checklistItems: [
			"Name both folders",
			"Give the sorting rule",
			"Set the default when unsure",
		],
	},
	// Medium: partial starter templates only (no checklist) — shown as guidance.
	[AGENT_IDS[2]]: {
		scaffoldTemplate:
			"Research the company and output [a short brief], ending with [one tailored opening angle].",
	},
	[AGENT_IDS[3]]: {
		scaffoldTemplate:
			"Rank the tasks by [what matters most], fit them around [existing meetings], and say what to cut.",
	},
	// Hard (agent-5-hard, agent-6-hard): empty box, no scaffold.
};

const agentLessonsBase = [
	// ===== BEGINNER (passingScore 60) — fill-in-the-blank template =====
	{
		id: AGENT_IDS[0],
		title: "Content Repurposing Agent",
		instruction:
			"You're a busy founder who wants to automate this. Complete the prompt so the agent reshapes your post for every channel. Describe what you want — don't copy the brief.",
		agentBrief:
			"Create an agent that reshapes one post to fit every platform you're on.",
		whatUserSees:
			"GOAL: Reshape one source post into platform-native versions for LinkedIn, X (Twitter), and Instagram without changing the underlying message.\n\n" +
			"INPUT / TRIGGER: Receives a single long-form post written by the founder.\n\n" +
			"DECISION LOGIC: Adapt the format per channel — LinkedIn: professional and structured, a few short paragraphs; X: one short, punchy post within the character limit; Instagram: a casual, friendly caption with a light hook. The core idea stays identical across all three.\n\n" +
			"OUTPUT FORMAT: Three labelled outputs — one LinkedIn post, one tweet, and one Instagram caption.\n\n" +
			"EDGE CASES: If the source post is very short, still produce all three versions rather than padding with filler.\n\n" +
			"WHAT IT MUST NOT DO: It must not invent new claims or change the core message — it only reformats what's already there.",
		hint: "For the [each channel] blank: LinkedIn professional, X short and punchy, Instagram casual caption.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "names_channels",
					description:
						"The prompt names the specific target channels (e.g. LinkedIn, X/Twitter, Instagram) it should produce versions for.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "tailors_tone_and_length",
					description:
						"The prompt sets a length and/or tone appropriate to each channel, rather than one generic rewrite for all of them.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "preserves_core_message",
					description:
						"The prompt tells the agent to keep the original post's core message/idea the same across every version.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "tailors_tone_and_length fails.",
			nudge:
				"Same post, different shapes. Tell the agent how each channel should differ — the length and tone for LinkedIn vs. a tweet vs. an Instagram caption.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Good. You named the channels, gave each its own shape, and locked the core message. That's exactly how a repurposing agent stays on-brand everywhere.",
		},
		lessonTakeaway:
			"When one input fans out to many outputs, name each target and how it should differ — while pinning the one thing that must stay the same.",
	},
	{
		id: AGENT_IDS[1],
		title: "Inbox Triage Agent",
		instruction:
			"You're a busy founder who wants to automate this. Complete the prompt so the agent triages your inbox for you. Describe what you want — don't copy the brief.",
		agentBrief: "Create an agent that triages your inbox every morning.",
		whatUserSees:
			"GOAL: Triage every incoming email into one of two buckets so the founder only spends time on what matters.\n\n" +
			"INPUT / TRIGGER: Fires on each email in the inbox. Reads the sender, subject, and body.\n\n" +
			"DECISION LOGIC: File an email as 'Needs me' when it needs a reply or an action from the founder; file it as 'FYI only' when it is purely informational (newsletters, receipts, automated notifications).\n\n" +
			"OUTPUT FORMAT: Every email assigned to exactly one folder — 'Needs me' or 'FYI only'.\n\n" +
			"EDGE CASES: When the right bucket is unclear, default to 'Needs me' so nothing important slips through.\n\n" +
			"WHAT IT MUST NOT DO: It must not reply to, archive, or delete emails — it only files them.",
		hint: "For the [the rule] blank: needs a reply or action from you → Needs me; just information → FYI only.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "defines_both_folders",
					description:
						"The prompt names both destination buckets (e.g. 'Needs me' and 'FYI only').",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_sorting_rule",
					description:
						"The prompt gives a concrete rule for deciding which bucket an email belongs in.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "handles_unsure_default",
					description:
						"The prompt specifies a default action for when the agent is unsure which bucket applies.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "defines_sorting_rule fails.",
			nudge:
				"The agent needs a rule, not just two folders. What actually separates a 'Needs me' email from an 'FYI only' one? Spell it out.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Nice. Two clear buckets, a rule to choose between them, and a safe default when it's unsure — that's a triage agent you can actually trust with your inbox.",
		},
		lessonTakeaway:
			"A sorting agent needs three things: the buckets, the rule that decides between them, and a default for the cases the rule doesn't cover.",
	},
	// ===== MEDIUM (passingScore 70) — partial starter template + free text =====
	{
		id: AGENT_IDS[2],
		title: "Meeting Prep Agent",
		instruction:
			"You're a busy founder who wants to automate this. Complete the prompt so the agent preps you for the call. Describe what you want — don't copy the brief.",
		agentBrief:
			"Create an agent that preps you for a sales call in minutes.",
		whatUserSees:
			"GOAL: Produce a fast, one-screen prep brief on a company the founder is about to meet, ending with a tailored way to open the conversation.\n\n" +
			"INPUT / TRIGGER: Given a company name (and maybe a website) shortly before a call.\n\n" +
			"DECISION LOGIC: Gather current facts — what the company sells, its size/stage, and any recent signal (funding, launch, news). Because this changes over time, the agent must look it up with a web-search tool rather than rely on memory.\n\n" +
			"OUTPUT FORMAT: A short brief (who they are, what they do, size/stage, a recent signal) that fits on one screen, ending with one tailored opening angle for the call.\n\n" +
			"EDGE CASES: If little is found, say so plainly instead of inventing details.\n\n" +
			"WHAT IT MUST NOT DO: It must not fabricate facts or present stale guesses as current.",
		hint: "For the [a short brief] blank: what they sell, their size/stage, and a recent signal — and tell it to use a web-search tool, since it can't know this from memory.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "scopes_research",
					description:
						"The prompt scopes what to research — e.g. what the company sells, its size or stage, and a recent signal/news.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "requires_web_search_tool",
					description:
						"The prompt tells the agent to use a web-search tool to gather current information instead of relying on memory.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "ends_with_opening_angle",
					description:
						"The prompt asks for one tailored opening angle / icebreaker for the call at the end.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "requires_web_search_tool fails.",
			nudge:
				"The agent can't know today's facts from memory. Tell it to use a web-search tool to look the company up — that's the difference between a real brief and a hallucination.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Sharp. You scoped the research, told it to actually look things up, and ended with an angle you can open on. That's a brief you'd trust walking into the room.",
		},
		lessonTakeaway:
			"When an agent needs current facts, tell it which tool to use to fetch them — and scope exactly what to bring back.",
	},
	{
		id: AGENT_IDS[3],
		title: "Day Planning Agent",
		instruction:
			"You're a busy founder who wants to automate this. Complete the prompt so the agent plans your day realistically. Describe what you want — don't copy the brief.",
		agentBrief:
			"Create an agent that turns your chaos into a realistic plan for today.",
		whatUserSees:
			"GOAL: Turn a messy task list plus a partly-booked calendar into a realistic, ranked plan for today, including what to cut.\n\n" +
			"INPUT / TRIGGER: Reads the founder's task list and their calendar for the day.\n\n" +
			"DECISION LOGIC: Rank tasks by a clear basis (deadline closeness, revenue impact, or who's blocked waiting). Fit the ranked work into the gaps around existing meetings. When there's more than fits, decide what to drop rather than overpacking the day.\n\n" +
			"OUTPUT FORMAT: A ranked, time-aware plan that respects the meetings, plus an explicit 'cut today' list.\n\n" +
			"EDGE CASES: If the calendar is nearly full, the plan honestly shrinks and the cut list grows — it does not pretend everything fits.\n\n" +
			"WHAT IT MUST NOT DO: It must not ignore the meetings or silently drop tasks without listing them.",
		hint: "For the [what matters most] blank: deadline closeness, revenue impact, or who's blocked waiting on you — and it needs your task list and calendar connected so it can read both.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "gives_ranking_basis",
					description:
						"The prompt gives a concrete basis for ranking the tasks (e.g. deadline, revenue impact, who is blocked).",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "connects_tasks_and_calendar",
					description:
						"The prompt has the agent use BOTH the task list and the calendar, so the plan fits around existing meetings.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "produces_cut_list",
					description:
						"The prompt asks the agent to say what to cut or drop, not just what to do.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "connects_tasks_and_calendar fails.",
			nudge:
				"A plan that ignores your meetings isn't realistic. Tell the agent to read both the task list and the calendar so it plans around what's already booked.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"That's a plan you'd actually follow — ranked by what matters, fit around real meetings, and honest about what won't happen today.",
		},
		lessonTakeaway:
			"A useful planning agent reads every relevant source (tasks AND calendar), ranks by an explicit basis, and is honest about trade-offs.",
	},
	// ===== HARD (passingScore 78) — empty box, no scaffold, tool-hint only =====
	{
		id: AGENT_IDS[4],
		title: "Follow-up Agent",
		instruction:
			"Free-text challenge — no template. Write the full prompt for this agent. Describe exactly who it should nudge, who it should leave alone, how it times the nudges, and which tools it connects. Use your own words.",
		agentBrief:
			"Create an agent that chases your stalled deals for you.",
		whatUserSees:
			"GOAL: Re-engage the right stalled deals with warm, well-timed nudges, while leaving the wrong ones alone and surfacing the important ones to the founder.\n\n" +
			"INPUT / TRIGGER: Reads the pipeline of deals and their status/history from a CRM or deal tracker.\n\n" +
			"DECISION LOGIC: Skip prospects who already replied and deals marked lost. For the rest, send a warm nudge — but space the nudges so they never feel spammy. Escalate high-value deals to the founder instead of just auto-nudging.\n\n" +
			"OUTPUT FORMAT: Nudge emails sent to the right prospects, plus a flag/notification to the founder for high-value deals.\n\n" +
			"EDGE CASES: A prospect who replied since the last run must drop out of the nudge list. A deal marked lost is never chased.\n\n" +
			"WHAT IT MUST NOT DO: It must not spam (no rapid repeat nudges), must not chase replied or lost deals, and must not silently handle a high-value deal without flagging it.",
		hint: "Connect your CRM/deal tracker to read each deal's status, and email to send the nudge — say which does what.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "skips_already_replied",
					description:
						"The prompt tells the agent to skip prospects who have already replied.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "skips_lost_deals",
					description:
						"The prompt tells the agent to skip deals marked lost / dead.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "escalates_high_value",
					description:
						"The prompt escalates or flags high-value deals to the founder rather than only auto-nudging.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "connects_crm_and_email",
					description:
						"The prompt connects a CRM/deal tracker (to read status) with email (to send the nudge), and says which does what.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "times_nudges_not_spammy",
					description:
						"The prompt times or spaces the nudges so they don't feel spammy (cadence / minimum gap).",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 8 out of 10.",
			perfectScore: "All five criteria pass.",
		},
		failState: {
			condition: "skips_already_replied or skips_lost_deals fails.",
			nudge:
				"A chaser that nudges people who already replied — or chases dead deals — is worse than none. Spell out exactly who to skip before you describe who to nudge.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"You drew the line clearly: who to skip, who to escalate, and how the tools connect. That restraint is what separates a helpful chaser from a spam cannon.",
		},
		lessonTakeaway:
			"For an outbound agent, defining who NOT to contact — and wiring the read-source to the send-tool — matters as much as the message itself.",
	},
	{
		id: AGENT_IDS[5],
		title: "Feedback Triage Agent",
		instruction:
			"Boss challenge — no template, no hint about the rules. Write the full prompt: how it sorts feedback, the on-brand replies it drafts, what it escalates, what it must never do, and which tools it connects. Use your own words.",
		agentBrief:
			"Create an agent that handles your incoming feedback for you.",
		whatUserSees:
			"GOAL: Triage incoming feedback, draft safe on-brand replies to the routine ones, and route anything risky to a human — fast.\n\n" +
			"INPUT / TRIGGER: Reads feedback from multiple sources (reviews, DMs, support messages).\n\n" +
			"DECISION LOGIC: Sort each message, then draft a calm, on-brand reply for routine ones. Escalate anything angry or legal-sounding to a human instead of replying. Never make public commitments on the company's behalf.\n\n" +
			"OUTPUT FORMAT: Sorted feedback with draft replies for the safe ones, and risky ones routed to a human via an escalation channel.\n\n" +
			"EDGE CASES: An angry or legal-sounding message is always escalated, never auto-answered. Ambiguous risk is treated as risky.\n\n" +
			"WHAT IT MUST NOT DO: It must not promise refunds or fixes publicly, must not break brand tone, and must not act on a risky message on its own.",
		hint: "Connect the feedback sources (reviews, DMs, support) to an escalation channel like Slack — say which to read from and which to route into.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "escalates_angry_or_legal",
					description:
						"The prompt escalates angry or legal-sounding messages to a human rather than auto-replying.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "no_public_promises",
					description:
						"The prompt forbids promising refunds or fixes publicly on the company's behalf.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "holds_brand_tone",
					description:
						"The prompt requires a consistent, on-brand tone in the drafted replies.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_never_do",
					description:
						"The prompt explicitly defines what the agent must never do on its own.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "connects_sources_to_escalation",
					description:
						"The prompt connects the feedback sources to an escalation channel like Slack, saying which to read from and which to route into.",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 8 out of 10.",
			perfectScore: "All five criteria pass.",
		},
		failState: {
			condition: "escalates_angry_or_legal or defines_never_do fails.",
			nudge:
				"A public-facing agent is one bad reply away from a crisis. Be explicit about what gets escalated to a human and what it must never say or do on its own.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"This is the capstone move: you let the agent handle the routine, drew hard lines around the risky, and named where humans take over. That's an agent you'd actually let near your brand.",
		},
		lessonTakeaway:
			"The strongest agent prompts pair useful autonomy with hard guardrails — define what it answers, what it escalates, and what it must never do alone.",
	},
];

export const agentLessons = agentLessonsBase.map((lesson) => ({
	...lesson,
	...agentLessonScaffolds[lesson.id],
}));
