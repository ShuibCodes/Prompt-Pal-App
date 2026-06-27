/**
 * Dev-only intro lab — preview every pre-challenge Prompty intro (promise +
 * secret) for the live opening path without playing the challenges or touching
 * the "seen" state. Mirrors the copy in `convex/coding_lessons_data.ts`
 * (codingLessonIntros) in live path order.
 */
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PromptyChallengeIntro } from "@/features/game/components/PromptyChallengeIntro";
import { isDevQuestToolsEnabled } from "@/lib/devQuest";

type IntroPreview = {
	id: string;
	title: string;
	promise: string;
	secret: string;
};

/** Opening-path intros in the order the player meets them (LAUNCH_CODING_OPENING_LESSON_IDS). */
const INTRO_PREVIEWS: IntroPreview[] = [
	{
		id: "code-1-easy",
		title: "Describe the outcome, not the code",
		promise: "Want to build a real website… using nothing but words? 👀",
		secret:
			"The trick: describe what you want to see, not how to code it. You write the prompt — I'll show you how you did.",
	},
	{
		id: "code-9-medium",
		title: "Refine with a focused follow-up",
		promise: "Something almost-right… want to fix it without starting over? 👀",
		secret:
			"The trick: don't redo it all. Ask for the one or two tweaks you want and leave the rest.",
	},
	{
		id: "code-4-easy",
		title: "Describe what happens, not how",
		promise: "This button does nothing… want to bring it to life in one line? 👀",
		secret:
			"The trick: say what should happen for the user, not how to wire it up.",
	},
	{
		id: "code-2-easy",
		title: "Name your tech stack",
		promise: "Want AI to style things your way, not its way? 👀",
		secret:
			"The trick: name your tools up front. Tell AI the stack and it stops guessing.",
	},
	{
		id: "code-3-easy",
		title: "Scope to one change at a time",
		promise: "Can you add one thing… without AI 'fixing' everything else? 👀",
		secret:
			"The trick: ask for one change at a time, and say what to leave alone.",
	},
	{
		id: "code-5-easy",
		title: "Protect what must stay the same",
		promise: "Want to change one part… and keep the rest perfectly untouched? 👀",
		secret:
			"The trick: name what AI must not touch. Guardrails keep the good stuff safe.",
	},
	{
		id: "code-11-hard",
		title: "Describe the design in plain language",
		promise: "Can you design something pretty… without knowing any CSS? 👀",
		secret:
			"The trick: describe the look in plain words — colors, spacing, hover — like talking to a designer.",
	},
	{
		id: "code-19-easy",
		title: "Start with the simplest version",
		promise: "Want to build a feature without it blowing up on you? 👀",
		secret:
			"The trick: ask for the simplest version first. Get it working, then grow it.",
	},
	{
		id: "code-18-easy",
		title: "Match an existing reference",
		promise: "Want a matching twin for something that already looks great? 👀",
		secret: "The trick: point at what already exists and tell AI to match it.",
	},
	{
		id: "code-17-easy",
		title: "Ask for the output format you want",
		promise: "Want plain boring text to fold itself into something slick? 👀",
		secret:
			"The trick: name the exact format you want. The shape is part of the ask.",
	},
	{
		id: "code-16-easy",
		title: "Set the boundaries",
		promise: "Want AI to build it your way… with rules it can't break? 👀",
		secret:
			"The trick: set the limits up front. What you forbid shapes the result too.",
	},
	{
		id: "code-8-medium",
		title: "Name edge cases in your prompt",
		promise:
			"What happens when it all goes wrong… want to handle it before it does? 👀",
		secret:
			"The trick: name the edge cases yourself. AI only guards what you call out.",
	},
	{
		id: "code-6-medium",
		title: "Report bugs: what's wrong, where, and expected",
		promise: "Found a bug? Want AI to squash it on the very first try? 👀",
		secret:
			"The trick: say what's wrong, where it happens, and what should happen instead.",
	},
	{
		id: "code-7-medium",
		title: "Ask for a plan before code",
		promise: "Want AI to think before it builds… and save you 3 redos? 👀",
		secret:
			"The trick: ask for the plan first. Approve the approach before any code.",
	},
];

