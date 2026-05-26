/**
 * Agent challenge lessons for the new "AI Agent" module.
 *
 * The mechanic: the user reads a plain-text description of what an AI agent does
 * (`agentBrief`) and writes the prompt that would instruct that agent to do its
 * job well. There is NO reference image and NO scaffold template — just the brief
 * and a free-text input (plus a guiding checklist on the easier tiers).
 *
 * Gemini judges the user's prompt against the hidden `whatUserSees` rubric
 * (goal, decision logic, edge cases, output format, what NOT to do) together with
 * `grading.criteria`, using the same LLM-judge pattern as the coding path in ai.ts.
 * There is no generation step — the prompt is judged directly against the rubric.
 *
 * The five grading dimensions the criteria escalate across:
 *   1. trigger / input        — what starts the agent or what it receives
 *   2. decision rules         — the logic it applies
 *   3. output format          — the shape of what it produces
 *   4. edge cases             — the tricky inputs it must anticipate
 *   5. constrain unintended   — the behaviour it must explicitly avoid
 *
 * Difficulty rises together: beginner levels cover fewer dimensions with looser
 * criteria; advanced levels cover all five plus conditional logic. Criteria are
 * never copy-pasted between levels.
 *
 * IMPORTANT: Never change lesson IDs. User progress (userProgress table) is keyed
 * by levelId. Editing copy, briefs, grading, or hints is safe — only ID changes
 * would orphan progress.
 *
 * IDs: agent-1-easy..agent-3-easy, agent-4-medium..agent-7-medium, agent-8-hard..agent-10-hard
 */

const AGENT_IDS = [
	"agent-1-easy",
	"agent-2-easy",
	"agent-3-easy",
	"agent-4-medium",
	"agent-5-medium",
	"agent-6-medium",
	"agent-7-medium",
	"agent-8-hard",
	"agent-9-hard",
	"agent-10-hard",
];

/**
 * Checklist scaffolding — NO scaffoldTemplate for agents (the client requires
 * "just the brief and the free-text input"). Items are abstract enough to guide
 * without giving the answer away, and grow in number/strictness per tier.
 * Advanced (-hard) levels intentionally have no checklist (scaffoldType "none").
 */
const agentLessonScaffolds: Record<string, { checklistItems?: string[] }> = {
	[AGENT_IDS[0]]: {
		checklistItems: [
			"Name the input the agent reads",
			"State the single decision it makes",
			"Describe what it produces as output",
		],
	},
	[AGENT_IDS[1]]: {
		checklistItems: [
			"Name what the agent receives",
			"Specify the exact sections of the output",
			"Say how each section should be formatted",
		],
	},
	[AGENT_IDS[2]]: {
		checklistItems: [
			"Define when the agent runs",
			"State the message it should produce",
			"Describe the tone or format of that message",
		],
	},
	[AGENT_IDS[3]]: {
		checklistItems: [
			"Name the source the agent watches",
			"State the condition that triggers an action",
			"Describe the notification it sends",
			"Say what it should do when nothing qualifies",
		],
	},
	[AGENT_IDS[4]]: {
		checklistItems: [
			"Define the incoming item the agent handles",
			"List the rules that decide where it goes",
			"Describe the structured output",
			"Cover an ambiguous or unclear case",
		],
	},
	[AGENT_IDS[5]]: {
		checklistItems: [
			"Name the request the agent evaluates",
			"Lay out the thresholds or rules it applies",
			"Specify the decision it records and its format",
			"Handle a request that falls outside the rules",
		],
	},
	[AGENT_IDS[6]]: {
		checklistItems: [
			"Define the content the agent reviews",
			"State the criteria it judges against",
			"Describe the structured verdict it returns",
			"Constrain what it must not do on its own",
		],
	},
	// agent-8-hard, agent-9-hard, agent-10-hard: scaffoldType "none" — pure free text, no checklist.
};

