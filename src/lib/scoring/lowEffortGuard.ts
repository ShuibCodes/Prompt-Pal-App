import { tokenizeChecklistText } from "../scaffolding/checklistMatching";

/**
 * Low-effort submission guard.
 *
 * The challenge evaluators (agent + coding, prompt-only) used to hand EVERY
 * submission to the LLM judge and trust its holistic score. That let two kinds
 * of "not even an attempt" inputs slip through to a PASS:
 *   1. character soup with no real words  — e.g. "dbasdbabdjabdihbhbdaih"
 *   2. coherent but completely off-topic   — e.g. "How are you bro?"
 *
 * This module catches those deterministically (no AI call, no quota spent) so
 * the evaluator can return a friendly "give it a real try" message instead of
 * scoring them. It is intentionally HIGH-PRECISION: it only fires on input that
 * is obviously not a genuine attempt, so real (even weak) attempts still flow
 * through normal, lenient scoring. The fuzzier off-topic cases that share an
 * incidental word with the task are caught by the LLM `isRealAttempt` backstop
 * in the evaluator.
 */

export type LowEffortReason = "empty" | "gibberish" | "off_topic";

export interface LowEffortResult {
	isLowEffort: boolean;
	reason?: LowEffortReason;
	/** User-facing, friendly explanation. Safe to show directly. */
	message?: string;
}

export interface LowEffortInput {
	userPrompt: string;
	/**
	 * Public task references (brief, title, description, hints, checklist…).
	 * Used only for the conservative off-topic check — never the hidden rubric.
	 */
	references?: Array<string | undefined>;
	/** Domain signal words (trigger, output, edge case…) that mark a real attempt. */
	strategicSignals?: string[];
}

const MESSAGES: Record<LowEffortReason, string> = {
	empty:
		"There's nothing to grade yet — write a prompt describing what you want the AI to do.",
	gibberish:
		"That doesn't look like a real attempt. Write your prompt in plain English, describing what you want the AI to do for this challenge.",
	off_topic:
		"That doesn't look related to this challenge. Re-read the brief, then write a prompt for this specific task.",
};

const VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);

/** Common keyboard mashes that are otherwise short enough to look word-like. */
const KEYBOARD_MASH = new Set([
	"asdf",
	"asdfgh",
	"asdfghjkl",
	"qwer",
	"qwert",
	"qwerty",
	"qwertyuiop",
	"zxcv",
	"zxcvbn",
	"wasd",
	"jkl",
	"hjkl",
	"lkj",
	"lkjh",
	"poiu",
	"mnbv",
	"sdfg",
	"fghj",
	"qaz",
	"wsx",
	"edc",
]);

function splitRawTokens(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((token) => token.length > 0);
}

function vowelRatio(token: string): number {
	const letters = token.replace(/[^a-z]/g, "");
	if (letters.length === 0) return 0;
	let vowels = 0;
	for (const ch of letters) if (VOWELS.has(ch)) vowels += 1;
	return vowels / letters.length;
}

function maxConsonantRun(token: string): number {
	let run = 0;
	let max = 0;
	for (const ch of token) {
		if (ch >= "a" && ch <= "z" && !VOWELS.has(ch)) {
			run += 1;
			if (run > max) max = run;
		} else {
			run = 0;
		}
	}
	return max;
}

function hasCharRepeatedRun(token: string, times: number): boolean {
	let run = 1;
	for (let i = 1; i < token.length; i++) {
		run = token[i] === token[i - 1] ? run + 1 : 1;
		if (run >= times) return true;
	}
	return false;
}

/** "jkjk", "asdfasdf", "lololol" — a short unit repeated to fill the token. */
function isRepeatedPattern(token: string): boolean {
	const n = token.length;
	if (n < 4) return false;
	for (let unit = 1; unit <= Math.floor(n / 2); unit++) {
		if (n % unit !== 0) continue;
		const slice = token.slice(0, unit);
		if (slice.repeat(n / unit) === token) return true;
	}
	return false;
}

/**
 * A "wordish" token looks like it could be a real word: right length, has
 * vowels, no absurd consonant pile-up, not a keyboard mash or repeated pattern.
 */
export function isWordishToken(token: string): boolean {
	if (token.length < 2 || token.length > 20) return false;
	if (/^\d+$/.test(token)) return false; // pure number
	if (KEYBOARD_MASH.has(token)) return false;
	if (isRepeatedPattern(token)) return false;
	if (hasCharRepeatedRun(token, 4)) return false; // "aaaa", "noooo"
	if (vowelRatio(token) < 0.2) return false; // "dbsdbh", "tttkkk"
	if (maxConsonantRun(token) > 4) return false; // "dbjabdihbhbd"
	return true;
}

/** Meaningful tokens shared between two texts (stopwords already stripped). */
function meaningfulOverlap(prompt: string, references: string): number {
	const promptTokens = new Set(tokenizeChecklistText(prompt));
	const refTokens = new Set(tokenizeChecklistText(references));
	if (promptTokens.size === 0 || refTokens.size === 0) return 0;
	let shared = 0;
	promptTokens.forEach((token) => {
		if (refTokens.has(token)) shared += 1;
	});
	return shared;
}

function containsStrategicSignal(prompt: string, signals: string[]): boolean {
	const lower = ` ${prompt.toLowerCase()} `;
	return signals.some((signal) => lower.includes(signal.toLowerCase()));
}

/**
 * Decide whether a submission is "not even an attempt". Returns
 * `{ isLowEffort: false }` for anything that should be scored normally.
 */
export function detectLowEffortSubmission(
	input: LowEffortInput,
): LowEffortResult {
	const raw = input.userPrompt ?? "";
	const trimmed = raw.trim();

	// 1. Empty / trivially tiny.
	if (trimmed.length < 3) {
		return { isLowEffort: true, reason: "empty", message: MESSAGES.empty };
	}

	const tokens = splitRawTokens(trimmed);
	const wordish = tokens.filter(isWordishToken);

	// 2. Character soup: a real prompt has at least two real words. Catches
	//    "dbasdbabdjabdihbhbdaih", "asdf jkjk", "...", emoji-only, etc.
	if (wordish.length < 2) {
		return {
			isLowEffort: true,
			reason: "gibberish",
			message: MESSAGES.gibberish,
		};
	}

	// 3. Coherent but off-topic chatter ("How are you bro?", "I like pizza").
	//    Conservative on purpose: only a SHORT prompt that shares zero meaningful
	//    words with the task AND uses none of the domain signal words. Longer
	//    attempts are always passed through to the AI judge instead.
	const references = (input.references ?? []).filter(Boolean).join(" ");
	const signals = input.strategicSignals ?? [];
	const hasReferences = tokenizeChecklistText(references).length > 0;
	if (hasReferences && wordish.length <= 6) {
		const overlap = meaningfulOverlap(trimmed, references);
		const hasSignal = containsStrategicSignal(trimmed, signals);
		if (overlap === 0 && !hasSignal) {
			return {
				isLowEffort: true,
				reason: "off_topic",
				message: MESSAGES.off_topic,
			};
		}
	}

	return { isLowEffort: false };
}
