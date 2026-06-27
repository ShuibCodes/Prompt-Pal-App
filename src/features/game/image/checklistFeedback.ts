/**
 * Maps a level's checklist items to captured/missed feedback for the result
 * screen. This is a pure UI derivation — no backend change. An item counts as
 * "captured" when the user's prompt (plus any AI-detected matched keywords)
 * covers it, reusing the same matcher the compose screen uses live.
 */
import { getMatchedChecklistItems } from "@/lib/scaffolding/checklistMatching";

export interface ChecklistFeedbackItem {
	label: string;
	passed: boolean;
}

export function buildChecklistFeedback(
	checklistItems: string[],
	prompt: string,
	keywordsMatched: string[] = [],
): ChecklistFeedbackItem[] {
	const items = checklistItems.filter(Boolean);
	if (items.length === 0) return [];

	// Combine the prompt with AI-detected keywords for better recall: a keyword
	// the model saw in the result is strong evidence the element was captured.
	const source = [prompt, ...keywordsMatched].join(" ");
	const matched = new Set(getMatchedChecklistItems(source, items));

	return items.map((label) => ({
		label,
		passed: matched.has(label),
	}));
}
