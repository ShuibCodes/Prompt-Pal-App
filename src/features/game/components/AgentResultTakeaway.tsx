/**
 * AgentResultTakeaway — the "result you're aiming for" teaching card shown in the
 * result sheet after an AI Agent challenge.
 *
 * Agent challenges have no rendered artifact — the client's ask is that the result is
 * "just text": the player's score, a sentence of feedback, and a line telling them
 * what a strong prompt should have covered. The per-criterion score bars and feedback
 * are rendered by the result sheet itself; this card supplies that closing takeaway,
 * sourced from the lesson's `lessonTakeaway` (the hidden grading rubric is never shown).
 *
 * Renders nothing when there's no takeaway, so the caller can mount it unconditionally.
 */
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AgentResultTakeawayProps {
	/** The lesson takeaway — what a strong agent prompt should cover. */
	takeaway?: string;
	/** Whether the player passed (tunes the framing slightly). */
	passed?: boolean;
}

export function AgentResultTakeaway({
	takeaway,
	passed = false,
}: AgentResultTakeawayProps) {
	const text = takeaway?.trim();
	if (!text) return null;

	return (
		<View
			className="mt-5 pt-5"
			style={{ borderTopWidth: 1, borderTopColor: "#F0F0F0" }}
		>
			<View className="flex-row items-center mb-1">
				<Ionicons name="sparkles" size={15} color="#FF9600" />
				<Text
					className="text-[15px] font-black ml-2"
					style={{ color: "#3C3C3C" }}
				>
					What a strong prompt covers
				</Text>
			</View>
			<Text className="text-[13px] leading-5 mb-3" style={{ color: "#777777" }}>
				{passed
					? "You nailed it — here's the standard to keep hitting."
					: "Here's the result you're aiming for next time."}
			</Text>

			<View
				className="rounded-2xl px-4 py-3.5"
				style={{
					backgroundColor: "#FFF9EE",
					borderWidth: 1,
					borderColor: "#FFE6BF",
				}}
			>
				<Text
					className="text-[14px] leading-6 font-semibold"
					style={{ color: "#3C3C3C" }}
				>
					{text}
				</Text>
			</View>
		</View>
	);
}
