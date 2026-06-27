import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
	ScreenBase,
	Header,
	Mascot,
	Headline,
	OptionRow,
	ContinueButton,
	Footer,
} from "../components/Chrome";
import { useDirectionAStore, stepProgress } from "../store";
import { A } from "../theme";

type Opt = { icon: keyof typeof MaterialCommunityIcons.glyphMap; c: string; title: string };

const OPTIONS: Opt[] = [
	{ icon: "briefcase-outline", c: A.blue, title: "Level up my career" },
	{ icon: "hammer", c: A.green, title: "Build my own projects" },
	{ icon: "trending-up", c: A.xp, title: "Stay ahead of the curve" },
	{ icon: "star-four-points-outline", c: A.gold, title: "Just curious & having fun" },
	{ icon: "school-outline", c: A.violet, title: "Boost my studies" },
	{ icon: "clock-outline", c: A.muted, title: "Work smarter, save time" },
];

export function WhyScreen() {
	const { next, back, reason, setReason } = useDirectionAStore();

	const onContinue = () => {
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		next();
	};

	return (
		<ScreenBase>
			<Header progress={stepProgress("why")} onBack={back} />
			<ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
				<View style={styles.titleRow}>
					<Mascot name="happy" size={72} />
					<View style={{ flex: 1 }}>
						<Headline size={25} lines={[{ t: "Why are you learning AI?" }]} />
					</View>
				</View>

				{OPTIONS.map((o, i) => (
					<OptionRow
						key={i}
						selected={reason === i}
						onPress={() => {
							void Haptics.selectionAsync();
							setReason(i);
						}}
						title={o.title}
						icon={
							<MaterialCommunityIcons
								name={o.icon}
								size={24}
								color={reason === i ? A.green : o.c}
							/>
						}
					/>
				))}
			</ScrollView>
			<Footer>
				<ContinueButton onPress={onContinue} disabled={reason === null} />
			</Footer>
		</ScreenBase>
	);
}

const styles = StyleSheet.create({
	scroll: { paddingHorizontal: 20, paddingBottom: 8 },
	titleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
});
