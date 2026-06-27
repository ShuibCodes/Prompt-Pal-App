/**
 * PromptyMascot — the animated Prompty character for the challenge result /
 * completion previews.
 *
 * Reuses the onboarding (Direction A) bob loop and adds an entrance "pop"
 * (scale spring on mount) so the mascot lands with a beat. Moods map to the
 * bundled Prompty PNGs; `neutral` falls back to the curious pose.
 */
import { useEffect } from "react";
import { Image, ImageSourcePropType } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withSequence,
	withTiming,
	withSpring,
	withDelay,
} from "react-native-reanimated";

const MASCOTS = {
	happy: require("../../../assets/prompty-happy.png"),
	sad: require("../../../assets/prompty-sad.png"),
	neutral: require("../../../assets/prompty-curious.png"),
	joyous: require("../../../assets/prompty-joyous.png"),
} as const;

export type PromptyMood = keyof typeof MASCOTS;

export interface PromptyMascotProps {
	mood: PromptyMood;
	/** Square render size in px. */
	size?: number;
	/** Faster, higher bob with a slight tilt for celebratory moments. */
	celebrate?: boolean;
	/** Delay (ms) before the entrance pop fires. */
	entranceDelay?: number;
}

export function PromptyMascot({
	mood,
	size = 150,
	celebrate = false,
	entranceDelay = 0,
}: PromptyMascotProps) {
	// Idle bob (loops forever).
	const bob = useSharedValue(0);
	// Entrance pop (0 → 1 on mount).
	const pop = useSharedValue(0);

	useEffect(() => {
		bob.value = withRepeat(
			withSequence(
				withTiming(1, { duration: celebrate ? 900 : 1400 }),
				withTiming(0, { duration: celebrate ? 900 : 1400 }),
			),
			-1,
			true,
		);
	}, [bob, celebrate]);

	useEffect(() => {
		pop.value = 0;
		pop.value = withDelay(
			entranceDelay,
			withSpring(1, { damping: 9, stiffness: 140, mass: 0.7 }),
		);
	}, [pop, entranceDelay, mood]);

	const style = useAnimatedStyle(() => {
		// Pop scales 0.6 → 1; bob translates/tilts on top.
		const scale = 0.6 + pop.value * 0.4;
		return {
			opacity: pop.value,
			transform: [
				{ scale },
				{ translateY: -(celebrate ? 12 : 8) * bob.value },
				{ rotate: `${(celebrate ? -4 : 0) * bob.value}deg` },
			],
		};
	});

	return (
		<Animated.View style={style}>
			<Image
				source={MASCOTS[mood] as ImageSourcePropType}
				style={{ width: size, height: size }}
				resizeMode="contain"
			/>
		</Animated.View>
	);
}
