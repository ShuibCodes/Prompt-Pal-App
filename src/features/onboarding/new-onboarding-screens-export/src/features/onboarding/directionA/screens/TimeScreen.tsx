import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
	ScreenBase,
	Header,
	Mascot,
	Headline,
	Check,
	ContinueButton,
	Footer,
} from "../components/Chrome";
import { useDirectionAStore, stepProgress } from "../store";
import { A } from "../theme";

type TimeOpt = {
	min: number;
	label: string;
	icon: keyof typeof MaterialCommunityIcons.glyphMap;
	c: string;
	rec?: boolean;
};

const TIMES: TimeOpt[] = [
	{ min: 5, label: "Casual", icon: "coffee-outline", c: A.blue },
	{ min: 10, label: "Regular", icon: "white-balance-sunny", c: A.green, rec: true },
	{ min: 15, label: "Serious", icon: "fire", c: A.xp },
	{ min: 20, label: "Intense", icon: "lightning-bolt", c: A.violet },
];

export function TimeScreen() {
	const { next, back, minutesPerDay, setMinutes } = useDirectionAStore();

	const onContinue = () => {
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		next();
	};

	return (
		<ScreenBase>
			<Header progress={stepProgress("time")} onBack={back} />
			<View style={styles.body}>
				<View style={styles.titleRow}>
					<Mascot name="happy" size={72} />
					<View style={{ flex: 1 }}>
						<Headline size={25} lines={[{ t: "How much time a day?" }]} />
					</View>
				</View>

				{TIMES.map((t) => {
					const selected = minutesPerDay === t.min;
					return (
						<TouchableOpacity
							key={t.min}
							style={[styles.row, selected && styles.rowSel]}
							onPress={() => {
								void Haptics.selectionAsync();
								setMinutes(t.min);
							}}
							activeOpacity={0.8}
						>
							<View style={[styles.minBox, selected && styles.minBoxSel]}>
								<Text style={[styles.minNum, selected && { color: A.greenDark }]}>{t.min}</Text>
								<Text style={styles.minUnit}>MIN</Text>
							</View>
							<View style={{ flex: 1 }}>
								<View style={styles.labelRow}>
									<Text style={[styles.label, selected && { color: A.greenDark }]}>{t.label}</Text>
									{t.rec ? (
										<View style={styles.recPill}>
											<Text style={styles.recText}>RECOMMENDED</Text>
										</View>
									) : null}
								</View>
								<Text style={styles.sub}>{t.min} min a day</Text>
							</View>
							<MaterialCommunityIcons
								name={t.icon}
								size={22}
								color={selected ? A.green : t.c}
								style={{ marginRight: 8 }}
							/>
							<Check on={selected} />
						</TouchableOpacity>
					);
				})}
			</View>
			<Footer>
				<ContinueButton onPress={onContinue} disabled={minutesPerDay == null} />
			</Footer>
		</ScreenBase>
	);
}

const styles = StyleSheet.create({
	body: { flex: 1, paddingHorizontal: 20 },
	titleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
	row: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: A.white,
		borderRadius: 16,
		borderWidth: 2,
		borderBottomWidth: 4,
		borderColor: A.border,
		paddingHorizontal: 14,
		paddingVertical: 12,
		marginBottom: 11,
	},
	rowSel: { borderColor: A.green, backgroundColor: A.greenTint },
	minBox: {
		width: 54,
		height: 48,
		borderRadius: 12,
		backgroundColor: A.surf,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 14,
	},
	minBoxSel: { backgroundColor: A.white },
	minNum: { fontSize: 20, fontWeight: "800", color: A.ink, lineHeight: 22 },
	minUnit: { fontSize: 9, fontWeight: "800", color: A.muted, letterSpacing: 0.5 },
	labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
	label: { fontSize: 17, fontWeight: "800", color: A.ink },
	sub: { fontSize: 13, fontWeight: "700", color: A.muted, marginTop: 1 },
	recPill: {
		backgroundColor: A.greenTint,
		borderWidth: 1,
		borderColor: A.successBorder,
		borderRadius: 99,
		paddingHorizontal: 7,
		paddingVertical: 2,
	},
	recText: { fontSize: 9, fontWeight: "800", color: A.greenDark, letterSpacing: 0.4 },
});
