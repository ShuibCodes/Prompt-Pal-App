import { describe, expect, it } from "@jest/globals";

import {
	detectLowEffortSubmission,
	isWordishToken,
} from "@/lib/scoring/lowEffortGuard";
import { STRATEGIC_SIGNALS } from "@/lib/scoring/promptQuality";

// A representative agent task: an email-triage agent. Used as the task context
// for the off-topic checks.
const AGENT_REFERENCES = [
	"Inbox Triage Agent",
	"Sort each incoming email into urgent, normal, or spam and decide what to do next.",
	"Define the trigger, the decision rules, the output format, and edge cases.",
];
const AGENT_SIGNALS = STRATEGIC_SIGNALS.agent;

function detectAgent(userPrompt: string) {
	return detectLowEffortSubmission({
		userPrompt,
		references: AGENT_REFERENCES,
		strategicSignals: AGENT_SIGNALS,
	});
}

describe("detectLowEffortSubmission — empty / trivial", () => {
	it.each([
		["empty string", ""],
		["whitespace only", "   \n\t "],
		["single character", "a"],
		["two characters", "ab"],
		["punctuation only", "?!"],
	])("flags %s as not an attempt", (_label, prompt) => {
		const result = detectAgent(prompt);
		expect(result.isLowEffort).toBe(true);
		expect(result.message).toBeTruthy();
	});
});

describe("detectLowEffortSubmission — character soup / gibberish", () => {
	it.each([
		["long random no-space string", "dbasdbabdjabdihbhbdaih"],
		["keyboard mash with spaces", "asdf jkjk"],
		["repeated keyboard row", "asdfasdfasdf"],
		["repeated short pattern", "jkjkjkjk"],
		["consonant pile-up", "dbsdbh tttkkk"],
		["repeated single char", "aaaaaaa"],
		["random caps soup", "XKCDQ ZZPLMN"],
		["numbers only", "12345 67890"],
	])("flags %s as gibberish", (_label, prompt) => {
		const result = detectAgent(prompt);
		expect(result.isLowEffort).toBe(true);
		expect(result.reason).toBe("gibberish");
	});
});

describe("detectLowEffortSubmission — coherent but off-topic", () => {
	it.each([
		["greeting", "How are you bro?"],
		["chit-chat", "I really like pizza today"],
		["unrelated statement", "The weather is nice outside"],
	])("flags %s as off-topic", (_label, prompt) => {
		const result = detectAgent(prompt);
		expect(result.isLowEffort).toBe(true);
		expect(result.reason).toBe("off_topic");
	});
});

describe("detectLowEffortSubmission — genuine attempts pass through", () => {
	it.each([
		[
			"weak but on-topic short attempt",
			"Sort the emails by how urgent they are",
		],
		[
			"on-topic using domain signal words",
			"When an email arrives, decide if it is urgent and output a label",
		],
		[
			"full strong attempt",
			"Trigger on each new inbox email. Read the subject and body, then classify it as urgent, normal, or spam based on sender and keywords. Output a JSON object with the label and a one-line reason. If the email is empty or unreadable, mark it normal and flag for review. Never auto-delete anything.",
		],
		[
			"on-topic attempt with a typo",
			"sort incomming emails into urgent or not urgent and tell me why",
		],
	])("lets %s through to scoring", (_label, prompt) => {
		const result = detectAgent(prompt);
		expect(result.isLowEffort).toBe(false);
	});
});

describe("detectLowEffortSubmission — off-topic guard is conservative", () => {
	it("does NOT flag a longer off-topic prompt deterministically (left to the AI backstop)", () => {
		// >6 wordish tokens: the deterministic off-topic rule deliberately backs
		// off here so it never blocks a genuine longer attempt; the LLM
		// isRealAttempt backstop handles these.
		const result = detectAgent(
			"How are you doing today my friend I hope everything is going really well",
		);
		expect(result.isLowEffort).toBe(false);
	});

	it("does not run the off-topic check when there are no task references", () => {
		const result = detectLowEffortSubmission({
			userPrompt: "How are you bro?",
			references: [],
			strategicSignals: AGENT_SIGNALS,
		});
		// Still a coherent multi-word string, so not gibberish and not flagged.
		expect(result.isLowEffort).toBe(false);
	});
});

describe("detectLowEffortSubmission — coding domain", () => {
	const CODE_REFERENCES = [
		"The Search Bar",
		"Build a search input with a placeholder and a submit button.",
	];
	function detectCode(userPrompt: string) {
		return detectLowEffortSubmission({
			userPrompt,
			references: CODE_REFERENCES,
			strategicSignals: STRATEGIC_SIGNALS.code,
		});
	}

	it("flags gibberish for coding too", () => {
		expect(detectCode("asdkjhaskjdhakjsd").isLowEffort).toBe(true);
	});

	it("passes a genuine coding prompt", () => {
		expect(
			detectCode(
				"Create a search bar with a rounded input, a magnifying glass icon, and a blue submit button",
			).isLowEffort,
		).toBe(false);
	});
});

describe("isWordishToken", () => {
	it.each(["sort", "email", "urgent", "classify", "trigger", "incomming"])(
		"treats %s as a real word",
		(token) => {
			expect(isWordishToken(token)).toBe(true);
		},
	);

	it.each([
		"dbasdbabdjabdihbhbdaih", // too long + consonant pile-up
		"jkjk", // repeated pattern
		"asdf", // keyboard mash
		"aaaa", // repeated char
		"tttkkk", // no vowels
		"x", // too short
	])("treats %s as not a real word", (token) => {
		expect(isWordishToken(token)).toBe(false);
	});
});
