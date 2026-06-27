import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
	ScreenBase,
	Header,
	Mascot,
	Headline,
	ContinueButton,
	Footer,
} from "../components/Chrome";
import { useDirectionAStore, stepProgress, AStep } from "../store";
import { A } from "../theme";

type RewardKind = "social" | "meet" | "time";

const STEP_FOR: Record<RewardKind, AStep> = {
	social: "reward-social",
	meet: "reward-meet",
	time: "reward-time",
};

export function RewardScreen({ kind }: { kind: RewardKind }) {
	const { next, back } = useDirectionAStore();
	const celebrate = kind === "time";

	const onContinue = () => {
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		next();
	};

	return (
		<ScreenBase>
			<Header progress={stepProgress(STEP_FOR[kind])} onBack={back} />
			<View style={styles.body}>
				<Mascot name={celebrate ? "joyous" : "curious"} size={172} celebrate={celebrate} />

				{kind === "social" ? (
					<>
						<Stat big="800+" cap="people have already learned AI with PromptPal" color={A.green} />
						<Line>You're in great company — let's make you one of them.</Line>
					</>
				) : kind === "meet" ? (
					<>
						<View style={styles.levelPill}>
							<Text style={styles.levelPillText}>YOUR LEVEL · DABBLER</Text>
						</View>
						<Headline
							align="center"
							size={26}
							lines={[
								{ t: "Perfect — PromptPal meets" },
								{ t: "you exactly where you are." },
							]}
						/>
						<Line>We've tuned your path so every challenge feels just right.</Line>
					</>
				) : (
					<>
						<View style={styles.statWrap}>
							<MaterialCommunityIcons
								name="star-four-points"
								size={18}
								color={A.gold}
								style={styles.sparkLeft}
							/>
							<Text style={[styles.statBig, { color: A.xp }]}>5 min</Text>
							<Text style={styles.statCap}>a day</Text>
						</View>
						<Headline
							align="center"
							size={25}
							lines={[
								{ t: "Just 5 minutes a day is" },
								{ t: "all it takes to master AI." },
							]}
						/>
					</>
				)}
			</View>
			<Footer>
				<ContinueButton onPress={onContinue} />
			</Footer>
		</ScreenBase>
	);
}

function Stat({ big, cap, color }: { big: string; cap: string; color: string }) {
	return (
		<View style={styles.statWrap}>
			<Text style={[styles.statBig, { color }]}>{big}</Text>
			<Text style={styles.statCap}>{cap}</Text>
		</View>
	);
}

function Line({ children }: { children: React.ReactNode }) {
	return <Text style={styles.line}>{children}</Text>;
}

const styles = StyleSheet.create({
	body: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 22,
		paddingHorizontal: 28,
	},
	statWrap: { alignItems: "center", gap: 4 },
	statBig: { fontSize: 64, fontWeight: "900", lineHeight: 66 },
	statCap: {
		fontSize: 15,
		fontWeight: "800",
		color: A.muted,
		textAlign: "center",
		maxWidth: 240,
		lineHeight: 20,
	},
	sparkLeft: { position: "absolute", left: -24, top: -4 },
	line: {
		fontSize: 16,
		fontWeight: "700",
		color: A.ink,
		textAlign: "center",
		lineHeight: 23,
		maxWidth: 300,
	},
	levelPill: {
		backgroundColor: "#EEF0FF",
		borderWidth: 1,
		borderColor: "#D5DAFF",
		borderRadius: 99,
		paddingHorizontal: 12,
		paddingVertical: 5,
	},
	levelPillText: { fontSize: 12, fontWeight: "800", color: A.blue, letterSpacing: 1 },
});
