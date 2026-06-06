import {
	View,
	Text,
	Image,
	Alert,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	InputAccessoryView,
	TextInput,
	useWindowDimensions,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Badge } from "@/components/ui";
import { processApiLevelsWithLocalAssets, getLocalImageForLevel } from "@/features/levels/data";
import { useGameStore, Level, ChallengeType, MAX_LIVES } from "@/features/game/store";
import { useUserProgressStore } from "@/features/user/store";
import { useConvexAI } from "@/hooks/useConvexAI";
import { convexHttpClient } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api.js";
import type { Id } from "../../../../convex/_generated/dataModel";
import { getAIErrorPresentation } from "@/lib/aiErrors";
import { logger } from "@/lib/logger";
import { NanoAssistant } from "@/lib/nanoAssistant";
import { useUser } from "@clerk/clerk-expo";
import { CodeExecutionView } from "@/features/game/components/CodeExecutionView";
import type { CodeExecutionResult } from "@/features/game/components/CodeExecutionView";
import { CopyAnalysisView } from "@/features/game/components/CopyAnalysisView";
import {
	PracticeStyleChallenge,
	type PracticeStyleSection,
} from "@/features/game/components/PracticeStyleChallenge";
import { HtmlPreview } from "@/features/game/components/HtmlPreview";
import { CopyTargetPreview } from "@/features/game/components/CopyTargetPreview";
import { AgentBriefPreview } from "@/features/game/components/AgentBriefPreview";
import { QuestPromptInputCard } from "@/features/game/components/QuestPromptInputCard";
import { ChallengeScoreBar } from "@/features/game/components/ChallengeScoreBar";
import { TargetExpandModal } from "@/features/game/components/TargetExpandModal";
import { TargetImageView } from "@/features/game/components/TargetImageView";
import {
	findFirstPlaceholderRange,
	HINT_XP_COST,
} from "@/features/game/components/PromptScaffold";
import type { CodeTestResult } from "@/lib/scoring/codeScoring";
import type { CopyScoringResult } from "@/lib/scoring/copyScoring";
import { buildQuestHelpContent } from "@/features/game/utils/questHelp";
import { getChecklistMatchResult } from "@/lib/scaffolding/checklistMatching";
import {
	getInitialPromptStateForLevel,
	getLevelChecklistItems,
	getOrdinalMatchedChecklistItemsForBeginnerTemplate,
	isBeginnerTemplateLocked,
} from "@/features/game/utils/scaffold";
import {
	getCodingLessonTargetHtml,
	getLessonTargetBrief,
	hasMeaningfulHtmlPreview,
} from "@/features/game/utils/lessonTarget";

function mapQuestLessonToLevel(lesson: any): Level {
	return {
		id: lesson.id,
		title: lesson.title,
		description:
			lesson.contentPayload?.description ??
			lesson.objective ??
			lesson.title,
		type: lesson.lessonType,
		difficulty: lesson.difficulty,
		passingScore: lesson.evaluationPayload?.passingScore ?? 70,
		unlocked: true,
		order: lesson.nodeOrder,
		points: lesson.rewardXp,
		// Image challenges render a bundled local target asset (a require() number).
		// The quest-product lesson has no targetImageUrl, so resolve the local asset
		// by id; scoring falls back to the whatUserSees rubric (no URL needed).
		targetImageUrl:
			lesson.lessonType === "image"
				? (lesson.targetPayload?.targetImageUrl ??
					getLocalImageForLevel(lesson.id))
				: lesson.targetPayload?.targetImageUrl,
		targetImageUrlForEvaluation:
			typeof lesson.targetPayload?.targetImageUrl === "string"
				? lesson.targetPayload.targetImageUrl
				: undefined,
		hiddenPromptKeywords: lesson.evaluationPayload?.hiddenPromptKeywords,
		style: lesson.targetPayload?.style,
		instruction: lesson.contentPayload?.instruction,
		whatUserSees: lesson.targetPayload?.whatUserSees,
		agentBrief: lesson.contentPayload?.agentBrief,
		requirementBrief: lesson.contentPayload?.requirementBrief,
		starterCode: lesson.scaffoldPayload?.starterCode,
		grading: lesson.evaluationPayload?.grading,
		failState: lesson.resultPayload?.failState,
		successState: lesson.resultPayload?.successState,
		lessonTakeaway: lesson.teachingPayload?.takeaway,
		starterContext: lesson.scaffoldPayload?.starterContext,
		briefTitle: lesson.contentPayload?.briefTitle,
		briefProduct: lesson.contentPayload?.briefProduct,
		briefTarget: lesson.contentPayload?.briefTarget,
		briefTone: lesson.contentPayload?.briefTone,
		briefGoal: lesson.contentPayload?.briefGoal,
		wordLimit: lesson.evaluationPayload?.wordLimit,
		requiredElements: lesson.targetPayload?.requiredElements,
		metrics: lesson.evaluationPayload?.metrics,
		// Image challenges are free-text ("just an image + recreate this"): no
		// scaffold template, checklist, or beginner slot-fill. Stripping these here
		// also stops the prompt box being pre-seeded with the template string.
		scaffoldType:
			lesson.lessonType === "image"
				? undefined
				: lesson.scaffoldPayload?.scaffoldType,
		scaffoldTemplate:
			lesson.lessonType === "image"
				? undefined
				: lesson.scaffoldPayload?.scaffoldTemplate,
		checklistItems:
			lesson.lessonType === "image"
				? undefined
				: lesson.scaffoldPayload?.checklistItems,
		promptChecklist:
			lesson.lessonType === "image"
				? undefined
				: lesson.scaffoldPayload?.promptChecklist,
		hints: lesson.contentPayload?.hints ?? [],
	};
}

type UserLevelAttempt = {
	id: string;
	attemptNumber: number;
	score: number;
	feedback: string[];
	keywordsMatched: string[];
	imageUrl?: string;
	code?: string;
	copy?: string;
	testResults?: any[];
	createdAt: number;
};

// Helper function to map level type to moduleId for navigation
const getModuleIdFromLevelType = (levelType: string): string => {
	switch (levelType) {
		case "image":
			return "image-generation";
		case "code":
			return "coding-logic";
		case "copywriting":
			return "copywriting";
		case "agent":
			return "agent";
		default:
			return "image-generation"; // fallback
	}
};

/**
 * Build the result-screen checklist feedback: each checklist item paired with the
 * judge's pass/fail for the criterion at the same index. The checklist is authored
 * to align 1:1 (in order) with grading.criteria, so a length match means we can
 * zip them honestly. If they don't align, we show nothing rather than guess.
 */
function buildResultChecklist(
	checklistItems: string[],
	testResults: Array<{ passed?: boolean }> | undefined,
): { label: string; passed: boolean }[] {
	if (
		!checklistItems.length ||
		!testResults ||
		testResults.length !== checklistItems.length
	) {
		return [];
	}
	return checklistItems.map((label, index) => ({
		label,
		passed: testResults[index]?.passed === true,
	}));
}

