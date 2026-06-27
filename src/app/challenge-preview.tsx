/**
 * Standalone dev preview for the challenge result/completion screens.
 *
 * Lets you flip between the "got it right", "got it wrong", and "quest
 * complete" states with mock data — no Convex/AI/progress involved. Iterate on
 * the copies under `src/features/challenge-preview/`; the live quest screens
 * stay untouched until you port the approved UI back in.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ChallengeResultPreview } from "@/features/challenge-preview/ChallengeResultPreview";
import { ChallengeCompletionPreview } from "@/features/challenge-preview/ChallengeCompletionPreview";
import {
	MOCK_COMPLETION,
	MOCK_RESULT_FAIL,
	MOCK_RESULT_PASS,
} from "@/features/challenge-preview/mockData";

type PreviewState = "right" | "wrong" | "completion";

const TABS: { id: PreviewState; label: string }[] = [
	{ id: "right", label: "Correct" },
	{ id: "wrong", label: "Wrong" },
	{ id: "completion", label: "Completion" },
];

export default function ChallengePreviewScreen() {
	const router = useRouter();
	const [state, setState] = useState<PreviewState>("right");

	const handleClose = () => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/(tabs)/profile");
	};

	return (
		<View style={styles.container}>
			<View style={styles.preview}>
				{state === "right" ? (
					<ChallengeResultPreview data={MOCK_RESULT_PASS} onClose={handleClose} />
				) : null}
				{state === "wrong" ? (
					<ChallengeResultPreview data={MOCK_RESULT_FAIL} onClose={handleClose} />
				) : null}
				{state === "completion" ? (
					<ChallengeCompletionPreview data={MOCK_COMPLETION} />
				) : null}
			</View>

			{/* Dev switcher pinned to the bottom — flip between states. */}
			<SafeAreaView edges={["bottom"]} style={styles.switcherBar}>
				<View style={styles.switcher}>
					{TABS.map((tab) => {
						const active = tab.id === state;
						return (
							<Pressable
								key={tab.id}
								onPress={() => setState(tab.id)}
								style={[styles.tab, active && styles.tabActive]}
								accessibilityRole="button"
								accessibilityState={{ selected: active }}
							>
								<Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
									{tab.label}
								</Text>
							</Pressable>
						);
					})}
					<Pressable
						onPress={handleClose}
						style={styles.closeButton}
						accessibilityRole="button"
						accessibilityLabel="Close challenge preview"
					>
						<Ionicons name="close" size={18} color="#3C3C3C" />
					</Pressable>
				</View>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	preview: {
		flex: 1,
	},
	switcherBar: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
	},
	switcher: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginHorizontal: 12,
		marginBottom: 8,
		padding: 6,
		borderRadius: 16,
		backgroundColor: "rgba(255,255,255,0.96)",
		borderWidth: 1,
		borderColor: "#E5E5E5",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 12,
		elevation: 8,
	},
	tab: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 10,
		borderRadius: 12,
	},
	tabActive: {
		backgroundColor: "#58CC02",
	},
	tabLabel: {
		fontSize: 13,
		fontWeight: "800",
		color: "#777777",
	},
	tabLabelActive: {
		color: "#FFFFFF",
	},
	closeButton: {
		width: 38,
		height: 38,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#F2F2F2",
	},
});
