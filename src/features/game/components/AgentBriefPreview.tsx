import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

interface AgentBriefPreviewProps {
	/** Plain-text description of what the agent does — the only visible context. */
	agentBrief: string;
	/** Optional one-line task framing shown above the brief. */
	instruction?: string;
	height?: number;
}

/**
 * Target/context card for the AI Agent challenge type. Shows ONLY the plain-text
 * `agentBrief` — no image, no template, no criteria (the rubric is hidden). Styled
 * to match the copywriting brief card so the agent type is visually consistent.
 */
export function AgentBriefPreview({
	agentBrief,
	instruction,
	height = 220,
}: AgentBriefPreviewProps) {
	const brief = agentBrief?.trim();
	if (!brief) return null;

	return (
		<View style={{ height, minHeight: Math.min(120, height) }}>
			<ScrollView
				className="flex-1 rounded-2xl bg-white border border-outline/10 p-4"
				showsVerticalScrollIndicator
				bounces={false}
			>
				<Animated.View entering={FadeInDown.duration(400)}>
					<View className="flex-row items-center mb-2">
						<Ionicons name="hardware-chip-outline" size={14} color="#58CC02" />
						<Text className="text-onSurfaceVariant text-[10px] font-black uppercase tracking-[2px] ml-1.5">
							What this agent does
						</Text>
					</View>
					<Text className="text-onSurface text-[16px] leading-[24px] font-semibold mb-4">
						{brief}
					</Text>
				</Animated.View>

				{instruction?.trim() ? (
					<Animated.View
						entering={FadeInDown.delay(120).duration(400)}
						className="pt-3 border-t border-outline/10"
					>
						<Text className="text-onSurfaceVariant text-[10px] font-black uppercase tracking-[2px] mb-2">
							Your task
						</Text>
						<Text className="text-onSurface text-[14px] leading-6">
							{instruction.trim()}
						</Text>
					</Animated.View>
				) : null}
			</ScrollView>
		</View>
	);
}
