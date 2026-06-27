// Direction A · "Open Sky" — shared design tokens.
// Kept consistent with the existing green onboarding screens
// (ReasonForLearningScreen / ExperienceScreen) already in the app.
export const A = {
	green: "#5CD615",
	greenDark: "#46A310",
	greenTint: "#EFFCE6",
	successBorder: "#A8E06B",

	ink: "#3C3C3C",
	muted: "#777777",
	border: "#E5E5E5",
	track: "#E5E5E5",
	bg: "#F7F7F7",
	white: "#FFFFFF",
	surf: "#F3F4F6",

	xp: "#FF9600",
	gold: "#FFB800",
	blue: "#4151FF",
	violet: "#9B5DE5",

	hintTint: "#FFF4E5",
	hintBorder: "#FFD79A",
} as const;

// Mascot assets — drop the PNGs into assets/images/ (see HANDOFF).
export const MASCOTS = {
	happy: require("../../../../assets/images/prompty-happy.png"),
	curious: require("../../../../assets/images/prompty-curious.png"),
	joyous: require("../../../../assets/images/prompty-joyous.png"),
	sad: require("../../../../assets/images/prompty-sad.png"),
} as const;

export type MascotName = keyof typeof MASCOTS;
