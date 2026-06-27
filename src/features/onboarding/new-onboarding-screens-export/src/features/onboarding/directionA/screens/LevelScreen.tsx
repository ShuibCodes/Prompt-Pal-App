import { View, StyleSheet } from "react-native";
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

type Opt = {
	icon: keyof typeof MaterialCommunityIcons.glyphMap;
	c: string;
	title: string;
	sub: string;
};

const OPTIONS: Opt[] = [
	{ icon: "sprout-outline", c: A.green, title: "Total beginner", sub: "I'm just starting out" },
	{ icon: "water-outline", c: A.blue, title: "I've dabbled", sub: "Tried ChatGPT a few times" },
	{ icon: "check-circle-outline", c: A.xp, title: "Pretty comfortable", sub: "I use AI tools weekly" },
	{ icon: "rocket-launch-outline", c: A.violet, title: "I'm advanced", sub: "I prompt like a pro" },
];

export function LevelScreen() {
	const { next, back, level, setLevel } = useDirectionAStore();

	const onContinue = () => {
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		next();
	};

	return (
		<ScreenBase>
			<Header progress={stepProgress("level")} onBack={back} />
			<View style={styles.body}>
				<View style={styles.titleRow}>
					<Mascot name="curious" size={72} />
					<View style={{ flex: 1 }}>
						<Headline size={25} lines={[{ t: "How much AI do you know?" }]} />
					</View>
				</View>

				{OPTIONS.map((o, i) => (
					<OptionRow
						key={i}
						selected={level === i}
						onPress={() => {
							void Haptics.selectionAsync();
							setLevel(i);
						}}
						title={o.title}
						sub={o.sub}
						icon={
							<MaterialCommunityIcons
								name={o.icon}
								size={24}
								color={level === i ? A.green : o.c}
							/>
						}
					/>
				))}
			</View>
			<Footer>
				<ContinueButton onPress={onContinue} disabled={level === null} />
			</Footer>
		</ScreenBase>
	);
}

const styles = StyleSheet.create({
	body: { flex: 1, paddingHorizontal: 20 },
	titleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
});