/** Format starterContext for display in copy brief (llm_judge lessons) */
function formatStarterContext(
	ctx: Record<string, unknown> | undefined,
): string {
	if (!ctx || typeof ctx !== "object") return "";
	return Object.entries(ctx)
		.map(([k, v]) => {
			const label = k
				.replace(/([A-Z])/g, " $1")
				.replace(/^./, (s) => s.toUpperCase())
				.trim();
			if (Array.isArray(v)) {
				return `${label}:\n${v.map((item) => (typeof item === "object" ? JSON.stringify(item, null, 2) : String(item))).join("\n")}`;
			}
			if (typeof v === "object" && v !== null) {
				return `${label}:\n${JSON.stringify(v, null, 2)}`;
			}
			return `${label}: ${String(v)}`;
		})
		.join("\n\n");
}

const normalizeCodeTestResults = (results?: any[]): CodeTestResult[] =>
	(results ?? []).map((result: any, index: number) => ({
		id: result.id || `test-${index + 1}`,
		name: result.name || `Hidden Test ${index + 1}`,
		passed: Boolean(result.passed),
		error: result.error,
		output: result.output,
		expectedOutput: result.expectedOutput,
		actualOutput: result.actualOutput,
		executionTime: result.executionTime || 0,
	}));

export default function QuestScreen() {
	const { id } = useLocalSearchParams(); // This is the Quest ID
	const router = useRouter();
	const goBackOrHome = () => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/(tabs)");
	};

	const { user } = useUser();
	const {
		generateText,
		generateImage,
		evaluateImage,
		evaluateCodeSubmission,
		evaluateCopySubmission,
		evaluateAgentSubmission,
	} = useConvexAI();
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedImage, setGeneratedImage] = useState<string | null>(null);
	const [generatedCode, setGeneratedCode] = useState<string | null>(null);
	const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
	const [codeExecutionResult, setCodeExecutionResult] =
		useState<CodeExecutionResult | null>(null);
	const [copyScoringResult, setCopyScoringResult] =
		useState<CopyScoringResult | null>(null);
	const [activeTab, setActiveTab] = useState<"target" | "attempt">("target");
	// Option B challenge sheet: which phase the sheet shows (prompt vs result),
	// whether it is expanded, the prompt-quality score (second result bar), and
	// whether the full-screen target preview is open.
	const [phase, setPhase] = useState<"prompt" | "result">("prompt");
	// Result sheet keeps the build preview + "how prompts compare" panel tucked
	// behind a tap so the verdict stays minimal (wizard-led) by default.
	// Current sheet snap: 0 = peek (target fully visible), 1 = mid (~40%), 2 = full.
	const [snapIndex, setSnapIndex] = useState(1);
	const [promptQuality, setPromptQuality] = useState<number | null>(null);
	const [targetExpanded, setTargetExpanded] = useState(false);
	const [showHelpModal, setShowHelpModal] = useState(false);
	const [lastScore, setLastScore] = useState<number | null>(null);
	const [feedback, setFeedback] = useState<string[]>([]);
	const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
	// Checklist as result-screen feedback: each item ticked/crossed by the judge's
	// matching criterion (built only when the checklist aligns 1:1 with criteria).
	const [resultChecklist, setResultChecklist] = useState<
		{ label: string; passed: boolean }[]
	>([]);
	const [attemptHistory, setAttemptHistory] = useState<UserLevelAttempt[]>([]);
	const [level, setLevel] = useState<Level | null>({
		id: "mock_level_1",
		title: "Master the Identity Prompt",
		description: "Learn how to craft a persona that guides the model's tone and behavior.",
		type: "code",
		difficulty: "beginner",
		passingScore: 70,
		unlocked: true,
		order: 1,
		points: 250,
		starterCode: "<html>\n  <body>\n    <h1 class=\"text-2xl font-bold\">Hello World</h1>\n  </body>\n</html>",
	});
	const [quest, setQuest] = useState<any>({
		id: "mock_quest_1",
		title: "Identity Master",
		xpReward: 250,
		completed: false
	});
	const [promptSelection, setPromptSelection] = useState<
		{ start: number; end?: number } | undefined
	>(undefined);
	const [beginnerSlotsFilled, setBeginnerSlotsFilled] = useState(true);
	const [beginnerSlotTextForChecklist, setBeginnerSlotTextForChecklist] =
		useState("");
	const [beginnerSlotValues, setBeginnerSlotValues] = useState<string[]>([]);

	const promptInputRef = useRef<TextInput>(null);
	const hasEditedPromptRef = useRef(false);
	const shouldJumpToTemplateRef = useRef(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { height: viewportHeight } = useWindowDimensions();
	const targetPreviewHeight = useMemo(
		() => Math.min(Math.max(Math.round(viewportHeight * 0.32), 220), 420),
		[viewportHeight],
	);
	const visibleHints = useMemo(() => level?.hints ?? [], [level?.hints]);
	const codeVisibleBrief = useMemo(
		() => [level?.moduleTitle, level?.description].filter(Boolean).join("\n\n"),
		[level?.description, level?.moduleTitle],
	);
	const copyVisibleBrief = useMemo(() => {
		const parts = [level?.description].filter((part): part is string =>
			Boolean(part),
		);
		if (level?.briefTitle) parts.unshift(level.briefTitle);
		const ctx = level?.starterContext as Record<string, unknown> | undefined;
		if (ctx && Object.keys(ctx).length > 0) {
			parts.push(formatStarterContext(ctx));
		}
		return parts.join("\n\n");
	}, [level?.briefTitle, level?.description, level?.starterContext]);
	const helpContent = useMemo(
		() => (level ? buildQuestHelpContent(level, visibleHints) : null),
		[level, visibleHints],
	);
	// Hint system state
	const [hints, setHints] = useState<string[]>([]);
	const [isLoadingHint, setIsLoadingHint] = useState(false);
	const [hintCooldown, setHintCooldown] = useState(0);
	const [showHints, setShowHints] = useState(false);
	const [moduleLevels, setModuleLevels] = useState<Level[]>([]);
	const inputAccessoryId = "promptInputAccessory";

	const {
		loseLife,
		regenerateLives,
		startLevel,
		completeLevel,
		syncToBackend,
		lives: livesAvailable,
	} = useGameStore();

	// Top up hearts based on elapsed time whenever the challenge screen opens, so
	// a player who ran out earlier comes back to regenerated hearts.
	useEffect(() => {
		regenerateLives();
	}, [regenerateLives]);
	const {
		updateStreak,
		addXP,
		spendXP,
		setCurrentQuest,
		xp,
		currentStreak,
		learningModules,
	} = useUserProgressStore();

	const checklistItems = useMemo(() => (level ? getLevelChecklistItems(level) : []), [level]);
	const beginnerLocked = useMemo(
		() => (level ? isBeginnerTemplateLocked(level) : false),
		[level],
	);
	const matchedChecklistItems = useMemo(() => {
		if (!level) return [];
		if (beginnerLocked && level.scaffoldTemplate) {
			const ordinalMatches = getOrdinalMatchedChecklistItemsForBeginnerTemplate(
				level.scaffoldTemplate,
				checklistItems,
				beginnerSlotValues,
			);
			if (ordinalMatches) return ordinalMatches;
		}
		const source = beginnerLocked ? beginnerSlotTextForChecklist : prompt;
		return source
			? getChecklistMatchResult(source, checklistItems).matchedItems
			: [];
	}, [
		beginnerLocked,
		beginnerSlotTextForChecklist,
		beginnerSlotValues,
		checklistItems,
		level,
		prompt,
	]);

	const noHintsLeft = useMemo(() => {
		if (!level || !level.id) return false;
		try {
			return NanoAssistant.getHintsRemaining(level.id, level.difficulty) === 0;
		} catch (e) {
			return false;
		}
	}, [level]);

	const canAffordHint = (xp || 0) >= HINT_XP_COST;
	const headerProgressPercent = useMemo(() => {
		if (!level) return 0;

		const moduleId = getModuleIdFromLevelType(level.type || "image");
		const moduleProgress = learningModules?.find((module) => module.id === moduleId)?.progress;
		if (typeof moduleProgress === "number") {
			return Math.max(0, Math.min(100, moduleProgress));
		}

		const levelOrder = level.order ?? 1;
		return Math.max(0, Math.min(100, levelOrder * 10));
	}, [learningModules, level]);

	// Helper to determine XP reward for a level

	useEffect(() => {
		const loadQuestAndLevel = async () => {
			setIsLoading(true);
			setError(null);

			try {
				let questRun = null;
				try {
					questRun = await convexHttpClient.query(
						api.questProduct.getQuestRun,
						{ runId: id as Id<"questRuns"> },
					);
				} catch {
					questRun = null;
				}

				if (questRun?.lesson) {
					const processedLevel = mapQuestLessonToLevel(questRun.lesson);
					setQuest({
						id: id as string,
						title: questRun.lesson.title,
						xpReward: questRun.run.rewardXp,
						completed: questRun.run.status === "completed",
						isQuestRun: true,
					});
					setLevel(processedLevel);
					startLevel(processedLevel.id);
					NanoAssistant.resetHintsForLevel(processedLevel.id);
					setHints([]);
					return;
				}

				// 1. Get Quest data from Convex
				const apiQuest = await convexHttpClient.query(
					api.queries.getDailyQuestById,
					{ id: id as string },
				);

				if (!apiQuest) {
					throw new Error("Quest not found");
				}
				setQuest(apiQuest);

				// 2. Get associated Level data
				const levelId = apiQuest.levelId;
				if (!levelId) {
					throw new Error("Quest has no associated level");
				}

				const apiLevel = await convexHttpClient.query(
					api.queries.getLevelById,
					{ id: levelId },
				);

				if (apiLevel) {
					const processedLevel = {
						...processApiLevelsWithLocalAssets([apiLevel as Level])[0],
						targetImageUrlForEvaluation:
							typeof apiLevel.targetImageUrl === "string"
								? apiLevel.targetImageUrl
								: undefined,
					};

					setLevel(processedLevel);
					startLevel(processedLevel.id);
					// Reset hints
					NanoAssistant.resetHintsForLevel(processedLevel.id);
					setHints([]);
				} else {
					throw new Error("Associated level not found");
				}
			} catch (error: any) {
				// TEMP DIAGNOSTIC (image-bug investigation): surface the real load
				// failure instead of silently swapping in the mock "Master the
				// Identity Prompt" code lesson. Revert this catch block to restore
				// the original demo fallback once we've identified the cause.
				const detail = error?.message ?? String(error);
				logger.warn("QuestScreen", "loadQuestAndLevel failed", {
					operation: "loadQuestAndLevel",
					id,
					detail,
				});
				console.error("[QuestScreen DIAGNOSTIC] load failed for id", id, error);
				setError(`[DEBUG] load failed for id=${id}: ${detail}`);
			} finally {
				setIsLoading(false);
			}
		};

		if (id) {
			loadQuestAndLevel();
		}
	}, [id, startLevel, user?.id]);

	useEffect(() => {
		const nextPrompt = getInitialPromptStateForLevel(level);
		setPrompt(nextPrompt);
		setBeginnerSlotTextForChecklist("");
		setBeginnerSlotValues([]);
		setPromptSelection(undefined);
		hasEditedPromptRef.current = false;
		setBeginnerSlotsFilled(!isBeginnerTemplateLocked(level));
		shouldJumpToTemplateRef.current = Boolean(
			level?.scaffoldType === "template" &&
				nextPrompt &&
				!isBeginnerTemplateLocked(level),
		);
	}, [
		level?.id,
		level?.scaffoldType,
		level?.scaffoldTemplate,
		level?.difficulty,
	]);

	// Hint cooldown timer
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
		if (!level || isBeginnerTemplateLocked(level)) {
			return;
		}
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
		requestAnimationFrame(() => {
			setPromptSelection(range);
		});
	}, [level, prompt]);

	const handleBeginnerSlotsFilledChange = useCallback((filled: boolean) => {
		setBeginnerSlotsFilled(filled);
	}, []);

	const handleBeginnerSlotValuesJoined = useCallback((joined: string) => {
		setBeginnerSlotTextForChecklist(joined);
	}, []);

	const handleBeginnerSlotValuesArray = useCallback((values: string[]) => {
		setBeginnerSlotValues(values);
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
				`You've used all ${NanoAssistant.getMaxHintsPerLevel(level.difficulty)} hints for this level.`,
			);
			return;
		}

		setIsLoadingHint(true);
		try {
			const moduleType = (level.type || "image") as ChallengeType;
			const hint = await NanoAssistant.getHint(
				prompt,
				moduleType,
				level as Parameters<typeof NanoAssistant.getHint>[2],
			);
			await spendXP(HINT_XP_COST);
			setHints((prev) => [...prev, hint]);
			setShowHints(true);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Could not get hint. Please try again.";
			Alert.alert("Hint Unavailable", errorMessage);
		} finally {
			setIsLoadingHint(false);
		}
	}, [
		canAffordHint,
		hintCooldown,
		isLoadingHint,
		level,
		noHintsLeft,
		prompt,
		spendXP,
	]);

	const openReferenceTab = useCallback(() => {
		if (!level) return;

		if (level.type === "image") {
			setActiveTab("target");
		}

		setShowHelpModal(false);
	}, [level]);

	if (isLoading) {
		return (
			<SafeAreaView className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator size="large" color="#FF6B00" />
				<Text className="text-onSurface mt-4 font-black">
					Loading Challenge…
				</Text>
			</SafeAreaView>
		);
	}

	if (!level) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center px-6">
					<Card className="w-full items-center p-8">
						<Text className="text-error text-xl font-bold mb-4">
							Level Not Found
						</Text>
						<Text className="text-onSurfaceVariant text-center mb-8">
							We couldn't find challenge "{id}". It may have been removed or
							moved.
						</Text>
						<Button onPress={goBackOrHome} variant="primary">
							Go Back
						</Button>
					</Card>
				</View>
			</SafeAreaView>
		);
	}

	const charCount = prompt.length;
	const tokenCount = Math.ceil(charCount / 4); // Rough estimation

	const handleGenerate = async () => {
		if (!prompt.trim()) {
			Alert.alert("Error", "Please enter a prompt");
			return;
		}
		if (quest?.completed) {
			return; // Already completed today's quest
		}

		setIsGenerating(true);
		setResultChecklist([]);
		try {
			if (level.type === "image") {
				const generateResult = await generateImage(prompt);
				const generatedImageUrl = generateResult.imageUrl;

				if (!generatedImageUrl) {
					throw new Error("Failed to generate image: no image URL returned");
				}

				setGeneratedImage(generatedImageUrl);
				setActiveTab("attempt");

				// Evaluation no longer depends on a fetchable target URL: the server
				// grades against the level's hidden rubric (whatUserSees + keywords) plus
				// the learner's generated image. A target image is only sent when a real
				// URL is available, so a missing/stale one never blocks scoring.
				const evaluationResult = await evaluateImage({
					taskId: level.id,
					userImageUrl: generatedImageUrl,
					expectedImageUrl: level.targetImageUrlForEvaluation || undefined,
					userPrompt: prompt,
				});

				const evaluation = evaluationResult.evaluation;
				const finalScore = evaluation.score;

				setLastScore(finalScore);
				setFeedback(evaluation.feedback || []);
				setMatchedKeywords(evaluation.keywordsMatched || []);
				setPromptQuality((evaluation as any).promptQualityScore ?? null);

				try {
					if (user?.id) {
						await convexHttpClient.mutation(
							api.mutations.saveUserLevelAttempt,
							{
								levelId: level.id,
								score: finalScore,
								feedback: evaluation.feedback || [],
								keywordsMatched: evaluation.keywordsMatched || [],
								imageUrl: generatedImageUrl,
							},
						);

						const attempts = await convexHttpClient.query(
							api.queries.getUserLevelAttempts,
							{
								levelId: level.id,
							},
						);
						setAttemptHistory(attempts || []);
					}
				} catch (saveError) {
					logger.warn("GameScreen", "Failed to save attempt", {
						error: saveError,
					});
				}

				if (finalScore >= level.passingScore) {
					let shouldAwardXp = true;
					if (user?.id && quest) {
						if ((quest as any).isQuestRun) {
							await convexHttpClient.mutation(api.questProduct.submitQuestAttempt, {
								runId: quest.id as Id<"questRuns">,
								submissionPayload: {
									prompt,
									imageUrl: generatedImageUrl,
									score: finalScore,
								},
							});
							const rewardResult = await convexHttpClient.mutation(
								api.questProduct.claimQuestRewards,
								{ runId: quest.id as Id<"questRuns"> },
							);
							if (rewardResult?.alreadyClaimed) shouldAwardXp = false;
						} else {
							const result = await convexHttpClient.mutation(
								api.mutations.completeDailyQuest,
								{
									questId: quest.id,
									score: finalScore,
								},
							);
							if (result?.alreadyCompleted) shouldAwardXp = false;
						}
					}
					if (user?.id) {
						const nextAttemptsCount = (attemptHistory?.length ?? 0) + 1;
						await convexHttpClient.mutation(api.mutations.updateLevelProgress, {
							appId: "prompt-pal",
							levelId: level.id,
							isCompleted: true,
							bestScore: finalScore,
							attempts: nextAttemptsCount,
							completedAt: Date.now(),
						});
					}
					await updateStreak();
					await completeLevel(level.id);
					syncToBackend().catch(() => {});
					if (shouldAwardXp) await addXP(quest?.xpReward || 50);
					setQuest((q: any) => (q ? { ...q, completed: true } : q));
					if (quest) setCurrentQuest({ ...quest, completed: true });
					setPhase("result");
					setSnapIndex(2);
					Keyboard.dismiss();
				} else {
					// A life is charged when the player chooses "Try again", not on the
					// failed attempt itself, so show the result either way.
					setPhase("result");
					setSnapIndex(2);
					Keyboard.dismiss();
				}
			} else if (level.type === "code") {
				setGeneratedCode(null);
				setCodeExecutionResult(null);

				// No code generation step: the prompt is judged directly against the
				// level's rubric (one fast AI call), then we go straight to the result.
				const evaluation = await evaluateCodeSubmission({
					levelId: level.id,
					userPrompt: prompt,
					visibleBrief: codeVisibleBrief,
					visibleHints,
				});

				const finalScore = evaluation.score;
				const userPassed = finalScore >= level.passingScore;

				setLastScore(finalScore);
				setFeedback(evaluation.feedback || []);
				setPromptQuality((evaluation as any).promptQualityScore ?? null);
				setResultChecklist(
					buildResultChecklist(checklistItems, evaluation.testResults),
				);
				const testResults = normalizeCodeTestResults(evaluation.testResults);
				setCodeExecutionResult({
					code: "",
					testResults,
					output: (evaluation.feedback || []).join("\n"),
					success: userPassed,
					error: evaluation.testResults?.find((r: any) => !r.passed)?.error,
					score: finalScore,
					passingScore: level.passingScore,
				});

				try {
					if (user?.id) {
						const passedTestNames = (evaluation.testResults || [])
							.filter((r: any) => r.passed && r.name)
							.map((r: any) => r.name)
							.filter((name: any): name is string => name !== undefined);

						const sanitizedTestResults = (evaluation.testResults || []).map(
							(r: any) => ({
								...r,
								id: r.id ?? undefined,
								name: r.name ?? undefined,
								error: r.error ?? undefined,
								output: r.output ?? undefined,
								expectedOutput: r.expectedOutput ?? undefined,
								actualOutput: r.actualOutput ?? undefined,
								executionTime: r.executionTime ?? undefined,
							}),
						);

						await convexHttpClient.mutation(
							api.mutations.saveUserLevelAttempt,
							{
								levelId: level.id,
								score: finalScore,
								feedback: (evaluation.feedback || []).map((f) =>
									f.slice(0, 200),
								),
								keywordsMatched:
									passedTestNames.length > 0 ? passedTestNames : [],
								// No code is generated anymore; the prompt itself is the
								// submission artifact (the mutation requires one of
								// imageUrl/code/copy).
								code: prompt,
								testResults: sanitizedTestResults,
							},
						);

						const attempts = await convexHttpClient.query(
							api.queries.getUserLevelAttempts,
							{
								levelId: level.id,
							},
						);
						setAttemptHistory(attempts || []);
					}
				} catch (saveError) {
					logger.warn("GameScreen", "Failed to save attempt", {
						error: saveError,
					});
				}

				if (userPassed) {
					let shouldAwardXp = true;
					if (user?.id && quest) {
						if ((quest as any).isQuestRun) {
							await convexHttpClient.mutation(api.questProduct.submitQuestAttempt, {
								runId: quest.id as Id<"questRuns">,
								submissionPayload: {
									prompt,
									score: finalScore,
								},
							});
							const rewardResult = await convexHttpClient.mutation(
								api.questProduct.claimQuestRewards,
								{ runId: quest.id as Id<"questRuns"> },
							);
							if (rewardResult?.alreadyClaimed) shouldAwardXp = false;
						} else {
							const result = await convexHttpClient.mutation(
								api.mutations.completeDailyQuest,
								{
									questId: quest.id,
									score: finalScore,
								},
							);
							if (result?.alreadyCompleted) shouldAwardXp = false;
						}
					}
					if (user?.id) {
						const nextAttemptsCount = (attemptHistory?.length ?? 0) + 1;
						await convexHttpClient.mutation(api.mutations.updateLevelProgress, {
							appId: "prompt-pal",
							levelId: level.id,
							isCompleted: true,
							bestScore: finalScore,
							attempts: nextAttemptsCount,
							completedAt: Date.now(),
						});
					}
					await updateStreak();
					await completeLevel(level.id);
					syncToBackend().catch(() => {});
					if (shouldAwardXp) await addXP(quest?.xpReward || 50);
					setQuest((q: any) => (q ? { ...q, completed: true } : q));
					if (quest) setCurrentQuest({ ...quest, completed: true });
					setPhase("result");
					setSnapIndex(2);
					Keyboard.dismiss();
				} else {
					// A life is charged when the player chooses "Try again", not on the
					// failed attempt itself, so show the result either way.
					setPhase("result");
					setSnapIndex(2);
					Keyboard.dismiss();
				}
			} else if (level.type === "copywriting") {
				const copyGenerationPrompt = [
					"You are a conversion-focused copywriter.",
					"",
					"VISIBLE BRIEF:",
					copyVisibleBrief ||
						level.description ||
						"Write the requested marketing asset.",
					"",
					visibleHints.length > 0
						? `VISIBLE GUIDANCE:\n- ${visibleHints.join("\n- ")}`
						: "",
					"",
					"Use the player prompt as the strategic direction for the final copy.",
					"Return only the final copy text, with no markdown or explanation.",
				].join("\n");

				const generateResult = await generateText(prompt, copyGenerationPrompt);
				const generatedCopyText = generateResult.result || "";

				if (!generatedCopyText) {
					throw new Error("Failed to generate copy: no copy returned");
				}

				setGeneratedCopy(generatedCopyText);

				const copyScoringResult = await evaluateCopySubmission({
					levelId: level.id,
					text: generatedCopyText,
					userPrompt: prompt,
					visibleBrief: copyVisibleBrief,
					visibleHints,
				});

				const finalScore = copyScoringResult.score;

				setLastScore(finalScore);
				setFeedback(copyScoringResult.feedback || []);
				setCopyScoringResult(copyScoringResult);
				setPromptQuality((copyScoringResult as any).promptQualityScore ?? null);

				try {
					if (user?.id) {
						const highMetrics = copyScoringResult.metrics
							.filter((m) => m.value >= 60 && m.label)
							.map((m) => m.label)
							.filter((label): label is string => label !== undefined);

						await convexHttpClient.mutation(
							api.mutations.saveUserLevelAttempt,
							{
								levelId: level.id,
								score: finalScore,
								feedback: copyScoringResult.feedback || [],
								keywordsMatched: highMetrics.length > 0 ? highMetrics : [],
								copy: generatedCopyText,
							},
						);

						const attempts = await convexHttpClient.query(
							api.queries.getUserLevelAttempts,
							{
								levelId: level.id,
							},
						);
						setAttemptHistory(attempts || []);
					}
				} catch (saveError) {
					logger.warn("GameScreen", "Failed to save attempt", {
						error: saveError,
					});
				}

				if (finalScore >= level.passingScore) {
					let shouldAwardXp = true;
					if (user?.id && quest) {
						if ((quest as any).isQuestRun) {
							await convexHttpClient.mutation(api.questProduct.submitQuestAttempt, {
								runId: quest.id as Id<"questRuns">,
								submissionPayload: {
									prompt,
									copy: generatedCopyText,
									score: finalScore,
								},
							});
							const rewardResult = await convexHttpClient.mutation(
								api.questProduct.claimQuestRewards,
								{ runId: quest.id as Id<"questRuns"> },
							);
							if (rewardResult?.alreadyClaimed) shouldAwardXp = false;
						} else {
							const result = await convexHttpClient.mutation(
								api.mutations.completeDailyQuest,
								{
									questId: quest.id,
									score: finalScore,
								},
							);
							if (result?.alreadyCompleted) shouldAwardXp = false;
						}
					}
					if (user?.id) {
						const nextAttemptsCount = (attemptHistory?.length ?? 0) + 1;
						await convexHttpClient.mutation(api.mutations.updateLevelProgress, {
							appId: "prompt-pal",
							levelId: level.id,
							isCompleted: true,
							bestScore: finalScore,
							attempts: nextAttemptsCount,
							completedAt: Date.now(),
						});
					}
					await updateStreak();
					await completeLevel(level.id);
					syncToBackend().catch(() => {});
					if (shouldAwardXp) await addXP(quest?.xpReward || 50);
					setQuest((q: any) => (q ? { ...q, completed: true } : q));
					if (quest) setCurrentQuest({ ...quest, completed: true });
					setPhase("result");
					setSnapIndex(2);
					Keyboard.dismiss();
				} else {
					// A life is charged when the player chooses "Try again", not on the
					// failed attempt itself, so show the result either way.
					setPhase("result");
					setSnapIndex(2);
					Keyboard.dismiss();
				}
			} else if (level.type === "agent") {
				// Agent challenges have NO generation step — the user's prompt is
				// judged directly against the hidden rubric (whatUserSees + criteria).
				const evaluation = await evaluateAgentSubmission({
					levelId: level.id,
					userPrompt: prompt,
					agentBrief: level.agentBrief,
					visibleHints,
				});

				const finalScore = evaluation.score;
				const userPassed = finalScore >= level.passingScore;

				setLastScore(finalScore);
				setFeedback(evaluation.feedback || []);
				setPromptQuality((evaluation as any).promptQualityScore ?? null);
				setResultChecklist(
					buildResultChecklist(checklistItems, evaluation.testResults),
				);
				// Show the result the instant the judge returns. Persisting the
				// attempt, progress, streak and XP all run in the background so the
				// player never waits on bookkeeping round-trips.
				setPhase("result");
				setSnapIndex(2);
				Keyboard.dismiss();

				void (async () => {
					try {
						if (user?.id) {
							await convexHttpClient.mutation(
								api.mutations.saveUserLevelAttempt,
								{
									levelId: level.id,
									score: finalScore,
									feedback: (evaluation.feedback || []).map((f) =>
										f.slice(0, 200),
									),
									keywordsMatched: [],
									// Agents generate no artifact; the prompt itself is the
									// submission (the mutation requires imageUrl/code/copy).
									code: prompt,
								},
							);
							const attempts = await convexHttpClient.query(
								api.queries.getUserLevelAttempts,
								{ levelId: level.id },
							);
							setAttemptHistory(attempts || []);
						}

						if (userPassed) {
							let shouldAwardXp = true;
							if (user?.id && quest) {
								if ((quest as any).isQuestRun) {
									await convexHttpClient.mutation(
										api.questProduct.submitQuestAttempt,
										{
											runId: quest.id as Id<"questRuns">,
											submissionPayload: { prompt, score: finalScore },
										},
									);
									const rewardResult = await convexHttpClient.mutation(
										api.questProduct.claimQuestRewards,
										{ runId: quest.id as Id<"questRuns"> },
									);
									if (rewardResult?.alreadyClaimed) shouldAwardXp = false;
								} else {
									const result = await convexHttpClient.mutation(
										api.mutations.completeDailyQuest,
										{ questId: quest.id, score: finalScore },
									);
									if (result?.alreadyCompleted) shouldAwardXp = false;
								}
							}
							if (user?.id) {
								const nextAttemptsCount = (attemptHistory?.length ?? 0) + 1;
								await convexHttpClient.mutation(
									api.mutations.updateLevelProgress,
									{
										appId: "prompt-pal",
										levelId: level.id,
										isCompleted: true,
										bestScore: finalScore,
										attempts: nextAttemptsCount,
										completedAt: Date.now(),
									},
								);
							}
							await updateStreak();
							await completeLevel(level.id);
							syncToBackend().catch(() => {});
							if (shouldAwardXp) await addXP(quest?.xpReward || 50);
							setQuest((q: any) => (q ? { ...q, completed: true } : q));
							if (quest) setCurrentQuest({ ...quest, completed: true });
						}
					} catch (bookkeepingError) {
						logger.warn("GameScreen", "Background save/progress failed", {
							error: bookkeepingError,
						});
					}
				})();
			}
		} catch (error: any) {
			const aiError = getAIErrorPresentation(error);

			if (aiError.isOperational) {
				logger.warn("GameScreen", aiError.message, {
					operation: "handleGenerate",
					code: aiError.code,
				});
			} else {
				logger.error("GameScreen", error, { operation: "handleGenerate" });
			}

			Alert.alert(aiError.title, aiError.message);
		} finally {
			setIsGenerating(false);
		}
	};

	// "Try again" — available on both pass and fail. Spends a heart, resets the
	// attempt (keeping the player's prompt so they can refine it), and returns the
	// sheet to its prompt phase.
	const handleTryAgain = async () => {
		// Regenerate first, then read the fresh count (the destructured value is a
		// stale snapshot within this handler).
		useGameStore.getState().regenerateLives();
		if (useGameStore.getState().lives <= 0) {
			Alert.alert(
				"Out of hearts",
				"You're out of hearts for now. They refill over time — head back to the path and come back soon.",
			);
			return;
		}
		await loseLife();
		setGeneratedImage(null);
		setGeneratedCode(null);
		setGeneratedCopy(null);
		setCodeExecutionResult(null);
		setCopyScoringResult(null);
		setLastScore(null);
		setPromptQuality(null);
		setFeedback([]);
		setMatchedKeywords([]);
		setActiveTab("target");
		setQuest((q: any) => (q ? { ...q, completed: false } : q));
		setResultChecklist([]);
		setPhase("prompt");
		setSnapIndex(1);
	};

	const handleNextLevel = () => {
		router.replace("/(tabs)/");
	};

	// Option B layout: target pinned to the top, draggable sheet holds the prompt
	// (and, after submit, the result) — the sheet just grows; nothing navigates away.
	const renderChallenge = () => {
		if (!level) return null;

		const passed = lastScore != null && lastScore >= (level.passingScore ?? 70);
		const rewardXp = quest?.xpReward || level.points || 50;
		const categoryLabel = (level.type || "code").toUpperCase();
		// Image challenges are deliberately minimal: just the target image and a
		// one-line "Recreate this" instruction — no brief, checklist, or scaffold.
		const isImage = level.type === "image";
		const levelNum = level.order || 1;
		const totalHearts = MAX_LIVES;

		const hintLabel = noHintsLeft
			? "No hints left"
			: !canAffordHint
				? `Need ${HINT_XP_COST} XP`
				: hintCooldown > 0
					? `${hintCooldown}s`
					: isLoadingHint
						? "Loading…"
						: `Hint · ${HINT_XP_COST} XP`;
		const hintDisabled =
			isLoadingHint || hintCooldown > 0 || noHintsLeft || !canAffordHint;
		const submitDisabled =
			isGenerating || !prompt.trim() || (beginnerLocked && !beginnerSlotsFilled);

		const promptFooter = (
			<View className="flex-row items-center justify-between">
				<View>
					<Text
						className="text-[10px] font-black uppercase tracking-widest mb-0.5"
						style={{ color: "#999999" }}
					>
						Reward
					</Text>
					<View className="flex-row items-center">
						<Text className="text-[18px] font-black" style={{ color: "#FF9600" }}>
							+{rewardXp} XP
						</Text>
						<Ionicons name="flash" size={16} color="#FF9600" style={{ marginLeft: 4 }} />
					</View>
				</View>
				<TouchableOpacity
					onPress={handleGenerate}
					disabled={submitDisabled}
					activeOpacity={0.85}
					accessibilityRole="button"
					className="flex-row items-center"
					style={{
						backgroundColor: submitDisabled ? "#AFAFAF" : "#58CC02",
						borderBottomWidth: 4,
						borderBottomColor: submitDisabled ? "#8E8E8E" : "#46A302",
						borderRadius: 16,
						paddingHorizontal: 24,
						paddingVertical: 13,
					}}
				>
					<Text className="text-white text-[15px] font-black uppercase tracking-widest mr-2">
						{isGenerating ? "Submitting…" : "Submit prompt"}
					</Text>
					{!isGenerating ? (
						<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
					) : null}
				</TouchableOpacity>
			</View>
		);

		const resultFooter = (
			<View className="flex-row items-center" style={{ gap: 12 }}>
				<TouchableOpacity
					onPress={passed ? handleTryAgain : handleNextLevel}
					activeOpacity={0.85}
					accessibilityRole="button"
					className="flex-1 items-center justify-center"
					style={{
						backgroundColor: "#FFFFFF",
						borderWidth: 2,
						borderColor: "#E5E5E5",
						borderBottomWidth: 4,
						borderBottomColor: "#E5E5E5",
						borderRadius: 16,
						paddingVertical: 12,
					}}
				>
					<Text
						numberOfLines={1}
						adjustsFontSizeToFit
						className="text-[14px] font-black uppercase tracking-wide"
						style={{ color: "#777777" }}
					>
						{passed ? "Try again" : "Back"}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={passed ? handleNextLevel : handleTryAgain}
					activeOpacity={0.85}
					accessibilityRole="button"
					className="flex-1 items-center justify-center"
					style={{
						backgroundColor: "#58CC02",
						borderBottomWidth: 4,
						borderBottomColor: "#46A302",
						borderRadius: 16,
						paddingVertical: 14,
					}}
				>
					<Text
						numberOfLines={1}
						adjustsFontSizeToFit
						className="text-white text-[14px] font-black uppercase tracking-wide"
					>
						{passed ? "Next level" : "Try again"}
					</Text>
				</TouchableOpacity>
			</View>
		);

		const promptBody = (
			<View>
				<View className="flex-row items-center justify-between mb-3">
					<Text
						className="text-[13px] font-black uppercase tracking-widest"
						style={{ color: "#8E8E93" }}
					>
						Your Prompt
					</Text>
					<TouchableOpacity
						onPress={handleGetHint}
						disabled={hintDisabled}
						activeOpacity={0.85}
						accessibilityRole="button"
						className="flex-row items-center px-3 py-1.5 rounded-full"
						style={{ backgroundColor: hintDisabled ? "#F2F2F2" : "#FFF4E5" }}
					>
						{isLoadingHint ? (
							<ActivityIndicator size="small" color="#FF9600" />
						) : (
							<Ionicons
								name="bulb"
								size={14}
								color={hintDisabled ? "#B0B0B0" : "#FF9600"}
								style={{ marginRight: 4 }}
							/>
						)}
						<Text
							className="text-[12px] font-black"
							style={{ color: hintDisabled ? "#B0B0B0" : "#FF9600" }}
						>
							{hintLabel}
						</Text>
					</TouchableOpacity>
				</View>

				<QuestPromptInputCard
					prompt={prompt}
					onChangePrompt={handlePromptChange}
					promptPlaceholder={
						isImage
							? "Describe the image so AI can recreate it…"
							: level.type === "agent"
								? "Write the prompt that instructs this agent…"
								: level.type === "copywriting"
									? "Describe the copy you want…"
									: "Describe what you want to build…"
					}
					scaffoldType={isImage ? undefined : level.scaffoldType}
					scaffoldTemplate={isImage ? undefined : level.scaffoldTemplate}
					beginnerTemplateLocked={isImage ? false : beginnerLocked}
					onBeginnerTemplateSlotsFilledChange={handleBeginnerSlotsFilledChange}
					onBeginnerSlotValuesJoinedChange={handleBeginnerSlotValuesJoined}
					onBeginnerSlotValuesArrayChange={handleBeginnerSlotValuesArray}
					checklistItems={isImage ? [] : checklistItems}
					matchedChecklistItems={isImage ? [] : matchedChecklistItems}
					inputRef={promptInputRef}
					onPromptFocus={handlePromptFocus}
					inputAccessoryViewID={Platform.OS === "ios" ? inputAccessoryId : undefined}
				/>

				{hints.length > 0 ? (
					<View
						className="mt-4 rounded-2xl p-4"
						style={{ backgroundColor: "#FFF9EE", borderWidth: 1, borderColor: "#FFE6BF" }}
					>
						<Text
							className="text-[10px] font-black uppercase tracking-widest mb-2"
							style={{ color: "#FF9600" }}
						>
							Hints
						</Text>
						{hints.map((hint, index) => (
							<View key={index} className="flex-row mb-1">
								<Text className="mr-2 text-[13px] font-black" style={{ color: "#FF9600" }}>
									{index + 1}.
								</Text>
								<Text className="flex-1 text-[14px] leading-5" style={{ color: "#3C3C3C" }}>
									{hint}
								</Text>
							</View>
						))}
					</View>
				) : null}
			</View>
		);

		const verdictTitle = passed ? "Nailed it!" : "Almost there!";

		const resultBody = (
			<View>
				<View className="items-center mb-5">
					<ExpoImage
						source={require("../../../../assets/OBJECTS.svg")}
						style={{ width: 260, height: 310 }}
						contentFit="contain"
					/>
					<Text className="text-[26px] font-black mt-2" style={{ color: "#3C3C3C" }}>
						{verdictTitle}
					</Text>
					{passed ? (
						<View
							className="flex-row items-center px-3 py-1 rounded-full mt-1.5"
							style={{ backgroundColor: "#FFF4E5" }}
						>
							<Ionicons name="flash" size={14} color="#FF9600" style={{ marginRight: 4 }} />
							<Text className="text-[14px] font-black" style={{ color: "#FF9600" }}>
								+{rewardXp} XP
							</Text>
						</View>
					) : (
						<View className="px-3 py-1 rounded-full mt-1.5" style={{ backgroundColor: "#FDECEC" }}>
							<Text
								className="text-[11px] font-black uppercase tracking-widest"
								style={{ color: "#E53935" }}
							>
								Not passed
							</Text>
						</View>
					)}
				</View>

				<ChallengeScoreBar label="Task match" value={lastScore ?? 0} color="#58CC02" />
				<ChallengeScoreBar
					label="Prompt quality"
					value={promptQuality ?? 0}
					color="#FF9600"
					delay={120}
				/>

				{/* Under the score bars: XP gained and current streak — the reward beat. */}
				<View className="flex-row mt-5" style={{ gap: 12 }}>
					<View
						className="flex-1 items-center rounded-2xl py-6"
						style={{ backgroundColor: "#FFF4E5" }}
					>
						<Text className="text-[34px] font-black" style={{ color: "#FF9600" }}>
							+{passed ? rewardXp : 0}
						</Text>
						<Text
							className="text-[12px] font-black uppercase tracking-widest mt-1"
							style={{ color: "#FF9600" }}
						>
							XP gained
						</Text>
					</View>
					<View
						className="flex-1 items-center rounded-2xl py-6"
						style={{ backgroundColor: "#FFF1F0" }}
					>
						<View className="flex-row items-center">
							<Ionicons name="flame" size={28} color="#FF4B4B" style={{ marginRight: 6 }} />
							<Text className="text-[34px] font-black" style={{ color: "#FF4B4B" }}>
								{currentStreak}
							</Text>
						</View>
						<Text
							className="text-[12px] font-black uppercase tracking-widest mt-1"
							style={{ color: "#FF4B4B" }}
						>
							Day streak
						</Text>
					</View>
				</View>

				{/* Checklist as feedback: what the prompt covered (✓) and missed (✗). */}
				{resultChecklist.length > 0 ? (
					<View
						className="mt-4 rounded-2xl p-4"
						style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EFEFEF" }}
					>
						<Text
							className="text-[10px] font-black uppercase tracking-[2px] mb-3"
							style={{ color: "#8E8E93" }}
						>
							What you covered
						</Text>
						{resultChecklist.map((item, index) => (
							<View key={index} className="flex-row items-center mb-2 last:mb-0">
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
					</View>
				) : null}

				{/* One inline takeaway line — the single most useful lesson, never gated. */}
				{level.lessonTakeaway ? (
					<View
						className="mt-4 rounded-2xl p-4"
						style={{ backgroundColor: "#F7F7F7", borderWidth: 1, borderColor: "#EFEFEF" }}
					>
						<Text className="text-[14px] leading-6" style={{ color: "#3C3C3C" }}>
							{level.lessonTakeaway}
						</Text>
					</View>
				) : null}
			</View>
		);

		return (
			<View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
				<SafeAreaView edges={["top"]} style={{ flex: 1 }}>
					<KeyboardAvoidingView
						style={{ flex: 1 }}
						behavior={Platform.OS === "ios" ? "padding" : undefined}
					>
						{/* Top nav: close, progress, hearts */}
						<View className="px-5 pt-1 pb-3 flex-row items-center">
							<TouchableOpacity
								onPress={goBackOrHome}
								className="mr-3"
								accessibilityRole="button"
								accessibilityLabel="Close challenge"
							>
								<Ionicons name="close" size={28} color="#3C3C3C" />
							</TouchableOpacity>
							<View
								className="flex-1 mr-3 overflow-hidden"
								style={{ height: 12, backgroundColor: "#F0F0F0", borderRadius: 6 }}
							>
								<View
									style={{
										height: "100%",
										width: `${headerProgressPercent}%`,
										backgroundColor: "#58CC02",
										borderRadius: 6,
									}}
								/>
							</View>
							<View className="flex-row">
								{[...Array(totalHearts)].map((_, index) => (
									<Ionicons
										key={index}
										name="heart"
										size={22}
										color={index < livesAvailable ? "#FF9600" : "#E5E5E5"}
										style={{ marginLeft: 3 }}
									/>
								))}
							</View>
						</View>

						{/* Single scrollable page: brief + prompt section stacked together
						    (no draggable sheet). Result uses the same full page. */}
						<ScrollView
							style={{ flex: 1 }}
							contentContainerStyle={{ paddingBottom: 24 }}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
							removeClippedSubviews={false}
						>
							{phase === "result" ? (
								<View className="px-5 pt-2">{resultBody}</View>
							) : (
								<>
									<View className="px-6 mb-2">
										<View
											className="self-start px-3 py-1.5 rounded-full mb-2"
											style={{ backgroundColor: "#E8F7DD" }}
										>
											<Text className="text-[11px] font-black tracking-widest" style={{ color: "#58CC02" }}>
												LEVEL {levelNum}  •  {categoryLabel}
											</Text>
										</View>
										<Text
											className="text-[22px] font-black leading-7"
											style={{ color: "#3C3C3C" }}
											numberOfLines={2}
										>
											{isImage ? "Recreate this image" : level.title}
										</Text>
									</View>

									{/* One context, said once. Agent shows a compact text brief.
									    Visual types (image, coding) show the rendered target in a
									    fixed box you can expand. */}
									<View className="px-5" style={{ marginTop: 6 }}>
										{level.type === "agent" ? (
											<View>{renderLessonTarget(false)}</View>
										) : (
											<>
												<View
													style={{
														height: targetPreviewHeight,
														borderRadius: 24,
														overflow: "hidden",
														backgroundColor: "#F7F7F7",
														borderWidth: 1,
														borderColor: "#EFEFEF",
													}}
												>
													<View style={{ flex: 1 }}>{renderLessonTarget(false)}</View>
												</View>
												<TouchableOpacity
													onPress={() => setTargetExpanded(true)}
													activeOpacity={0.85}
													accessibilityRole="button"
													accessibilityLabel="Expand target"
													className="absolute items-center justify-center"
													style={{
														right: 24,
														bottom: 14,
														width: 40,
														height: 40,
														borderRadius: 20,
														backgroundColor: "#FFFFFF",
														borderWidth: 1,
														borderColor: "#EFEFEF",
														shadowColor: "#000000",
														shadowOffset: { width: 0, height: 2 },
														shadowOpacity: 0.12,
														shadowRadius: 6,
														elevation: 4,
													}}
												>
													<Ionicons name="expand" size={18} color="#3C3C3C" />
												</TouchableOpacity>
											</>
										)}
									</View>

									{/* Prompt section directly below the brief — all on one page. */}
									<View className="px-5" style={{ marginTop: 18 }}>
										{promptBody}
									</View>
								</>
							)}
						</ScrollView>

						{/* Pinned action footer — submit / result actions, always visible. */}
						<View
							className="px-5 pt-3"
							style={{
								borderTopWidth: 1,
								borderTopColor: "#F0F0F0",
								paddingBottom: 12,
								backgroundColor: "#FFFFFF",
							}}
						>
							{phase === "result" ? resultFooter : promptFooter}
						</View>
					</KeyboardAvoidingView>
				</SafeAreaView>

				<TargetExpandModal
					visible={targetExpanded}
					onClose={() => setTargetExpanded(false)}
					title="Target"
				>
					{level.type === "image" && level.targetImageUrl ? (
						<TargetImageView
							source={
								typeof level.targetImageUrl === "number"
									? level.targetImageUrl
									: { uri: level.targetImageUrl as string }
							}
							className="flex-1 rounded-2xl"
						/>
					) : (
						<View style={{ flex: 1 }}>{renderLessonTarget()}</View>
					)}
				</TargetExpandModal>

				{Platform.OS === "ios" ? (
					<InputAccessoryView nativeID={inputAccessoryId}>
						<View
							className="px-4 py-2 flex-row justify-end"
							style={{ backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#F0F0F0" }}
						>
							<TouchableOpacity
								onPress={Keyboard.dismiss}
								className="px-4 py-2 rounded-full"
								style={{ backgroundColor: "#EAF8E1" }}
							>
								<Text
									className="text-[12px] font-black uppercase tracking-widest"
									style={{ color: "#58CC02" }}
								>
									Done
								</Text>
							</TouchableOpacity>
						</View>
					</InputAccessoryView>
				) : null}
			</View>
		);
	};

	const renderLessonTarget = (interactive = true) => {
		if (!level) return null;

		const starterCode = (level as { starterCode?: string }).starterCode;
		const codingTargetHtml = getCodingLessonTargetHtml(level);
		const targetBrief = getLessonTargetBrief(level);
		const criteria =
			(level as { grading?: { criteria?: { description: string }[] } }).grading
				?.criteria?.map((criterion) => criterion.description)
				.filter(Boolean) ?? [];

		if (level.type === "image" && level.targetImageUrl) {
			return (
				<Image
					source={
						typeof level.targetImageUrl === "number"
							? level.targetImageUrl
							: { uri: level.targetImageUrl as string }
					}
					className="w-full h-full rounded-2xl"
					resizeMode="cover"
				/>
			);
		}

		if (level.type === "agent") {
			// Agent: the ONLY visible context is one short brief (+ optional muted
			// "produces" line, plumbed via briefGoal). No image, no template, no
			// criteria (the rubric is hidden), nothing that repeats the task.
			return <AgentBriefPreview agentBrief={level.agentBrief ?? ""} />;
		}

		if (
			level.type === "copywriting" &&
			(targetBrief.primary || targetBrief.secondary || criteria.length > 0)
		) {
			return (
				<CopyTargetPreview
					instruction={[targetBrief.primary, targetBrief.secondary]
						.filter(Boolean)
						.join("\n\n")}
					criteria={criteria}
					context={formatStarterContext(
						level.starterContext as Record<string, unknown>,
					)}
				/>
			);
		}

		if (level.type === "code") {
			return (
				<HtmlPreview
					html={
						codingTargetHtml ??
						(hasMeaningfulHtmlPreview(starterCode) ? starterCode ?? "" : "")
					}
					height={targetPreviewHeight}
					animateIn={false}
					interactive={interactive}
				/>
			);
		}

		return (
			<ScrollView
				className="w-full"
				style={{ maxHeight: targetPreviewHeight }}
				showsVerticalScrollIndicator={false}
				bounces={false}
			>
				<View className="w-full rounded-2xl bg-white border border-outline/10 p-4">
					{targetBrief.primary ? (
						<View className="mb-4">
							<Text className="text-onSurfaceVariant text-[10px] font-black uppercase tracking-[2px] mb-2">
								What You See
							</Text>
							<Text className="text-onSurface text-[15px] leading-6 font-semibold">
								{targetBrief.primary}
							</Text>
						</View>
					) : null}

					{targetBrief.secondary ? (
						<View className="mb-4">
							<Text className="text-onSurfaceVariant text-[10px] font-black uppercase tracking-[2px] mb-2">
								Your Task
							</Text>
							<Text className="text-onSurface text-[14px] leading-6">
								{targetBrief.secondary}
							</Text>
						</View>
					) : null}

					{checklistItems.length > 0 ? (
						<View>
							<Text className="text-onSurfaceVariant text-[10px] font-black uppercase tracking-[2px] mb-2">
								Include
							</Text>
							{checklistItems.map((item) => (
								<View key={item} className="flex-row items-start mb-2">
									<Ionicons
										name="checkmark-circle-outline"
										size={15}
										color="#58CC02"
										style={{ marginRight: 8, marginTop: 2 }}
									/>
									<Text className="text-onSurface text-[13px] leading-5 flex-1">
										{item}
									</Text>
								</View>
							))}
						</View>
					) : null}
				</View>
			</ScrollView>
		);
	};

	// Final screen state routing
	if (isLoading) {
		return (
			<View className="flex-1 bg-white items-center justify-center">
				<ActivityIndicator size="large" color="#58CC02" />
			</View>
		);
	}

	if (error) {
		return (
			<SafeAreaView className="flex-1 bg-white px-6 items-center justify-center">
				<Ionicons name="alert-circle" size={64} color="#EF4444" />
				<Text className="text-xl font-bold mt-4">Failed to load quest</Text>
				<Text className="text-onSurfaceVariant text-center mt-2 mb-8">{error}</Text>
				<Button onPress={goBackOrHome}>Go Back</Button>
			</SafeAreaView>
		);
	}

	return renderChallenge();
}
