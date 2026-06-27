import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { OnboardingFlowA } from "@/features/onboarding/directionA/OnboardingFlowA";
import { useDirectionAStore } from "@/features/onboarding/directionA/store";

/**
 * Standalone preview for Direction A onboarding — does not touch real
 * onboarding / pre-onboarding persisted state.
 */
export default function OnboardingPreviewScreen() {
	const router = useRouter();
	const restart = useDirectionAStore((state) => state.restart);

	useEffect(() => {
		restart();
	}, [restart]);

	const handleClose = () => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/(tabs)/profile");
	};

	return (
		<View style={styles.container}>
			<OnboardingFlowA />
			<SafeAreaView edges={["top"]} style={styles.closeBar} pointerEvents="box-none">
				<Pressable
					onPress={handleClose}
					style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
					accessibilityRole="button"
					accessibilityLabel="Close onboarding preview"
				>
					<Ionicons name="close" size={20} color="#3C3C3C" />
					<Text style={styles.closeLabel}>Close preview</Text>
				</Pressable>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	closeBar: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 100,
		paddingHorizontal: 12,
		paddingTop: 4,
	},
	closeButton: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 12,
		backgroundColor: "rgba(255,255,255,0.92)",
		borderWidth: 1,
		borderColor: "#E5E5E5",
	},
	closeLabel: {
		fontSize: 13,
		fontWeight: "800",
		color: "#3C3C3C",
	},
	pressed: {
		opacity: 0.75,
	},
});
