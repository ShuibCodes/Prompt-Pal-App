/**
 * Dev-only image challenge lab — stress-test all 10 image levels without
 * exposing them on the live quest path.
 */
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { fetchDevLevelsFromApi } from "@/features/levels/data";
import type { Level } from "@/features/game/store";
import { isDevQuestToolsEnabled } from "@/lib/devQuest";

const DIFFICULTY_LABEL: Record<Level["difficulty"], string> = {
	beginner: "Easy",
	intermediate: "Medium",
	advanced: "Hard",
};

const DIFFICULTY_COLOR: Record<Level["difficulty"], string> = {
	beginner: "#58CC02",
	intermediate: "#FF9600",
	advanced: "#FF4B4B",
};

export default function ImageLabScreen() {
	const router = useRouter();
	const devToolsEnabled = isDevQuestToolsEnabled();
	const [levels, setLevels] = useState<Level[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadLevels = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const devLevels = await fetchDevLevelsFromApi();
			const imageLevels = devLevels
				.filter((level) => level.type === "image")
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
			setLevels(imageLevels);
			if (imageLevels.length === 0) {
				setError(
					"No dev image levels found. Run: npx convex run seed:seedLevels",
				);
			}
		} catch {
			setError("Could not load dev image levels.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (devToolsEnabled) {
			void loadLevels();
		}
	}, [devToolsEnabled, loadLevels]);

	const handleClose = () => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/(tabs)/profile");
	};

	const openLevel = (levelId: string) => {
		router.push(`/game/image/${levelId}?devLab=1`);
	};

	if (!devToolsEnabled) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.centered}>
					<Text style={styles.blockedTitle}>Dev tools only</Text>
					<Text style={styles.blockedBody}>
						Image lab is available in development builds or when
						EXPO_PUBLIC_DEV_QUEST_TOOLS=1 is set.
					</Text>
					<Pressable onPress={handleClose} style={styles.backButton}>
						<Text style={styles.backButtonText}>Go back</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={["top", "bottom"]}>
			<View style={styles.header}>
				<Pressable
					onPress={handleClose}
					style={styles.headerButton}
					accessibilityRole="button"
					accessibilityLabel="Close image lab"
				>
					<Ionicons name="close" size={24} color="#3C3C3C" />
				</Pressable>
				<View style={styles.headerText}>
					<Text style={styles.headerTitle}>Image challenge lab</Text>
					<Text style={styles.headerSubtitle}>
						Dev only · {levels.length} levels · real Gemini generate + evaluate
					</Text>
				</View>
			</View>

			{isLoading ? (
				<View style={styles.centered}>
					<ActivityIndicator size="large" color="#FF9600" />
				</View>
			) : error ? (
				<View style={styles.centered}>
					<Text style={styles.errorText}>{error}</Text>
					<Pressable onPress={() => void loadLevels()} style={styles.backButton}>
						<Text style={styles.backButtonText}>Retry</Text>
					</Pressable>
				</View>
			) : (
				<ScrollView
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
				>
					{levels.map((level, index) => (
						<Pressable
							key={level.id}
							onPress={() => openLevel(level.id)}
							style={({ pressed }) => [
								styles.row,
								pressed && styles.rowPressed,
							]}
							accessibilityRole="button"
							accessibilityLabel={`Open ${level.title}`}
						>
							<View style={styles.rowIndex}>
								<Text style={styles.rowIndexText}>{index + 1}</Text>
							</View>
							<View style={styles.rowBody}>
								<Text style={styles.rowTitle}>{level.title}</Text>
								<Text style={styles.rowDescription} numberOfLines={2}>
									{level.description}
								</Text>
							</View>
							<View
								style={[
									styles.difficultyPill,
									{
										backgroundColor: `${DIFFICULTY_COLOR[level.difficulty]}22`,
									},
								]}
							>
								<Text
									style={[
										styles.difficultyText,
										{ color: DIFFICULTY_COLOR[level.difficulty] },
									]}
								>
									{DIFFICULTY_LABEL[level.difficulty]}
								</Text>
							</View>
							<Ionicons name="chevron-forward" size={20} color="#CFCFCF" />
						</Pressable>
					))}
				</ScrollView>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#EFEFEF",
		gap: 12,
	},
	headerButton: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	headerText: {
		flex: 1,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: "#3C3C3C",
	},
	headerSubtitle: {
		marginTop: 2,
		fontSize: 12,
		color: "#777777",
	},
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
		gap: 12,
	},
	blockedTitle: {
		fontSize: 18,
		fontWeight: "800",
		color: "#3C3C3C",
	},
	blockedBody: {
		fontSize: 14,
		color: "#777777",
		textAlign: "center",
		lineHeight: 20,
	},
	errorText: {
		fontSize: 14,
		color: "#777777",
		textAlign: "center",
		lineHeight: 20,
	},
	backButton: {
		marginTop: 8,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 12,
		backgroundColor: "#FFF4E5",
	},
	backButtonText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#FF9600",
	},
	list: {
		padding: 16,
		gap: 10,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		padding: 14,
		borderRadius: 16,
		backgroundColor: "#FAFAFA",
		borderWidth: 1,
		borderColor: "#EFEFEF",
	},
	rowPressed: {
		opacity: 0.85,
	},
	rowIndex: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#FFF4E5",
		alignItems: "center",
		justifyContent: "center",
	},
	rowIndexText: {
		fontSize: 12,
		fontWeight: "800",
		color: "#FF9600",
	},
	rowBody: {
		flex: 1,
		gap: 4,
	},
	rowTitle: {
		fontSize: 15,
		fontWeight: "800",
		color: "#3C3C3C",
	},
	rowDescription: {
		fontSize: 12,
		color: "#777777",
		lineHeight: 16,
	},
	difficultyPill: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
	},
	difficultyText: {
		fontSize: 10,
		fontWeight: "800",
		textTransform: "uppercase",
	},
});
