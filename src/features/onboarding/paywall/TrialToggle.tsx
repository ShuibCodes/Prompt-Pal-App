import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { PAY } from "./theme";

/**
 * iOS-style toggle used on the paywall "free trial" row.
 * Orange when on, grey when off, with a sliding knob.
 */
export function TrialToggle({
	value,
	onChange,
}: {
	value: boolean;
	onChange: (next: boolean) => void;
}) {
	const t = useSharedValue(value ? 1 : 0);

	useEffect(() => {
		t.value = withTiming(value ? 1 : 0, { duration: 180 });
	}, [value, t]);

	const trackStyle = useAnimatedStyle(() => ({
		backgroundColor: t.value > 0.5 ? PAY.orange : "#D6D6DB",
	}));
	const knobStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: 21 * t.value }],
	}));

	return (
		<Pressable
			onPress={() => {
				void Haptics.selectionAsync();
				onChange(!value);
			}}
			hitSlop={8}
		>
			<Animated.View style={[styles.track, trackStyle]}>
				<Animated.View style={[styles.knob, knobStyle]} />
			</Animated.View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	track: { width: 52, height: 31, borderRadius: 99, justifyContent: "center", paddingHorizontal: 3 },
	knob: {
		width: 25,
		height: 25,
		borderRadius: 12.5,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOpacity: 0.25,
		shadowRadius: 2,
		shadowOffset: { width: 0, height: 1 },
		elevation: 2,
	},
});
