import { create } from "zustand";

// Direction A onboarding flow — ordered steps.
// Mirrors the 9-screen "Open Sky" prototype.
export type AStep =
	| "hook"
	| "why"
	| "reward-social"
	| "level"
	| "reward-meet"
	| "time"
	| "reward-time"
	| "leaderboard"
	| "challenge"
	| "result"
	| "paywall";

export const A_STEP_ORDER: AStep[] = [
	"hook",
	"why",
	"reward-social",
	"level",
	"reward-meet",
	"time",
	"reward-time",
	"leaderboard",
	"challenge",
	"result",
	"paywall",
];

// Question screens that carry a real progress value (7-step journey shown to user).
const PROGRESS_MAP: Record<AStep, number> = {
	hook: 0,
	why: 14,
	"reward-social": 28,
	level: 42,
	"reward-meet": 57,
	time: 71,
	"reward-time": 85,
	leaderboard: 100,
	challenge: 100,
	result: 100,
	paywall: 100,
};

export function stepProgress(step: AStep): number {
	return PROGRESS_MAP[step];
}

interface AState {
	step: AStep;
	// captured answers
	reason: number | null;
	level: number | null;
	minutesPerDay: number | null;

	next: () => void;
	back: () => void;
	goTo: (s: AStep) => void;
	restart: () => void;
	setReason: (i: number) => void;
	setLevel: (i: number) => void;
	setMinutes: (m: number) => void;
}

export const useDirectionAStore = create<AState>((set, get) => ({
	step: "hook",
	reason: null,
	level: null,
	minutesPerDay: 10,

	next: () => {
		const i = A_STEP_ORDER.indexOf(get().step);
		if (i < A_STEP_ORDER.length - 1) set({ step: A_STEP_ORDER[i + 1] });
	},
	back: () => {
		const i = A_STEP_ORDER.indexOf(get().step);
		if (i > 0) set({ step: A_STEP_ORDER[i - 1] });
	},
	goTo: (s) => set({ step: s }),
	restart: () => set({ step: "hook" }),
	setReason: (reason) => set({ reason }),
	setLevel: (level) => set({ level }),
	setMinutes: (minutesPerDay) => set({ minutesPerDay }),
}));