const agentLessonsBase = [
	// ===== BEGINNER (passingScore 60) — single clear task, obvious output =====
	{
		id: AGENT_IDS[0],
		title: "Instruct an inbox triage agent",
		instruction:
			"Read what this agent does, then write the prompt that instructs it. Name the input it reads, the one decision it makes, and the output it produces. Use your own words — don't copy the brief.",
		agentBrief:
			"An agent that reads each new email in your inbox and labels the ones that are urgent.",
		whatUserSees:
			"GOAL: Classify every incoming email as urgent or not urgent and apply an 'Urgent' label only to the urgent ones.\n\n" +
			"INPUT / TRIGGER: Fires on each newly received email. Reads the sender, subject, and body.\n\n" +
			"DECISION LOGIC: Treat an email as urgent when it asks for action within a tight deadline (today/now/ASAP), reports something broken or failing, or comes from a flagged VIP sender. Routine newsletters, receipts, and FYI threads are not urgent.\n\n" +
			"OUTPUT FORMAT: For each email, output the email identifier and a boolean urgent flag (e.g. apply or skip the 'Urgent' label). No prose summaries.\n\n" +
			"EDGE CASES: An email with no body, or a forwarded thread, should still be classified, defaulting to not urgent when signals are absent.\n\n" +
			"WHAT IT MUST NOT DO: It must not reply to, archive, delete, or forward emails. It only labels.",
		hint: "A strong prompt names three things: the input (each new email), the rule that defines 'urgent', and the action (apply a label — nothing else).",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "defines_email_input",
					description:
						"The prompt tells the agent to read incoming/new emails as its input.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_urgency_decision",
					description:
						"The prompt gives at least one concrete rule for what makes an email count as urgent.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_label_output",
					description:
						"The prompt states that the agent applies an urgent label (or marks/flags urgent emails) as its output.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 3 out of 5.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "defines_urgency_decision fails.",
			nudge:
				"The agent needs a rule, not just a goal. What specifically makes an email urgent? Spell out at least one condition.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Good. You gave the agent an input, a rule, and an action. That trio is the backbone of every agent prompt.",
		},
		lessonTakeaway:
			"Every agent prompt needs an input to act on, a rule to decide by, and an output to produce. Start with those three.",
	},
	{
		id: AGENT_IDS[1],
		title: "Instruct a meeting-notes summarizer",
		instruction:
			"Write the prompt for this agent. Tell it what it receives and the exact shape of the summary it should return. Be specific about the output sections. Use your own words.",
		agentBrief:
			"An agent that takes raw, messy meeting notes and outputs a structured summary with action items and decisions.",
		whatUserSees:
			"GOAL: Turn unstructured meeting notes into a clean, skimmable summary that a teammate who missed the meeting can act on.\n\n" +
			"INPUT / TRIGGER: Receives a block of raw notes (bullet fragments, half-sentences, names, times) pasted in.\n\n" +
			"DECISION LOGIC: Separate three things — decisions that were made, action items (each with an owner and, if stated, a due date), and a short overview of what was discussed. Infer owners only when clearly named; otherwise mark the owner as unassigned.\n\n" +
			"OUTPUT FORMAT: Three labelled sections — Summary (2-3 sentences), Decisions (bulleted), and Action Items (bulleted, each as 'owner — task — due date'). No raw note fragments echoed back.\n\n" +
			"EDGE CASES: If the notes contain no clear action items or no decisions, the agent still produces the section with an explicit 'None recorded' rather than omitting it.\n\n" +
			"WHAT IT MUST NOT DO: It must not invent decisions or tasks that the notes don't support, and must not add commentary or opinions.",
		hint: "Don't just ask for 'a summary'. Name the sections you want (overview, decisions, action items) and how each should look — e.g. action items as owner, task, and due date.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "names_raw_notes_input",
					description:
						"The prompt establishes that the agent's input is raw or unstructured meeting notes.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "requests_action_items_and_decisions",
					description:
						"The prompt asks for action items AND decisions as distinct parts of the output.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "specifies_output_structure",
					description:
						"The prompt specifies a structure or format for the summary (named sections, bullets, or per-item fields like owner/due date), not just 'summarize it'.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "specifies_output_structure fails.",
			nudge:
				"A summarizer is only as useful as its shape. Tell the agent the exact sections and how each line should be formatted.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Nice. You defined the output's shape, so the agent produces something consistent every time instead of a different blob per run.",
		},
		lessonTakeaway:
			"When an agent produces text, the output format is part of the spec. Name the sections and the per-item fields explicitly.",
	},
	{
		id: AGENT_IDS[2],
		title: "Instruct a daily standup reminder",
		instruction:
			"Write the prompt for this agent. Define when it runs, the message it posts, and the tone of that message. Use your own words.",
		agentBrief:
			"An agent that posts a daily reminder in a team chat channel asking everyone to share their standup update.",
		whatUserSees:
			"GOAL: Reliably prompt the team to post their standup update once per working day.\n\n" +
			"INPUT / TRIGGER: Runs on a schedule — every weekday at a fixed local time (e.g. 9:30am) in one named channel.\n\n" +
			"DECISION LOGIC: Only on weekdays, not weekends or recognised holidays. One message per day, no duplicates.\n\n" +
			"OUTPUT FORMAT: A short, friendly chat message that asks the three standup questions (what you did, what you're doing, any blockers) and is easy to reply to in a thread.\n\n" +
			"EDGE CASES: If it is a weekend or holiday, it posts nothing. If it already posted today, it does not post again.\n\n" +
			"WHAT IT MUST NOT DO: It must not @-mention everyone individually, must not DM people, and must not chase or nag those who haven't replied.",
		hint: "Pin down the trigger (a specific time, weekdays only) and the message itself. A reminder agent lives or dies on when it fires.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "defines_schedule_trigger",
					description:
						"The prompt defines when the agent runs — a time and/or cadence (e.g. each weekday morning), not just 'remind the team'.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_reminder_message",
					description:
						"The prompt describes the content of the reminder message the agent should post.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "specifies_tone_or_channel",
					description:
						"The prompt specifies the tone of the message or the channel/place it should be posted.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 5.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "defines_schedule_trigger fails.",
			nudge:
				"A scheduled agent needs a schedule. When exactly should it fire — and how often?",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"For time-based agents, the trigger is half the prompt. You defined when it runs and what it says — that's a complete instruction.",
		},
		lessonTakeaway:
			"For scheduled agents, the trigger (when it runs, how often) matters as much as the message it sends.",
	},

	// ===== INTERMEDIATE (passingScore 70) — 2-3 rules, some ambiguity =====
	{
		id: AGENT_IDS[3],
		title: "Instruct an overdue-task notifier",
		instruction:
			"Write the prompt for this agent. Name what it monitors, the condition that triggers an alert, the notification it sends, and what it does when nothing qualifies. Use your own words.",
		agentBrief:
			"An agent that monitors a project task database and sends a Slack message when a task becomes overdue.",
		whatUserSees:
			"GOAL: Make sure no task silently slips past its due date without the owner being told.\n\n" +
			"INPUT / TRIGGER: Polls a task database on a regular interval. Each task has a status, an assignee, and a due date.\n\n" +
			"DECISION LOGIC: A task is overdue when its due date is in the past AND its status is not 'done' or 'cancelled'. Only those tasks should trigger a notification. Already-notified tasks should not be alerted again on every poll.\n\n" +
			"OUTPUT FORMAT: A direct Slack message to the task's assignee containing the task name, how many days overdue it is, and a link to the task. One message per newly-overdue task.\n\n" +
			"EDGE CASES: Tasks with no assignee should notify a default channel instead of failing. Tasks with no due date are skipped entirely.\n\n" +
			"WHAT IT MUST NOT DO: It must not change the task's status or due date, must not reassign it, and must not spam the same overdue task on every run.",
		hint: "The decision rule is the heart of this one: 'overdue' means past the due date AND not already finished. And say what happens when a task has no assignee or no due date.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "names_monitored_source",
					description:
						"The prompt tells the agent to monitor a task list/database with due dates as its trigger.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "defines_overdue_rule",
					description:
						"The prompt defines the overdue condition with more than just 'past due' — e.g. past the due date and not already completed.",
					method: "llm_judge",
					weight: 3,
					required: true,
				},
				{
					id: "specifies_notification_contents",
					description:
						"The prompt says what the Slack notification should contain (which task, who to notify, or relevant detail).",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "handles_missing_field_case",
					description:
						"The prompt addresses what to do when a task is missing a field (no assignee or no due date) or avoids re-notifying the same task.",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 6 out of 8.",
			perfectScore: "All four criteria pass.",
		},
		failState: {
			condition: "defines_overdue_rule fails.",
			nudge:
				"'Overdue' is more than 'past the date'. A finished task isn't overdue. Tighten the rule so it ignores completed and cancelled tasks.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"You wrote a real decision rule with an AND in it. Compound conditions are what separate a useful agent from a noisy one.",
		},
		lessonTakeaway:
			"A precise decision rule — often a compound condition — keeps an agent from acting on the wrong items.",
	},
	{
		id: AGENT_IDS[4],
		title: "Instruct a support-ticket triager",
		instruction:
			"Write the prompt for this agent. Define the incoming ticket, the rules that route it, the structured output, and how it handles an unclear ticket. Use your own words.",
		agentBrief:
			"An agent that reads incoming customer support tickets and routes each one to the right team with a priority.",
		whatUserSees:
			"GOAL: Get every new ticket to the correct team with an appropriate priority so nothing sits in a general queue.\n\n" +
			"INPUT / TRIGGER: Fires on each new support ticket. Reads the subject, body, and customer plan tier.\n\n" +
			"DECISION LOGIC: Route by topic — billing/refunds to Finance, bugs/outages to Engineering, how-to questions to Support. Set priority by impact: anything mentioning an outage, data loss, or a paying enterprise customer is high; general questions are low; everything else is medium.\n\n" +
			"OUTPUT FORMAT: A structured record per ticket — team, priority, and a one-line reason — ideally as JSON or labelled fields. No free-form reply to the customer.\n\n" +
			"EDGE CASES: A ticket that spans two topics goes to the team for the higher-impact issue. A ticket with too little information to classify is routed to Support at medium priority and flagged 'needs triage'.\n\n" +
			"WHAT IT MUST NOT DO: It must not reply to the customer, must not close or merge tickets, and must not guess a team when the topic is genuinely unclear — it flags instead.",
		hint: "Give the agent two rule sets: one that picks the team (by topic) and one that picks the priority (by impact). Then say what to do when a ticket is too vague to classify.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "defines_ticket_trigger",
					description:
						"The prompt establishes that the agent acts on each incoming support ticket and what fields it reads.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "defines_routing_rules",
					description:
						"The prompt provides rules that map ticket content to a team or category.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_priority_rules",
					description:
						"The prompt gives a separate basis for assigning priority/severity, distinct from the routing rule.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "handles_ambiguous_ticket",
					description:
						"The prompt says what to do with an ambiguous, multi-topic, or under-specified ticket.",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 5 out of 7.",
			perfectScore: "All four criteria pass.",
		},
		failState: {
			condition: "defines_priority_rules fails.",
			nudge:
				"Routing and priority are two different decisions. You've said where tickets go — now say how the agent decides how urgent each one is.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Two independent rule sets, cleanly separated. That's how you keep an agent's decisions auditable instead of mushed together.",
		},
		lessonTakeaway:
			"When an agent makes more than one decision, give each its own rule set so they don't collapse into vague judgement.",
	},
	{
		id: AGENT_IDS[5],
		title: "Instruct an expense approval router",
		instruction:
			"Write the prompt for this agent. Define the request it evaluates, the thresholds it applies, the decision it records and its format, and what happens for requests outside the rules. Use your own words.",
		agentBrief:
			"An agent that reviews submitted expense requests and either auto-approves them, sends them for manager review, or rejects them.",
		whatUserSees:
			"GOAL: Clear small, in-policy expenses automatically while escalating anything that needs a human, with a clear audit trail.\n\n" +
			"INPUT / TRIGGER: Fires when an employee submits an expense. Reads amount, category, whether a receipt is attached, and the submitter's department.\n\n" +
			"DECISION LOGIC: Auto-approve when the amount is at or below a small threshold AND a receipt is attached AND the category is on the allowed list. Send to manager review when the amount is above the small threshold but at or below a larger cap. Reject outright when the category is disallowed or no receipt is attached on a reimbursable claim.\n\n" +
			"OUTPUT FORMAT: A decision record per request — one of approved / needs_review / rejected — plus the reason and the rule that fired, in structured fields.\n\n" +
			"EDGE CASES: An amount exactly on a threshold boundary follows the stated boundary rule (at-or-below). A foreign-currency amount is converted before the thresholds are applied.\n\n" +
			"WHAT IT MUST NOT DO: It must not approve anything above the larger cap under any circumstances, must not pay or disburse funds, and must not edit the submitted amount.",
		hint: "Thresholds need exact boundaries — is the limit inclusive or exclusive? And give the agent three clear outcomes (approve / review / reject) with the rule that triggers each.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "defines_expense_input",
					description:
						"The prompt establishes the submitted expense (and key fields like amount/receipt) as the input.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "defines_threshold_rules",
					description:
						"The prompt sets out amount thresholds or conditions that decide the outcome.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_three_outcomes",
					description:
						"The prompt maps the rules to distinct outcomes (e.g. approve / escalate / reject) rather than a single yes-or-no.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "specifies_decision_record_format",
					description:
						"The prompt asks for the decision to be recorded in a structured form (status plus reason or the rule applied).",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 5 out of 7.",
			perfectScore: "All four criteria pass.",
		},
		failState: {
			condition: "defines_three_outcomes fails.",
			nudge:
				"This agent has three possible answers, not two. Make sure 'send to a human' is its own outcome between approve and reject.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"You mapped thresholds to three distinct outcomes. Multi-branch logic like this is exactly where vague prompts fall apart — yours didn't.",
		},
		lessonTakeaway:
			"When a decision has more than two outcomes, enumerate every branch and the threshold that triggers it.",
	},
	{
		id: AGENT_IDS[6],
		title: "Instruct a comment moderation agent",
		instruction:
			"Write the prompt for this agent. Define the content it reviews, the criteria it judges against, the structured verdict it returns, and the action it must not take on its own. Use your own words.",
		agentBrief:
			"An agent that reviews user comments on a community forum and flags ones that break the community guidelines.",
		whatUserSees:
			"GOAL: Surface comments that likely violate guidelines for human review, while leaving normal discussion untouched.\n\n" +
			"INPUT / TRIGGER: Fires on each newly posted comment. Reads the comment text and minimal author context.\n\n" +
			"DECISION LOGIC: Flag a comment when it contains harassment or personal attacks, hate speech, spam/advertising, or explicit content. Heated-but-civil disagreement is allowed and must not be flagged. When unsure, lean toward flagging for review rather than auto-acting.\n\n" +
			"OUTPUT FORMAT: A structured verdict per comment — a flag boolean, the category of violation (or 'none'), and a confidence level — for a human moderator to act on.\n\n" +
			"EDGE CASES: Quoted or reported abuse (a user quoting an attack to report it) should not be flagged as if the quoter authored it. Borderline cases get a 'low confidence' flag, not a silent pass.\n\n" +
			"WHAT IT MUST NOT DO: It must not delete, hide, or edit comments, must not ban or warn users, and must not act on its own — every action it takes is a recommendation for a human.",
		hint: "Separate civil disagreement from real violations so the agent doesn't over-flag. And be explicit that it only recommends — a human makes the final call.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "defines_comment_input",
					description:
						"The prompt establishes user comments as the content the agent reviews.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "defines_violation_criteria",
					description:
						"The prompt lists concrete criteria for what counts as a guideline violation.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_structured_verdict",
					description:
						"The prompt asks for a structured verdict (flag plus a category, reason, or confidence) rather than a yes/no alone.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "constrains_to_recommendation",
					description:
						"The prompt constrains the agent to flagging/recommending and forbids it from deleting, banning, or otherwise acting on its own.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All four criteria pass.",
		},
		failState: {
			condition: "constrains_to_recommendation fails.",
			nudge:
				"A moderation agent that acts on its own is dangerous. Tell it explicitly: flag for a human, never delete or ban by itself.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"You drew the line between recommend and act. For anything high-stakes, that boundary is the most important sentence in the prompt.",
		},
		lessonTakeaway:
			"For high-stakes agents, explicitly constrain them to recommending — keep the irreversible action in human hands.",
	},

	// ===== ADVANCED (passingScore 78) — all five dimensions + conditional logic =====
	{
		id: AGENT_IDS[7],
		title: "Instruct a lead-qualification agent",
		instruction:
			"This is a free-text challenge — no checklist. Write the complete prompt for this agent: define its trigger and input, its qualification rules, its output, the edge cases it must anticipate, and the behaviour it must never take. Use your own words.",
		agentBrief:
			"An agent that scores inbound sales leads, updates the CRM record, and notifies a rep when a lead is hot — without spamming reps on weak leads.",
		whatUserSees:
			"GOAL: Qualify each inbound lead, write a score and reasoning back to the CRM, and alert a rep only when the lead clears the bar — so reps spend time on real opportunities.\n\n" +
			"INPUT / TRIGGER: Fires when a lead submits a form. Reads company size, role/title, stated budget, use case, and email domain.\n\n" +
			"DECISION LOGIC: Score on fit (company size and role seniority), intent (explicit budget or timeline), and reachability (business email vs. free webmail). A lead is 'hot' when fit is strong AND intent is present; 'warm' when one of those holds; 'cold' otherwise. Only hot leads trigger a rep alert.\n\n" +
			"OUTPUT FORMAT: Update the CRM record with a score band (hot/warm/cold), a numeric score, and a one-line rationale; for hot leads, additionally send the assigned rep a concise alert with the company, score, and reason.\n\n" +
			"EDGE CASES: Missing fields are treated as unknown and lower the score rather than crashing. Obvious spam or test submissions (gibberish company, disposable domains) are marked 'cold — likely spam' and never alert a rep. Duplicate submissions from the same lead update the existing record instead of creating a new one.\n\n" +
			"WHAT IT MUST NOT DO: It must not email the lead directly, must not alert reps on warm or cold leads, must not delete existing CRM data (only append/update), and must not fabricate budget or intent that the lead didn't provide.",
		hint: "Cover all five: the trigger, the scoring rules (fit + intent + reachability), the CRM-update-plus-conditional-alert output, the edge cases (missing fields, spam, duplicates), and the hard limits (never email the lead, never alert on cold).",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "defines_lead_trigger_input",
					description:
						"The prompt defines the trigger (a new inbound lead) and the lead fields the agent reads.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "defines_scoring_rules",
					description:
						"The prompt gives multi-factor qualification rules (e.g. fit, intent, reachability) rather than a single criterion.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_conditional_alert_output",
					description:
						"The prompt specifies updating the CRM AND conditionally alerting a rep only for qualifying (hot) leads.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "handles_missing_or_spam_or_duplicate",
					description:
						"The prompt anticipates at least one real edge case: missing fields, spam/test submissions, or duplicate leads.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "constrains_unwanted_actions",
					description:
						"The prompt forbids unwanted behaviour — e.g. emailing the lead, alerting on cold leads, deleting CRM data, or inventing data.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 8 out of 9.",
			perfectScore: "All five criteria pass.",
		},
		failState: {
			condition:
				"defines_conditional_alert_output or handles_missing_or_spam_or_duplicate fails.",
			nudge:
				"This agent has to do two things conditionally — always update the CRM, but only alert reps on hot leads — and survive messy input. Make both explicit.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"That's a production-grade agent spec: trigger, multi-factor scoring, conditional output, edge cases, and guardrails all in one prompt.",
		},
		lessonTakeaway:
			"A complete agent prompt covers all five dimensions — trigger, decision rules, output, edge cases, and constraints — and ties output to conditions.",
	},
	{
		id: AGENT_IDS[8],
		title: "Instruct an on-call escalation agent",
		instruction:
			"Free-text challenge — no checklist. Write the full prompt: define what the agent monitors, how it decides severity, how it escalates conditionally, the edge cases (noise, duplicates), the output, and what it must never do. Use your own words.",
		agentBrief:
			"An agent that watches a stream of system alerts, decides how serious each incident is, and pages the right on-call engineer — without waking people up for noise.",
		whatUserSees:
			"GOAL: Make sure genuine incidents reach the right engineer fast, while suppressing noise so on-call trust isn't eroded.\n\n" +
			"INPUT / TRIGGER: Consumes a continuous stream of monitoring alerts. Each alert has a service, a severity hint, a timestamp, and a message.\n\n" +
			"DECISION LOGIC: Classify each incident as SEV1 (customer-facing outage or data loss), SEV2 (degraded service, no full outage), or SEV3 (internal/non-urgent). Escalation is conditional: SEV1 pages the primary on-call immediately and the secondary if unacknowledged within a set window; SEV2 notifies the team channel only; SEV3 is logged, not paged. Correlate related alerts into a single incident.\n\n" +
			"OUTPUT FORMAT: For each incident, a structured action — severity, the target (who/what is notified), and the escalation step taken — plus the page or channel message itself when one is sent.\n\n" +
			"EDGE CASES: A flapping alert that fires and resolves repeatedly must be deduplicated, not paged on every flap. A burst of alerts from one root cause is grouped into one incident. An alert for a service in a known maintenance window is suppressed.\n\n" +
			"WHAT IT MUST NOT DO: It must not page anyone for SEV3, must not page repeatedly for the same unresolved incident (escalate on a schedule instead), must not auto-resolve or close incidents, and must not modify the alerting rules themselves.",
		hint: "The hard parts are the conditional escalation (SEV1 pages now, escalates to secondary if unacked; SEV2 only notifies the channel) and the noise control (dedupe flapping alerts, group a burst, respect maintenance windows).",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "defines_alert_stream_trigger",
					description:
						"The prompt establishes the agent's input as a stream of monitoring alerts with relevant fields.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "defines_severity_classification",
					description:
						"The prompt defines distinct severity levels and the rule for assigning each.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_conditional_escalation",
					description:
						"The prompt specifies escalation that depends on severity and/or acknowledgement (e.g. page primary, then secondary if unacked; channel-only for lower severity).",
					method: "llm_judge",
					weight: 3,
					required: true,
				},
				{
					id: "handles_noise_dedup",
					description:
						"The prompt addresses noise: deduplicating flapping alerts, grouping a burst into one incident, or suppressing maintenance-window alerts.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "constrains_paging_behaviour",
					description:
						"The prompt forbids unwanted behaviour — e.g. paging for the lowest severity, re-paging endlessly, or auto-closing incidents.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 9 out of 10.",
			perfectScore: "All five criteria pass.",
		},
		failState: {
			condition:
				"defines_conditional_escalation or handles_noise_dedup fails.",
			nudge:
				"On-call agents fail in two ways: missing real incidents and crying wolf. Your prompt needs conditional escalation AND explicit noise suppression.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"You handled both the escalation ladder and the noise. That balance — responsive but not annoying — is the whole job of an on-call agent.",
		},
		lessonTakeaway:
			"The hardest agents balance two failure modes at once; spell out both the conditional action and the suppression rules that prevent over-acting.",
	},
	{
		id: AGENT_IDS[9],
		title: "Instruct an invoice-processing agent",
		instruction:
			"Free-text challenge — no checklist. Write the complete prompt: define its trigger and what it extracts, its validation rules, its conditional output, the edge cases (duplicates, mismatches), and the actions it must never take. Use your own words.",
		agentBrief:
			"An agent that reads incoming vendor invoices, validates them against purchase orders, and schedules approved ones for payment — while catching duplicates and mismatches and never auto-paying large amounts.",
		whatUserSees:
			"GOAL: Process valid invoices straight through to a scheduled payment, while routing anything suspicious or large to a human, with a full audit trail.\n\n" +
			"INPUT / TRIGGER: Fires when an invoice arrives (email attachment or upload). Extracts vendor, invoice number, line items, total amount, currency, and the referenced purchase order (PO) number.\n\n" +
			"DECISION LOGIC: Validate the invoice against the matching PO — vendor matches, line items and total are within an allowed tolerance, and the PO is open. A clean match at or below the auto-pay threshold is scheduled for payment on its due date. A clean match above the threshold is sent for human approval. Any validation failure is routed to AP review.\n\n" +
			"OUTPUT FORMAT: A structured result per invoice — status (scheduled / needs_approval / needs_review), the matched PO, the amount and due date, and the reason — plus a payment-schedule entry only when status is 'scheduled'.\n\n" +
			"EDGE CASES: A duplicate invoice (same vendor + invoice number already seen) is rejected as a duplicate and never scheduled twice. A total that exceeds the PO beyond tolerance is flagged as a mismatch. A missing or unrecognised PO is routed to review, not guessed.\n\n" +
			"WHAT IT MUST NOT DO: It must not pay or release funds itself (it only schedules), must not auto-approve anything above the threshold, must not pay a duplicate, and must not alter the invoice amount or the PO.",
		hint: "Tie the output to conditions: clean + under threshold → schedule; clean + over threshold → human approval; any mismatch → review. Then nail the edge cases — duplicate invoices and PO mismatches — and the absolute limit on auto-paying large amounts.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "defines_invoice_trigger_extraction",
					description:
						"The prompt defines the trigger (an incoming invoice) and the fields the agent must extract.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "defines_validation_rules",
					description:
						"The prompt specifies how the invoice is validated against a purchase order or reference data.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "defines_conditional_payment_output",
					description:
						"The prompt maps validation results to conditional outcomes (schedule vs. human approval vs. review) and a structured record.",
					method: "llm_judge",
					weight: 3,
					required: true,
				},
				{
					id: "handles_duplicate_or_mismatch",
					description:
						"The prompt anticipates duplicates and/or amount-vs-PO mismatches and routes them safely.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "constrains_payment_authority",
					description:
						"The prompt forbids dangerous actions — auto-paying above the threshold, releasing funds directly, paying duplicates, or editing the amount/PO.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 9 out of 10.",
			perfectScore: "All five criteria pass.",
		},
		failState: {
			condition:
				"defines_conditional_payment_output or constrains_payment_authority fails.",
			nudge:
				"Money agents need a hard ceiling. Make the payment outcome conditional on validation AND amount, and forbid auto-paying large or duplicate invoices outright.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Conditional outcomes, duplicate and mismatch handling, and a hard spending ceiling — this is the kind of prompt you'd actually trust near a bank account.",
		},
		lessonTakeaway:
			"For agents that touch money or irreversible actions, bind the output to validation conditions and set explicit, non-negotiable ceilings on what they may do alone.",
	},
];

export const agentLessons = agentLessonsBase.map((lesson) => ({
	...lesson,
	...agentLessonScaffolds[lesson.id],
}));
