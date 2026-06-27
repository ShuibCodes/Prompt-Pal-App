import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	Alert,
	Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useDirectionAStore } from "../store";
import { A } from "../theme";
import { useConvexAI } from "@/hooks/useConvexAI";
import {
	ImageComparisonRow,
	type ImageComparisonPhase,
} from "@/features/game/image/ImageComparisonRow";
import { useImageChallengeSession } from "@/features/game/image/imageChallengeSession";
import { PromptyScoringOverlay } from "@/features/game/components/PromptyScoringOverlay";
import { getAIErrorPresentation } from "@/lib/aiErrors";

// Onboarding image round = image-2-easy (the grey sphere). Reuse the bundled
// target asset + authoritative server rubric (looked up by taskId).
const ONBOARDING_LEVEL_ID = "image-2-easy";
const TARGET_IMAGE = require("../../../../../assets/images/level-2-image.png");
const CHECKLIST_ITEMS = ["Shape", "Background", "Edge or texture detail", "Style"];
// Very low pass bar so the first onboarding win lands reliably. Tune freely
// (1 = always pass; higher = slightly more earned).
const ONBOARDING_IMAGE_PASS = 10;

function Heart() {
	return <Ionicons name="heart" size={20} color={A.xp} />;
}

function Gap({
	value,
	onChangeText,
	placeholder,
	width,
	editable,
}: {
	value: string;
	onChangeText: (t: string) => void;
	placeholder: string;
	width: number;
	editable: boolean;
}) {
	const filled = value.trim().length > 0;
	return (
		<TextInput
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
			placeholderTextColor="#A98D63"
			editable={editable}
			style={[styles.gap, filled && styles.gapFilled, { minWidth: width }]}
		/>
	);
}

