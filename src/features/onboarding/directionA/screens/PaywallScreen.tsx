import { useState } from "react";
import * as Haptics from "expo-haptics";
import { useMutation } from "convex/react";
import { PaywallScreen as ProductPaywallScreen } from "@/features/onboarding/paywall/PaywallScreen";
import { useDirectionAStore } from "../store";
import { useOnboardingStore } from "@/features/onboarding/store";
import { api } from "../../../../../convex/_generated/api.js";

const REASON_GOALS = [
	"career",
	"projects",
	"future-proof",
	"curiosity",
	"study",
	"save-time",
] as const;

const EXPERIENCE_LEVELS = ["beginner", "beginner", "intermediate", "advanced"] as const;

export function PaywallScreen() {
	const { reason, level, minutesPerDay } = useDirectionAStore();
	const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
	const completeBackendOnboarding = useMutation(api.questProduct.completeOnboarding);
	const [isFinishing, setIsFinishing] = useState(false);

	const finish = async () => {
		if (isFinishing) return;
		setIsFinishing(true);
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		try {
			await completeBackendOnboarding({
				selectedTrackId: "mixed",
				experienceLevel:
					level != null
						? EXPERIENCE_LEVELS[Math.max(0, Math.min(level, EXPERIENCE_LEVELS.length - 1))]
						: "beginner",
				reasonForLearning:
					reason != null
						? REASON_GOALS[Math.max(0, Math.min(reason, REASON_GOALS.length - 1))]
						: "build-prompting-skills",
				selectedGoals: [
					"direction-a",
					`daily-${minutesPerDay ?? 10}-minutes`,
					...(reason != null
						? [REASON_GOALS[Math.max(0, Math.min(reason, REASON_GOALS.length - 1))]]
						: []),
				],
			});
		} catch {
			// Local completion remains available offline; backend will re-sync.
		} finally {
			completeOnboarding();
		}
	};

	return (
		<ProductPaywallScreen
			onContinue={() => void finish()}
			onClose={() => void finish()}
			onRestore={() => {
				// Placeholder until RevenueCat is wired.
			}}
		/>
	);
}
