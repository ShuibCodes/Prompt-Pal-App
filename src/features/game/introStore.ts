import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

interface IntroState {
	seenIntros: Record<string, true>;
	hasSeenIntro: (lessonId: string) => boolean;
	markIntroSeen: (lessonId: string) => void;
}

const secureStorage = {
	getItem: async (name: string): Promise<string | null> => {
		try {
			if (typeof window !== "undefined") {
				return window.localStorage.getItem(name);
			}
			return await SecureStore.getItemAsync(name);
		} catch {
			return null;
		}
	},
	setItem: async (name: string, value: string): Promise<void> => {
		try {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(name, value);
			} else {
				await SecureStore.setItemAsync(name, value);
			}
		} catch {
			// Ignore write failures — intro may replay on next launch.
		}
	},
	removeItem: async (name: string): Promise<void> => {
		try {
			if (typeof window !== "undefined") {
				window.localStorage.removeItem(name);
			} else {
				await SecureStore.deleteItemAsync(name);
			}
		} catch {
			// Ignore.
		}
	},
};

export const useIntroStore = create<IntroState>()(
	persist(
		(set, get) => ({
			seenIntros: {},
			hasSeenIntro: (lessonId) => Boolean(get().seenIntros[lessonId]),
			markIntroSeen: (lessonId) =>
				set((state) => ({
					seenIntros: { ...state.seenIntros, [lessonId]: true },
				})),
		}),
		{
			name: "promptpal-seen-intros",
			storage: createJSONStorage(() => secureStorage),
			partialize: (state) => ({ seenIntros: state.seenIntros }),
		},
	),
);

/** Wait until persisted seen-intros have loaded before gating the intro phase. */
export async function waitForIntroStoreHydration() {
	if (useIntroStore.persist.hasHydrated()) {
		return;
	}
	await new Promise<void>((resolve) => {
		const unsub = useIntroStore.persist.onFinishHydration(() => {
			unsub();
			resolve();
		});
	});
}

export function shouldShowChallengeIntro(level: {
	id: string;
	introPromise?: string;
	introSecret?: string;
}): boolean {
	return Boolean(
		level.introPromise &&
			level.introSecret &&
			!useIntroStore.getState().hasSeenIntro(level.id),
	);
}
