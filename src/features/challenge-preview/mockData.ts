/**
 * Mock data for the standalone challenge-screen UI preview.
 *
 * These values stand in for the live `quest/[id].tsx` state (score, streak,
 * checklist, etc.) so the preview screens render with zero Convex/AI/Clerk
 * calls. Iterate on the preview UI freely; nothing here touches real progress.
 */

import type { PromptyMood } from "./PromptyMascot";

export type ResultChecklistItem = { label: string; passed: boolean };

export interface ChallengeResultPreviewData {
	/** Headline category badge, e.g. "CODE" / "AGENT". */
	categoryLabel: string;
	/** 1-based level number shown in the badge. */
	levelNum: number;
	/** Prompty's mood for this result state. */
	mood: PromptyMood;
	/** Task-match score 0–100 (the green bar + verdict driver). */
	score: number;
	/** Prompt-quality score 0–100 (the orange bar). */
	promptQuality: number;
	/** XP awarded on a pass. */
	rewardXp: number;
	/** Current day streak shown in the reward tile. */
	streak: number;
	/** Per-criterion feedback rendered as ticks/crosses. */
	checklist: ResultChecklistItem[];
	/** One-line lesson takeaway shown at the bottom. */
	takeaway: string;
}

export const PASSING_SCORE = 70;

/** "Got it right" sample — high score, all checklist items covered. */
export const MOCK_RESULT_PASS: ChallengeResultPreviewData = {
	categoryLabel: "CODE",
	levelNum: 3,
	mood: "happy",
	score: 94,
	promptQuality: 88,
	rewardXp: 250,
	streak: 5,
	checklist: [
		{ label: "Sets a clear role for the model", passed: true },
		{ label: "States the exact output format", passed: true },
		{ label: "Includes a concrete example", passed: true },
		{ label: "Defines a constraint or limit", passed: true },
	],
	takeaway:
		"Telling the model who it is and exactly what to produce removes guesswork — that's why this prompt scored so well.",
};

/** "Got it wrong" sample — below passing, some checklist items missed. */
export const MOCK_RESULT_FAIL: ChallengeResultPreviewData = {
	categoryLabel: "CODE",
	levelNum: 3,
	mood: "sad",
	score: 48,
	promptQuality: 41,
	rewardXp: 250,
	streak: 5,
	checklist: [
		{ label: "Sets a clear role for the model", passed: true },
		{ label: "States the exact output format", passed: false },
		{ label: "Includes a concrete example", passed: false },
		{ label: "Defines a constraint or limit", passed: true },
	],
	takeaway:
		"Add the missing pieces — an exact output format and one example — and the model will have far less room to drift.",
};

export interface ChallengeCompletionPreviewData {
	earnedXp: number;
	questTitle: string;
}

export const MOCK_COMPLETION: ChallengeCompletionPreviewData = {
	earnedXp: 250,
	questTitle: "Master the Identity Prompt",
};