export function ChallengeScreen() {
	const { next } = useDirectionAStore();
	const { generateImage, evaluateImage } = useConvexAI();
	const setLastResult = useImageChallengeSession((s) => s.setLastResult);

	const [shape, setShape] = useState("");
	const [background, setBackground] = useState("");
	const [lighting, setLighting] = useState("");
	const [phase, setPhase] = useState<ImageComparisonPhase>("idle");
	const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);

	const busy = phase !== "idle";
	const canSubmit =
		shape.trim().length > 0 &&
		background.trim().length > 0 &&
		lighting.trim().length > 0 &&
		!busy;

	const submitLabel =
		phase === "painting"
			? "GENERATING…"
			: phase === "scoring"
				? "SCORING…"
				: "SUBMIT PROMPT";

	const onSubmit = async () => {
		if (!canSubmit) return;
		Keyboard.dismiss();
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		const prompt = `Create a ${shape.trim()} on a ${background.trim()} with ${lighting.trim()}`;

		setGeneratedPreview(null);
		setPhase("painting");
		try {
			const generateResult = await generateImage(prompt);
			const generatedImageUrl = generateResult.imageUrl;
			if (!generatedImageUrl) {
				throw new Error("No image was returned. Please try again.");
			}

			// Reveal the image, then score it.
			setGeneratedPreview(generatedImageUrl);
			setPhase("scoring");

			const evaluationResult = await evaluateImage({
				taskId: ONBOARDING_LEVEL_ID,
				userImageUrl: generatedImageUrl,
				userPrompt: prompt,
			});
			const evaluation = evaluationResult.evaluation;
			const finalScore = evaluation.score;

			setLastResult({
				levelId: ONBOARDING_LEVEL_ID,
				levelTitle: "Basic Shape",
				difficulty: "beginner",
				score: finalScore,
				passingScore: ONBOARDING_IMAGE_PASS,
				promptQualityScore:
					(evaluation as { promptQualityScore?: number }).promptQualityScore ?? 0,
				feedback: evaluation.feedback || [],
				keywordsMatched: evaluation.keywordsMatched || [],
				criteria:
					(evaluation as {
						criteria?: { name: string; score: number; feedback: string }[];
					}).criteria ?? [],
				checklistItems: CHECKLIST_ITEMS,
				prompt,
				generatedImageUrl,
			});

			void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			next();
		} catch (err) {
			const presentation = getAIErrorPresentation(err);
			Alert.alert(presentation.title, presentation.message);
		} finally {
			setPhase("idle");
			setGeneratedPreview(null);
		}
	};

	return (
		<SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
			<KeyboardAvoidingView
				style={styles.fill}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
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
						<Text style={styles.levelPillText}>CHALLENGE 1</Text>
					</View>
					<Text style={styles.title}>Re-create this image with the perfect prompt</Text>
					<Text style={styles.subtitle}>
						Fill the blanks to describe it, then watch the AI paint your version.
					</Text>

					{/* target (left) vs generated (right) */}
					<View style={styles.comparison}>
						<ImageComparisonRow
							targetSource={TARGET_IMAGE}
							generatedUri={generatedPreview}
							phase={phase}
						/>
					</View>

					{/* prompt label */}
					<Text style={styles.promptLabel}>YOUR PROMPT</Text>

					{/* fill-in */}
					<View style={styles.fillIn}>
						<View style={styles.fillRow}>
							<Text style={styles.fillText}>Create a </Text>
							<Gap
								value={shape}
								onChangeText={setShape}
								placeholder="shape"
								width={92}
								editable={!busy}
							/>
							<Text style={styles.fillText}> on a </Text>
							<Gap
								value={background}
								onChangeText={setBackground}
								placeholder="background"
								width={120}
								editable={!busy}
							/>
							<Text style={styles.fillText}> with </Text>
							<Gap
								value={lighting}
								onChangeText={setLighting}
								placeholder="lighting or shadow"
								width={150}
								editable={!busy}
							/>
						</View>
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
					<TouchableOpacity
						style={[styles.submit, !canSubmit && styles.submitDisabled]}
						onPress={() => void onSubmit()}
						disabled={!canSubmit}
						activeOpacity={0.85}
					>
						<Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
							{submitLabel}
						</Text>
						{!busy ? (
							<Ionicons
								name="arrow-forward"
								size={18}
								color={canSubmit ? "#fff" : "#A0A0A0"}
								style={{ marginLeft: 8 }}
							/>
						) : null}
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>

			<PromptyScoringOverlay
				visible={busy}
				messages={[
					"Painting your image…",
					"Mixing the colours…",
					"Checking your shapes…",
					"Scoring your prompt…",
					"Almost there…",
				]}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: A.white },
	fill: { flex: 1 },
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
		fontSize: 24,
		fontWeight: "800",
		color: A.ink,
		marginTop: 12,
		letterSpacing: -0.3,
		lineHeight: 28,
	},
	subtitle: {
		fontSize: 15,
		fontWeight: "700",
		color: A.muted,
		marginTop: 8,
		lineHeight: 21,
	},
	comparison: { marginTop: 16 },
	promptLabel: {
		fontSize: 13,
		fontWeight: "800",
		color: A.muted,
		letterSpacing: 1.5,
		marginTop: 18,
	},
	fillIn: {
		marginTop: 10,
		flex: 1,
		minHeight: 100,
		borderRadius: 18,
		backgroundColor: A.greenTint,
		borderWidth: 2,
		borderColor: A.successBorder,
		padding: 18,
	},
	fillRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
	fillText: { fontSize: 18, fontWeight: "700", color: A.ink, lineHeight: 38 },
	gap: {
		backgroundColor: "#F6E7D2",
		borderRadius: 8,
		borderBottomWidth: 2,
		borderBottomColor: A.xp,
		paddingHorizontal: 10,
		paddingVertical: Platform.OS === "ios" ? 4 : 1,
		fontSize: 17,
		fontWeight: "800",
		color: "#5A4423",
		textAlign: "center",
	},
	gapFilled: { backgroundColor: "#FFE9C7" },
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
	submitDisabled: {
		backgroundColor: "#E5E5E5",
		borderBottomColor: "#D3D3D3",
	},
	submitText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.6 },
	submitTextDisabled: { color: "#A0A0A0" },
});
