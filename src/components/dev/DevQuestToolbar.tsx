import React from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

type DevQuestToolbarProps = {
	onPreviewResult: () => void;
	onSkipAndAdvance?: () => void;
	onExitOnly?: () => void;
	isBusy?: boolean;
	showSkip?: boolean;
};

export function DevQuestToolbar({
	onPreviewResult,
	onSkipAndAdvance,
	onExitOnly,
	isBusy = false,
	showSkip = true,
}: DevQuestToolbarProps) {
	return (
		<View style={styles.container}>
			<Text style={styles.label}>DEV</Text>
			<View style={styles.actions}>
				<Pressable
					onPress={onPreviewResult}
					disabled={isBusy}
					style={({ pressed }) => [
						styles.button,
						styles.secondaryButton,
						(pressed || isBusy) && styles.pressed,
					]}
				>
					<Text
						style={styles.secondaryButtonText}
						numberOfLines={1}
						adjustsFontSizeToFit
					>
						Preview
					</Text>
				</Pressable>
				{showSkip && onSkipAndAdvance ? (
					<Pressable
						onPress={onSkipAndAdvance}
						disabled={isBusy}
						style={({ pressed }) => [
							styles.button,
							styles.primaryButton,
							(pressed || isBusy) && styles.pressed,
						]}
					>
						{isBusy ? (
							<ActivityIndicator color="#FFFFFF" size="small" />
						) : (
							<Text
								style={styles.primaryButtonText}
								numberOfLines={1}
								adjustsFontSizeToFit
							>
								Skip & next
							</Text>
						)}
					</Pressable>
				) : null}
				{onExitOnly ? (
					<Pressable
						onPress={onExitOnly}
						disabled={isBusy}
						style={({ pressed }) => [
							styles.button,
							styles.secondaryButton,
							(pressed || isBusy) && styles.pressed,
						]}
					>
						<Text
							style={styles.secondaryButtonText}
							numberOfLines={1}
							adjustsFontSizeToFit
						>
							Exit
						</Text>
					</Pressable>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingHorizontal: 16,
		paddingVertical: 8,
		backgroundColor: "#FFF9EE",
		borderBottomWidth: 1,
		borderBottomColor: "#FFE6BF",
	},
	label: {
		fontSize: 10,
		fontWeight: "900",
		color: "#FF9600",
		letterSpacing: 1,
	},
	actions: {
		flex: 1,
		flexDirection: "row",
		gap: 8,
	},
	button: {
		flex: 1,
		minWidth: 0,
		borderRadius: 10,
		paddingHorizontal: 8,
		paddingVertical: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	primaryButton: {
		backgroundColor: "#58CC02",
		borderWidth: 2,
		borderColor: "#46A302",
	},
	secondaryButton: {
		backgroundColor: "#FFFFFF",
		borderWidth: 2,
		borderColor: "#FFD08A",
	},
	primaryButtonText: {
		color: "#FFFFFF",
		fontSize: 13,
		fontWeight: "900",
	},
	secondaryButtonText: {
		color: "#FF9600",
		fontSize: 13,
		fontWeight: "900",
	},
	pressed: {
		opacity: 0.75,
	},
});
