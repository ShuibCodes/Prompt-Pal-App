import React, { useCallback, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api.js";
import { clearAuth } from "@/lib/convex-client";
import { logger } from "@/lib/logger";
import { useUserProgressStore } from "@/features/user/store";
import { useGameStore } from "@/features/game/store";
import { useSubscriptionStore } from "@/features/subscription/store";
import { useOnboardingStore } from "@/features/onboarding/store";
import { usePreOnboardingStore } from "@/features/pre-onboarding/store";

const CONFIRM_WORD = "DELETE";

/**
 * What gets permanently removed. Shown to the user so consent is informed
 * (App Store Guideline 5.1.1(v) — account deletion must be clear and complete).
 */
const DELETED_ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] =
	[
		{ icon: "person-outline", label: "Your profile, email, and login" },
		{ icon: "flash-outline", label: "All XP, levels, and daily streaks" },
		{ icon: "checkbox-outline", label: "Quest history and learning progress" },
		{ icon: "image-outline", label: "Generated images and prompt history" },
		{ icon: "trophy-outline", label: "Achievements and statistics" },
	];

/**
 * Reset every persisted local store so a future account on this device starts
 * from a clean slate. Best-effort: a failure here must never block deletion.
 */
function clearLocalState() {
	try {
		useUserProgressStore.getState().resetProgress();
		useGameStore.getState().resetProgress();
		useSubscriptionStore.getState().resetForSignedOut();
		useOnboardingStore.getState().resetOnboarding();
		usePreOnboardingStore.getState().resetPreOnboarding();
	} catch (error) {
		logger.warn("DeleteAccount", "Local store reset failed", { error });
	}
	clearAuth();
}

