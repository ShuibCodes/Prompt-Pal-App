/**
 * GameButton — the dopamine button for the challenge screens.
 *
 * Duolingo-style 3D button (solid bottom border) that "presses down" on touch
 * (the face drops onto the border, plus a subtle scale) and fires a haptic on
 * every press. Three variants cover the result/completion footers.
 */
import { ReactNode } from "react";
import { Pressable, Text, StyleSheet, View, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = "primary" | "secondary";

const PALETTE: Record<
	Variant,
	{ face: string; edge: string; label: string; border?: string }
> = {
	primary: { face: "#5CD615", edge: "#46A310", label: "#FFFFFF" },
	secondary: { face: "#FFFFFF", edge: "#E5E5E5", label: "#777777", border: "#E5E5E5" },
};

// How far the face drops when pressed (matches the resting bottom border).
const DEPTH = 4;

export interface GameButtonProps {
	label: string;
	onPress?: () => void;
	variant?: Variant;
	/** Haptic fired on press. Defaults to medium impact. */
	haptic?: Haptics.ImpactFeedbackStyle;
	style?: ViewStyle;
	/** Render extra content (e.g. an icon) after the label. */
	trailing?: ReactNode;
}

export function GameButton({
	label,
	onPress,
	variant = "primary",
	haptic = Haptics.ImpactFeedbackStyle.Medium,
	style,
	trailing,
}: GameButtonProps) {
	const pressed = useSharedValue(0);
	const colors = PALETTE[variant];

	const faceStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: pressed.value * DEPTH },
			{ scale: 1 - pressed.value * 0.02 },
		],
		// Border shrinks as the face drops so the button looks pushed in.
		borderBottomWidth: DEPTH - pressed.value * DEPTH,
	}));

	const handlePress = () => {
		void Haptics.impactAsync(haptic);
		onPress?.();
	};

	return (
		<AnimatedPressable
			onPressIn={() => {
				pressed.value = withTiming(1, { duration: 70 });
			}}
			onPressOut={() => {
				pressed.value = withTiming(0, { duration: 110 });
			}}
			onPress={handlePress}
			accessibilityRole="button"
			accessibilityLabel={label}
			style={[
				styles.face,
				{
					backgroundColor: colors.face,
					borderBottomColor: colors.edge,
					borderWidth: colors.border ? 2 : 0,
					borderColor: colors.border ?? "transparent",
				},
				style,
				faceStyle,
			]}
		>
			<View style={styles.content}>
				<Text
					numberOfLines={1}
					adjustsFontSizeToFit
					style={[styles.label, { color: colors.label }]}
				>
					{label}
				</Text>
				{trailing}
			</View>
		</AnimatedPressable>
	);
}

const styles = StyleSheet.create({
	face: {
		borderRadius: 16,
		paddingVertical: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "900",
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
});
