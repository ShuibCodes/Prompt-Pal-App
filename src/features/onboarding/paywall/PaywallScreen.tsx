import { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Image,
	ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { PAY, PROMPTY_WIZARD } from "./theme";
import { TrialToggle } from "./TrialToggle";

type Plan = "yearly" | "weekly";

export interface PaywallProps {
	/** Initial free-trial toggle state. Default true. */
	initialTrial?: boolean;
	/** Initial selected plan. Default "yearly". */
	initialPlan?: Plan;
	onClose?: () => void;
	onRestore?: () => void;
	/** Fired on CTA press with the resolved purchase intent. */
	onContinue?: (intent: { plan: Plan; trial: boolean }) => void;
}

/**
 * CTA rule:
 *   "Try for Free"  ⟺  trial enabled AND weekly (free-trial) plan selected
 *   "Continue"      ⟺  everything else (yearly selected, or trial off)
 */
function ctaLabel(trial: boolean, plan: Plan): string {
	return trial && plan === "weekly" ? "Try for Free" : "Continue";
}

const FEATURES: { tile: keyof typeof TILE; emoji: string; pre: string; bold: string; post?: string }[] = [
	{ tile: "amber", emoji: "⚡", pre: "Images, screens, and more — all ", bold: "unlocked" },
	{ tile: "orange", emoji: "🎯", pre: "Know exactly ", bold: "why your prompt worked" },
	{ tile: "gold", emoji: "🏆", pre: "", bold: "Compete", post: " and climb the ranks daily" },
	{ tile: "mint", emoji: "✨", pre: "Build screens with ", bold: "just words" },
];

const TILE = {
	amber: PAY.amber,
	orange: PAY.orangeTile,
	gold: PAY.gold,
	mint: PAY.mint,
} as const;

export function PaywallScreen({
	initialTrial = true,
	initialPlan = "yearly",
	onClose,
	onRestore,
	onContinue,
}: PaywallProps) {
	const [trial, setTrial] = useState(initialTrial);
	// Enabling the trial always selects the 3-day free trial (weekly) plan.
	const [plan, setPlan] = useState<Plan>(initialTrial ? "weekly" : initialPlan);

	const onToggleTrial = (next: boolean) => {
		setTrial(next);
		if (next) setPlan("weekly");
	};

	// gentle mascot bob
	const bob = useSharedValue(0);
	useEffect(() => {
		bob.value = withRepeat(
			withSequence(withTiming(1, { duration: 2000 }), withTiming(0, { duration: 2000 })),
			-1,
			true,
		);
	}, [bob]);
	const bobStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: -7 * bob.value }, { rotate: `${-1.2 * bob.value}deg` }],
	}));

	const selectPlan = (p: Plan) => {
		void Haptics.selectionAsync();
		setPlan(p);
	};

	const onPressCta = () => {
		void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		onContinue?.({ plan, trial });
	};

	return (
		<SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
			{/* top bar */}
			<View style={styles.topbar}>
				<TouchableOpacity onPress={onRestore} hitSlop={10}>
					<Text style={styles.restore}>Restore</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.closex} onPress={onClose} hitSlop={10}>
					<Ionicons name="close" size={17} color="#9A9AA0" />
				</TouchableOpacity>
			</View>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				bounces={false}
			>
				{/* hero */}
				<View style={styles.hero}>
					<View style={styles.glow} />
					<Animated.Image source={PROMPTY_WIZARD} style={[styles.prompty, bobStyle]} resizeMode="contain" />
					<Spark style={{ top: 4, left: 60 }} size={15} />
					<Spark style={{ top: 26, right: 58 }} size={11} />
					<Spark style={{ bottom: 16, left: 52 }} size={10} />
				</View>

				<Text style={styles.headline}>
					Learn to speak AI.{"\n"}
					<Text style={styles.headlineAccent}>Get anything built. 🧙</Text>
				</Text>

				{/* features */}
				<View style={styles.features}>
					{FEATURES.map((f, i) => (
						<View key={i} style={styles.frow}>
							<View style={[styles.ficon, { backgroundColor: TILE[f.tile] }]}>
								<Text style={styles.femoji}>{f.emoji}</Text>
							</View>
							<Text style={styles.ftext}>
								{f.pre}
								<Text style={styles.fbold}>{f.bold}</Text>
								{f.post ?? ""}
							</Text>
						</View>
					))}
				</View>

				{/* free-trial toggle */}
				<View style={styles.trialRow}>
					<Text style={styles.trialLbl}>{trial ? "Free trial enabled" : "Enable free trial"}</Text>
					<TrialToggle value={trial} onChange={onToggleTrial} />
				</View>

				{/* pricing */}
				<View style={styles.pricing}>
					<PlanCard
						selected={plan === "yearly"}
						onPress={() => selectPlan("yearly")}
						title="YEARLY ACCESS"
						sub="Just $59.99 per year"
						subBold="$59.99"
						price="$1.15"
						badge="BEST OFFER"
					/>
					<PlanCard
						selected={plan === "weekly"}
						onPress={() => selectPlan("weekly")}
						title={trial ? "3-DAY FREE TRIAL" : "WEEKLY ACCESS"}
						sub={trial ? "then billed weekly" : "Billed weekly"}
						price="$4.99"
					/>
				</View>
			</ScrollView>

			{/* CTA */}
			<View style={styles.ctaZone}>
				<TouchableOpacity style={styles.cta} onPress={onPressCta} activeOpacity={0.85}>
					<Text style={styles.ctaText}>{ctaLabel(trial, plan)}</Text>
				</TouchableOpacity>
				<View style={styles.reassure}>
					<Ionicons name="time-outline" size={16} color={PAY.orange} />
					<Text style={styles.reassureText}>Cancel anytime</Text>
				</View>
				<View style={styles.legal}>
					<Text style={styles.legalLink}>Terms of Use</Text>
					<Text style={styles.legalSep}>|</Text>
					<Text style={styles.legalLink}>Privacy Policy</Text>
				</View>
			</View>
		</SafeAreaView>
	);
}

