/**
 * ChallengeResultPreview — a standalone COPY of the result phase from
 * `src/app/game/quest/[id].tsx` (the inline `resultBody` + `resultFooter`).
 *
 * This is a UI sandbox: all live state/handlers are replaced by mock props so
 * the "got it right" and "got it wrong" verdicts can be iterated in isolation.
 * Nothing here touches Convex, AI, XP, hearts, or progress. Once the UI is
 * approved, port the JSX back into the live quest screen.
 *
 * Aesthetic goals (match Direction A onboarding + dopamine):
 *  - Animated Prompty mascot (happy / sad) instead of the static illustration
 *  - Confetti burst on a pass
 *  - Haptic feedback on mount + every button press
 *  - 3D "press-down" animated buttons
 */
import { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ChallengeScoreBar } from "@/features/game/components/ChallengeScoreBar";
import { PromptyMascot } from "./PromptyMascot";
import { GameButton } from "./GameButton";
import { Confetti } from "./Confetti";
import {
	PASSING_SCORE,
	type ChallengeResultPreviewData,
} from "./mockData";

const TOTAL_HEARTS = 5;
const LIVES_AVAILABLE = 4;
const HEADER_PROGRESS_PERCENT = 40;

export interface ChallengeResultPreviewProps {
	data: ChallengeResultPreviewData;
	/** Primary action (pass → "Next level", fail → "Try again"). */
	onPrimary?: () => void;
	/** Secondary action (pass → "Try again", fail → "Back"). */
	onSecondary?: () => void;
	/** Top-left close. */
	onClose?: () => void;
}

export function ChallengeResultPreview({
	data,
	onPrimary,
	onSecondary,
	onClose,
}: ChallengeResultPreviewProps) {
	const { mood, score, promptQuality, rewardXp, streak, checklist } = data;
	const passed = score >= PASSING_SCORE;
	const verdictTitle = passed ? "Nailed it!" : "Almost there!";

	// Dopamine beat on arrival: success buzz + confetti on a pass, a softer
	// warning buzz on a miss.
	useEffect(() => {
		void Haptics.notificationAsync(
			passed
				? Haptics.NotificationFeedbackType.Success
				: Haptics.NotificationFeedbackType.Warning,
		);
	}, [passed]);

	const resultBody = (
		<View>
			<View className="items-center mb-5">
				{/* Prompty — 50% bigger than the old 96px onboarding mascot (~150),
				    bumped again here for the hero moment. */}
				<PromptyMascot mood={mood} size={210} celebrate={passed} />
				<Animated.Text
					entering={FadeInDown.delay(120).springify()}
					className="text-[26px] font-black mt-2"
					style={{ color: "#3C3C3C" }}
				>
					{verdictTitle}
				</Animated.Text>
				{passed ? (
					<Animated.View
						entering={FadeInDown.delay(200).springify()}
						className="flex-row items-center px-3 py-1 rounded-full mt-1.5"
						style={{ backgroundColor: "#FFF4E5" }}
					>
						<Ionicons name="flash" size={14} color="#FF9600" style={{ marginRight: 4 }} />
						<Text className="text-[14px] font-black" style={{ color: "#FF9600" }}>
							+{rewardXp} XP
						</Text>
					</Animated.View>
				) : (
					<Animated.View
						entering={FadeInDown.delay(200).springify()}
						className="px-3 py-1 rounded-full mt-1.5"
						style={{ backgroundColor: "#FDECEC" }}
					>
						<Text
							className="text-[11px] font-black uppercase tracking-widest"
							style={{ color: "#E53935" }}
						>
							Not passed
						</Text>
					</Animated.View>
				)}
			</View>

			<ChallengeScoreBar label="Task match" value={score} color="#58CC02" />
			<ChallengeScoreBar
				label="Prompt quality"
				value={promptQuality}
				color="#FF9600"
				delay={120}
			/>

			{/* Under the score bars: XP gained and current streak — the reward beat. */}
			<Animated.View
				entering={FadeInDown.delay(260).springify()}
				className="flex-row mt-5"
				style={{ gap: 12 }}
			>
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
							{streak}
						</Text>
					</View>
					<Text
						className="text-[12px] font-black uppercase tracking-widest mt-1"
						style={{ color: "#FF4B4B" }}
					>
						Day streak
					</Text>
				</View>
			</Animated.View>

			{/* Checklist as feedback: what the prompt covered (✓) and missed (✗). */}
			{checklist.length > 0 ? (
				<Animated.View
					entering={FadeInDown.delay(320).springify()}
					className="mt-4 rounded-2xl p-4"
					style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EFEFEF" }}
				>
					<Text
						className="text-[10px] font-black uppercase tracking-[2px] mb-3"
						style={{ color: "#8E8E93" }}
					>
						What you covered
					</Text>
					{checklist.map((item, index) => (
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
				</Animated.View>
			) : null}
		</View>
	);

	const resultFooter = (
		<View className="flex-row items-center" style={{ gap: 12 }}>
			<GameButton
				label={passed ? "Try again" : "Back"}
				variant="secondary"
				onPress={onSecondary}
				style={{ flex: 1 }}
			/>
			<GameButton
				label={passed ? "Next level" : "Try again"}
				variant="primary"
				onPress={onPrimary}
				style={{ flex: 1 }}
			/>
		</View>
	);

	return (
		<View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
			<SafeAreaView edges={["top"]} style={{ flex: 1 }}>
				{/* Top nav: close, progress, hearts */}
				<View className="px-5 pt-1 pb-3 flex-row items-center">
					<GameNavClose onClose={onClose} />
					<View
						className="flex-1 mr-3 overflow-hidden"
						style={{ height: 12, backgroundColor: "#F0F0F0", borderRadius: 6 }}
					>
						<View
							style={{
								height: "100%",
								width: `${HEADER_PROGRESS_PERCENT}%`,
								backgroundColor: "#58CC02",
								borderRadius: 6,
							}}
						/>
					</View>
					<View className="flex-row">
						{[...Array(TOTAL_HEARTS)].map((_, index) => (
							<Ionicons
								key={index}
								name="heart"
								size={22}
								color={index < LIVES_AVAILABLE ? "#FF9600" : "#E5E5E5"}
								style={{ marginLeft: 3 }}
							/>
						))}
					</View>
				</View>

				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ paddingBottom: 24 }}
					showsVerticalScrollIndicator={false}
				>
					<View className="px-5 pt-2">{resultBody}</View>
				</ScrollView>

				{/* Pinned action footer — always visible. */}
				<View
					className="px-5 pt-3"
					style={{
						borderTopWidth: 1,
						borderTopColor: "#F0F0F0",
						paddingBottom: 12,
						backgroundColor: "#FFFFFF",
					}}
				>
					{resultFooter}
				</View>
			</SafeAreaView>

			{/* Confetti overlays everything on a pass. */}
			{passed ? <Confetti /> : null}
		</View>
	);
}

function GameNavClose({ onClose }: { onClose?: () => void }) {
	return (
		<Pressable
			onPress={() => {
				void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
				onClose?.();
			}}
			className="mr-3"
			accessibilityRole="button"
			accessibilityLabel="Close challenge"
			hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
		>
			<Ionicons name="close" size={28} color="#3C3C3C" />
		</Pressable>
	);
}
