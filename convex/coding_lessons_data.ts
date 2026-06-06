/**
 * Coding lessons for the Coding module.
 *
 * The mechanic: the user is shown a rendered TARGET UI (the "build this" preview,
 * authored in src/features/game/utils/lessonTarget.ts → codingTargetHtmlById) and
 * writes the PROMPT that would produce it. There is NO generation step — the
 * prompt is judged directly against `grading.criteria` (prompt-only, like agents).
 *
 * SCAFFOLDING FADE:
 *   - easy → fill-in-the-blank template (the user completes the gaps)
 *   - medium/hard/boss → empty box (free text); scaffolding is gone
 *
 * Some challenges carry a "trap": the target includes a pre-existing element
 * (a heading, a nav) that must survive. The target render shows a visible
 * "already on the page — must survive" badge so the user knows to protect it;
 * the grading then checks the prompt actually says to leave it untouched.
 *
 * ROLLOUT: built but kept DARK — the coding track is inactive and these are not
 * in `allLevels` yet. Flip on by adding codeLevels back to allLevels and
 * activating the coding track.
 *
 * IMPORTANT: Never change lesson IDs — userProgress is keyed by levelId.
 *
 * IDs: code-1-easy, code-2-easy, code-3-medium, code-4-hard, code-5-hard (boss)
 */

const CODE_IDS = [
	"code-1-easy",
	"code-2-easy",
	"code-3-medium",
	"code-4-hard",
	"code-5-hard",
];

/**
 * Easy tier only: fill-in-the-blank templates. `checklistItems` map ordinally to
 * the [bracket] slots. Medium/hard have no scaffold (empty box).
 */
const codingLessonScaffolds: Record<
	string,
	{ scaffoldTemplate?: string; checklistItems?: string[] }
> = {
	[CODE_IDS[0]]: {
		scaffoldTemplate:
			"Build a card with [an image], [a title], [a description], and [a button].",
		checklistItems: ["An image", "A title", "A description", "A button"],
	},
	[CODE_IDS[1]]: {
		scaffoldTemplate:
			"Add a search bar with [placeholder text], [a search icon], and [a button].",
		checklistItems: ["Placeholder text", "A search icon", "A button"],
	},
};