export default function DeleteAccountScreen() {
	const router = useRouter();
	const { user, isLoaded } = useUser();
	const { signOut } = useClerk();
	const deleteUserData = useMutation(api.mutations.deleteCurrentUserData);

	const [confirmText, setConfirmText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const confirmed = confirmText.trim().toUpperCase() === CONFIRM_WORD;
	const canDelete = confirmed && isLoaded && !isDeleting;

	const handleCancel = useCallback(() => {
		if (isDeleting) {
			return;
		}
		if (router.canGoBack()) {
			router.back();
		} else {
			router.replace("/(tabs)/profile");
		}
	}, [isDeleting, router]);

	const handleDelete = useCallback(async () => {
		if (isDeleting || !confirmed) {
			return;
		}
		setError(null);

		// Must have a fully-loaded Clerk user before we touch anything.
		if (!isLoaded || !user) {
			setError("We couldn't verify your account. Please try again in a moment.");
			return;
		}

		// Gate BEFORE deleting any data: if Clerk self-service deletion is
		// disabled we could wipe backend data we cannot fully delete, leaving an
		// orphaned account. Bail out cleanly instead.
		if (user.deleteSelfEnabled === false) {
			logger.error(
				"DeleteAccount",
				"Clerk self-service deletion is disabled (deleteSelfEnabled=false). Enable it in the Clerk dashboard.",
			);
			setError(
				"Account deletion is temporarily unavailable. Please contact support and we'll remove your account right away.",
			);
			return;
		}

		setIsDeleting(true);
		void Haptics.notificationAsync(
			Haptics.NotificationFeedbackType.Warning,
		).catch(() => {});

		// Track whether backend data was already wiped so we can give an accurate
		// message if the second step (identity deletion) fails. Re-running is safe:
		// deleteCurrentUserData deletes by index and is idempotent.
		let dataDeleted = false;

		try {
			// 1) Delete all backend data FIRST, while the Clerk JWT is still valid.
			//    Deleting the Clerk user first would invalidate the token and orphan
			//    this data permanently.
			await deleteUserData({});
			dataDeleted = true;

			// 2) Delete the Clerk identity itself (email, name, credentials). This is
			//    the actual account closure.
			await user.delete();

			// 3) Tear down all local + session state, then route to sign-in.
			clearLocalState();
			try {
				await signOut();
			} catch {
				// Session is typically already gone after user.delete(); ignore.
			}

			logger.info("DeleteAccount", "Account deleted successfully");
			router.replace("/(auth)/sign-in");
		} catch (err) {
			logger.error("DeleteAccount", err, {
				phase: dataDeleted ? "clerk_identity" : "convex_data",
			});
			setIsDeleting(false);
			setError(
				dataDeleted
					? "Your data was removed, but we couldn't fully close your account. Please tap delete again, or contact support if it keeps happening."
					: "We couldn't delete your account. Check your connection and try again.",
			);
		}
	}, [isDeleting, confirmed, isLoaded, user, deleteUserData, signOut, router]);

	return (
		<View style={styles.container}>
			<SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
				{/* Header */}
				<View style={styles.header}>
					<Pressable
						onPress={handleCancel}
						disabled={isDeleting}
						hitSlop={12}
						style={({ pressed }) => [
							styles.backButton,
							(pressed || isDeleting) && styles.dimmed,
						]}
						accessibilityRole="button"
						accessibilityLabel="Go back"
					>
						<Ionicons name="chevron-back" size={26} color="#3C3C3C" />
					</Pressable>
					<Text style={styles.headerTitle}>Delete Account</Text>
					<View style={styles.backButton} />
				</View>

				<KeyboardAvoidingView
					style={styles.flex}
					behavior={Platform.OS === "ios" ? "padding" : undefined}
				>
					<ScrollView
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<View style={styles.warningCircle}>
							<Ionicons name="trash-outline" size={40} color="#FF4B4B" />
						</View>

						<Text style={styles.title}>Delete your account?</Text>
						<Text style={styles.subtitle}>
							This permanently deletes your PromptPal account and everything
							tied to it. This{" "}
							<Text style={styles.subtitleStrong}>cannot be undone.</Text>
						</Text>

						<View style={styles.card}>
							{DELETED_ITEMS.map((item) => (
								<View key={item.label} style={styles.cardRow}>
									<View style={styles.cardIcon}>
										<Ionicons name={item.icon} size={18} color="#FF4B4B" />
									</View>
									<Text style={styles.cardLabel}>{item.label}</Text>
								</View>
							))}
						</View>

						<View style={styles.note}>
							<Ionicons
								name="information-circle-outline"
								size={18}
								color="#777777"
							/>
							<Text style={styles.noteText}>
								You can sign up again anytime, but your progress won't be
								recoverable.
							</Text>
						</View>

						<Text style={styles.confirmLabel}>
							Type <Text style={styles.confirmWord}>{CONFIRM_WORD}</Text> to
							confirm
						</Text>
						<TextInput
							value={confirmText}
							onChangeText={(text) => {
								setConfirmText(text);
								if (error) {
									setError(null);
								}
							}}
							editable={!isDeleting}
							placeholder={CONFIRM_WORD}
							placeholderTextColor="#BDBDBD"
							autoCapitalize="characters"
							autoCorrect={false}
							autoComplete="off"
							returnKeyType="done"
							style={[styles.input, confirmed && styles.inputConfirmed]}
							accessibilityLabel={`Type ${CONFIRM_WORD} to confirm account deletion`}
						/>

						{error ? <Text style={styles.errorText}>{error}</Text> : null}

						<Pressable
							onPress={handleDelete}
							disabled={!canDelete}
							style={({ pressed }) => [
								styles.deleteButton,
								!canDelete && styles.deleteButtonDisabled,
								pressed && canDelete && styles.deleteButtonPressed,
							]}
							accessibilityRole="button"
							accessibilityLabel="Permanently delete account"
							accessibilityState={{ disabled: !canDelete }}
						>
							<Text style={styles.deleteButtonText}>
								Permanently Delete Account
							</Text>
						</Pressable>

						<Pressable
							onPress={handleCancel}
							disabled={isDeleting}
							style={({ pressed }) => [
								styles.cancelButton,
								pressed && !isDeleting && styles.dimmed,
							]}
							accessibilityRole="button"
							accessibilityLabel="Cancel and keep my account"
						>
							<Text style={styles.cancelButtonText}>Cancel</Text>
						</Pressable>
					</ScrollView>
				</KeyboardAvoidingView>
			</SafeAreaView>

			{/* Blocking overlay during deletion */}
			{isDeleting ? (
				<View style={styles.overlay} pointerEvents="auto">
					<ActivityIndicator size="large" color="#FF4B4B" />
					<Text style={styles.overlayText}>Deleting your account…</Text>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	safe: {
		flex: 1,
	},
	flex: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	backButton: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "900",
		color: "#3C3C3C",
		fontFamily: "DIN Round Pro",
		textTransform: "uppercase",
	},
	dimmed: {
		opacity: 0.5,
	},
	scrollContent: {
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 40,
		alignItems: "center",
	},
	warningCircle: {
		width: 84,
		height: 84,
		borderRadius: 42,
		backgroundColor: "#FFE9E9",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "900",
		color: "#3C3C3C",
		fontFamily: "DIN Round Pro",
		textAlign: "center",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 15,
		lineHeight: 22,
		color: "#777777",
		textAlign: "center",
		marginBottom: 24,
	},
	subtitleStrong: {
		color: "#FF4B4B",
		fontWeight: "800",
	},
	card: {
		width: "100%",
		backgroundColor: "#F7F7F7",
		borderRadius: 20,
		borderWidth: 2,
		borderColor: "#F0F0F0",
		padding: 16,
		gap: 14,
		marginBottom: 20,
	},
	cardRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	cardIcon: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#FFE9E9",
		alignItems: "center",
		justifyContent: "center",
	},
	cardLabel: {
		flex: 1,
		fontSize: 14,
		color: "#3C3C3C",
		fontWeight: "600",
	},
	note: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
		width: "100%",
		marginBottom: 28,
		paddingHorizontal: 4,
	},
	noteText: {
		flex: 1,
		fontSize: 13,
		lineHeight: 19,
		color: "#777777",
	},
	confirmLabel: {
		alignSelf: "flex-start",
		fontSize: 14,
		color: "#3C3C3C",
		fontWeight: "700",
		marginBottom: 8,
	},
	confirmWord: {
		color: "#FF4B4B",
		fontWeight: "900",
	},
	input: {
		width: "100%",
		height: 54,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: "#E5E5E5",
		paddingHorizontal: 16,
		fontSize: 18,
		fontWeight: "800",
		color: "#3C3C3C",
		letterSpacing: 2,
		backgroundColor: "#FFFFFF",
	},
	inputConfirmed: {
		borderColor: "#FF4B4B",
	},
	errorText: {
		alignSelf: "flex-start",
		marginTop: 12,
		fontSize: 13,
		lineHeight: 19,
		color: "#FF4B4B",
		fontWeight: "600",
	},
	deleteButton: {
		width: "100%",
		height: 54,
		borderRadius: 16,
		backgroundColor: "#FF4B4B",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 24,
		borderBottomWidth: 4,
		borderBottomColor: "#D63333",
	},
	deleteButtonPressed: {
		backgroundColor: "#E63E3E",
		borderBottomWidth: 2,
	},
	deleteButtonDisabled: {
		backgroundColor: "#F0A9A9",
		borderBottomColor: "#E29B9B",
	},
	deleteButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "900",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	cancelButton: {
		width: "100%",
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 8,
	},
	cancelButtonText: {
		color: "#777777",
		fontSize: 15,
		fontWeight: "800",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(255,255,255,0.92)",
		alignItems: "center",
		justifyContent: "center",
		gap: 16,
	},
	overlayText: {
		fontSize: 15,
		fontWeight: "700",
		color: "#3C3C3C",
	},
});
