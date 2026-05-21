/**
 * ChallengeBottomSheet — the draggable sheet used by the challenge screen.
 *
 * Implements the "Option B" layout: the target stays behind the sheet and this sheet
 * holds everything the player interacts with. It supports multiple snap points (e.g.
 * a small peek, a mid height, and near-full) so the player can collapse it right down
 * to see the target, pull it to a comfortable working height, or expand it fully — it
 * *grows*, it never navigates away. It can be dragged from its handle and lifts above
 * the keyboard so the input and the pinned footer stay visible while typing.
 *
 * Built on react-native-reanimated + react-native-gesture-handler. The pan gesture is
 * attached only to the handle so it never fights the body's ScrollView.
 *
 * Visual language matches the existing quest UI: white surface, rounded top, soft
 * shadow, light-grey grabber.
 */
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
	Keyboard,
	Platform,
	ScrollView,
	StyleSheet,
	View,
	useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SPRING = { damping: 22, stiffness: 220, mass: 0.7 } as const;

// Plain JS wrapper so a worklet can schedule it via runOnJS. Passing
// `Keyboard.dismiss` directly makes the worklet read `.dismiss` off the Keyboard
// object on the UI runtime, which it can't serialize.
function dismissKeyboard() {
	Keyboard.dismiss();
}

interface ChallengeBottomSheetProps {
	/** Ascending fractions of the screen height the sheet can rest at, e.g. [0.12, 0.4, 0.94]. */
	snapPoints: number[];
	/** Controlled index into `snapPoints`. */
	snapIndex: number;
	/** Fired when the sheet settles at a new snap (drag release, keyboard). */
	onSnapIndexChange: (index: number) => void;
	/** Pinned footer (Submit, or Try again / Next level). */
	footer?: ReactNode;
	/** Hide the footer while the sheet is settled below this index (keeps a clean peek). */
	hideFooterBelowIndex?: number;
	/** Scrollable body content. */
	children: ReactNode;
	/** Snap to the top point when the keyboard opens. */
	expandOnKeyboard?: boolean;
}

export function ChallengeBottomSheet({
	snapPoints,
	snapIndex,
	onSnapIndexChange,
	footer,
	hideFooterBelowIndex = 0,
	children,
	expandOnKeyboard = true,
}: ChallengeBottomSheetProps) {
	const { height: screenHeight } = useWindowDimensions();
	const insets = useSafeAreaInsets();

	const snapHeights = useMemo(
		() => snapPoints.map((ratio) => Math.round(screenHeight * ratio)),
		[snapPoints, screenHeight],
	);
	const minHeight = snapHeights[0];
	const maxHeight = snapHeights[snapHeights.length - 1];
	const topIndex = snapHeights.length - 1;
	const safeIndex = Math.max(0, Math.min(snapIndex, topIndex));

	const height = useSharedValue(snapHeights[safeIndex] ?? minHeight);
	const bottom = useSharedValue(0);
	const dragStartHeight = useSharedValue(0);
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	// Keyboard tracking: lift the sheet above the keyboard and snap it open.
	useEffect(() => {
		const showEvent =
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
		const hideEvent =
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

		const showSub = Keyboard.addListener(showEvent, (event) => {
			setKeyboardHeight(event?.endCoordinates?.height ?? 0);
			if (expandOnKeyboard) onSnapIndexChange(topIndex);
		});
		const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

		return () => {
			showSub.remove();
			hideSub.remove();
		};
	}, [expandOnKeyboard, onSnapIndexChange, topIndex]);

	useEffect(() => {
		bottom.value = withTiming(keyboardHeight, {
			duration: Platform.OS === "ios" ? 250 : 180,
			easing: Easing.out(Easing.cubic),
		});
	}, [keyboardHeight, bottom]);

	// Drive the height from the controlled snap index; cap it under the keyboard so the
	// handle never slides off the top of the screen.
	useEffect(() => {
		const target = snapHeights[safeIndex] ?? minHeight;
		const capped =
			keyboardHeight > 0
				? Math.min(
						target,
						Math.max(minHeight, screenHeight - keyboardHeight - insets.top - 8),
					)
				: target;
		height.value = withSpring(capped, SPRING);
	}, [
		safeIndex,
		snapHeights,
		keyboardHeight,
		screenHeight,
		insets.top,
		minHeight,
		height,
	]);

	const settle = useCallback(
		(index: number) => onSnapIndexChange(index),
		[onSnapIndexChange],
	);

	const pan = Gesture.Pan()
		.onStart(() => {
			dragStartHeight.value = height.value;
			runOnJS(dismissKeyboard)();
		})
		.onUpdate((event) => {
			const next = dragStartHeight.value - event.translationY;
			height.value = Math.min(maxHeight, Math.max(minHeight, next));
		})
		.onEnd((event) => {
			// Project the resting point a little by the fling velocity, then snap to the
			// nearest configured height.
			const projected = height.value - event.velocityY * 0.08;
			let bestIndex = 0;
			let bestDistance = Number.POSITIVE_INFINITY;
			for (let i = 0; i < snapHeights.length; i++) {
				const distance = Math.abs(snapHeights[i] - projected);
				if (distance < bestDistance) {
					bestDistance = distance;
					bestIndex = i;
				}
			}
			height.value = withSpring(snapHeights[bestIndex], SPRING);
			runOnJS(settle)(bestIndex);
		});

	const containerStyle = useAnimatedStyle(() => ({
		height: height.value,
		bottom: bottom.value,
	}));

	const showFooter = footer != null && safeIndex >= hideFooterBelowIndex;

	return (
		<Animated.View style={[styles.sheet, containerStyle]}>
			<GestureDetector gesture={pan}>
				<View style={styles.handleZone} accessibilityRole="adjustable">
					<View style={styles.grabber} />
				</View>
			</GestureDetector>

			<View style={styles.body}>
				<ScrollView
					style={styles.scroll}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{children}
				</ScrollView>

				{showFooter ? (
					<View
						style={[
							styles.footer,
							{ paddingBottom: keyboardHeight > 0 ? 14 : Math.max(insets.bottom, 14) },
						]}
					>
						{footer}
					</View>
				) : null}
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	sheet: {
		position: "absolute",
		left: 0,
		right: 0,
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		shadowColor: "#000000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.08,
		shadowRadius: 16,
		elevation: 16,
	},
	handleZone: {
		paddingTop: 10,
		paddingBottom: 8,
		alignItems: "center",
	},
	grabber: {
		width: 44,
		height: 5,
		borderRadius: 999,
		backgroundColor: "#E0E0E0",
	},
	body: {
		flex: 1,
	},
	scroll: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingBottom: 16,
	},
	footer: {
		paddingHorizontal: 20,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#F0F0F0",
		backgroundColor: "#FFFFFF",
	},
});
