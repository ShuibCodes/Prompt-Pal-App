import "./global.css";
import { LogBox } from "react-native";
import { BootModeScreen } from "../lib/BootModeScreen";

// Silence a single benign deprecation warning emitted by a third-party
// dependency (not our code) that still renders React Native's built-in
// SafeAreaView. Scoped to this exact message so nothing else is hidden.
// LogBox handles the on-device overlay; the console.warn filter clears it from
// the Metro terminal too, since LogBox doesn't touch terminal output.
const IGNORED_WARNINGS = ["SafeAreaView has been deprecated"];
LogBox.ignoreLogs(IGNORED_WARNINGS);
const originalConsoleWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
	const first = args[0];
	if (
		typeof first === "string" &&
		IGNORED_WARNINGS.some((message) => first.includes(message))
	) {
		return;
	}
	originalConsoleWarn(...args);
};

const SAFE_MODE = process.env.EXPO_PUBLIC_SAFE_MODE === "1";

function SafeModeScreen() {
	return (
		<BootModeScreen
			mode="Safe Mode"
			title="Startup Isolation Active"
			body="PromptPal is running with startup protections enabled while we isolate a crash trigger."
			details={[
				"Core runtime loaded successfully.",
				"Subsystems will be re-enabled incrementally.",
				"No user data is modified in this mode.",
			]}
		/>
	);
}

export default function RootLayout() {
	if (SAFE_MODE) {
		return <SafeModeScreen />;
	}

	// Lazy-load the normal root to keep the emergency safe screen isolated.
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const NormalRoot = require("../lib/NormalRoot").default;
	return <NormalRoot />;
}
