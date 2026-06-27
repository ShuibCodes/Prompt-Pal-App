/**
 * ImageResultScreen — Screen B of the image-challenge two-screen flow
 * (dev image lab only).
 *
 * Renders the evaluation snapshot from the session store: Prompty reacting to
 * the score (happy on pass / sad on fail), the score bars, the checklist
 * reframed as captured/missed feedback (this is where the checklist teaches),
 * and a single-sentence AI feedback line. Kept short so it doesn't scroll.
 * CTAs: "Try again" (back to compose with the prompt retained) and "Continue"
 * (advance when passed).
 *
 * Reuses PromptyMascot + the ChallengeResultPreview layout/components. No
 * backend logic is changed here.
 */
import { useCallback, useEffect, useMemo } from "react";
import {
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ChallengeScoreBar } from "@/features/game/components/ChallengeScoreBar";
import { PromptyMascot } from "@/features/challenge-preview/PromptyMascot";
import { GameButton } from "@/features/challenge-preview/GameButton";
import { Confetti } from "@/features/challenge-preview/Confetti";
import { fetchDevLevelsFromApi } from "@/features/levels/data";
import {
	useImageChallengeSession,
	type ImageRoundResult,
} from "@/features/game/image/imageChallengeSession";
import { buildChecklistFeedback } from "@/features/game/image/checklistFeedback";

