import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useDirectionAStore } from "../store";
import { A } from "../theme";

function Heart() {
	return <Ionicons name="heart" size={20} color={A.xp} />;
}

function Chip({ children }: { children: React.ReactNode }) {
	return (
		<View style={styles.chip}>
			<Text style={styles.chipText}>{children}</Text>
		</View>
	);
}

export function ChallengeScreen() {
	const { restart } = useDirectionAStore();
	const onSubmit = () => {
		void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		// Hand off to the real game flow here. Demo: loop back to start.
		restart();
	};

	return (
		<SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
			{/* progress row: gear + track + hearts */}
			<View style={styles.topRow}>
				<View style={styles.gear}>
					<MaterialCommunityIcons name="cog" size={22} color="#fff" />
				</View>
				<View style={styles.track}>
					<View style={styles.trackFill} />
				</View>
				<View style={styles.hearts}>
					{[0, 1, 2, 3, 4].map((i) => (
						<Heart key={i} />
					))}
				</View>
			</View>

			<View style={styles.body}>
				<View style={styles.levelPill}>
					<Text style={styles.levelPillText}>LEVEL 1 · CODE</Text>
				</View>
				<Text style={styles.title}>Describe the outcome, not the code</Text>

				{/* reference card */}
				<View style={styles.card}>
					<View style={styles.cardImage} />
					<View style={{ paddingHorizontal: 4, paddingTop: 12 }}>
						<Text style={styles.cardTitle}>Mountain Retreat</Text>
						<Text style={styles.cardSub}>A quiet cabin getaway in the hills.</Text>
						<View style={styles.cardButton} />
					</View>
				</View>

				{/* prompt label + hint */}
				<View style={styles.promptHead}>
					<Text style={styles.promptLabel}>YOUR PROMPT</Text>
					<View style={styles.hint}>
						<MaterialCommunityIcons name="lightbulb-on-outline" size={15} color={A.xp} />
						<Text style={styles.hintText}>Hint · 25 XP</Text>
					</View>
				</View>

				{/* fill-in */}
				<View style={styles.fillIn}>
					<Text style={styles.fillText}>
						Build a hero section with a <Chip>headline</Chip>, <Chip>supporting text</Chip>, and a{" "}
						<Chip>button label</Chip>.
					</Text>
				</View>
			</View>

			{/* bottom bar */}
			<View style={styles.bottomBar}>
				<View>
					<Text style={styles.rewardLabel}>REWARD</Text>
					<View style={styles.rewardRow}>
						<Text style={styles.rewardXp}>+100 XP</Text>
						<MaterialCommunityIcons name="lightning-bolt" size={17} color={A.xp} />
					</View>
				</View>
				<TouchableOpacity style={styles.submit} onPress={onSubmit} activeOpacity={0.85}>
					<Text style={styles.submitText}>SUBMIT PROMPT</Text>
					<Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: A.white },
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingHorizontal: 20,
		paddingTop: 8,
	},
	gear: {
		width: 42,
		height: 42,
		borderRadius: 21,
		backgroundColor: A.blue,
		alignItems: "center",
		justifyContent: "center",
		borderBottomWidth: 4,
		borderBottomColor: "#2E3BC9",
	},
	track: { flex: 1, height: 14, backgroundColor: A.track, borderRadius: 99, overflow: "hidden" },
	trackFill: { width: "8%", height: "100%", backgroundColor: A.green, borderRadius: 99 },
	hearts: { flexDirection: "row", gap: 3 },
	body: { flex: 1, paddingHorizontal: 20, paddingTop: 14 },
	levelPill: {
		alignSelf: "flex-start",
		backgroundColor: A.greenTint,
		borderRadius: 99,
		paddingHorizontal: 12,
		paddingVertical: 5,
	},
	levelPillText: { fontSize: 13, fontWeight: "800", color: A.greenDark, letterSpacing: 0.6 },
	title: {
		fontSize: 27,
		fontWeight: "800",
		color: A.ink,
		marginTop: 12,
		letterSpacing: -0.3,
		lineHeight: 30,
	},
	card: {
		marginTop: 16,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: A.border,
		backgroundColor: "#fff",
		padding: 14,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},
	cardImage: { height: 110, borderRadius: 14, backgroundColor: "#2BB873" },
	cardTitle: { fontSize: 22, fontWeight: "800", color: A.ink },
	cardSub: { fontSize: 15, fontWeight: "700", color: A.muted, marginTop: 3 },
	cardButton: { marginTop: 14, height: 40, borderRadius: 12, backgroundColor: "#1A1A1A" },
	promptHead: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 18,
	},
	promptLabel: { fontSize: 13, fontWeight: "800", color: A.muted, letterSpacing: 1.5 },
	hint: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: A.hintTint,
		borderWidth: 1,
		borderColor: A.hintBorder,
		borderRadius: 99,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	hintText: { fontSize: 13, fontWeight: "800", color: A.xp },
	fillIn: {
		marginTop: 10,
		flex: 1,
		minHeight: 120,
		borderRadius: 18,
		backgroundColor: A.greenTint,
		borderWidth: 2,
		borderColor: A.successBorder,
		padding: 18,
	},
	fillText: { fontSize: 17, fontWeight: "700", color: A.ink, lineHeight: 34 },
	chip: {
		backgroundColor: "#F6E7D2",
		borderRadius: 8,
		borderBottomWidth: 2,
		borderBottomColor: A.xp,
		paddingHorizontal: 9,
		paddingVertical: 3,
	},
	chipText: { color: "#8A8A8A", fontWeight: "800", fontSize: 16 },
	bottomBar: {
		borderTopWidth: 1,
		borderTopColor: A.border,
		paddingHorizontal: 20,
		paddingVertical: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	rewardLabel: { fontSize: 11, fontWeight: "800", color: A.muted, letterSpacing: 1 },
	rewardRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
	rewardXp: { fontSize: 22, fontWeight: "900", color: A.xp },
	submit: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: A.green,
		borderRadius: 16,
		paddingHorizontal: 22,
		paddingVertical: 15,
		borderBottomWidth: 5,
		borderBottomColor: A.greenDark,
	},
	submitText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.6 },
});
