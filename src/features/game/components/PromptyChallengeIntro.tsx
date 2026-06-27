/**
 * PromptyChallengeIntro — two-screen pre-challenge teaser (Promise → Secret)
 * shown once before a live quest challenge. Wooshes into the challenge on finish.
 */
import { useEffect, useMemo, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Pressable,
	useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
	runOnJS,
} from "react-native-reanimated";
import { PromptyMascot, type PromptyMood } from "@/features/challenge-preview/PromptyMascot";

const GREEN = "#58CC02";
const GREEN_DARK = "#46A302";
const INK = "#3C3C3C";
const DEPTH = 4;

export interface PromptyChallengeIntroProps {
	promise: string;
	secret: string;
	onComplete: () => void;
}

function SpeechBubble({ text }: { text: string }) {
	return (
		<Animated.View
			entering={FadeInDown.delay(180).springify().damping(14)}
			style={styles.bubbleWrap}
		>
			<View style={styles.bubble}>
				<Text style={styles.bubbleText}>{text}</Text>
			</View>
			<View style={styles.bubbleTail} />
		</Animated.View>
	);
}

function ProgressDots({ step }: { step: 0 | 1 }) {
	return (
		<View style={styles.dotsRow} accessibilityLabel={`Step ${step + 1} of 2`}>
			{[0, 1].map((index) => (
				<View
					key={index}
					style={[
						styles.dot,
						index === step ? styles.dotActive : styles.dotInactive,
					]}
				/>
			))}
		</View>
	);
}

function Sparkle({
	left,
	top,
	size,
	delay,
}: {
	left: number;
	top: number;
	size: number;
	delay: number;
}) {
	const drift = useSharedValue(0);

	useEffect(() => {
		drift.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 1400 + delay }),
				withTiming(0, { duration: 1400 + delay }),
			),
			-1,
			true,
		);
	}, [delay, drift]);

	const style = useAnimatedStyle(() => ({
		opacity: 0.35 + drift.value * 0.55,
		transform: [
			{ translateY: -6 * drift.value },
			{ scale: 0.85 + drift.value * 0.25 },
			{ rotate: `${drift.value * 18}deg` },
		],
	}));

	return (
		<Animated.View style={[styles.sparkle, { left, top }, style]}>
			<Ionicons name="sparkles" size={size} color="#FFD54F" />
		</Animated.View>
	);
}

function IntroButton({
	label,
	onPress,
	disabled,
}: {
	label: string;
	onPress: () => void;
	disabled?: boolean;
}) {
	const pressed = useSharedValue(0);

	const faceStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: pressed.value * DEPTH },
			{ scale: 1 - pressed.value * 0.02 },
		],
		borderBottomWidth: DEPTH - pressed.value * DEPTH,
	}));

	const handlePress = () => {
		if (disabled) {
			return;
		}
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		onPress();
	};

	return (
		<Pressable
			onPressIn={() => {
				if (!disabled) {
					pressed.value = withTiming(1, { duration: 70 });
				}
			}}
			onPressOut={() => {
				pressed.value = withTiming(0, { duration: 110 });
			}}
			onPress={handlePress}
			disabled={disabled}
			accessibilityRole="button"
			accessibilityLabel={label}
			style={styles.ctaOuter}
		>
			<Animated.View
				style={[
					styles.ctaFace,
					{
						backgroundColor: disabled ? "#AFAFAF" : GREEN,
						borderBottomColor: disabled ? "#8A8A8A" : GREEN_DARK,
					},
					faceStyle,
				]}
			>
				<Text style={styles.ctaLabel}>{label}</Text>
			</Animated.View>
		</Pressable>
	);
}

