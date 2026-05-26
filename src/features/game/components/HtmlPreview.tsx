import { useCallback, useState } from "react";
import { StyleSheet, Platform, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import Animated, { FadeIn } from "react-native-reanimated";
import { sanitizeHtmlForWebView } from "@/lib/htmlSanitizer";
import type React from "react";

interface HtmlPreviewProps {
	html: string;
	height?: number;
	/**
	 * Play the fade-in entrance. Disable inside a ScrollView/animated container: a
	 * reanimated `entering` animation there can leave the WebView stuck invisible.
	 */
	animateIn?: boolean;
	/**
	 * When false, the preview is touch-inert: no scrolling and no tapping into the
	 * rendered HTML. Use for reference/result previews so tapping an <input> inside
	 * the WebView can't steal focus and raise the keyboard (which would otherwise
	 * push the challenge bottom sheet to full screen). Defaults to true.
	 */
	interactive?: boolean;
	/**
	 * Size the preview to its rendered content instead of a fixed `height`. The
	 * measured height is clamped between `minHeight` and `maxHeight`; if the content
	 * is taller than `maxHeight`, the preview caps there and becomes scrollable (even
	 * when `interactive` is false) so nothing is clipped. `height` is used as the
	 * initial height until the first measurement arrives. Defaults to false.
	 */
	autoHeight?: boolean;
	/** Lower clamp for `autoHeight` (px). Defaults to 80. */
	minHeight?: number;
	/** Upper clamp for `autoHeight` (px). Defaults to 360. */
	maxHeight?: number;
}

function isBlankPage(html: string): boolean {
	const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	const bodyContent =
		bodyMatch?.[1]?.replace(/<script[\s\S]*?<\/script>/gi, "").trim() ?? "";
	return bodyContent.length < 20;
}

const EMPTY_PAGE_PLACEHOLDER = `
  <div style="display:flex;align-items:center;justify-content:center;width:100%;min-height:40vh;color:#9ca3af;font-size:18px;line-height:1.4;font-family:system-ui;text-align:center;padding:24px;">
    Empty webpage — describe what you want to add
  </div>
`;

/**
 * Script injected only in autoHeight mode. It reports the document height back to the
 * native WebView via postMessage. It re-measures on a few delays and on resize because
 * the Tailwind CDN applies styles a tick AFTER load, which changes the final layout —
 * a single on-load measurement would under-report and clip the content.
 */
const MEASURE_SCRIPT = `<script>(function(){
  function measure(){
    var b = document.body, d = document.documentElement;
    var h = Math.max(b ? b.scrollHeight : 0, b ? b.offsetHeight : 0, d ? d.scrollHeight : 0);
    if (h && window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(String(h));
    }
  }
  window.addEventListener('load', measure);
  [0, 80, 250, 600, 1200].forEach(function(t){ setTimeout(measure, t); });
  try { if (window.ResizeObserver && document.body) { new ResizeObserver(measure).observe(document.body); } } catch (e) {}
})();</script>`;

export function HtmlPreview({
	html,
	height = 200,
	animateIn = true,
	interactive = true,
	autoHeight = false,
	minHeight = 80,
	maxHeight = 360,
}: HtmlPreviewProps) {
	// Measured content height (native via postMessage, web via iframe onLoad).
	const [measured, setMeasured] = useState<number | null>(null);

	const clampMeasured = useCallback(
		(raw: number) =>
			Math.round(Math.min(maxHeight, Math.max(minHeight, raw))),
		[minHeight, maxHeight],
	);

	const onNativeMessage = useCallback(
		(event: WebViewMessageEvent) => {
			const raw = Number(event.nativeEvent.data);
			if (Number.isFinite(raw) && raw > 0) setMeasured(clampMeasured(raw));
		},
		[clampMeasured],
	);

	const onWebFrameLoad = useCallback(
		(event: React.SyntheticEvent<HTMLIFrameElement>) => {
			const frame = event.currentTarget;
			const read = () => {
				try {
					const doc = frame.contentDocument;
					const body = doc?.body;
					const root = doc?.documentElement;
					const raw = Math.max(
						body?.scrollHeight ?? 0,
						root?.scrollHeight ?? 0,
					);
					if (raw > 0) setMeasured(clampMeasured(raw));
				} catch {
					/* cross-origin guard — srcDoc is same-origin so this rarely fires */
				}
			};
			// Re-read after the Tailwind CDN settles the layout.
			[0, 80, 300, 700].forEach((t) => setTimeout(read, t));
		},
		[clampMeasured],
	);

	if (!html || !html.trim()) return null;

	const sanitized = sanitizeHtmlForWebView(html);
	const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>';
	let wrappedHtml = sanitized.includes("<html")
		? sanitized
		: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">${tailwindScript}</head><body>${sanitized}</body></html>`;

	if (
		sanitized.includes("<html") &&
		!sanitized.includes("tailwindcss.com") &&
		sanitized.includes("class=")
	) {
		wrappedHtml = wrappedHtml.replace("</head>", `${tailwindScript}</head>`);
	}

	if (isBlankPage(wrappedHtml)) {
		wrappedHtml = wrappedHtml.replace(
			/<body([^>]*)>([\s\S]*?)<\/body>/i,
			(_, attrs, inner) =>
				`<body${attrs}>${inner}${EMPTY_PAGE_PLACEHOLDER}</body>`,
		);
	}

	if (autoHeight) {
		// Inject the measuring script just before the (last) closing body tag.
		wrappedHtml = wrappedHtml.includes("</body>")
			? wrappedHtml.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${MEASURE_SCRIPT}</body>`)
			: wrappedHtml + MEASURE_SCRIPT;
	}

	// Resolve the rendered height. In autoHeight mode use the measured value once it
	// arrives (clamped); until then fall back to `height` so there's no 0-height flash.
	const resolvedHeight = autoHeight ? measured ?? height : height;
	// Content taller than the cap should scroll, even on otherwise inert previews.
	const overflowing =
		autoHeight && measured != null && measured >= maxHeight;
	const touchEnabled = interactive || overflowing;

	return (
		<Animated.View
			entering={animateIn ? FadeIn.duration(400) : undefined}
			style={[
				styles.container,
				{
					height: resolvedHeight,
					minHeight: autoHeight ? minHeight : Math.min(120, height),
				},
				!touchEnabled && { pointerEvents: "none" },
			]}
		>
			{Platform.OS === "web" ? (
				<View
					style={[
						styles.webContainer,
						!touchEnabled && { pointerEvents: "none" },
					]}
				>
					<iframe
						title="HTML Preview"
						srcDoc={wrappedHtml}
						onLoad={autoHeight ? onWebFrameLoad : undefined}
						sandbox={
							autoHeight || interactive
								? "allow-scripts allow-same-origin"
								: "allow-scripts"
						}
						style={webFrameStyle}
					/>
				</View>
			) : (
				<WebView
					source={{ html: wrappedHtml }}
					originWhitelist={["*"]}
					style={styles.webview}
					scrollEnabled={touchEnabled}
					showsVerticalScrollIndicator={overflowing}
					showsHorizontalScrollIndicator={false}
					javaScriptEnabled={true}
					domStorageEnabled={true}
					scalesPageToFit={false}
					bounces={interactive}
					nestedScrollEnabled={touchEnabled}
					onMessage={autoHeight ? onNativeMessage : undefined}
				/>
			)}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		minHeight: 0,
		borderRadius: 16,
		overflow: "hidden",
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "rgba(0,0,0,0.06)",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	webview: {
		flex: 1,
		backgroundColor: "transparent",
		...(Platform.OS === "android" && { opacity: 0.99 }),
	},
	webContainer: {
		flex: 1,
		backgroundColor: "transparent",
	},
});

const webFrameStyle: React.CSSProperties = {
	width: "100%",
	height: "100%",
	border: "none",
	backgroundColor: "transparent",
};
