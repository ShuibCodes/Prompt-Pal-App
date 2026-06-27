/**
 * ImageComposeScreen — Screen A of the image-challenge two-screen flow
 * (dev image lab only; the image track is hidden for launch).
 *
 * Clean compose surface: header, instruction, a side-by-side Target vs. "Your
 * image" row (the right card shows the generating state IN PLACE), the prompt
 * input (scaffold-fade: fill-in-the-blank template on easy, free text on
 * medium/hard), a Hint button, and "Generate & Compare". On completion it
 * stores the evaluation in the session store and pushes to the result screen.
 *
 * Reuses the existing generation + evaluation pipeline (useConvexAI →
 * convex/ai.ts). No backend logic is changed here.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
	type TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Badge, Button, Card, Input } from "@/components/ui";
import { processApiLevelsWithLocalAssets } from "@/features/levels/data";
import { useGameStore, type Level } from "@/features/game/store";
import { useUserProgressStore } from "@/features/user/store";
import { useConvexAI } from "@/hooks/useConvexAI";
import { convexHttpClient } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api.js";
import { getAIErrorPresentation } from "@/lib/aiErrors";
import { logger } from "@/lib/logger";
import { NanoAssistant } from "@/lib/nanoAssistant";
import { useUser } from "@clerk/clerk-expo";
import { BeginnerTemplatePromptInput } from "@/features/game/components/BeginnerTemplatePromptInput";
import { HINT_XP_COST } from "@/features/game/components/PromptScaffold";
import {
	findFirstPlaceholderRange,
	getInitialPromptStateForLevel,
	getLevelChecklistItems,
	isBeginnerTemplateLocked,
} from "@/features/game/utils/scaffold";
import { ImageComparisonRow } from "@/features/game/image/ImageComparisonRow";
import { PromptyScoringOverlay } from "@/features/game/components/PromptyScoringOverlay";
import { useImageChallengeSession } from "@/features/game/image/imageChallengeSession";
import { isDevQuestToolsEnabled } from "@/lib/devQuest";

const INPUT_ACCESSORY_ID = "imageComposeAccessory";

function getLevelXPReward(level: Level): number {
	if (level.points && level.points > 0) return level.points;
	switch (level.difficulty) {
		case "beginner":
			return 50;
		case "intermediate":
			return 100;
		case "advanced":
			return 200;
		default:
			return 50;
	}
}

export default function ImageComposeScreen() {
	const { id, devLab } = useLocalSearchParams<{ id?: string; devLab?: string }>();
	const router = useRouter();
	const { user } = useUser();
	const { generateImage, evaluateImage } = useConvexAI();
	const { startLevel, completeLevel, syncToBackend } = useGameStore();
	const { updateStreak, addXP, spendXP, xp } = useUserProgressStore();

	const devSuffix = devLab === "1" ? "?devLab=1" : "";

	const setSessionPrompt = useImageChallengeSession((s) => s.setPrompt);
	const getSessionPrompt = useImageChallengeSession((s) => s.getPrompt);
	const setLastResult = useImageChallengeSession((s) => s.setLastResult);

	const [level, setLevel] = useState<Level | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [prompt, setPrompt] = useState("");
	const [phase, setPhase] = useState<"idle" | "painting" | "scoring">("idle");
	const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
	const isGenerating = phase !== "idle";

	// Beginner fill-in-the-blank template state.
	const [beginnerSlotsFilled, setBeginnerSlotsFilled] = useState(true);
	const [promptSelection, setPromptSelection] = useState<
		{ start: number; end?: number } | undefined
	>(undefined);
	const hasEditedPromptRef = useRef(false);
	const shouldJumpToTemplateRef = useRef(false);
	const promptInputRef = useRef<TextInput>(null);

	// Hint state.
	const [hints, setHints] = useState<string[]>([]);
	const [showHints, setShowHints] = useState(false);
	const [isLoadingHint, setIsLoadingHint] = useState(false);
	const [hintCooldown, setHintCooldown] = useState(0);

	const beginnerLocked = useMemo(
		() => isBeginnerTemplateLocked(level),
		[level],
	);
	const canAffordHint = xp >= HINT_XP_COST;
	const hintsRemaining = level
		? NanoAssistant.getHintsRemaining(level.id, level.difficulty)
		: 0;
	const maxHints = level
		? NanoAssistant.getMaxHintsPerLevel(level.difficulty)
		: 4;
	const noHintsLeft = hintsRemaining === 0;

	const goBack = useCallback(() => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/dev/image-lab");
	}, [router]);

	useEffect(() => {
		let cancelled = false;
		const loadLevel = async () => {
			if (!id) return;
			setIsLoading(true);
			setError(null);
			try {
				const apiLevel = await convexHttpClient.query(
					api.queries.getLevelById,
					{ id: id as string },
				);
				if (!apiLevel) throw new Error("Level not found");

				const processed = {
					...processApiLevelsWithLocalAssets([apiLevel as Level])[0],
					targetImageUrlForEvaluation:
						typeof apiLevel.targetImageUrl === "string"
							? apiLevel.targetImageUrl
							: undefined,
				};
				if (cancelled) return;

				setLevel(processed);
				startLevel(processed.id);
				NanoAssistant.resetHintsForLevel(processed.id);
				setHints([]);

				// Restore retained prompt (Try again), else seed scaffold initial state.
				const retained = getSessionPrompt(processed.id);
				const initial =
					retained ?? getInitialPromptStateForLevel(processed);
				setPrompt(initial);
				hasEditedPromptRef.current = Boolean(retained);
				setBeginnerSlotsFilled(!isBeginnerTemplateLocked(processed));
				shouldJumpToTemplateRef.current = Boolean(
					processed.scaffoldType === "template" &&
						initial &&
						!isBeginnerTemplateLocked(processed),
				);
			} catch (err) {
				if (cancelled) return;
				logger.error("ImageCompose", err as Error, { operation: "loadLevel", id });
				setError("Failed to load challenge. Please try again.");
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};
		void loadLevel();
		return () => {
			cancelled = true;
		};
	}, [id, getSessionPrompt, startLevel]);

	// Hint cooldown ticker.
	useEffect(() => {
		const interval = setInterval(() => {
			const { isOnCooldown, remainingMs } = NanoAssistant.getCooldownStatus();
			setHintCooldown(isOnCooldown ? Math.ceil(remainingMs / 1000) : 0);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const handlePromptChange = useCallback((text: string) => {
		hasEditedPromptRef.current = true;
		setPromptSelection(undefined);
		setPrompt(text);
	}, []);

	const handlePromptFocus = useCallback(() => {
		if (!level || isBeginnerTemplateLocked(level)) return;
		if (
			level.scaffoldType !== "template" ||
			!level.scaffoldTemplate ||
			hasEditedPromptRef.current ||
			prompt !== level.scaffoldTemplate ||
			!shouldJumpToTemplateRef.current
		) {
			return;
		}
		const range = findFirstPlaceholderRange(level.scaffoldTemplate);
		if (!range) return;
		shouldJumpToTemplateRef.current = false;
		requestAnimationFrame(() => setPromptSelection(range));
	}, [level, prompt]);

	const handleBeginnerPromptChange = useCallback((text: string) => {
		setPrompt(text);
	}, []);

	const handleGetHint = useCallback(async () => {
		if (!level || isLoadingHint || hintCooldown > 0) return;
		if (!canAffordHint) {
			Alert.alert("Not Enough XP", `You need ${HINT_XP_COST} XP to buy a hint.`);
			return;
		}
		if (noHintsLeft) {
			Alert.alert(
				"No Hints Remaining",
				`You've used all ${maxHints} hints for this level.`,
			);
			return;
		}
		setIsLoadingHint(true);
		try {
			const hint = await NanoAssistant.getHint(
				prompt,
				"image",
				level as Parameters<typeof NanoAssistant.getHint>[2],
			);
			await spendXP(HINT_XP_COST);
			setHints((prev) => [...prev, hint]);
			setShowHints(true);
		} catch (err) {
			Alert.alert(
				"Hint Unavailable",
				err instanceof Error ? err.message : "Could not get hint.",
			);
		} finally {
			setIsLoadingHint(false);
		}
	}, [
		canAffordHint,
		hintCooldown,
		isLoadingHint,
		level,
		maxHints,
		noHintsLeft,
		prompt,
		spendXP,
	]);

	const handleGenerate = useCallback(async () => {
		if (!level) return;
		if (!prompt.trim()) {
			Alert.alert("Add a prompt", "Describe the image before generating.");
			return;
		}
		if (beginnerLocked && !beginnerSlotsFilled) {
			Alert.alert("Fill the blanks", "Complete each blank before generating.");
			return;
		}

		Keyboard.dismiss();
		// Retain the prompt immediately so a return trip keeps the user's text.
		setSessionPrompt(level.id, prompt);
		// Two-phase anticipation: "painting" while the image generates, then reveal
		// the image in place and switch to "scoring" while evaluation runs — so the
		// wait reads as visible progress instead of one long opaque spinner.
		setGeneratedPreview(null);
		setPhase("painting");
		try {
			const generateResult = await generateImage(prompt);
			const generatedImageUrl = generateResult.imageUrl;
			if (!generatedImageUrl) {
				throw new Error("No image was returned. Please try again.");
			}

			// Reveal the generated image ~halfway through, then score it.
			setGeneratedPreview(generatedImageUrl);
			setPhase("scoring");

			const evaluationResult = await evaluateImage({
				taskId: level.id,
				userImageUrl: generatedImageUrl,
				expectedImageUrl: level.targetImageUrlForEvaluation,
				hiddenPromptKeywords: level.hiddenPromptKeywords,
				style: level.style,
				userPrompt: prompt,
			});
			const evaluation = evaluationResult.evaluation;
			const finalScore = evaluation.score;
			const passed = finalScore >= level.passingScore;

			// Persist the attempt for history (best-effort).
			if (user?.id) {
				try {
					await convexHttpClient.mutation(api.mutations.saveUserLevelAttempt, {
						levelId: level.id,
						score: finalScore,
						feedback: evaluation.feedback || [],
						keywordsMatched: evaluation.keywordsMatched || [],
						imageUrl: generatedImageUrl,
					});
				} catch (saveErr) {
					logger.warn("ImageCompose", "Failed to save attempt", {
						error: saveErr,
					});
				}
			}

			// On a pass, record progress + reward. Fail does NOT lose a life on the
			// image track (hearts non-blocking here, per product decision).
			if (passed && user?.id) {
				try {
					await convexHttpClient.mutation(api.mutations.updateLevelProgress, {
						appId: "prompt-pal",
						levelId: level.id,
						isCompleted: true,
						bestScore: finalScore,
						attempts: 1,
						completedAt: Date.now(),
					});
					await updateStreak();
					await addXP(getLevelXPReward(level));
					await completeLevel(level.id);
					syncToBackend().catch(() => {});
				} catch (progressErr) {
					logger.warn("ImageCompose", "Failed to record progress", {
						error: progressErr,
					});
				}
			}

			setLastResult({
				levelId: level.id,
				levelTitle: level.title ?? "Image challenge",
				difficulty: level.difficulty,
				score: finalScore,
				passingScore: level.passingScore,
				promptQualityScore:
					(evaluation as { promptQualityScore?: number }).promptQualityScore ??
					0,
				feedback: evaluation.feedback || [],
				keywordsMatched: evaluation.keywordsMatched || [],
				criteria:
					(evaluation as {
						criteria?: { name: string; score: number; feedback: string }[];
					}).criteria ?? [],
				checklistItems: getLevelChecklistItems(level),
				prompt,
				generatedImageUrl,
			});

			router.push(`/game/image/${level.id}/result${devSuffix}`);
		} catch (err) {
			const presentation = getAIErrorPresentation(err);
			Alert.alert(presentation.title, presentation.message);
		} finally {
			setPhase("idle");
			setGeneratedPreview(null);
		}
	}, [
		addXP,
		beginnerLocked,
		beginnerSlotsFilled,
		completeLevel,
		devSuffix,
		evaluateImage,
		generateImage,
		level,
		prompt,
		router,
		setLastResult,
		setSessionPrompt,
		syncToBackend,
		updateStreak,
		user?.id,
	]);

	const charCount = prompt.length;
	const tokenCount = Math.ceil(charCount / 4);

	const getHintLabel = () => {
		if (noHintsLeft) return "No hints left";
		if (!canAffordHint) return `Need ${HINT_XP_COST} XP`;
		if (hintCooldown > 0) return `${hintCooldown}s`;
		if (isLoadingHint) return "Loading…";
		return `Hint (${HINT_XP_COST} XP • ${hintsRemaining}/${maxHints})`;
	};

	const renderHeader = () => (
		<SafeAreaView edges={["top"]} className="bg-background">
			<View className="flex-row items-center px-4 py-3">
				<TouchableOpacity
					onPress={goBack}
					accessibilityRole="button"
					accessibilityLabel="Go back"
					className="w-10 h-10 items-center justify-center rounded-full"
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				>
					<Ionicons name="arrow-back" size={24} color="#3C3C3C" />
				</TouchableOpacity>
				<Text
					className="flex-1 text-center text-onSurface text-lg font-black"
					numberOfLines={1}
				>
					{level?.title ?? "Image Challenge"}
				</Text>
				<View
					className="w-10 h-10 items-center justify-center rounded-full"
					accessibilityLabel="Settings"
				>
					<Ionicons name="settings-outline" size={22} color="#C7C7CC" />
				</View>
			</View>
		</SafeAreaView>
	);

	if (isLoading) {
		return (
			<View className="flex-1 bg-background">
				{renderHeader()}
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#FF9600" />
					<Text className="text-onSurface mt-4 font-black">
						Loading Challenge…
					</Text>
				</View>
			</View>
		);
	}

	if (error || !level) {
		return (
			<View className="flex-1 bg-background">
				{renderHeader()}
				<View className="flex-1 items-center justify-center px-6">
					<Ionicons name="alert-circle" size={56} color="#FF4B4B" />
					<Text className="text-onSurface text-lg font-black mt-4 text-center">
						{error ?? "Challenge not found"}
					</Text>
					<Button onPress={goBack} variant="primary" className="mt-6">
						Go Back
					</Button>
				</View>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			{renderHeader()}
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 60}
			>
				<ScrollView
					className="flex-1"
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="always"
					contentContainerStyle={{ paddingBottom: 48 }}
				>
					<View className="px-6 pt-2 pb-4">
						<Text className="text-onSurface text-base font-black leading-6 text-center">
							Re-create this image with the perfect prompt
						</Text>
					</View>

					<View className="px-6">
						<ImageComparisonRow
							targetSource={level.targetImageUrl}
							generatedUri={generatedPreview}
							phase={phase}
						/>
					</View>

					<View className="px-6 pt-6">
						<View className="flex-row justify-between items-center mb-3">
							<Text className="text-onSurfaceVariant text-[11px] font-black uppercase tracking-[2px]">
								Your Turn
							</Text>
							<TouchableOpacity
								onPress={handleGetHint}
								disabled={
									isLoadingHint ||
									hintCooldown > 0 ||
									noHintsLeft ||
									!canAffordHint
								}
								className={`flex-row items-center px-3 py-2 rounded-full ${
									noHintsLeft || !canAffordHint || hintCooldown > 0
										? "bg-surfaceVariant/50"
										: "bg-secondary/20"
								}`}
								accessibilityRole="button"
								accessibilityLabel="Get a hint"
							>
								{isLoadingHint ? (
									<ActivityIndicator size="small" color="#4151FF" />
								) : (
									<Text className="text-[11px] font-bold text-secondary">
										{getHintLabel()}
									</Text>
								)}
							</TouchableOpacity>
						</View>

						{hints.length > 0 ? (
							<TouchableOpacity
								onPress={() => setShowHints((v) => !v)}
								activeOpacity={0.9}
								className="mb-4"
							>
								<Card className="p-4 rounded-[24px] border border-secondary/30 bg-secondary/5">
									<View className="flex-row items-center justify-between">
										<Text className="text-secondary text-xs font-black uppercase tracking-widest">
											💡 Hints ({hints.length})
										</Text>
										<Text className="text-onSurfaceVariant text-xs">
											{showHints ? "▲ Hide" : "▼ Show"}
										</Text>
									</View>
									{showHints ? (
										<View className="mt-2">
											{hints.map((hint, index) => (
												<View key={index} className="flex-row mb-2">
													<Text className="text-secondary text-xs mr-2">
														{index + 1}.
													</Text>
													<Text className="text-onSurface text-sm flex-1">
														{hint}
													</Text>
												</View>
											))}
										</View>
									) : null}
								</Card>
							</TouchableOpacity>
						) : null}

						<Card className="p-5 rounded-[24px] border border-primary/20 bg-surfaceVariant/15 mb-4">
							{beginnerLocked && level.scaffoldTemplate ? (
								<BeginnerTemplatePromptInput
									template={level.scaffoldTemplate}
									onChangePrompt={handleBeginnerPromptChange}
									onAllSlotsFilledChange={setBeginnerSlotsFilled}
									onPromptFocus={handlePromptFocus}
									inputAccessoryViewID={
										Platform.OS === "ios" ? INPUT_ACCESSORY_ID : undefined
									}
									firstInputRef={promptInputRef}
									className="mb-3 min-h-[100px] content-start"
								/>
							) : (
								<Input
									ref={promptInputRef}
									value={prompt}
									onChangeText={handlePromptChange}
									onFocus={handlePromptFocus}
									placeholder="Describe the image you want to create…"
									multiline
									className="text-base text-onSurface min-h-[100px] bg-transparent border-0 p-0 mb-3"
									inputAccessoryViewID={
										Platform.OS === "ios" ? INPUT_ACCESSORY_ID : undefined
									}
									selection={promptSelection}
									onSelectionChange={(event) =>
										setPromptSelection(event.nativeEvent.selection)
									}
								/>
							)}

							<View className="flex-row items-center">
								<Badge
									label={`${charCount} chars`}
									variant="surface"
									className="bg-surfaceVariant mr-2 border-0 px-2.5"
								/>
								<Badge
									label={`${tokenCount} tokens`}
									variant="surface"
									className="bg-surfaceVariant border-0 px-2.5"
								/>
							</View>
						</Card>

						{/* The card carries the loading story; keep the button quiet
						    (no competing spinner) — just dimmed/disabled while busy. */}
						<Button
							onPress={handleGenerate}
							disabled={
								prompt.trim().length === 0 ||
								isGenerating ||
								(beginnerLocked && !beginnerSlotsFilled)
							}
							variant="primary"
							size="lg"
							fullWidth
							className="rounded-full py-5"
						>
							<View className="flex-row items-center">
								<Text className="text-onPrimary text-base font-bold mr-2">
									{isGenerating ? "Working…" : "Generate & Compare"}
								</Text>
								{isGenerating ? null : (
									<Ionicons name="sparkles" size={16} color="#FFFFFF" />
								)}
							</View>
						</Button>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>

			<PromptyScoringOverlay
				visible={isGenerating}
				messages={[
					"Painting your image…",
					"Mixing the colours…",
					"Checking your shapes…",
					"Scoring your prompt…",
					"Almost there…",
				]}
			/>
		</View>
	);
}
