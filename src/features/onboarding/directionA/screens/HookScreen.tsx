import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ScreenBase, Mascot, Headline } from "../components/Chrome";
import { useDirectionAStore } from "../store";
import { A } from "../theme";

export function HookScreen() {
	const { next } = useDirectionAStore();
	const go = () => {
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		next();
	};
	return (
		<ScreenBase>
			<View style={styles.wordmark}>
				<Text style={styles.wmPrompt}>Prompt</Text>
				<Text style={styles.wmPal}>Pal</Text>
			</View>

			<View style={styles.hero}>
				<View style={styles.halo}>
					<Mascot name="happy" size={210} />
				</View>
				<Headline
					align="center"
					size={34}
					lines={[{ t: "Learn AI prompting." }, { t: "Like a game.", c: A.green }]}
				/>
				<Text style={styles.sub}>
					Short challenges. Real prompting skills. Five minutes a day.
				</Text>
			</View>

			<View style={styles.footer}>
				<TouchableOpacity style={styles.cta} onPress={go} activeOpacity={0.85}>
					<Text style={styles.ctaText}>START</Text>
					<Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
				</TouchableOpacity>
				<TouchableOpacity onPress={go} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
					<Text style={styles.signin}>I already have an account</Text>
				</TouchableOpacity>
			</View>
		</ScreenBase>
	);
}

const styles = StyleSheet.create({
	wordmark: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
	wmPrompt: { fontSize: 24, fontWeight: "900", color: A.green, letterSpacing: -0.5 },
	wmPal: { fontSize: 24, fontWeight: "900", color: A.ink, letterSpacing: -0.5 },
	hero: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 26,
		paddingHorizontal: 28,
	},
	halo: {
		alignItems: "center",
		justifyContent: "center",
		padding: 6,
	},
	sub: {
		fontSize: 16,
		fontWeight: "700",
		color: A.muted,
		textAlign: "center",
		lineHeight: 23,
		maxWidth: 300,
	},
	footer: { paddingHorizontal: 20, paddingBottom: 24, alignItems: "center", gap: 14 },
	cta: {
		backgroundColor: A.green,
		height: 56,
		borderRadius: 16,
		borderBottomWidth: 5,
		borderBottomColor: A.greenDark,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		alignSelf: "stretch",
	},
	ctaText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 1 },
	signin: { fontSize: 14, fontWeight: "800", color: A.muted },
});