export default function IntroLabScreen() {
	const router = useRouter();
	const devToolsEnabled = isDevQuestToolsEnabled();
	const [playingIndex, setPlayingIndex] = useState<number | null>(null);

	const handleClose = () => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/(tabs)/profile");
	};

	if (!devToolsEnabled) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.centered}>
					<Text style={styles.blockedTitle}>Dev tools only</Text>
					<Text style={styles.blockedBody}>
						The intro lab is available in development builds or when
						EXPO_PUBLIC_DEV_QUEST_TOOLS=1 is set.
					</Text>
					<Pressable onPress={handleClose} style={styles.backButton}>
						<Text style={styles.backButtonText}>Go back</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}

	if (playingIndex !== null) {
		const item = INTRO_PREVIEWS[playingIndex];
		return (
			<View style={styles.playerRoot}>
				<PromptyChallengeIntro
					key={item.id}
					promise={item.promise}
					secret={item.secret}
					onComplete={() => setPlayingIndex(null)}
				/>
				<SafeAreaView style={styles.playerClose} edges={["top"]}>
					<Pressable
						onPress={() => setPlayingIndex(null)}
						style={styles.playerCloseButton}
						accessibilityRole="button"
						accessibilityLabel="Close intro preview"
						hitSlop={12}
					>
						<Ionicons name="close" size={26} color="#3C3C3C" />
					</Pressable>
				</SafeAreaView>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={["top", "bottom"]}>
			<View style={styles.header}>
				<Pressable
					onPress={handleClose}
					style={styles.headerButton}
					accessibilityRole="button"
					accessibilityLabel="Close intro lab"
					hitSlop={8}
				>
					<Ionicons name="close" size={26} color="#3C3C3C" />
				</Pressable>
				<Text style={styles.headerTitle}>Intro Lab</Text>
				<View style={styles.headerButton} />
			</View>

			<ScrollView
				style={styles.list}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.caption}>
					{INTRO_PREVIEWS.length} opening-path intros, in play order. Tap to
					preview full-screen (doesn't affect "seen" state).
				</Text>

				{INTRO_PREVIEWS.map((item, index) => (
					<Pressable
						key={item.id}
						onPress={() => setPlayingIndex(index)}
						style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
						accessibilityRole="button"
						accessibilityLabel={`Preview intro for ${item.title}`}
					>
						<View style={styles.cardHeader}>
							<View style={styles.numberBadge}>
								<Text style={styles.numberBadgeText}>{index + 1}</Text>
							</View>
							<View style={styles.cardHeaderText}>
								<Text style={styles.cardTitle}>{item.title}</Text>
								<Text style={styles.cardId}>{item.id}</Text>
							</View>
							<Ionicons name="play-circle" size={30} color="#58CC02" />
						</View>

						<View style={styles.copyBlock}>
							<Text style={styles.copyLabel}>PROMISE</Text>
							<Text style={styles.copyText}>{item.promise}</Text>
						</View>
						<View style={styles.copyBlock}>
							<Text style={styles.copyLabel}>SECRET</Text>
							<Text style={styles.copyText}>{item.secret}</Text>
						</View>
					</Pressable>
				))}

				<View style={{ height: 24 }} />
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	centered: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 32,
	},
	blockedTitle: {
		fontSize: 20,
		fontWeight: "900",
		color: "#3C3C3C",
		marginBottom: 8,
	},
	blockedBody: {
		fontSize: 14,
		color: "#777777",
		textAlign: "center",
		marginBottom: 20,
	},
	backButton: {
		backgroundColor: "#58CC02",
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 14,
	},
	backButtonText: {
		color: "#FFFFFF",
		fontWeight: "900",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#F0F0F0",
	},
	headerButton: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "900",
		color: "#3C3C3C",
	},
	list: {
		flex: 1,
	},
	listContent: {
		padding: 16,
	},
	caption: {
		fontSize: 13,
		color: "#8E8E93",
		marginBottom: 16,
		lineHeight: 18,
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		borderWidth: 2,
		borderColor: "#EFEFEF",
		padding: 16,
		marginBottom: 14,
	},
	cardPressed: {
		opacity: 0.85,
		borderColor: "#D7F0C2",
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	numberBadge: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: "#E8F7DD",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	numberBadgeText: {
		fontSize: 14,
		fontWeight: "900",
		color: "#58CC02",
	},
	cardHeaderText: {
		flex: 1,
		marginRight: 8,
	},
	cardTitle: {
		fontSize: 15,
		fontWeight: "900",
		color: "#3C3C3C",
	},
	cardId: {
		fontSize: 12,
		fontWeight: "700",
		color: "#B0B0B0",
		marginTop: 2,
	},
	copyBlock: {
		marginTop: 8,
	},
	copyLabel: {
		fontSize: 10,
		fontWeight: "900",
		letterSpacing: 1.5,
		color: "#FF9600",
		marginBottom: 2,
	},
	copyText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#3C3C3C",
		lineHeight: 20,
	},
	playerRoot: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	playerClose: {
		position: "absolute",
		top: 0,
		left: 0,
	},
	playerCloseButton: {
		margin: 12,
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#F2F2F2",
		alignItems: "center",
		justifyContent: "center",
	},
});