export default function ImageResultScreen() {
	const { id, devLab } = useLocalSearchParams<{ id?: string; devLab?: string }>();
	const router = useRouter();
	const devSuffix = devLab === "1" ? "?devLab=1" : "";

	const lastResult = useImageChallengeSession((s) => s.lastResult);
	const clearLastResult = useImageChallengeSession((s) => s.clearLastResult);

	// Snapshot the result on mount so clearing it later doesn't blank the screen.
	const result = useMemo<ImageRoundResult | null>(
		() => lastResult,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
	const passed = result ? result.score >= result.passingScore : false;

	useEffect(() => {
		if (!result) return;
		void Haptics.notificationAsync(
			passed
				? Haptics.NotificationFeedbackType.Success
				: Haptics.NotificationFeedbackType.Warning,
		);
	}, [passed, result]);

	const checklist = useMemo(
		() =>
			result
				? buildChecklistFeedback(
						result.checklistItems,
						result.prompt,
						result.keywordsMatched,
					)
				: [],
		[result],
	);

	// Collapse the AI feedback to a single sentence: the first non-empty line,
	// trimmed to its first sentence so the card stays scannable.
	const headlineFeedback = useMemo(() => {
		const first = (result?.feedback ?? []).map((s) => s.trim()).find(Boolean);
		if (!first) return "";
		const match = first.match(/^[^.!?]*[.!?]/);
		return (match ? match[0] : first).trim();
	}, [result]);

	const goToCompose = useCallback(() => {
		// Back to the (still-mounted) compose screen — the prompt is retained there
		// and in the session store, so the user can edit and re-generate.
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace(`/game/image/${id}${devSuffix}`);
	}, [devSuffix, id, router]);

	const handleContinue = useCallback(async () => {
		clearLastResult();
		try {
			const levels = await fetchDevLevelsFromApi();
			const ordered = levels
				.filter((entry) => entry.type === "image")
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
			const idx = ordered.findIndex((entry) => entry.id === id);
			const next =
				idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;
			if (next) {
				router.replace(`/game/image/${next.id}${devSuffix}`);
			} else {
				router.replace("/dev/image-lab");
			}
		} catch {
			router.replace("/dev/image-lab");
		}
	}, [clearLastResult, devSuffix, id, router]);

	if (!result) {
		return (
			<View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
				<SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
					<View className="flex-1 items-center justify-center px-8">
						<Ionicons name="image-outline" size={56} color="#C7C7CC" />
						<Text
							className="text-[16px] font-black mt-4 text-center"
							style={{ color: "#3C3C3C" }}
						>
							No result to show
						</Text>
						<Text
							className="text-[13px] mt-2 text-center"
							style={{ color: "#8E8E93" }}
						>
							Generate an image first to see your score.
						</Text>
						<GameButton
							label="Back"
							variant="primary"
							onPress={goToCompose}
							style={{ marginTop: 20, paddingHorizontal: 32 }}
						/>
					</View>
				</SafeAreaView>
			</View>
		);
	}

	const verdictTitle = passed ? "Nailed it!" : "Almost there!";

	return (
		<View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
			<SafeAreaView edges={["top"]} style={{ flex: 1 }}>
				{/* Top nav: close back to compose */}
				<View className="px-5 pt-1 pb-2 flex-row items-center">
					<TouchableOpacity
						onPress={goToCompose}
						accessibilityRole="button"
						accessibilityLabel="Close result"
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						className="mr-3"
					>
						<Ionicons name="close" size={28} color="#3C3C3C" />
					</TouchableOpacity>
					<Text
						className="flex-1 text-[15px] font-black"
						style={{ color: "#3C3C3C" }}
						numberOfLines={1}
					>
						{result.levelTitle}
					</Text>
				</View>

				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 20 }}
					showsVerticalScrollIndicator={false}
				>
					{/* Prompty hero */}
					<View className="items-center mb-5 mt-2">
						<PromptyMascot
							mood={passed ? "happy" : "sad"}
							size={200}
							celebrate={passed}
						/>
						<Animated.Text
							entering={FadeInDown.delay(120).springify()}
							className="text-[26px] font-black mt-2"
							style={{ color: "#3C3C3C" }}
						>
							{verdictTitle}
						</Animated.Text>
					</View>

					{/* Big score */}
					<View className="items-center mb-5">
						<Text
							className="text-[64px] font-black"
							style={{ color: passed ? "#58CC02" : "#FF4B4B", lineHeight: 70 }}
						>
							{Math.round(result.score)}%
						</Text>
						<Text
							className="text-[11px] font-black uppercase tracking-[2px]"
							style={{ color: "#8E8E93" }}
						>
							{passed
								? "Passed"
								: `Needs ${result.passingScore}% to pass`}
						</Text>
					</View>

					<ChallengeScoreBar label="Task match" value={result.score} color="#58CC02" />
					<ChallengeScoreBar
						label="Prompt quality"
						value={result.promptQualityScore}
						color="#FF9600"
						delay={120}
					/>

					{/* Checklist as captured/missed feedback */}
					{checklist.length > 0 ? (
						<Animated.View
							entering={FadeInDown.delay(280).springify()}
							className="mt-4 rounded-2xl p-4"
							style={{
								backgroundColor: "#FFFFFF",
								borderWidth: 1,
								borderColor: "#EFEFEF",
							}}
						>
							<Text
								className="text-[10px] font-black uppercase tracking-[2px] mb-3"
								style={{ color: "#8E8E93" }}
							>
								What you covered
							</Text>
							{checklist.map((item) => (
								<View key={item.label} className="flex-row items-center mb-2">
									<Ionicons
										name={item.passed ? "checkmark-circle" : "close-circle"}
										size={20}
										color={item.passed ? "#58CC02" : "#E53935"}
										style={{ marginRight: 8 }}
									/>
									<Text
										className="flex-1 text-[14px] leading-5"
										style={{ color: item.passed ? "#3C3C3C" : "#999999" }}
									>
										{item.label}
									</Text>
								</View>
							))}
						</Animated.View>
					) : null}

					{/* AI feedback — one concise sentence (the headline takeaway). */}
					{headlineFeedback ? (
						<Animated.View
							entering={FadeInDown.delay(340).springify()}
							className="mt-4 rounded-2xl p-4"
							style={{
								backgroundColor: "#F7F9FC",
								borderWidth: 1,
								borderColor: "#EFEFEF",
							}}
						>
							<Text
								className="text-[10px] font-black uppercase tracking-[2px] mb-2"
								style={{ color: "#8E8E93" }}
							>
								Feedback
							</Text>
							<Text
								className="text-[14px] leading-5"
								style={{ color: "#3C3C3C" }}
							>
								{headlineFeedback}
							</Text>
						</Animated.View>
					) : null}

				</ScrollView>

				{/* Pinned CTAs */}
				<View
					className="px-5 pt-3"
					style={{
						borderTopWidth: 1,
						borderTopColor: "#F0F0F0",
						paddingBottom: 12,
						backgroundColor: "#FFFFFF",
					}}
				>
					<View className="flex-row items-center" style={{ gap: 12 }}>
						<GameButton
							label="Try again"
							variant="secondary"
							onPress={goToCompose}
							style={{ flex: 1 }}
						/>
						{passed ? (
							<GameButton
								label="Continue"
								variant="primary"
								onPress={handleContinue}
								style={{ flex: 1 }}
							/>
						) : null}
					</View>
				</View>
			</SafeAreaView>

			{passed ? <Confetti /> : null}
		</View>
	);
}