const codingLessonsBase = [
	// ===== EASY (passingScore 60) — fill-in-the-blank template =====
	{
		id: CODE_IDS[0],
		title: "The Card",
		instruction:
			"Look at the target, then complete the prompt that would build it. Name what you see — don't describe HTML or code.",
		whatUserSees:
			"A single card: a coloured image placeholder at the top, a bold title ('Mountain Retreat'), one muted line of description ('A quiet cabin getaway in the hills.'), and a dark full-width button ('Book now'). Rounded corners, soft shadow.",
		hint: "For the [a title] blank: name the place (like 'Mountain Retreat'). The description is one calm line about it; the button says what happens, like 'Book now'.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "names_image",
					description:
						"The prompt asks for an image (or image placeholder) at the top of the card.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "names_title",
					description: "The prompt asks for a title/heading on the card.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "names_description",
					description: "The prompt asks for a line of description text.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "names_button",
					description: "The prompt asks for a button (e.g. 'Book now').",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All four criteria pass.",
		},
		failState: {
			condition: "Any required element is missing from the prompt.",
			nudge:
				"Name every part you can see in the target: the image, the title, the description, and the button.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Nice — you named what's on screen and let the AI build it. Describing the outcome, not the code, is the whole skill.",
		},
		lessonTakeaway:
			"Describe what you see — the parts on screen — not the HTML. Name each element and the AI assembles it.",
	},
	{
		id: CODE_IDS[1],
		title: "The Search Bar",
		instruction:
			"Look at the target, then complete the prompt that would build it. Name what you see — don't describe HTML or code.",
		whatUserSees:
			"One rounded input field with greyed placeholder text ('Search products…'), a small magnifier icon on the left inside the field, and a small accent-coloured button on the right ('Go'). Single row, nothing else.",
		hint: "For the [placeholder text] blank: the greyed hint inside the field, like 'Search products…'. There's a magnifier icon on the left and a small 'Go' button on the right.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "names_input_with_placeholder",
					description:
						"The prompt asks for a text input with placeholder text (e.g. 'Search products…').",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "names_search_icon",
					description:
						"The prompt asks for a search/magnifier icon inside the field.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "names_button",
					description:
						"The prompt asks for a button (e.g. 'Go') to run the search.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "Any required element is missing from the prompt.",
			nudge:
				"Cover all three: the input with its placeholder, the magnifier icon, and the 'Go' button.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Good. Small component, but you specified each piece — placeholder, icon, button — so there's nothing left to guess.",
		},
		lessonTakeaway:
			"Even tiny components have parts. Name the placeholder, the icon, and the button instead of just saying 'a search bar'.",
	},
	// ===== MEDIUM (passingScore 70) — empty box, the trap =====
	{
		id: CODE_IDS[2],
		title: "The Sign-up Form",
		instruction:
			"Free-text challenge — no template. Look at the target and write the prompt that builds the form. There's already a heading on the page (see the badge) — make sure your prompt protects it.",
		whatUserSees:
			"A bold 'Welcome back' heading is already at the top of the page (pre-existing — it must survive). Below it: a form with three stacked input fields (Name, Email, Password) and a dark submit button ('Sign up').",
		hint: "Name all three fields (Name, Email, Password) and the 'Sign up' button — and explicitly tell the AI NOT to touch the 'Welcome back' heading that's already there.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "names_three_fields",
					description:
						"The prompt asks for the three input fields: Name, Email, and Password.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "names_submit_button",
					description: "The prompt asks for a submit button (e.g. 'Sign up').",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "protects_existing_heading",
					description:
						"The prompt explicitly says to leave the existing 'Welcome back' heading unchanged / untouched.",
					method: "llm_judge",
					weight: 3,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "protects_existing_heading fails.",
			nudge:
				"You built the form, but did you protect the 'Welcome back' heading? Under-specify and the AI overwrites what's already there. Say what must NOT change.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"That's the #1 real-world skill: saying what must NOT change. You added the form and protected the heading that was already there.",
		},
		lessonTakeaway:
			"When something already exists on the page, say explicitly what to leave untouched — or the AI will happily overwrite it.",
	},
	// ===== HARD (passingScore 78) — empty box =====
	{
		id: CODE_IDS[3],
		title: "The Tab Bar",
		instruction:
			"Free-text challenge — no template. Look at the target and write the prompt. The whole challenge is describing the difference between the active and inactive tabs.",
		whatUserSees:
			"A horizontal tab bar with three tabs (Home · Search · Profile). One tab (Home) is clearly active — darker text with an accent underline; the other two are muted/inactive. The active-vs-inactive contrast is obvious.",
		hint: "Describe the difference: the active tab (Home) is darker with an accent underline; the other two are muted/grey. That contrast is the point — don't just say 'a tab bar'.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "names_three_tabs",
					description:
						"The prompt asks for a tab bar with three tabs (Home, Search, Profile).",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "describes_active_state",
					description:
						"The prompt describes how the active tab looks distinct — e.g. darker text with an accent underline.",
					method: "llm_judge",
					weight: 3,
					required: true,
				},
				{
					id: "describes_inactive_state",
					description:
						"The prompt describes the inactive tabs as muted/greyed.",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 5 out of 7.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "describes_active_state fails.",
			nudge:
				"A tab bar where every tab looks the same isn't a tab bar. Spell out exactly how the active tab differs — darker, with an accent underline.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"You described state, not just structure — the active tab vs the muted ones. That precision is what separates a hard prompt from a vague one.",
		},
		lessonTakeaway:
			"Describe the differences between states, not just the elements. 'Active vs inactive' has to be spelled out or the AI guesses.",
	},
	{
		id: CODE_IDS[4],
		title: "The Hero",
		instruction:
			"Boss challenge — no template, no fill-in help. Look at the target and write the whole prompt. There's already a nav bar at the top (see the badge) — protect it.",
		whatUserSees:
			"A simple nav bar is already across the top — a small logo/wordmark on the left and 2–3 muted nav links on the right (pre-existing — it must survive). Below it, a hero: a large bold headline ('Ship faster with AI'), a line of supporting text ('Turn ideas into polished interfaces.'), and a single prominent button ('Get started').",
		hint: "Ask for a big headline, one line of supporting text, and a 'Get started' button — and tell the AI to leave the existing nav bar at the top untouched.",
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "names_headline",
					description:
						"The prompt asks for a large headline (e.g. 'Ship faster with AI').",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "names_supporting_text",
					description: "The prompt asks for a line of supporting text.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
				{
					id: "names_button",
					description:
						"The prompt asks for a prominent button (e.g. 'Get started').",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "protects_existing_nav",
					description:
						"The prompt explicitly says to leave the existing top nav bar untouched.",
					method: "llm_judge",
					weight: 3,
					required: true,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 7 out of 8.",
			perfectScore: "All four criteria pass.",
		},
		failState: {
			condition: "protects_existing_nav fails.",
			nudge:
				"The nav is already there — and it's the thing most likely to get clobbered. Build the hero AND tell the AI to leave the existing nav untouched.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Boss cleared. You built the hero from scratch and protected what was already on the page — outcome described, existing structure defended. That's the whole track in one prompt.",
		},
		lessonTakeaway:
			"The complete prompt builds the new thing AND protects the old one. Describe the outcome, then guard what must not change.",
	},
];

export const codingLessons = codingLessonsBase.map((lesson) => ({
	...lesson,
	...codingLessonScaffolds[lesson.id],
}));