export function PromptyChallengeIntro({
	promise,
	secret,
	onComplete,
}: PromptyChallengeIntroProps) {
	const { width } = useWindowDimensions();
	const [step, setStep] = useState<0 | 1>(0);
	const [isWooshing, setIsWooshing] = useState(false);

	const woosh = useSharedValue(0);
	const slide = useSharedValue(0);

	const sparkles = useMemo(
		() => [
			{ left: width * 0.12, top: 120, size: 16, delay: 0 },
			{ left: width * 0.78, top: 160, size: 14, delay: 400 },
			{ left: width * 0.68, top: 90, size: 12, delay: 800 },
		],
		[width],
	);

	const mascotMood: PromptyMood = step === 0 ? "happy" : "neutral";
	const mascotSize = step === 0 ? 200 : 190;

	const mascotWrapStyle = useAnimatedStyle(() => ({
		transform: [
			{ scale: 1 + woosh.value * 0.55 },
			{ translateY: -woosh.value * 28 },
			{ translateX: woosh.value * 18 },
		],
		opacity: 1 - woosh.value * 0.35,
	}));

	const contentStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: slide.value * width }],
		opacity: 1 - woosh.value,
	}));

	const finishWoosh = () => {
		onComplete();
	};

	const startWoosh = () => {
		setIsWooshing(true);
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
		woosh.value = withTiming(1, { duration: 480 });
		slide.value = withTiming(-1, { duration: 480 }, (finished) => {
			if (finished) {
				runOnJS(finishWoosh)();
			}
		});
	};

	const handlePrimaryPress = () => {
		if (isWooshing) {
			return;
		}
		if (step === 0) {
			setStep(1);
			return;
		}
		startWoosh();
	};

	return (
		<View style={styles.root}>
			<SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
				<Animated.View style={[styles.content, contentStyle]}>
					<View style={styles.hero}>
						{sparkles.map((sparkle, index) => (
							<Sparkle key={index} {...sparkle} />
						))}

						<Animated.View style={[styles.mascotShadowWrap, mascotWrapStyle]}>
							<View style={styles.mascotShadow} />
							<PromptyMascot
								mood={mascotMood}
								size={mascotSize}
								entranceDelay={step === 0 ? 0 : 80}
							/>
						</Animated.View>

						<SpeechBubble text={step === 0 ? promise : secret} />
					</View>

					<View style={styles.footer}>
						<ProgressDots step={step} />
						<IntroButton
							label={step === 0 ? "Show me how →" : "Let's start learning →"}
							onPress={handlePrimaryPress}
							disabled={isWooshing}
						/>
					</View>
				</Animated.View>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	safe: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: 24,
		justifyContent: "space-between",
	},
	hero: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 12,
	},
	sparkle: {
		position: "absolute",
	},
	mascotShadowWrap: {
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	mascotShadow: {
		position: "absolute",
		bottom: 8,
		width: 120,
		height: 24,
		borderRadius: 60,
		backgroundColor: "rgba(0,0,0,0.08)",
	},
	bubbleWrap: {
		width: "100%",
		alignItems: "center",
		marginTop: 8,
	},
	bubble: {
		width: "100%",
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		borderWidth: 2,
		borderColor: "#EFEFEF",
		paddingHorizontal: 22,
		paddingVertical: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.06,
		shadowRadius: 12,
		elevation: 3,
	},
	bubbleText: {
		fontSize: 22,
		fontWeight: "900",
		color: INK,
		textAlign: "center",
		lineHeight: 30,
	},
	bubbleTail: {
		width: 18,
		height: 18,
		backgroundColor: "#FFFFFF",
		borderLeftWidth: 2,
		borderBottomWidth: 2,
		borderColor: "#EFEFEF",
		transform: [{ rotate: "45deg" }],
		marginTop: -10,
	},
	footer: {
		paddingBottom: 8,
		gap: 16,
	},
	dotsRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 8,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	dotActive: {
		backgroundColor: GREEN,
		width: 20,
	},
	dotInactive: {
		backgroundColor: "#E5E5E5",
	},
	ctaOuter: {
		width: "100%",
	},
	ctaFace: {
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: "center",
		justifyContent: "center",
		borderBottomWidth: DEPTH,
	},
	ctaLabel: {
		fontSize: 15,
		fontWeight: "900",
		color: "#FFFFFF",
		letterSpacing: 0.4,
	},
});
