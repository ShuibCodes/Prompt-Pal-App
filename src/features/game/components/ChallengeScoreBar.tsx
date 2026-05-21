/**
 * ChallengeScoreBar — a labeled, animated score bar used in the challenge result sheet.
 *
 * Renders a left-aligned label, a right-aligned percentage, and a rounded track that
 * fills smoothly from 0 to the given value on mount. Colors are passed in so the same
 * component can render the green "Task match" bar and the orange "Prompt quality" bar
 * while staying faithful to the existing quest UI palette.
 */
import { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";

export interface ChallengeScoreBarProps {
	/** Bar label, e.g. "Task match". */
	label: string;
	/** Value 0–100. Clamped and rounded for display. */
	value: number;
	/** Fill + percentage color (theme hex), e.g. "#58CC02". */
	color: string;
	/** Track (empty) color. Defaults to the app's light grey. */
	trackColor?: string;
	/** Stagger the fill animation so multiple bars cascade. */
	delay?: number;
}

export function ChallengeScoreBar({
	label,
	value,
	color,
	trackColor = "#F0F0F0",
	delay = 0,
}: ChallengeScoreBarProps) {
	const pct = Math.max(0, Math.min(100, Math.round(value)));
	const fill = useSharedValue(0);

	useEffect(() => {
		fill.value = withDelay(
			delay,
			withTiming(pct, { duration: 750, easing: Easing.out(Easing.cubic) }),
		);
	}, [pct, delay, fill]);

	const fillStyle = useAnimatedStyle(() => ({
		width: `${fill.value}%`,
	}));

	return (
		<View className="mb-4">
			<View className="flex-row items-center justify-between mb-2">
				<Text
					className="text-[15px] font-bold"
					style={{ color: "#3C3C3C" }}
				>
					{label}
				</Text>
				<Text className="text-[15px] font-black" style={{ color }}>
					{pct}%
				</Text>
			</View>
			<View
				className="w-full rounded-full overflow-hidden"
				style={{ height: 12, backgroundColor: trackColor }}
			>
				<Animated.View
					style={[{ height: "100%", borderRadius: 999, backgroundColor: color }, fillStyle]}
				/>
			</View>
		</View>
	);
}
