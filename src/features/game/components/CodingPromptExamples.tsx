/**
 * CodingPromptExamples — the "how prompts compare" teaching panel shown in the result
 * sheet after a coding challenge is submitted.
 *
 * The client's ask: for coding challenges, show the learner what a BAD vs. MEDIUM vs.
 * GOOD prompt would have produced, as rendered UI (not a generated image). This panel
 * presents the three tiers as a segmented control with a single rendered preview that
 * swaps on selection — so it teaches the gap between a vague prompt and a precise one
 * without mounting several WebViews at once (one live preview keeps it light and
 * jank-free on lower-end devices).
 *
 * Robustness notes:
 *  - Renders nothing when there are no examples (caller can mount it unconditionally).
 *  - `HtmlPreview` is non-interactive (can't steal focus / raise the keyboard) and
 *    `animateIn={false}` because a reanimated entrance inside a ScrollView can leave a
 *    WebView stuck invisible (documented in HtmlPreview).
 *  - The preview is keyed by tier so switching tiers cleanly remounts the WebView.
 */
import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { HtmlPreview } from "./HtmlPreview";
import type {
	CodingPromptExample,
	PromptTier,
} from "@/features/game/utils/codingPromptExamples";

interface TierMeta {
	label: string;
	color: string;
	bg: string;
	icon: keyof typeof Ionicons.glyphMap;
}

/** Palette drawn from the existing quest UI: red / warm orange / green. */
const TIER_META: Record<PromptTier, TierMeta> = {
	weak: { label: "Weak", color: "#E53935", bg: "#FDECEC", icon: "close-circle" },
	medium: { label: "Okay", color: "#FF9600", bg: "#FFF4E5", icon: "remove-circle" },
	strong: {
		label: "Great",
		color: "#58CC02",
		bg: "#E8F7DD",
		icon: "checkmark-circle",
	},
};

interface CodingPromptExamplesProps {
	examples: CodingPromptExample[];
	/** Preview height in px. */
	previewHeight?: number;
}

export function CodingPromptExamples({
	examples,
	previewHeight = 180,
}: CodingPromptExamplesProps) {
	const hasExamples = Array.isArray(examples) && examples.length > 0;

	// Default to the strongest authored tier so a glancing user sees the best-case
	// result (the one that matches the target) before stepping down to the weaker ones.
	const initialTier = useMemo<PromptTier>(() => {
		if (!hasExamples) return "strong";
		const tiers = examples.map((e) => e.tier);
		return tiers.includes("strong") ? "strong" : tiers[tiers.length - 1];
	}, [examples, hasExamples]);

	const [selectedTier, setSelectedTier] = useState<PromptTier>(initialTier);

	const active = useMemo(
		() =>
			examples.find((e) => e.tier === selectedTier) ??
			examples[examples.length - 1],
		[examples, selectedTier],
	);

	if (!hasExamples || !active) return null;

	const activeMeta = TIER_META[active.tier];

	return (
		<View
			className="mt-5 pt-5"
			style={{ borderTopWidth: 1, borderTopColor: "#F0F0F0" }}
		>
			{/* Header */}
			<View className="flex-row items-center mb-1">
				<Ionicons name="git-compare" size={16} color="#3C3C3C" />
				<Text
					className="text-[15px] font-black ml-2"
					style={{ color: "#3C3C3C" }}
				>
					How prompts compare
				</Text>
			</View>
			<Text className="text-[13px] leading-5 mb-3" style={{ color: "#777777" }}>
				Same challenge — see what a weak vs. a strong prompt actually builds.
			</Text>

			{/* Segmented tier control */}
			<View
				className="flex-row rounded-2xl p-1 mb-4"
				style={{ backgroundColor: "#F5F5F5" }}
			>
				{examples.map((example) => {
					const meta = TIER_META[example.tier];
					const isActive = example.tier === active.tier;
					return (
						<TouchableOpacity
							key={example.tier}
							onPress={() => setSelectedTier(example.tier)}
							activeOpacity={0.85}
							accessibilityRole="button"
							accessibilityState={{ selected: isActive }}
							accessibilityLabel={`${meta.label} prompt example`}
							className="flex-1 flex-row items-center justify-center rounded-xl py-2"
							style={{
								backgroundColor: isActive ? meta.color : "transparent",
							}}
						>
							<Ionicons
								name={meta.icon}
								size={14}
								color={isActive ? "#FFFFFF" : meta.color}
								style={{ marginRight: 5 }}
							/>
							<Text
								className="text-[13px] font-black"
								style={{ color: isActive ? "#FFFFFF" : "#8E8E93" }}
							>
								{meta.label}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>

			{/* The prompt for the selected tier */}
			<Text
				className="text-[10px] font-black uppercase tracking-widest mb-1.5"
				style={{ color: "#8E8E93" }}
			>
				The prompt
			</Text>
			<View
				className="rounded-xl px-3.5 py-3 mb-3"
				style={{
					backgroundColor: "#FAFAFA",
					borderLeftWidth: 3,
					borderLeftColor: activeMeta.color,
				}}
			>
				<Text
					className="text-[14px] leading-5 italic"
					style={{ color: "#3C3C3C" }}
				>
					“{active.prompt}”
				</Text>
			</View>

			{/* Flow hint */}
			<View className="items-center mb-2">
				<Ionicons name="arrow-down" size={16} color="#C4C4C4" />
			</View>

			{/* The rendered result for the selected tier */}
			<Text
				className="text-[10px] font-black uppercase tracking-widest mb-1.5"
				style={{ color: "#8E8E93" }}
			>
				What it builds
			</Text>
			<View
				className="rounded-2xl overflow-hidden mb-3"
				style={{ borderWidth: 1, borderColor: "#EFEFEF" }}
			>
				<HtmlPreview
					key={active.tier}
					html={active.html}
					height={previewHeight}
					autoHeight
					minHeight={120}
					maxHeight={440}
					animateIn={false}
					interactive={false}
				/>
			</View>

			{/* Why it turned out this way */}
			<View
				className="flex-row items-start rounded-xl px-3 py-2.5"
				style={{ backgroundColor: activeMeta.bg }}
			>
				<Ionicons
					name={activeMeta.icon}
					size={15}
					color={activeMeta.color}
					style={{ marginTop: 1, marginRight: 7 }}
				/>
				<Text
					className="flex-1 text-[13px] leading-5 font-semibold"
					style={{ color: "#3C3C3C" }}
				>
					{active.caption}
				</Text>
			</View>
		</View>
	);
}
