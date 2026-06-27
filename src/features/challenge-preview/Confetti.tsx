/**
 * Confetti — a lightweight, dependency-free celebratory burst.
 *
 * Spawns N small pieces that fly up-and-out, drift, spin, and fade. Driven by a
 * single shared `progress` value (0→1) with per-piece constants, so it stays
 * cheap. Plays once when mounted; remount (e.g. via a changing `key`) to replay.
 */
import { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

const COLORS = ["#5CD615", "#FF9600", "#4151FF", "#FFB800", "#9B5DE5", "#FF4B4B"];

interface Piece {
	left: number;
	size: number;
	color: string;
	driftX: number;
	rise: number;
	fall: number;
	rotations: number;
	delay: number;
	duration: number;
	radius: number;
}

function buildPieces(count: number, width: number, height: number): Piece[] {
	return Array.from({ length: count }, () => {
		const size = 7 + Math.random() * 9;
		return {
			left: Math.random() * width,
			size,
			color: COLORS[Math.floor(Math.random() * COLORS.length)],
			driftX: (Math.random() - 0.5) * width * 0.6,
			rise: 40 + Math.random() * 120,
			fall: height * (0.55 + Math.random() * 0.4),
			rotations: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 3),
			delay: Math.random() * 180,
			duration: 1100 + Math.random() * 900,
			radius: Math.random() < 0.5 ? size / 2 : 2,
		};
	});
}

function ConfettiPiece({
	piece,
	progress,
}: {
	piece: Piece;
	progress: Animated.SharedValue<number>;
}) {
	const style = useAnimatedStyle(() => {
		const p = progress.value;
		// Up first, then fall under "gravity" (quadratic).
		const translateY = -piece.rise * Math.sin(Math.min(p, 0.5) * Math.PI) + piece.fall * p * p;
		const translateX = piece.driftX * p;
		const rotate = `${piece.rotations * 360 * p}deg`;
		const opacity = p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15;
		return {
			opacity,
			transform: [{ translateX }, { translateY }, { rotate }],
		};
	});

	return (
		<Animated.View
			pointerEvents="none"
			style={[
				{
					position: "absolute",
					top: 0,
					left: piece.left,
					width: piece.size,
					height: piece.size,
					borderRadius: piece.radius,
					backgroundColor: piece.color,
				},
				style,
			]}
		/>
	);
}

export interface ConfettiProps {
	/** Number of pieces. Defaults to 80. */
	count?: number;
}

export function Confetti({ count = 80 }: ConfettiProps) {
	const { width, height } = useWindowDimensions();
	const progress = useSharedValue(0);
	const pieces = useMemo(
		() => buildPieces(count, width, height),
		[count, width, height],
	);

	useEffect(() => {
		progress.value = 0;
		progress.value = withTiming(1, {
			duration: 1900,
			easing: Easing.out(Easing.quad),
		});
	}, [progress]);

	return (
		<View pointerEvents="none" style={StyleSheet.absoluteFill}>
			{pieces.map((piece, index) => (
				<ConfettiPiece key={index} piece={piece} progress={progress} />
			))}
		</View>
	);
}
