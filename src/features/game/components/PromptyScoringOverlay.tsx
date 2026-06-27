/**
 * PromptyScoringOverlay — the "maximum dopamine" wait state shown between
 * submitting a prompt and seeing the result.
 *
 * A small Prompty bobs in the center of the screen while a line of text
 * cycles through reassuring progress messages ("Scoring your prompt…" →
 * "Almost there…"). Rendered as an absolutely-positioned overlay so it can
 * float over any challenge screen (image, coding, copy).
 */
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
	FadeIn,
	FadeOut,
	FadeInUp,
} from "react-native-reanimated";
import { PromptyMascot } from "@/features/challenge-preview/PromptyMascot";

const DEFAULT_MESSAGES = [
	"Reading your prompt…",
	"Thinking it over…",
	"Scoring your prompt…",
	"Almost there…",
];

export interface PromptyScoringOverlayProps {
	visible: boolean;
	/** Lines to cycle through. Falls back to a generic scoring set. */
	messages?: string[];
	/** How long each message stays on screen (ms). */
	intervalMs?: number;
}

export function PromptyScoringOverlay({
	visible,
	messages,
	intervalMs = 1400,
}: PromptyScoringOverlayProps) {
	const lines = messages && messages.length > 0 ? messages : DEFAULT_MESSAGES;
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (!visible) {
			setIndex(0);
			return;
		}
		const id = setInterval(() => {
			setIndex((prev) => (prev + 1) % lines.length);
		}, intervalMs);
		return () => clearInterval(id);
	}, [visible, lines.length, intervalMs]);

	if (!visible) return null;

	return (
		<Animated.View
			entering={FadeIn.duration(180)}
			exiting={FadeOut.duration(180)}
			style={styles.overlay}
			pointerEvents="auto"
		>
			<PromptyMascot mood="neutral" size={92} />
			<Animated.Text key={index} entering={FadeInUp.duration(300)} style={styles.message}>
				{lines[index]}
			</Animated.Text>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(255,255,255,0.94)",
		zIndex: 60,
	},
	message: {
		marginTop: 14,
		fontSize: 16,
		fontWeight: "800",
		color: "#4B4B4B",
		letterSpacing: 0.2,
		textAlign: "center",
		paddingHorizontal: 32,
	},
});
