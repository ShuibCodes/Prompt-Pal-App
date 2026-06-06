import type { Level } from "@/features/game/store";

interface LessonTargetBrief {
	primary?: string;
	secondary?: string;
}

function normalizeText(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

export function getLessonTargetBrief(level?: Level | null): LessonTargetBrief {
	if (!level) return {};

	const primary =
		normalizeText(level.whatUserSees) ??
		normalizeText(level.requirementBrief) ??
		normalizeText(level.briefTitle) ??
		normalizeText(level.description) ??
		normalizeText(level.instruction);

	const secondaryCandidates = [
		normalizeText(level.instruction),
		normalizeText(level.briefGoal),
		normalizeText(level.description),
	].filter((value): value is string => Boolean(value) && value !== primary);

	return {
		primary,
		secondary: secondaryCandidates[0],
	};
}

export function hasMeaningfulHtmlPreview(html?: string | null): boolean {
	if (!html || !html.trim()) return false;
	const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, "");
	const bodyMatch = withoutScripts.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
	const visibleSource = bodyMatch?.[1] ?? withoutScripts;
	const visibleText = visibleSource
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<[^>]+>/g, "")
		.replace(/&nbsp;/gi, " ")
		.trim();
	return visibleText.length > 0;
}

/**
 * Rendered "build this" targets for the coding challenges, keyed by level id.
 * All five share one design language — system font, slate text, emerald accent,
 * dark (slate-950) primary buttons, rounded corners — so the challenge comes from
 * the task, not from decoding inconsistent designs. Component-sized, plain white
 * background, sized to sit in the top half of the challenge screen.
 *
 * The "trap" targets (Sign-up, Hero) include a small amber "already here — must
 * survive" badge so the learner can see there's a pre-existing element to protect.
 */
const codingTargetHtmlById: Record<string, string> = {
	"code-1-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white p-8 flex justify-center">
    <div class="w-72 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
      <div class="h-36 bg-gradient-to-br from-emerald-300 to-emerald-500"></div>
      <div class="p-5">
        <h2 class="text-xl font-black text-slate-950">Mountain Retreat</h2>
        <p class="mt-1 text-sm text-slate-500">A quiet cabin getaway in the hills.</p>
        <button class="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Book now</button>
      </div>
    </div>
  </body>
</html>`,
	"code-2-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white p-8 flex justify-center">
    <div class="flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
      <span class="text-base text-slate-400">&#128269;</span>
      <input class="flex-1 bg-transparent text-sm text-slate-700 outline-none" placeholder="Search products…" />
      <button class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Go</button>
    </div>
  </body>
</html>`,
	"code-3-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white p-8">
    <div class="mx-auto max-w-sm">
      <div class="flex flex-wrap items-center gap-2">
        <h1 class="text-2xl font-black text-slate-950">Welcome back</h1>
        <span class="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">&#9888; already here — must survive</span>
      </div>
      <form class="mt-5 space-y-3">
        <input class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" placeholder="Name" />
        <input class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" placeholder="Email" />
        <input type="password" class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" placeholder="Password" />
        <button class="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Sign up</button>
      </form>
    </div>
  </body>
</html>`,
	"code-4-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white p-8">
    <div class="mx-auto flex max-w-md border-b border-slate-200">
      <div class="flex-1 text-center">
        <span class="text-sm font-bold text-slate-950">Home</span>
        <div class="mt-2 h-0.5 rounded-full bg-emerald-600"></div>
      </div>
      <div class="flex-1 pb-2 text-center">
        <span class="text-sm font-semibold text-slate-400">Search</span>
      </div>
      <div class="flex-1 pb-2 text-center">
        <span class="text-sm font-semibold text-slate-400">Profile</span>
      </div>
    </div>
  </body>
</html>`,
	"code-5-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white">
    <nav class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
      <div class="flex flex-wrap items-center gap-2">
        <div class="text-lg font-black text-slate-950">&#9670; Acme</div>
        <span class="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">&#9888; already here — must survive</span>
      </div>
      <div class="flex items-center gap-5 text-sm font-semibold text-slate-400">
        <span>Product</span>
        <span>Pricing</span>
        <span>Docs</span>
      </div>
    </nav>
    <section class="px-8 py-12 text-center">
      <h1 class="text-4xl font-black tracking-tight text-slate-950">Ship faster with AI</h1>
      <p class="mt-3 text-base text-slate-500">Turn ideas into polished interfaces.</p>
      <button class="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Get started</button>
    </section>
  </body>
</html>`,
};

export function getCodingLessonTargetHtml(level?: Level | null): string | null {
	if (!level || level.type !== "code") return null;
	return codingTargetHtmlById[level.id] ?? null;
}
