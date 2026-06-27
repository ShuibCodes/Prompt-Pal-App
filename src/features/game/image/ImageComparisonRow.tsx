/**
 * ImageComparisonRow — the side-by-side Target vs. Your image row for the image
 * compose screen. Left shows the target reference; the right card walks through
 * phases IN PLACE: "?" placeholder → "painting" spinner → the generated image
 * revealed with a "scoring" overlay. Revealing the image mid-flight (before the
 * score is ready) turns one long opaque spinner into a visible progress beat.
 */
import { ActivityIndicator, Image, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ImageComparisonPhase = "idle" | "painting" | "scoring";

export interface ImageComparisonRowProps {
	/** Target reference image: require() asset (number) or remote uri string. */
	targetSource: number | string | { uri: string } | undefined;
	/** Generated image uri (shown the moment it exists, even while scoring). */
	generatedUri?: string | null;
	/**
	 * Right-card phase:
	 *  - "idle": "?" placeholder (or the generated image if one is present)
	 *  - "painting": spinner + "Painting your image…"
	 *  - "scoring": generated image revealed with a "Scoring your shot…" overlay
	 */
	phase?: ImageComparisonPhase;
}

function toImageSource(
	source: number | string | { uri: string } | undefined,
): ImageSourcePropType | undefined {
	if (source === undefined) return undefined;
	if (typeof source === "number") return source;
	if (typeof source === "string") return { uri: source };
	return source;
}

function CardLabel({ text }: { text: string }) {
	return (
		<Text
			className="text-[10px] font-black uppercase tracking-[2px] mt-2 text-center"
			style={{ color: "#8E8E93" }}
		>
			{text}
		</Text>
	);
}

export function ImageComparisonRow({
	targetSource,
	generatedUri,
	phase = "idle",
}: ImageComparisonRowProps) {
	const resolvedTarget = toImageSource(targetSource);
	const busy = phase !== "idle";
	const showImage = Boolean(generatedUri) && phase !== "painting";

	return (
		<View className="flex-row" style={{ gap: 12 }}>
			{/* Target */}
			<View className="flex-1">
				<View
					className="aspect-square overflow-hidden"
					style={{
						borderRadius: 24,
						backgroundColor: "#F7F7F7",
						borderWidth: 1,
						borderColor: "#EFEFEF",
					}}
				>
					{resolvedTarget ? (
						<Image
							source={resolvedTarget}
							style={{ width: "100%", height: "100%" }}
							resizeMode="cover"
						/>
					) : (
						<View className="flex-1 items-center justify-center">
							<Ionicons name="image-outline" size={40} color="#C7C7CC" />
						</View>
					)}
				</View>
				<CardLabel text="Target" />
			</View>

			{/* Your image */}
			<View className="flex-1">
				<View
					className="aspect-square overflow-hidden items-center justify-center"
					style={{
						borderRadius: 24,
						backgroundColor: busy ? "#FFF7EE" : "#FAFAFA",
						borderWidth: 1,
						borderColor: busy ? "#FFD9A8" : "#EFEFEF",
						borderStyle: showImage || busy ? "solid" : "dashed",
					}}
				>
					{showImage ? (
						<Image
							source={{ uri: generatedUri as string }}
							style={{ width: "100%", height: "100%" }}
							resizeMode="cover"
						/>
					) : phase === "painting" ? (
						<View className="items-center justify-center px-3">
							<ActivityIndicator size="large" color="#FF9600" />
							<Text
								className="text-[11px] font-black uppercase tracking-[1px] mt-3 text-center"
								style={{ color: "#FF9600" }}
							>
								Painting your image…
							</Text>
						</View>
					) : (
						<Text style={{ fontSize: 56, fontWeight: "900", color: "#D1D1D6" }}>
							?
						</Text>
					)}

					{/* Scoring overlay sits on top of the revealed image. */}
					{phase === "scoring" && showImage ? (
						<View
							className="absolute inset-0 items-center justify-center"
							style={{ backgroundColor: "rgba(28,28,30,0.45)" }}
						>
							<ActivityIndicator size="large" color="#FFFFFF" />
							<Text
								className="text-[11px] font-black uppercase tracking-[1px] mt-3 text-center"
								style={{ color: "#FFFFFF" }}
							>
								Scoring your shot…
							</Text>
						</View>
					) : null}
				</View>
				<CardLabel text="Your image" />
			</View>
		</View>
	);
}
