import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ContinueButton, Footer, Mascot } from "../components/Chrome";
import { Confetti } from "@/features/challenge-preview/Confetti";
import { useImageChallengeSession } from "@/features/game/image/imageChallengeSession";
import { useDirectionAStore } from "../store";
import { A } from "../theme";

export function ResultScreen() {
	const { next } = useDirectionAStore();
	const lastResult = useImageChallengeSession((s) => s.lastResult);
	const clearLastResult = useImageChallengeSession((s) => s.clearLastResult);

	useEffect(() => {
		void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	}, []);

	const score = lastResult ? Math.round(lastResult.score) : null;

	const onContinue = () => {
		clearLastResult();
		next();
	};

	return (
		<SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
			<Confetti />
			<View style={styles.body}>
				<Mascot name="joyous" size={176} celebrate />

				<Animated.View entering={FadeInDown.delay(120).springify()}>
					<Text style={styles.verdict}>Nailed it!</Text>
				</Animated.View>

				{score != null ? (
					<Animated.View
						entering={FadeInDown.delay(220).springify()}
						style={styles.scorePill}
					>
						<MaterialCommunityIcons name="star" size={18} color="#fff" />
						<Text style={styles.scoreText}>{score}% match</Text>
					</Animated.View>
				) : (
					<Animated.View
						entering={FadeInDown.delay(220).springify()}
						style={styles.scorePill}
					>
						<MaterialCommunityIcons name="lightning-bolt" size={18} color="#fff" />
						<Text style={styles.scoreText}>+100 XP</Text>
					</Animated.View>
				)}

				<Animated.Text entering={FadeInDown.delay(320).springify()} style={styles.sub}>
					You just turned words into an image — that's the whole game. Let's keep going.
				</Animated.Text>
			</View>

			<Footer>
				<ContinueButton label="CONTINUE" onPress={onContinue} />
			</Footer>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: A.bg },
	body: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 18,
		paddingHorizontal: 28,
	},
	verdict: {
		fontSize: 40,
		fontWeight: "900",
		color: A.greenDark,
		letterSpacing: -0.5,
		textAlign: "center",
	},
	scorePill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: A.xp,
		borderRadius: 99,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	scoreText: { color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
	sub: {
		fontSize: 16,
		fontWeight: "700",
		color: A.ink,
		textAlign: "center",
		lineHeight: 23,
		maxWidth: 300,
	},
});
