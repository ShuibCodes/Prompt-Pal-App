import { View, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useDirectionAStore } from "./store";

import { HookScreen } from "./screens/HookScreen";
import { WhyScreen } from "./screens/WhyScreen";
import { LevelScreen } from "./screens/LevelScreen";
import { TimeScreen } from "./screens/TimeScreen";
import { RewardScreen } from "./screens/RewardScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { ChallengeScreen } from "./screens/ChallengeScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { PaywallScreen } from "./screens/PaywallScreen";

/**
 * Direction A · "Open Sky" onboarding flow.
 *
 * Drop-in: render <OnboardingFlowA /> from your root once the user
 * needs onboarding (mirror how OnboardingFlow is gated today).
 * Hooks into useDirectionAStore for step + captured answers.
 */
export function OnboardingFlowA() {
	const step = useDirectionAStore((s) => s.step);

	const render = () => {
		switch (step) {
			case "hook":
				return <HookScreen />;
			case "why":
				return <WhyScreen />;
			case "reward-social":
				return <RewardScreen kind="social" />;
			case "level":
				return <LevelScreen />;
			case "reward-meet":
				return <RewardScreen kind="meet" />;
			case "time":
				return <TimeScreen />;
			case "reward-time":
				return <RewardScreen kind="time" />;
			case "leaderboard":
				return <LeaderboardScreen />;
			case "challenge":
				return <ChallengeScreen />;
			case "result":
				return <ResultScreen />;
			case "paywall":
				return <PaywallScreen />;
			default:
				return <HookScreen />;
		}
	};

	return (
		<View style={styles.container}>
			<Animated.View
				key={step}
				entering={FadeIn.duration(320)}
				exiting={FadeOut.duration(160)}
				style={styles.fill}
			>
				{render()}
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { ...StyleSheet.absoluteFillObject, backgroundColor: "#F7F7F7", zIndex: 50 },
	fill: { flex: 1 },
});
