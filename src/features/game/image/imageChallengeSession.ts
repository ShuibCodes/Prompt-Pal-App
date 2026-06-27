/**
 * Image-challenge session store (dev image lab two-screen flow).
 *
 * Carries state between the compose screen (`/game/image/[id]`) and the result
 * screen (`/game/image/[id]/result`) without stuffing image URLs / evaluation
 * JSON into route params:
 *   - `promptByLevel` retains the user's prompt per level so "Try again" returns
 *     to the compose screen with their text intact (edit, not retype).
 *   - `lastResult` is the evaluation snapshot the result screen renders, so it
 *     paints instantly with no second fetch / blank flash.
 *
 * This is in-memory only (no persistence) — it is scratch state for a single
 * play session, not user progress.
 */
import { create } from "zustand";

export interface ImageRoundCriterion {
	name: string;
	score: number;
	feedback: string;
}

export interface ImageRoundResult {
	levelId: string;
	levelTitle: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	score: number;
	passingScore: number;
	promptQualityScore: number;
	feedback: string[];
	keywordsMatched: string[];
	criteria: ImageRoundCriterion[];
	checklistItems: string[];
	prompt: string;
	generatedImageUrl: string;
}

interface ImageChallengeSessionState {
	/** Retained prompt text keyed by level id (survives the result round trip). */
	promptByLevel: Record<string, string>;
	/** The most recent evaluation snapshot for the result screen. */
	lastResult: ImageRoundResult | null;
	setPrompt: (levelId: string, prompt: string) => void;
	getPrompt: (levelId: string) => string | undefined;
	clearPrompt: (levelId: string) => void;
	setLastResult: (result: ImageRoundResult) => void;
	clearLastResult: () => void;
}

export const useImageChallengeSession = create<ImageChallengeSessionState>(
	(set, get) => ({
		promptByLevel: {},
		lastResult: null,
		setPrompt: (levelId, prompt) =>
			set((state) => ({
				promptByLevel: { ...state.promptByLevel, [levelId]: prompt },
			})),
		getPrompt: (levelId) => get().promptByLevel[levelId],
		clearPrompt: (levelId) =>
			set((state) => {
				const next = { ...state.promptByLevel };
				delete next[levelId];
				return { promptByLevel: next };
			}),
		setLastResult: (result) => set({ lastResult: result }),
		clearLastResult: () => set({ lastResult: null }),
	}),
);