function Spark({ style, size }: { style: object; size: number }) {
	return (
		<Ionicons
			name="sparkles"
			size={size}
			color="#FAC12E"
			style={[{ position: "absolute" }, style]}
		/>
	);
}

function PlanCard({
	selected,
	onPress,
	title,
	sub,
	subBold,
	price,
	badge,
}: {
	selected: boolean;
	onPress: () => void;
	title: string;
	sub: string;
	subBold?: string;
	price: string;
	badge?: string;
}) {
	// split sub around the bold fragment if provided
	let subNode: React.ReactNode = sub;
	if (subBold && sub.includes(subBold)) {
		const [a, b] = sub.split(subBold);
		subNode = (
			<>
				{a}
				<Text style={styles.psubBold}>{subBold}</Text>
				{b}
			</>
		);
	}
	return (
		<TouchableOpacity
			style={[styles.pcard, selected && styles.pcardSel]}
			onPress={onPress}
			activeOpacity={0.85}
		>
			{badge ? (
				<View style={styles.badge}>
					<Text style={styles.badgeText}>{badge}</Text>
				</View>
			) : null}
			<View style={styles.pinner}>
				<View style={[styles.radio, selected && styles.radioSel]}>
					{selected ? <View style={styles.radioDot} /> : null}
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.ptitle}>{title}</Text>
					<Text style={styles.psub}>{subNode}</Text>
				</View>
			</View>
			<View>
				<Text style={[styles.pprice, selected && { color: PAY.orangeDeep }]}>{price}</Text>
				<Text style={styles.pper}>per week</Text>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: PAY.white },
	topbar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 22,
		height: 40,
	},
	restore: { fontSize: 13.5, fontWeight: "700", color: PAY.muted },
	closex: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#F1F1F2",
		alignItems: "center",
		justifyContent: "center",
	},
	content: { paddingHorizontal: 22, paddingBottom: 8 },

	hero: { height: 130, alignItems: "center", justifyContent: "center", marginTop: 4 },
	glow: {
		position: "absolute",
		width: 150,
		height: 150,
		borderRadius: 75,
		backgroundColor: "rgba(245,158,11,0.13)",
	},
	prompty: { width: 128, height: 128 },
	headline: {
		marginTop: 2,
		textAlign: "center",
		fontSize: 28,
		lineHeight: 31,
		fontWeight: "900",
		color: PAY.ink,
		letterSpacing: -0.6,
	},
	headlineAccent: { color: PAY.orange },

	features: { marginTop: 14, gap: 9 },
	frow: { flexDirection: "row", alignItems: "center", gap: 14 },
	ficon: {
		width: 40,
		height: 40,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 0,
		shadowOffset: { width: 0, height: 3 },
		elevation: 1,
	},
	femoji: { fontSize: 19 },
	ftext: { flex: 1, fontSize: 16, fontWeight: "700", color: "#3A3A40" },
	fbold: { fontWeight: "900", color: PAY.ink },

	trialRow: {
		marginTop: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderWidth: 1.5,
		borderColor: PAY.line,
		borderRadius: 18,
		paddingHorizontal: 18,
		paddingVertical: 12,
	},
	trialLbl: { fontSize: 16, fontWeight: "800", color: PAY.ink },

	pricing: { marginTop: 12, gap: 10 },
	pcard: {
		position: "relative",
		borderRadius: 18,
		paddingHorizontal: 18,
		paddingVertical: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderWidth: 2,
		borderColor: PAY.line,
		backgroundColor: "#fff",
	},
	pcardSel: { borderColor: PAY.orange, backgroundColor: PAY.cream },
	pinner: { flexDirection: "row", alignItems: "center", gap: 13, flex: 1 },
	radio: {
		width: 22,
		height: 22,
		borderRadius: 11,
		borderWidth: 2,
		borderColor: "#DADADE",
		alignItems: "center",
		justifyContent: "center",
	},
	radioSel: { borderColor: PAY.orange, backgroundColor: PAY.orange },
	radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
	ptitle: { fontSize: 16, fontWeight: "900", color: PAY.ink, letterSpacing: 0.2 },
	psub: { fontSize: 13.5, fontWeight: "700", color: PAY.muted, marginTop: 2 },
	psubBold: { color: PAY.ink, fontWeight: "900" },
	pprice: { fontSize: 17, fontWeight: "900", color: PAY.ink, textAlign: "right" },
	pper: { fontSize: 12.5, fontWeight: "700", color: PAY.muted, marginTop: 1, textAlign: "right" },
	badge: {
		position: "absolute",
		top: -11,
		right: 16,
		backgroundColor: PAY.orange,
		borderRadius: 99,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
	badgeText: { fontSize: 10.5, fontWeight: "900", color: "#fff", letterSpacing: 0.7 },

	ctaZone: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 16 },
	cta: {
		height: 58,
		borderRadius: 18,
		backgroundColor: PAY.green,
		borderBottomWidth: 5,
		borderBottomColor: PAY.greenDark,
		alignItems: "center",
		justifyContent: "center",
	},
	ctaText: { color: "#fff", fontSize: 18.5, fontWeight: "900", letterSpacing: 0.3 },
	reassure: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 13 },
	reassureText: { fontSize: 14, fontWeight: "800", color: PAY.muted },
	legal: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 12 },
	legalLink: { fontSize: 12, fontWeight: "700", color: "#B6B6BC" },
	legalSep: { fontSize: 12, color: "#DADADE" },
});
