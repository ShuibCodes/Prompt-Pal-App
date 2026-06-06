import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

interface AgentBriefPreviewProps {
	/** One punchy line in the form "Create an agent that ___." */
	agentBrief: string;
}

/**
 * Compact context card for the AI Agent challenge type. Shows ONE punchy line
 * ("Create an agent that ___") — no image, no template, no criteria (the rubric
 * is hidden), nothing that repeats the task. The robot chip + the "Create an
 * agent…" wording make it obvious at a glance the user is building an agent.
 */
export function AgentBriefPreview({ agentBrief }: AgentBriefPreviewProps) {
	const brief = agentBrief?.trim();
	if (!brief) return null;

	// Deliberately quiet: no card, no border, muted tone. This is read-only
	// context — it must visually recede so the interactive prompt card below it
	// is obviously where the action is.
	return (
		<Animated.View
			entering={FadeInDown.duration(400)}
			className="flex-row items-center px-1"
		>
			<View
				className="items-center justify-center rounded-full mr-2.5"
				style={{ width: 30, height: 30, backgroundColor: "#F0F0F0" }}
			>
				<Ionicons name="hardware-chip-outline" size={16} color="#9AA0A6" />
			</View>
			<Text
				className="flex-1 text-[15px] leading-[21px] font-semibold"
				style={{ color: "#8A8F98" }}
			>
				{brief}
			</Text>
		</Animated.View>
	);
}
