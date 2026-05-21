/**
 * TargetExpandModal — full-screen viewer for a challenge's target.
 *
 * The challenge screen pins the target to the top ~60% of the screen with a small
 * expand affordance. Tapping it opens this viewer so the player can inspect the target
 * in detail (e.g. pinch-to-zoom an image, read a long brief, or see a taller code
 * preview). Content is supplied by the caller so each challenge type can present the
 * most useful large view.
 *
 * Implemented as an in-tree absolute overlay rather than a React Native `Modal`: a
 * Modal renders in a separate native view tree that does NOT inherit the app root's
 * SafeAreaProvider, so its `SafeAreaView`/insets resolve to zero and the header slides
 * under the notch. Rendered inline (the challenge route is already full-screen), the
 * SafeAreaView reads the real insets and the close button stays reachable.
 */
import type { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface TargetExpandModalProps {
	visible: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
}

export function TargetExpandModal({
	visible,
	onClose,
	title = "Target",
	children,
}: TargetExpandModalProps) {
	if (!visible) return null;

	return (
		<View
			style={[StyleSheet.absoluteFillObject, styles.overlay]}
			accessibilityViewIsModal
		>
			<SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
				<View
					className="flex-row items-center justify-between px-5 py-3"
					style={{ borderBottomWidth: 1, borderBottomColor: "#F0F0F0" }}
				>
					<Text className="text-[18px] font-black" style={{ color: "#3C3C3C" }}>
						{title}
					</Text>
					<TouchableOpacity
						onPress={onClose}
						accessibilityRole="button"
						accessibilityLabel="Close target preview"
						hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
						className="w-10 h-10 items-center justify-center rounded-full"
						style={{ backgroundColor: "#F2F2F2" }}
					>
						<Ionicons name="close" size={22} color="#3C3C3C" />
					</TouchableOpacity>
				</View>
				<View className="flex-1 p-5">{children}</View>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		backgroundColor: "#FFFFFF",
		zIndex: 50,
		elevation: 50,
	},
});
