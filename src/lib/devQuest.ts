/**
 * Dev-only quest tooling: skip challenges, preview result UI, open locked nodes,
 * and access the image challenge lab.
 * Enabled in Metro dev builds (`__DEV__`) or when EXPO_PUBLIC_DEV_QUEST_TOOLS=1.
 */
export function isDevQuestToolsEnabled(): boolean {
	if (process.env.EXPO_PUBLIC_DEV_QUEST_TOOLS === "1") {
		return true;
	}
	return typeof __DEV__ !== "undefined" && __DEV__ === true;
}
