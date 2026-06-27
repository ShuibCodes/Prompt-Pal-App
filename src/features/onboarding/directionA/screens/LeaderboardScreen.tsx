import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
	ScreenBase,
	Header,
	Mascot,
	Headline,
	ContinueButton,
	Footer,
} from "../components/Chrome";
import { useDirectionAStore, stepProgress } from "../store";
import { A } from "../theme";

type Podium = { rank: number; name: string; xp: string; color: string; medal: string };
const TOP: Podium[] = [
	{ rank: 2, name: "Leo K.", xp: "2,210", color: "#4DA3FF", medal: "#C7CDD6" },
	{ rank: 1, name: "Maya R.", xp: "2,480", color: "#FF7BAC", medal: A.gold },
	{ rank: 3, name: "Aisha B.", xp: "1,990", color: A.violet, medal: "#E59A5B" },
];
const ROWS = [
	{ rank: 4, name: "Tom H.", xp: "1,840", color: "#3DC98A", me: false },
	{ rank: 5, name: "Priya S.", xp: "1,720", color: "#FF9600", me: false },
	{ rank: 6, name: "You", xp: "1,650", color: A.blue, me: true },
	{ rank: 7, name: "Diego M.", xp: "1,510", color: "#F56C6C", me: false },
];

function Avatar({ name, color, size, ring }: { name: string; color: string; size: number; ring?: string }) {
	const initial = (name === "You" ? "Y" : name[0]).toUpperCase();
	return (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				backgroundColor: color,
				alignItems: "center",
				justifyContent: "center",
				borderWidth: ring ? 3 : 0,
				borderColor: ring,
			}}
		>
			<Text style={{ color: "#fff", fontWeight: "900", fontSize: size * 0.42 }}>{initial}</Text>
		</View>
	);
}

function XP({ val, size = 13, color = A.xp }: { val: string; size?: number; color?: string }) {
	return (
		<View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
			<Text style={{ fontWeight: "800", fontSize: size, color }}>{val}</Text>
			<MaterialCommunityIcons name="lightning-bolt" size={size} color={color} />
		</View>
	);
}

function Pedestal({ p, h }: { p: Podium; h: number }) {
	const first = p.rank === 1;
	return (
		<View style={styles.pedCol}>
			{first ? (
				<MaterialCommunityIcons name="crown" size={24} color={A.gold} style={{ marginBottom: -2 }} />
			) : null}
			<Avatar name={p.name} color={p.color} size={first ? 54 : 44} ring={p.medal} />
			<Text style={styles.pedName}>{p.name}</Text>
			<XP val={p.xp} size={12} />
			<View style={[styles.pedBlock, { height: h, backgroundColor: p.medal }]}>
				<Text style={styles.pedRank}>{p.rank}</Text>
			</View>
		</View>
	);
}

export function LeaderboardScreen() {
	const { next, back } = useDirectionAStore();
	const onContinue = () => {
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		next();
	};

	return (
		<ScreenBase>
			<Header progress={stepProgress("leaderboard")} onBack={back} />
			<View style={styles.body}>
				<View style={styles.headerRow}>
					<Headline size={26} lines={[{ t: "Battle your" }, { t: "friends.", c: A.green }]} />
					<Mascot name="joyous" size={92} celebrate />
				</View>

				<View style={styles.banner}>
					<View style={styles.bannerIcon}>
						<Ionicons name="trophy" size={22} color={A.gold} />
					</View>
					<Text style={styles.bannerText}>
						The top 3 every month win the{" "}
						<Text style={styles.bannerBold}>AI Engineering Bootcamp</Text> — worth{" "}
						<Text style={styles.bannerBold}>$2,000</Text>.
					</Text>
				</View>

				<View style={styles.podium}>
					<Pedestal p={TOP[0]} h={52} />
					<Pedestal p={TOP[1]} h={82} />
					<Pedestal p={TOP[2]} h={42} />
				</View>

				<View style={{ gap: 7 }}>
					{ROWS.map((r) => (
						<View key={r.rank} style={[styles.row, r.me && styles.rowMe]}>
							<Text style={[styles.rowRank, r.me && { color: A.blue }]}>{r.rank}</Text>
							<Avatar name={r.name} color={r.color} size={32} />
							<Text style={[styles.rowName, r.me && { color: A.blue }]}>
								{r.name}
								{r.me ? <Text style={styles.youTag}>  YOU</Text> : null}
							</Text>
							<XP val={r.xp} size={14} color={r.me ? A.blue : A.xp} />
						</View>
					))}
				</View>
			</View>
			<Footer>
				<ContinueButton label="I'M IN" onPress={onContinue} />
			</Footer>
		</ScreenBase>
	);
}

const styles = StyleSheet.create({
	body: { flex: 1, paddingHorizontal: 20 },
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	banner: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: "#FFF7E0",
		borderWidth: 1,
		borderColor: "#FFE3A1",
		borderRadius: 16,
		padding: 12,
		marginBottom: 16,
	},
	bannerIcon: {
		width: 40,
		height: 40,
		borderRadius: 12,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	bannerText: { flex: 1, fontSize: 13, fontWeight: "700", color: "#7A5A12", lineHeight: 18 },
	bannerBold: { fontWeight: "900", color: "#5E4509" },
	podium: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 16 },
	pedCol: { flex: 1, alignItems: "center", gap: 6 },
	pedName: { fontSize: 13, fontWeight: "800", color: A.ink },
	pedBlock: {
		width: "100%",
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		alignItems: "center",
	},
	pedRank: { fontWeight: "900", fontSize: 22, color: "#fff", marginTop: 6 },
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: "#fff",
		borderWidth: 2,
		borderColor: A.border,
		borderRadius: 14,
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	rowMe: { backgroundColor: "#EEF0FF", borderColor: A.blue },
	rowRank: { width: 18, textAlign: "center", fontWeight: "800", fontSize: 15, color: A.muted },
	rowName: { flex: 1, fontWeight: "800", fontSize: 15, color: A.ink },
	youTag: { fontSize: 11, fontWeight: "800", color: A.blue, opacity: 0.7 },
});
