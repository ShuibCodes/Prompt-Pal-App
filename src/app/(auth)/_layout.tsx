import { Stack } from "expo-router";

/**
 * Inner auth layout that uses Clerk authentication.
 * Only rendered when Clerk is configured.
 */
function AuthRoutesLayoutInner() {
	// Always render the navigator so child routes (sign-in / sign-up) keep their
	// navigation context. Redirect-when-signed-in is handled inside each screen
	// (and by the root index), so we must NOT swap the <Stack> for a <Redirect>
	// or loading view here. Doing so unmounts the navigator mid-navigation and
	// throws "Couldn't find a navigation context" on pushed screens.
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "none",
			}}
		>
			<Stack.Screen name="sign-in" />
			<Stack.Screen name="sign-up" />
		</Stack>
	);
}

/**
 * Auth layout wrapper that only uses Clerk when configured.
 * When Clerk is not configured, allows access to auth routes (for development).
 */
export default function AuthRoutesLayout() {
	const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
	const isClerkConfigured =
		publishableKey && publishableKey !== "your_clerk_publishable_key_here";

	// If Clerk is not configured, allow access to auth routes without checking authentication
	if (!isClerkConfigured) {
		return (
			<Stack
				screenOptions={{
					headerShown: false,
					animation: "none",
				}}
			/>
		);
	}

	return <AuthRoutesLayoutInner />;
}
