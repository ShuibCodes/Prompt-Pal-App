import React, { useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Image,
	ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
	FadeIn,
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { BackArrowIcon, ProgressBarBackground } from "@/components/Icons";
import { A, MASCOTS, MascotName } from "./theme";

// ─── Screen base: F7F7F7 surface, safe-area, fade-in ───────────
export function ScreenBase({ children }: { children: React.ReactNode }) {
	return (
		<SafeAreaView style={baseStyles.safe} edges={["top", "bottom"]}>
			<Animated.View entering={FadeIn.duration(300)} style={baseStyles.fill}>
				{children}
			</Animated.View>
		</SafeAreaView>
	);
}

// ─── Header: back chevron + slim progress bar ──────────────────
export function Header({
	progress,
	onBack,
	showBack = true,
}: {
	progress: number;
	onBack?: () => void;
	showBack?: boolean;
}) {
	return (
		<View style={baseStyles.header}>
			{showBack ? (
				<TouchableOpacity
					style={baseStyles.backBtn}
					onPress={onBack}
					hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
					accessibilityRole="button"
					accessibilityLabel="Go back"
				>
					<BackArrowIcon />
				</TouchableOpacity>
			) : (
				<View style={baseStyles.backPlaceholder} />
			)}
			<View style={baseStyles.progressWrap}>
				<ProgressBarBackground progress={progress} />
			</View>
		</View>
	);
}

// ─── Bobbing mascot ────────────────────────────────────────────
export function Mascot({
	name,
	size = 96,
	celebrate = false,
}: {
	name: MascotName;
	size?: number;
	celebrate?: boolean;
}) {
	const t = useSharedValue(0);
	useEffect(() => {
		t.value = withRepeat(
			withSequence(
				withTiming(1, { duration: celebrate ? 900 : 1400 }),
				withTiming(0, { duration: celebrate ? 900 : 1400 }),
			),
			-1,
			true,
		);
	}, [t, celebrate]);
	const style = useAnimatedStyle(() => ({
		transform: [
			{ translateY: -(celebrate ? 10 : 7) * t.value },
			{ rotate: `${(celebrate ? -4 : 0) * t.value}deg` },
		],
	}));
	return (
		<Animated.View style={style}>
			<Image
				source={MASCOTS[name] as ImageSourcePropType}
				style={{ width: size, height: size }}
				resizeMode="contain"
			/>
		</Animated.View>
	);
}

// ─── Two-tone headline ─────────────────────────────────────────
export function Headline({
	lines,
	size = 30,
	align = "left",
}: {
	lines: { t: string; c?: string }[];
	size?: number;
	align?: "left" | "center";
}) {
	return (
		<Text style={[baseStyles.headline, { fontSize: size, lineHeight: size * 1.12, textAlign: align }]}>
			{lines.map((ln, i) => (
				<Text key={i} style={{ color: ln.c || A.ink }}>
					{ln.t}
					{i < lines.length - 1 ? "\n" : ""}
				</Text>
			))}
		</Text>
	);
}

// ─── Selectable option row (3D card) ───────────────────────────
export function OptionRow({
	icon,
	title,
	sub,
	selected,
	onPress,
}: {
	icon: React.ReactNode;
	title: string;
	sub?: string;
	selected: boolean;
	onPress: () => void;
}) {
	return (
		<TouchableOpacity
			style={[baseStyles.option, selected && baseStyles.optionSel]}
			onPress={onPress}
			activeOpacity={0.8}
		>
			<View style={[baseStyles.optionIcon, selected && baseStyles.optionIconSel]}>
				{icon}
			</View>
			<View style={baseStyles.optionText}>
				<Text style={[baseStyles.optionTitle, selected && baseStyles.optionTitleSel]}>
					{title}
				</Text>
				{sub ? <Text style={baseStyles.optionSub}>{sub}</Text> : null}
			</View>
			<Check on={selected} />
		</TouchableOpacity>
	);
}

export function Check({ on }: { on: boolean }) {
	return (
		<View style={[baseStyles.check, on && baseStyles.checkOn]}>
			{on ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}
		</View>
	);
}

// ─── 3D green CTA ──────────────────────────────────────────────
export function ContinueButton({
	label = "CONTINUE",
	onPress,
	disabled = false,
}: {
	label?: string;
	onPress: () => void;
	disabled?: boolean;
}) {
	return (
		<TouchableOpacity
			style={[baseStyles.cta, disabled && baseStyles.ctaDisabled]}
			disabled={disabled}
			onPress={onPress}
			activeOpacity={0.85}
		>
			<Text style={[baseStyles.ctaText, disabled && baseStyles.ctaTextDisabled]}>
				{label}
			</Text>
		</TouchableOpacity>
	);
}

// ─── Footer wrapper (pins CTA to bottom) ───────────────────────
export function Footer({ children }: { children: React.ReactNode }) {
	return <View style={baseStyles.footer}>{children}</View>;
}

const baseStyles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: A.bg },
	fill: { flex: 1 },
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
		marginTop: 10,
		marginBottom: 22,
	},
	backBtn: { marginRight: 18 },
	backPlaceholder: { width: 24, marginRight: 18 },
	progressWrap: { flex: 1, height: 19, justifyContent: "center" },
	headline: {
		fontWeight: "800",
		color: A.ink,
		letterSpacing: -0.3,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: A.white,
		borderRadius: 16,
		borderWidth: 2,
		borderBottomWidth: 4,
		borderColor: A.border,
		minHeight: 66,
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginBottom: 11,
	},
	optionSel: { borderColor: A.green, backgroundColor: A.greenTint },
	optionIcon: {
		width: 46,
		height: 46,
		borderRadius: 12,
		backgroundColor: A.surf,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 14,
	},
	optionIconSel: { backgroundColor: A.white },
	optionText: { flex: 1 },
	optionTitle: { fontSize: 17, fontWeight: "800", color: A.ink },
	optionTitleSel: { color: A.greenDark },
	optionSub: { fontSize: 13, fontWeight: "700", color: A.muted, marginTop: 2 },
	check: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: A.border,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 8,
	},
	checkOn: { borderWidth: 0, backgroundColor: A.green },
	footer: { marginTop: "auto", paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12 },
	cta: {
		backgroundColor: A.green,
		height: 54,
		borderRadius: 16,
		borderBottomWidth: 5,
		borderBottomColor: A.greenDark,
		alignItems: "center",
		justifyContent: "center",
	},
	ctaDisabled: { backgroundColor: "#E5E5E5", borderBottomColor: "#D3D3D3" },
	ctaText: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 1 },
	ctaTextDisabled: { color: "#A0A0A0" },
});
