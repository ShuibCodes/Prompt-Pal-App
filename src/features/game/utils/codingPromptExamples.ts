/**
 * Curated "what a weak vs. medium vs. strong prompt would build" examples for the
 * coding challenge type.
 *
 * WHY THIS LIVES CLIENT-SIDE
 * The rendered target HTML for coding levels is already authored client-side in
 * `lessonTarget.ts` (`codingTargetHtmlById`), keyed by level id — not in the DB.
 * These comparison examples are the same kind of curated, rendered content, so they
 * live in the same layer: no schema field, no seed, no Gemini calls, and any level
 * without an authored set simply renders nothing (graceful fallback).
 *
 * HOW IT'S USED
 * After the player submits a coding prompt and the result sheet opens, the
 * `CodingPromptExamples` component shows these three tiers so the player can SEE the
 * gap between a vague prompt and a precise one. The "strong" example is authored to
 * mirror the level's target, reinforcing "a strong prompt → the target you were given".
 *
 * OUTPUT SHAPE PER LESSON
 * Most lessons build UI, so the render is a component. A few teach a *text* output —
 * a plan (code-7), a self-audit (code-13), a spec, a diff (code-23), or tests
 * (code-27). For those the render is the styled text response, not a UI, because that
 * is genuinely what a strong prompt produces.
 *
 * ADDING / EDITING
 * Add an entry keyed by the level id with exactly three items (weak, medium, strong).
 * `html` is a body fragment rendered through `HtmlPreview` (which injects the Tailwind
 * CDN automatically), so deliberately leaving classes off makes a "weak" result look
 * raw and unstyled — which is the point.
 */
import type { Level } from "@/features/game/store";

export type PromptTier = "weak" | "medium" | "strong";

export interface CodingPromptExample {
	/** Quality tier this example represents. */
	tier: PromptTier;
	/** A realistic prompt a learner at this tier might type. */
	prompt: string;
	/** One line on why this prompt produced this result — the teaching point. */
	caption: string;
	/** Self-contained HTML body fragment, rendered non-interactively via HtmlPreview. */
	html: string;
}

const TIER_ORDER: PromptTier[] = ["weak", "medium", "strong"];

/**
 * Examples keyed by level id. Each entry holds one weak, one medium, and one strong
 * example. Authored to be faithful to each lesson's actual instruction.
 */
const codingPromptExamplesById: Record<string, CodingPromptExample[]> = {
	// code-1-easy — "Describe the outcome, not the code" (hero section).
	"code-1-easy": [
		{
			tier: "weak",
			prompt: "make a hero section",
			caption:
				"Too vague — AI has to guess everything. You get a bare heading and a default button, with no message and no style.",
			html: `<h1>Welcome</h1>
<button>Click here</button>`,
		},
		{
			tier: "medium",
			prompt:
				"Add a hero with the headline \"Build Better Prompts\" and a \"Start Building\" button.",
			caption:
				"Closer — it names the headline and button, but skips the supporting line and the polish, so it still feels unfinished.",
			html: `<div class="text-center py-10 px-6 bg-white">
  <h1 class="text-3xl font-bold text-slate-900 mb-4">Build Better Prompts</h1>
  <button class="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold">Start Building</button>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Build a centered hero: a small uppercase \"PromptPal Studio\" label, a bold headline \"Build Better Prompts\", one line of supporting text about turning rough ideas into clear instructions, and a \"Start Building\" button.",
			caption:
				"Describes the label, headline, supporting text, and button — so AI builds the complete, polished hero you pictured.",
			html: `<section class="px-8 py-10 flex flex-col items-center justify-center text-center bg-white">
  <p class="text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 mb-3">PromptPal Studio</p>
  <h1 class="text-4xl font-black tracking-tight text-slate-950 mb-4">Build Better Prompts</h1>
  <p class="text-base leading-7 text-slate-600 max-w-xl mb-6">Turn rough ideas into clear instructions that help AI create polished interfaces faster.</p>
  <button class="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Start Building</button>
</section>`,
		},
	],

	// code-2-easy — "Name your tech stack" (navigation bar).
	"code-2-easy": [
		{
			tier: "weak",
			prompt: "make a navbar",
			caption:
				"No stack named and no detail — AI returns plain stacked links with no layout, brand, or styling.",
			html: `<div>
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Contact</a>
</div>`,
		},
		{
			tier: "medium",
			prompt:
				"Build a navigation bar with Product, Pricing, and Docs links and a Get Started button.",
			caption:
				"Good links and a button, but it never names the stack, so styling is a coin-flip and there's no brand.",
			html: `<nav class="flex items-center gap-4 p-4 border-b border-slate-200 bg-white">
  <a href="#" class="text-sm text-slate-600">Product</a>
  <a href="#" class="text-sm text-slate-600">Pricing</a>
  <a href="#" class="text-sm text-slate-600">Docs</a>
  <button class="ml-auto bg-emerald-600 text-white text-sm px-3 py-1.5 rounded">Get Started</button>
</nav>`,
		},
		{
			tier: "strong",
			prompt:
				"Using Tailwind, build a navbar with a \"Northstar\" brand on the left; Product, Pricing and Docs links in the middle; and a green \"Get Started\" button on the right, with a subtle bottom border.",
			caption:
				"Names the stack (Tailwind) and every part — brand, links, button, border — so it comes out clean and complete.",
			html: `<nav class="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
  <div class="text-lg font-black text-slate-950">Northstar</div>
  <div class="flex items-center gap-5 text-sm font-semibold text-slate-600">
    <a href="#">Product</a>
    <a href="#">Pricing</a>
    <a href="#">Docs</a>
  </div>
  <button class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Get Started</button>
</nav>`,
		},
	],

	// code-3-easy — "Scope to one change at a time" (contact form, leave heading).
	"code-3-easy": [
		{
			tier: "weak",
			prompt: "add a contact form",
			caption:
				"Wide open — AI renamed your heading and skipped the message field. You never said what to keep or include.",
			html: `<h2>Get in touch</h2>
<form>
  <input placeholder="Name" />
  <input placeholder="Email" />
  <button>Send</button>
</form>`,
		},
		{
			tier: "medium",
			prompt:
				"Add a contact form with name, email, and message fields and a submit button below the heading.",
			caption:
				"All three fields and a submit — but with no instruction to leave the heading alone, you're relying on luck.",
			html: `<div class="p-8 bg-white">
  <h1 class="text-2xl font-bold mb-6">Contact Us</h1>
  <form class="max-w-md space-y-3">
    <input class="w-full border border-slate-300 px-3 py-2 rounded" placeholder="Name" />
    <input class="w-full border border-slate-300 px-3 py-2 rounded" placeholder="Email" />
    <textarea class="w-full border border-slate-300 px-3 py-2 rounded" placeholder="Message"></textarea>
    <button class="bg-slate-900 text-white px-4 py-2 rounded text-sm font-bold">Submit</button>
  </form>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Below the existing \"Contact Us\" heading, add a form with Name, Email, and a Message textarea plus a \"Submit Message\" button. Leave the heading exactly as it is and don't change anything else.",
			caption:
				"Names the fields and button AND explicitly protects the heading — so AI adds only the form, nothing more.",
			html: `<div class="bg-white p-8">
  <h1 class="text-2xl font-bold mb-6">Contact Us</h1>
  <form class="max-w-md space-y-4">
    <input class="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Name" />
    <input class="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Email" />
    <textarea class="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-24" placeholder="Message"></textarea>
    <button class="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Submit Message</button>
  </form>
</div>`,
		},
	],

	// code-4-easy — "Describe what happens, not how" (Sign Up click behaviour).
	"code-4-easy": [
		{
			tier: "weak",
			prompt: "make the button work",
			caption:
				"\"Work\" how? AI wires up a generic alert — something happens, but it's not what a user expects from Sign Up.",
			html: `<div style="padding:16px">
  <button>Sign Up</button>
  <p>&#9888; alert("Clicked!")</p>
</div>`,
		},
		{
			tier: "medium",
			prompt: "When Sign Up is clicked, show a signup form.",
			caption:
				"Describes the outcome — a signup form — but with no detail on its content or tone, so it's bare.",
			html: `<div class="p-6 bg-slate-50">
  <button class="bg-blue-500 text-white px-4 py-2 rounded mb-4">Sign Up</button>
  <form class="max-w-xs space-y-2">
    <input class="w-full border border-slate-300 px-3 py-2 rounded" placeholder="Email" />
    <button class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold">Continue</button>
  </form>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"When the Sign Up button is clicked, show a small card titled \"Create your account\" with a short line of text, an email field, and a \"Continue\" button. Keep it clean and friendly.",
			caption:
				"Describes exactly what the user should see and the tone — so AI builds the polished account card.",
			html: `<div class="bg-slate-50 p-8">
  <button class="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</button>
  <div class="mt-6 max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="text-xl font-black text-slate-950 mb-2">Create your account</h2>
    <p class="text-sm text-slate-600 mb-4">Enter your email to continue.</p>
    <input class="w-full rounded-xl border border-slate-300 px-4 py-3 mb-3" placeholder="Email address" />
    <button class="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">Continue</button>
  </div>
</div>`,
		},
	],

	// code-5-easy — "Protect what must stay the same" (change header colour only).
	"code-5-easy": [
		{
			tier: "weak",
			prompt: "change the colors",
			caption:
				"Far too broad — AI recolored the whole page and dropped the nav links. You never said what to protect.",
			html: `<div class="p-8 bg-purple-100">
  <header class="bg-purple-600 text-white p-4">
    <h1 class="text-2xl font-bold">My App</h1>
  </header>
  <main class="mt-8">
    <p class="text-purple-700">Welcome to my app.</p>
  </main>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Change the header background to green.",
			caption:
				"Changes the colour and happens to keep the rest — but nothing told AI to preserve the links and content.",
			html: `<div class="p-8 bg-white">
  <header class="bg-emerald-600 text-white p-4">
    <h1 class="text-2xl font-bold">My App</h1>
    <nav class="mt-2">
      <a href="#" class="text-emerald-100 mr-4">Home</a>
      <a href="#" class="text-emerald-100 mr-4">About</a>
      <a href="#" class="text-emerald-100">Contact</a>
    </nav>
  </header>
  <main class="mt-8">
    <p class="text-gray-600">Welcome to my app.</p>
  </main>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Change only the header's background colour to emerald green and keep the white text readable. Do not modify the Home/About/Contact links or the \"Welcome to my app\" content.",
			caption:
				"Names the single change and explicitly protects the links and content — a safe, surgical edit.",
			html: `<div class="p-8 bg-white">
  <header class="bg-emerald-700 text-white p-4">
    <h1 class="text-2xl font-bold">My App</h1>
    <nav class="mt-2">
      <a href="#" class="text-emerald-100 mr-4">Home</a>
      <a href="#" class="text-emerald-100 mr-4">About</a>
      <a href="#" class="text-emerald-100">Contact</a>
    </nav>
  </header>
  <main class="mt-8">
    <p class="text-gray-600">Welcome to my app.</p>
  </main>
</div>`,
		},
	],

	// code-6-medium — "Report bugs: what's wrong, where, and expected" (form validation).
	"code-6-medium": [
		{
			tier: "weak",
			prompt: "fix the bug",
			caption:
				"Which bug? With no description AI can't tell — the form still submits with an empty email.",
			html: `<div class="p-8 bg-white">
  <form class="max-w-sm space-y-3">
    <input type="text" placeholder="Email" class="border border-slate-300 p-3 w-full rounded-xl" />
    <button class="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold">Submit</button>
  </form>
  <p class="text-xs text-slate-400 mt-2">Still submits when the email is empty.</p>
</div>`,
		},
		{
			tier: "medium",
			prompt: "The form submits even when the email is empty. Add validation.",
			caption:
				"Names what's wrong, so AI adds validation — but without saying how to warn, the error is a blunt popup.",
			html: `<div class="p-8 bg-white">
  <form class="max-w-sm space-y-3">
    <input type="text" placeholder="Email" class="border border-slate-300 p-3 w-full rounded-xl" />
    <button class="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold">Submit</button>
  </form>
  <div class="mt-3 inline-block rounded-lg bg-slate-800 px-3 py-2 text-xs text-white">&#9888; Alert: "Please enter an email"</div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Bug: the form submits even when the email field is empty, on the email input. Expected: block the submit and show a red \"Email is required.\" message under the field, but still submit when a valid email is entered.",
			caption:
				"States what's wrong, where, and the expected behaviour — so AI fixes it with a clear inline error.",
			html: `<div class="bg-white p-8">
  <form class="max-w-sm space-y-3">
    <input type="text" placeholder="Email" class="border border-red-300 p-3 w-full rounded-xl" />
    <p class="text-sm font-semibold text-red-600">Email is required.</p>
    <button class="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold">Submit</button>
  </form>
</div>`,
		},
	],

	// code-7-medium — "Ask for a plan before code" (dark mode). Output is a PLAN, not UI.
	"code-7-medium": [
		{
			tier: "weak",
			prompt: "add a dark mode toggle",
			caption:
				"You asked for the feature, so AI skipped planning and dumped code — now you're reviewing an implementation before you've agreed on the approach.",
			html: `<pre class="m-0 p-4 bg-slate-900 text-emerald-200 text-xs leading-5" style="white-space:pre-wrap"><code>const b = document.createElement('button');
b.textContent = 'Toggle';
b.onclick = () =&gt; document.body.classList.toggle('dark');
document.body.appendChild(b);</code></pre>`,
		},
		{
			tier: "medium",
			prompt: "How should I add dark mode? Give me a quick plan.",
			caption:
				"Asks for a plan, but it's loose — a couple of steps, no edge cases like saving the choice or honoring the system setting.",
			html: `<div class="p-5 bg-white">
  <p class="text-[11px] font-black uppercase tracking-wide text-amber-600 mb-2">Plan</p>
  <ol class="list-decimal pl-5 space-y-1 text-slate-700 text-sm">
    <li>Add a toggle button to the header</li>
    <li>Switch the colours when it's clicked</li>
  </ol>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Before writing any code, plan how to add a dark mode toggle: list the steps, the parts of the page involved, and edge cases like saving the user's preference and respecting the system default.",
			caption:
				"Asks AI to plan first and name edge cases — you get an approach to approve before a single line of code exists.",
			html: `<div class="p-5 bg-white">
  <p class="text-[11px] font-black uppercase tracking-wide text-emerald-600 mb-2">Plan — no code yet</p>
  <ol class="list-decimal pl-5 space-y-1.5 text-slate-700 text-sm">
    <li>Add a toggle button in the header</li>
    <li>Track a "dark" state and toggle a class on &lt;body&gt;</li>
    <li>Define dark styles for background, text, and surfaces</li>
    <li>Edge case: persist the choice in localStorage</li>
    <li>Edge case: default to the system colour-scheme preference</li>
  </ol>
</div>`,
		},
	],

	// code-8-medium — "Name edge cases in your prompt" (users list: error + empty states).
	"code-8-medium": [
		{
			tier: "weak",
			prompt: "fetch the users and show them",
			caption:
				"Only the happy path. When the request fails or returns nothing, the user sees a blank screen — no message at all.",
			html: `<div class="p-8 bg-white">
  <h1 class="text-2xl font-bold mb-4">Users</h1>
  <div class="grid gap-2">
    <div class="border border-slate-200 p-3 rounded">Leona Park</div>
    <div class="border border-slate-200 p-3 rounded">Mateo Ivers</div>
  </div>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Fetch the users and show an error if it fails.",
			caption:
				"Covers the failure case, but forgets the empty list — when the API returns nothing, it's still a blank page.",
			html: `<div class="p-8 bg-white">
  <h1 class="text-2xl font-bold mb-4">Users</h1>
  <div class="grid gap-2">
    <div class="border border-slate-200 p-3 rounded">Leona Park</div>
    <div class="rounded border border-red-200 bg-red-50 p-3 text-red-700">Could not load users. Try again.</div>
  </div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"When fetching the users: if the request fails, show a friendly \"Couldn't load users\" error; if it succeeds but returns no one, show a \"No users found yet\" empty state. Otherwise list the names.",
			caption:
				"Names both edge cases and what to show for each — so AI handles failure and empty, not just the happy path.",
			html: `<div class="p-8 bg-white">
  <h1 class="text-2xl font-bold mb-4">Users</h1>
  <div class="grid gap-3">
    <div class="rounded-xl border border-slate-200 p-4">Leona Park</div>
    <div class="rounded-xl border border-slate-200 p-4">Mateo Ivers</div>
    <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">No users found yet.</div>
    <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">Couldn't load users. Try again.</div>
  </div>
</div>`,
		},
	],

	// code-9-medium — "Refine with a focused follow-up" (card: more spacing + bigger title).
	"code-9-medium": [
		{
			tier: "weak",
			prompt: "make the card better",
			caption:
				"\"Better\" is subjective — AI guesses and rebuilds the whole card, often changing things you were happy with.",
			html: `<div class="p-8 bg-slate-100">
  <div class="border border-slate-200 rounded p-3 w-72 bg-white">
    <h2 class="text-sm font-bold text-slate-900">A Brand New Card</h2>
    <p class="text-slate-600 text-sm">Completely redesigned copy you didn't ask for.</p>
    <button class="bg-indigo-600 text-white px-3 py-1 rounded mt-2">Go</button>
  </div>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Give the card more spacing.",
			caption:
				"One of the two changes lands — more breathing room — but the title is still small because you didn't mention it.",
			html: `<div class="p-8 bg-slate-100">
  <div class="border border-slate-200 rounded-2xl p-6 w-72 bg-white space-y-4">
    <h2 class="text-sm font-bold text-slate-900">Card Title</h2>
    <p class="text-slate-600 leading-6">This is the card description text.</p>
    <button class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Action</button>
  </div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Two changes only: add more spacing between the card's elements and make the title larger. Leave the button, the text, and everything else exactly as it is.",
			caption:
				"A focused follow-up — names both changes and protects the rest, so AI refines instead of rebuilding.",
			html: `<div class="p-8 bg-slate-100">
  <div class="border border-slate-200 rounded-2xl p-6 w-72 bg-white shadow-sm space-y-4">
    <h2 class="text-2xl font-black text-slate-950">Card Title</h2>
    <p class="text-slate-600 leading-6">This is the card description text.</p>
    <button class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Action</button>
  </div>
</div>`,
		},
	],

	// code-10-medium — "Share the context AI needs" (navbar logout wired to authStore).
	"code-10-medium": [
		{
			tier: "weak",
			prompt: "add a logout button",
			caption:
				"AI doesn't know your app, so it drops in a generic button that logs to the console — it never calls your real logout.",
			html: `<header class="bg-gray-800 text-white p-4 flex items-center justify-between">
  <h1 class="text-xl font-bold">My App</h1>
  <button class="bg-white text-gray-800 px-3 py-1 rounded text-sm">Logout</button>
</header>
<p class="p-3 text-xs text-slate-500">onClick → console.log('logout') &nbsp;(not wired to your app)</p>`,
		},
		{
			tier: "medium",
			prompt: "Add a logout button to the navbar that logs the user out.",
			caption:
				"Places it correctly, but with no mention of authStore, AI invents its own logout logic instead of using yours.",
			html: `<header class="bg-gray-800 text-white p-4 flex items-center justify-between">
  <h1 class="text-xl font-bold">My App</h1>
  <nav class="flex items-center gap-4">
    <a href="#" class="text-gray-300">Dashboard</a>
    <a href="#" class="text-gray-300">Settings</a>
    <button class="rounded-lg bg-white px-3 py-1 text-sm font-bold text-gray-800">Logout</button>
  </nav>
</header>`,
		},
		{
			tier: "strong",
			prompt:
				"The app already has an authStore with a logout() method. Add a Logout button to the navbar, beside Dashboard and Settings, that calls authStore.logout() when clicked.",
			caption:
				"Tells AI about the existing authStore — so the new button wires into your real code instead of fake logic.",
			html: `<header class="bg-gray-800 text-white p-4 flex items-center justify-between">
  <h1 class="text-xl font-bold">My App</h1>
  <nav class="flex items-center gap-4">
    <a href="#" class="text-gray-300">Dashboard</a>
    <a href="#" class="text-gray-300">Settings</a>
    <button class="rounded-lg bg-white px-3 py-1 text-sm font-bold text-gray-800">Logout</button>
  </nav>
</header>
<p class="p-3 text-xs text-emerald-600">onClick → authStore.logout()</p>`,
		},
	],

	// code-11-hard — "Describe the design in plain language" (polished pricing card).
	"code-11-hard": [
		{
			tier: "weak",
			prompt: "make the pricing card look nicer with hover:bg-blue-700 and mb-4",
			caption:
				"Reaches for class names you may have wrong — and stays plain. Describing implementation beats describing the look.",
			html: `<div class="p-8 bg-slate-100 flex justify-center">
  <div class="border p-4 w-64 bg-white">
    <h2 class="text-lg font-bold">Pro Plan</h2>
    <p class="text-2xl">$29/mo</p>
    <ul><li>Feature one</li><li>Feature two</li></ul>
    <button class="bg-blue-700 text-white px-4 py-2 mt-4">Get Started</button>
  </div>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Make the pricing card look more polished, with more spacing.",
			caption:
				"Better spacing, but \"polished\" is vague — no emphasis, no hover, no hierarchy guidance for AI to act on.",
			html: `<div class="p-12 bg-slate-100 flex justify-center">
  <div class="w-64 rounded-2xl bg-white p-6 shadow border border-slate-200">
    <h2 class="text-xl font-black text-slate-950">Pro Plan</h2>
    <p class="mt-2 text-3xl font-black">$29<span class="text-base text-slate-500">/mo</span></p>
    <ul class="mt-4 space-y-2 text-sm text-slate-700"><li>Feature one</li><li>Feature two</li><li>Feature three</li></ul>
    <button class="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 font-bold text-white">Get Started</button>
  </div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Make this pricing card feel premium, described in plain language: a small \"Most Popular\" tag in green at the top, generous spacing, a big bold price, comfortable room between the features, a rounded card with a soft shadow, and a dark full-width button that darkens on hover.",
			caption:
				"Describes the look like you would to a designer — no class names — so AI translates it into a polished card.",
			html: `<div class="p-12 bg-slate-100 flex justify-center">
  <div class="w-72 rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
    <p class="text-xs font-black tracking-[0.2em] text-emerald-600 uppercase mb-3">Most Popular</p>
    <h2 class="text-2xl font-black text-slate-950">Pro Plan</h2>
    <p class="mt-3 text-4xl font-black">$29<span class="text-base text-slate-500">/mo</span></p>
    <ul class="mt-6 space-y-3 text-sm text-slate-700"><li>Feature one</li><li>Feature two</li><li>Feature three</li></ul>
    <button class="mt-7 w-full rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white hover:bg-slate-800">Get Started</button>
  </div>
</div>`,
		},
	],

	// code-12-hard — "Brief AI when it loses track" (TaskFlow + Add task button).
	"code-12-hard": [
		{
			tier: "weak",
			prompt: "add a button",
			caption:
				"No context and no target — AI has lost the thread, so it drops a stray button with no idea this is a task app.",
			html: `<div class="p-8 bg-white">
  <button class="border border-slate-300 px-3 py-1 rounded">Button</button>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Add an \"Add task\" button to the tasks page.",
			caption:
				"Names the feature, but without recapping the app, AI half-guesses the layout and the button lands awkwardly.",
			html: `<div>
  <header class="bg-blue-600 text-white p-4"><h1 class="text-xl font-bold">TaskFlow</h1></header>
  <main class="p-8">
    <h2 class="text-lg font-bold mb-4">Your Tasks</h2>
    <button class="rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white mb-4">Add task</button>
    <ul class="space-y-2"><li class="border p-3 rounded bg-white">Buy groceries</li></ul>
  </main>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Quick recap: this is TaskFlow, a task app with a blue header (title + Logout) and a \"Your Tasks\" list. Now add an \"Add task\" button in the header of the tasks section, aligned to the right of the \"Your Tasks\" title, without changing the existing list.",
			caption:
				"Re-briefs AI on what's already built, then states the one change — so it places the button right and breaks nothing.",
			html: `<div>
  <header class="bg-blue-600 text-white p-4 flex justify-between items-center">
    <h1 class="text-xl font-bold">TaskFlow</h1>
    <button class="text-sm bg-white text-blue-600 px-3 py-1 rounded">Logout</button>
  </header>
  <main class="p-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold">Your Tasks</h2>
      <button class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">Add task</button>
    </div>
    <ul class="space-y-2">
      <li class="border p-3 rounded bg-white">Buy groceries</li>
      <li class="border p-3 rounded bg-white">Finish project report</li>
    </ul>
  </main>
</div>`,
		},
	],

	// code-13-hard — "Ask AI to audit its code" (login form). Output is an AUDIT (text).
	"code-13-hard": [
		{
			tier: "weak",
			prompt: "review this login form",
			caption:
				"A vague \"review\" gets a vague thumbs-up — AI misses the real problems because you didn't ask it to look for any.",
			html: `<div class="p-5 bg-white">
  <p class="text-sm text-slate-700">Looks good! The form is clean and the layout works well. 👍</p>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Check this login form for any security issues.",
			caption:
				"Points AI at security, so it catches the hardcoded key — but misses the missing error handling and loading state.",
			html: `<div class="p-5 bg-white">
  <ul class="space-y-2 text-sm text-slate-700">
    <li class="flex gap-2"><span class="text-red-600 font-bold">✗</span> Hardcoded API key in the request body</li>
  </ul>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Audit this login form against a checklist and report what you find: (1) any hardcoded secrets, (2) missing error handling on the request, (3) missing loading state. List each issue and how to fix it.",
			caption:
				"Gives AI a specific checklist — so the audit surfaces every real issue instead of a surface-level glance.",
			html: `<div class="p-5 bg-white">
  <p class="text-[11px] font-black uppercase tracking-wide text-emerald-600 mb-2">Audit</p>
  <ul class="space-y-2 text-sm text-slate-700">
    <li class="flex gap-2"><span class="text-red-600 font-bold">✗</span> Hardcoded API key — move it to an env variable</li>
    <li class="flex gap-2"><span class="text-red-600 font-bold">✗</span> No error handling — add a .catch and show a failure message</li>
    <li class="flex gap-2"><span class="text-red-600 font-bold">✗</span> No loading state — disable the button and show a spinner while submitting</li>
  </ul>
</div>`,
		},
	],

	// code-14-hard — "Spec first, then prompt" (task manager scaffold).
	"code-14-hard": [
		{
			tier: "weak",
			prompt: "build a task app",
			caption:
				"No spec — AI guesses what \"task app\" means and returns a bare input with none of the structure you had in mind.",
			html: `<div class="p-8 bg-white">
  <input placeholder="task" />
  <button>add</button>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Build a task manager where you can add tasks. Use Tailwind.",
			caption:
				"Names the stack and one feature, so you get a working adder — but no completing tasks, and a thin layout.",
			html: `<div class="p-8 bg-slate-50">
  <h1 class="text-2xl font-bold mb-4">Tasks</h1>
  <div class="flex gap-2 mb-4">
    <input class="flex-1 rounded-xl border border-slate-300 px-4 py-3" placeholder="Add a task" />
    <button class="rounded-xl bg-slate-900 px-4 py-3 text-white font-bold">Add</button>
  </div>
  <div class="rounded-xl border p-3">Plan project</div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Spec: a personal task manager. Users can add tasks and mark them complete. Built with Tailwind. Build the full scaffold — a heading, an intro line, an add-task input row, and a list showing both open and completed tasks.",
			caption:
				"A clear spec — purpose, two features, stack — up front, so AI builds a complete, on-target scaffold.",
			html: `<div class="bg-slate-50 p-8">
  <section class="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
    <h1 class="text-3xl font-black mb-2">Task Manager</h1>
    <p class="text-slate-600 mb-5">Create, complete, and organize personal tasks.</p>
    <div class="flex gap-2 mb-4">
      <input class="flex-1 rounded-xl border border-slate-300 px-4 py-3" placeholder="Add a task" />
      <button class="rounded-xl bg-slate-950 px-4 py-3 text-white font-bold">Add</button>
    </div>
    <div class="space-y-2">
      <div class="rounded-xl border p-3">Plan project</div>
      <div class="rounded-xl border p-3 line-through text-slate-400">Review notes</div>
    </div>
  </section>
</div>`,
		},
	],

	// code-15-hard — "Pack everything into one prompt" (profile card: loading + error + data).
	"code-15-hard": [
		{
			tier: "weak",
			prompt: "show a user profile from the API",
			caption:
				"No stack, no states, no fields — AI ships only the happy path with a plain dump and nothing for loading or errors.",
			html: `<div class="p-8 bg-gray-100">
  <p>Leanne Graham</p>
  <p>Bret</p>
</div>`,
		},
		{
			tier: "medium",
			prompt:
				"Fetch a user from jsonplaceholder and show their name and company in a card. Use Tailwind.",
			caption:
				"Names the stack, source, and fields — but skips the loading and error states, so a slow or failed request looks broken.",
			html: `<div class="p-8 bg-gray-100">
  <article class="max-w-sm rounded-2xl bg-white p-6 border border-slate-200">
    <h2 class="text-2xl font-black text-slate-950">Leanne Graham</h2>
    <p class="text-slate-600">Bret · Romaguera-Crona</p>
  </article>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"With Tailwind, fetch user 1 from jsonplaceholder.typicode.com/users/1 and show a profile card with their name, username, and company. Show a loading state while fetching and a clear error message if it fails. Make the card polished.",
			caption:
				"One prompt with the stack, data source, both edge cases, and the look — so AI builds the whole feature, not a fragment.",
			html: `<div class="p-8 bg-gray-100">
  <article class="max-w-sm rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
    <div class="mb-4 h-12 w-12 rounded-full bg-emerald-100"></div>
    <h2 class="text-2xl font-black text-slate-950">Leanne Graham</h2>
    <p class="text-slate-600">Bret · Romaguera-Crona</p>
    <p class="mt-4 text-sm text-slate-500">Loading and error states are handled before this card appears.</p>
  </article>
</div>`,
		},
	],

	// code-16-easy — "Show, don't just tell" (reuse a card example → 3 product cards).
	"code-16-easy": [
		{
			tier: "weak",
			prompt: "add more product cards",
			caption:
				"AI invents its own card style instead of copying yours — the new cards don't match what's already on the page.",
			html: `<div class="p-6 bg-gray-100 grid grid-cols-3 gap-3">
  <div class="bg-white rounded shadow p-4"><div class="bg-slate-200 h-20 rounded mb-2"></div><h3 class="font-bold">Headphones</h3></div>
  <div class="bg-indigo-600 text-white rounded-2xl p-4"><h3 class="font-bold">Watch — NEW STYLE</h3><p>$149</p></div>
  <div class="border-2 border-dashed p-4"><h3>Speaker?</h3></div>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Add two more product cards for a Smart Watch and a Bluetooth Speaker.",
			caption:
				"You get three cards, but without pointing at the example AI re-styles them slightly — the set isn't quite consistent.",
			html: `<div class="p-6 bg-gray-100 grid grid-cols-3 gap-4">
  <div class="bg-white rounded-2xl border border-slate-200 p-4"><div class="bg-slate-200 h-24 rounded-xl mb-3"></div><h3 class="font-black">Wireless Headphones</h3><p class="text-slate-600">$99</p><button class="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white mt-1">Buy</button></div>
  <div class="bg-white rounded-lg border border-slate-200 p-4"><div class="bg-slate-200 h-20 rounded mb-3"></div><h3 class="font-bold">Smart Watch</h3><p class="text-slate-600">$149</p><button class="rounded bg-blue-500 px-3 py-1.5 text-sm text-white mt-1">Buy</button></div>
  <div class="bg-white rounded-lg border border-slate-200 p-4"><div class="bg-slate-200 h-20 rounded mb-3"></div><h3 class="font-bold">Bluetooth Speaker</h3><p class="text-slate-600">$79</p><button class="rounded bg-blue-500 px-3 py-1.5 text-sm text-white mt-1">Buy</button></div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Here's my existing product card as the template. Build two more exactly like it — same image box, name, price, and Buy button — for a Smart Watch ($149) and a Bluetooth Speaker ($79).",
			caption:
				"Points AI at the card that's already there as the pattern — so all three match perfectly.",
			html: `<div class="p-6 bg-gray-100 grid grid-cols-3 gap-4">
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"><div class="bg-slate-200 h-24 rounded-xl mb-3"></div><h3 class="font-black text-slate-950">Wireless Headphones</h3><p class="text-slate-600 mb-2">$99</p><button class="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white">Buy</button></div>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"><div class="bg-slate-200 h-24 rounded-xl mb-3"></div><h3 class="font-black text-slate-950">Smart Watch</h3><p class="text-slate-600 mb-2">$149</p><button class="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white">Buy</button></div>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"><div class="bg-slate-200 h-24 rounded-xl mb-3"></div><h3 class="font-black text-slate-950">Bluetooth Speaker</h3><p class="text-slate-600 mb-2">$79</p><button class="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white">Buy</button></div>
</div>`,
		},
	],

	// code-17-easy — "Ask for the output format you want" (countdown timer).
	"code-17-easy": [
		{
			tier: "weak",
			prompt: "add a timer",
			caption:
				"\"A timer\" could be anything — AI returns a plain ticking number, not the launch countdown you wanted.",
			html: `<div class="p-8 text-center bg-slate-50">
  <h1 class="text-2xl font-black mb-4">Launch in:</h1>
  <p class="text-3xl font-mono">137</p>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Add a countdown timer showing days, hours, minutes, and seconds.",
			caption:
				"Names the units, so the data is right — but with no format described, the layout is a plain run-on line.",
			html: `<div class="p-8 text-center bg-slate-50">
  <h1 class="text-2xl font-black mb-4">Launch in:</h1>
  <p class="text-xl font-mono text-slate-800">02d : 14h : 37m : 09s</p>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Add a launch countdown below the heading, formatted as four separate boxes — days, hours, minutes, seconds — each a dark rounded tile with the big number on top and the unit label beneath, and highlight the seconds tile in green.",
			caption:
				"Specifies the exact format — tiles, layout, labels, highlight — so AI builds the countdown you pictured.",
			html: `<div class="p-8 text-center bg-slate-50">
  <h1 class="text-2xl font-black text-slate-950 mb-6">Launch in:</h1>
  <div class="flex justify-center gap-3">
    <div class="rounded-2xl bg-slate-950 text-white px-5 py-4"><span class="block text-3xl font-black">02</span><span class="text-xs text-slate-300">days</span></div>
    <div class="rounded-2xl bg-slate-950 text-white px-5 py-4"><span class="block text-3xl font-black">14</span><span class="text-xs text-slate-300">hrs</span></div>
    <div class="rounded-2xl bg-slate-950 text-white px-5 py-4"><span class="block text-3xl font-black">37</span><span class="text-xs text-slate-300">min</span></div>
    <div class="rounded-2xl bg-emerald-600 text-white px-5 py-4"><span class="block text-3xl font-black">09</span><span class="text-xs text-emerald-100">sec</span></div>
  </div>
</div>`,
		},
	],

	// code-18-easy — "Ask for the output format you want" (FAQ → accordion).
	"code-18-easy": [
		{
			tier: "weak",
			prompt: "tidy up the FAQ",
			caption:
				"\"Tidy up\" doesn't say how — AI just restyles the same always-open paragraphs instead of making them collapsible.",
			html: `<div class="p-8 max-w-lg bg-white">
  <h1 class="text-2xl font-black mb-4">FAQ</h1>
  <p class="font-semibold">How do I reset my password?</p>
  <p class="text-slate-600 mb-3">Visit Settings and click Reset Password.</p>
  <p class="font-semibold">Can I change my plan?</p>
  <p class="text-slate-600 mb-3">Yes, from the Billing page.</p>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Turn the FAQ into an accordion.",
			caption:
				"AI builds clickable rows, but doesn't know they should start closed — so every answer is still showing.",
			html: `<div class="p-8 max-w-lg bg-white">
  <h1 class="text-2xl font-black mb-4">FAQ</h1>
  <div class="space-y-2">
    <div class="rounded-xl border border-slate-200">
      <button class="w-full flex justify-between px-4 py-3 font-bold">How do I reset my password?<span>−</span></button>
      <p class="px-4 pb-3 text-slate-600">Visit Settings and click Reset Password.</p>
    </div>
    <div class="rounded-xl border border-slate-200">
      <button class="w-full flex justify-between px-4 py-3 font-bold">Can I change my plan?<span>−</span></button>
      <p class="px-4 pb-3 text-slate-600">Yes, from the Billing page.</p>
    </div>
  </div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Turn the FAQ into a collapsible accordion: each question is a clickable header, all answers are collapsed by default and expand only when their question is clicked. Keep the existing questions and answers.",
			caption:
				"Names the format and the starting state — so AI builds an accordion that's closed until tapped.",
			html: `<div class="p-8 bg-white max-w-lg">
  <h1 class="text-2xl font-black text-slate-950 mb-4">FAQ</h1>
  <div class="space-y-2">
    <div class="rounded-xl border border-slate-200">
      <button class="w-full flex items-center justify-between px-4 py-3 font-bold text-slate-950">How do I reset my password?<span class="text-slate-400">−</span></button>
      <p class="px-4 pb-3 text-slate-600">Visit Settings and click Reset Password.</p>
    </div>
    <div class="rounded-xl border border-slate-200">
      <button class="w-full flex items-center justify-between px-4 py-3 font-bold text-slate-950">Can I change my plan?<span class="text-slate-400">+</span></button>
    </div>
    <div class="rounded-xl border border-slate-200">
      <button class="w-full flex items-center justify-between px-4 py-3 font-bold text-slate-950">How do I contact support?<span class="text-slate-400">+</span></button>
    </div>
  </div>
</div>`,
		},
	],

	// code-19-easy — "Match an existing reference" (Primary → matching Secondary button).
	"code-19-easy": [
		{
			tier: "weak",
			prompt: "add another button",
			caption:
				"No reference — AI adds a mismatched button in a different size and colour that breaks the visual pair.",
			html: `<div class="p-8 bg-slate-50 flex items-center gap-3">
  <button class="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">Primary</button>
  <button class="bg-green-500 text-white px-2 py-1 rounded-full text-xs">click</button>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Add a gray Secondary button next to the Primary one.",
			caption:
				"Right colour and label, but without anchoring to the original its size and rounding drift slightly off.",
			html: `<div class="p-8 bg-slate-50 flex items-center gap-3">
  <button class="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">Primary</button>
  <button class="bg-slate-200 text-slate-800 px-4 py-2 rounded-md text-sm">Secondary</button>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Add a \"Secondary\" button next to the existing \"Primary\" button. Match the Primary button's exact size, padding, and rounding, but style it in a muted gray instead of blue.",
			caption:
				"Anchors the request to the existing button — so the pair shares one size and shape, just different colours.",
			html: `<div class="p-8 bg-slate-50">
  <div class="flex gap-3">
    <button class="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">Primary</button>
    <button class="bg-slate-200 text-slate-800 px-5 py-2.5 rounded-lg font-medium">Secondary</button>
  </div>
</div>`,
		},
	],

	// code-20-easy — "Start with the simplest version" (to-do MVP: input + list only).
	"code-20-easy": [
		{
			tier: "weak",
			prompt: "build a full-featured to-do app",
			caption:
				"Asks for everything at once — AI crams in edit, delete, filters, and storage, so there's more to debug than to use.",
			html: `<div class="p-6 max-w-md bg-white">
  <h1 class="text-2xl font-black mb-3">My Tasks</h1>
  <div class="flex gap-2 mb-3"><input class="flex-1 border rounded px-3 py-2" placeholder="Add" /><button class="bg-slate-900 text-white px-3 rounded">Add</button></div>
  <div class="flex gap-2 mb-3 text-xs"><button class="border rounded px-2 py-1">All</button><button class="border rounded px-2 py-1">Active</button><button class="border rounded px-2 py-1">Done</button></div>
  <div class="border rounded p-2 flex justify-between">Buy milk <span class="text-xs text-slate-400">edit · delete · ★</span></div>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Build a to-do list where I can add and delete tasks.",
			caption:
				"Trimmed down, but \"delete\" is still extra scope for a first pass — more surface area than the core needs.",
			html: `<div class="p-6 max-w-md bg-white">
  <h1 class="text-2xl font-black mb-4">My Tasks</h1>
  <div class="flex gap-2 mb-4"><input class="flex-1 rounded-xl border border-slate-300 px-4 py-3" placeholder="Add a task" /><button class="rounded-xl bg-slate-900 px-4 py-3 text-white font-bold">Add</button></div>
  <div class="space-y-2">
    <div class="rounded-xl border border-slate-200 p-3 flex justify-between items-center">Buy groceries <button class="text-xs text-red-500">delete</button></div>
  </div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Build the simplest working version of a to-do first: just an input and a list, where typing a task and submitting adds it to the list. No editing, deleting, or saving yet.",
			caption:
				"Scopes to the core MVP on purpose — so you get something working fast to build on with focused follow-ups.",
			html: `<div class="p-8 max-w-md bg-white">
  <h1 class="text-2xl font-black text-slate-950 mb-4">My Tasks</h1>
  <div class="flex gap-2 mb-4">
    <input class="flex-1 rounded-xl border border-slate-300 px-4 py-3" placeholder="Add a task" />
    <button class="rounded-xl bg-slate-950 px-4 py-3 text-white font-bold">Add</button>
  </div>
  <div class="space-y-2">
    <div class="rounded-xl border border-slate-200 p-3">Buy groceries</div>
    <div class="rounded-xl border border-slate-200 p-3">Call the dentist</div>
  </div>
</div>`,
		},
	],

	// code-21-medium — "Give AI a role" (bare signup form → production quality).
	"code-21-medium": [
		{
			tier: "weak",
			prompt: "make this form better",
			caption:
				"No role and no bar — AI nudges the styling a little but keeps the prototype feel you were trying to leave behind.",
			html: `<div class="p-8 bg-white">
  <form class="max-w-sm space-y-2">
    <input type="email" placeholder="Email" class="border px-2 py-1 w-full" />
    <input type="password" placeholder="Password" class="border px-2 py-1 w-full" />
    <button class="bg-blue-500 text-white px-3 py-1">Sign Up</button>
  </form>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Polish this signup form to look professional.",
			caption:
				"\"Professional\" lifts it some, but with no role or explicit standard AI stops short of labels and focus states.",
			html: `<div class="p-8 bg-slate-50">
  <form class="max-w-sm space-y-3 rounded-2xl bg-white p-6 border border-slate-200">
    <h2 class="text-xl font-black text-slate-950">Create your account</h2>
    <input type="email" class="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Email" />
    <input type="password" class="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Password" />
    <button class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Sign Up</button>
  </form>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Act as a senior frontend engineer. Bring this signup form up to production quality: clear field labels, comfortable spacing, visible focus states, and a strong visual hierarchy with a prominent primary button.",
			caption:
				"Sets a role and a quality bar — so AI applies senior-level judgment: labels, hierarchy, and polish.",
			html: `<div class="p-8 bg-slate-50">
  <form class="max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
    <h2 class="text-xl font-black text-slate-950">Create your account</h2>
    <div>
      <label class="block text-sm font-semibold text-slate-700 mb-1">Email</label>
      <input type="email" class="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="you@example.com" />
    </div>
    <div>
      <label class="block text-sm font-semibold text-slate-700 mb-1">Password</label>
      <input type="password" class="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Choose a password" />
    </div>
    <button class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Sign Up</button>
  </form>
</div>`,
		},
	],

	// code-22-medium — "Define 'done' with acceptance criteria" (list → search box).
	"code-22-medium": [
		{
			tier: "weak",
			prompt: "add search",
			caption:
				"No criteria — AI adds a box that matches only exact case and shows nothing when there are no results.",
			html: `<div class="p-8 max-w-md bg-white">
  <input class="w-full border border-slate-300 px-3 py-2 rounded mb-3" value="A" />
  <ul class="space-y-1 text-slate-800"><li>Apple</li></ul>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Add a case-insensitive search box that filters the list.",
			caption:
				"Filtering works in any case now, but with no count or empty-state defined, a no-match search looks broken.",
			html: `<div class="p-8 max-w-md bg-white">
  <input class="w-full border border-slate-300 px-3 py-2 rounded mb-3" value="a" />
  <ul class="space-y-1 text-slate-800">
    <li class="rounded-lg bg-slate-50 px-3 py-2">Apple</li>
    <li class="rounded-lg bg-slate-50 px-3 py-2">Banana</li>
    <li class="rounded-lg bg-slate-50 px-3 py-2">Date</li>
  </ul>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Add a search box to filter the list. Done means: matching is case-insensitive, a live result count is shown above the list, and a clear \"No matches\" message appears when nothing matches.",
			caption:
				"Spells out the acceptance criteria — case-insensitive, a count, an empty state — so AI builds (and you can verify) all three.",
			html: `<div class="p-8 max-w-md bg-white">
  <input class="w-full rounded-xl border border-slate-300 px-4 py-3 mb-2" value="a" />
  <p class="text-xs font-semibold text-slate-500 mb-3">3 results</p>
  <ul class="space-y-1 text-slate-800">
    <li class="rounded-lg bg-slate-50 px-3 py-2">Apple</li>
    <li class="rounded-lg bg-slate-50 px-3 py-2">Banana</li>
    <li class="rounded-lg bg-slate-50 px-3 py-2">Date</li>
  </ul>
</div>`,
		},
	],

	// code-23-medium — "Ask for just the diff" (pricing card button colour). Output is a DIFF.
	"code-23-medium": [
		{
			tier: "weak",
			prompt: "change the button to blue",
			caption:
				"AI re-emits the whole component, so you have to re-read everything to spot the one line that actually changed.",
			html: `<pre class="m-0 p-4 bg-slate-900 text-slate-200 text-xs leading-5" style="white-space:pre-wrap"><code>&lt;div class="card"&gt;
  &lt;h2&gt;Starter&lt;/h2&gt;
  &lt;p&gt;$19/mo&lt;/p&gt;
  &lt;ul&gt;...&lt;/ul&gt;
  &lt;button class="bg-blue-600 ..."&gt;Choose plan&lt;/button&gt;
&lt;/div&gt;</code></pre>`,
		},
		{
			tier: "medium",
			prompt: "Change only the button to blue.",
			caption:
				"Scopes the change correctly, but AI still prints the full file back — you didn't ask it to show only the diff.",
			html: `<pre class="m-0 p-4 bg-slate-900 text-slate-200 text-xs leading-5" style="white-space:pre-wrap"><code>// full component re-printed
&lt;button class="bg-blue-600 text-white w-full py-2 rounded-lg"&gt;Choose plan&lt;/button&gt;
// ...plus every other line</code></pre>`,
		},
		{
			tier: "strong",
			prompt:
				"Change only the \"Choose plan\" button from green to blue. Leave the rest of the card exactly as it is, and show me just the line that changed — not the whole file.",
			caption:
				"Asks for one scoped change and the diff only — so you review two lines instead of the entire component.",
			html: `<pre class="m-0 p-4 bg-slate-900 text-xs leading-6" style="white-space:pre-wrap"><code><span style="color:#f87171">- &lt;button class="bg-green-600 ..."&gt;Choose plan&lt;/button&gt;</span>
<span style="color:#4ade80">+ &lt;button class="bg-blue-600 ..."&gt;Choose plan&lt;/button&gt;</span></code></pre>`,
		},
	],

	// code-24-medium — "Prompt for accessibility" (icon toolbar → labels + keyboard).
	"code-24-medium": [
		{
			tier: "weak",
			prompt: "make the toolbar nicer",
			caption:
				"Cosmetic only — the icons still have no labels, so a screen reader announces nothing and the buttons stay a mystery.",
			html: `<div class="p-8 bg-slate-50">
  <div class="flex gap-2">
    <button class="p-2 border rounded">🖨️</button>
    <button class="p-2 border rounded">❤️</button>
    <button class="p-2 border rounded">🗑️</button>
  </div>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Add labels to the icon buttons.",
			caption:
				"Adds accessible names — a real improvement — but doesn't ask for keyboard focus states, so it's still half-done.",
			html: `<div class="p-8 bg-slate-50">
  <div class="flex gap-2">
    <button aria-label="Print" class="p-2 border border-slate-300 rounded">🖨️</button>
    <button aria-label="Favorite" class="p-2 border border-slate-300 rounded">❤️</button>
    <button aria-label="Delete" class="p-2 border border-slate-300 rounded">🗑️</button>
  </div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Make this icon toolbar accessible: give every button an accessible label, add a visible text label beside each icon, and make sure each control is keyboard-focusable with a clear focus ring.",
			caption:
				"Names the accessibility needs explicitly — labels, visible text, keyboard focus — so AI builds it in for everyone.",
			html: `<div class="p-8 bg-slate-50">
  <div class="flex gap-2">
    <button aria-label="Print" class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">🖨️ Print</button>
    <button aria-label="Favorite" class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">❤️ Favorite</button>
    <button aria-label="Delete" class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">🗑️ Delete</button>
  </div>
</div>`,
		},
	],

	// code-25-medium — "Prompt for responsive behavior" (3-col grid that stacks on mobile).
	"code-25-medium": [
		{
			tier: "weak",
			prompt: "make it responsive",
			caption:
				"No behaviour described — AI tweaks a gap but keeps the fixed three columns, so it still squashes on a phone.",
			html: `<div class="p-8 bg-white">
  <div class="grid grid-cols-3 gap-2">
    <div class="bg-red-200 h-20 rounded"></div>
    <div class="bg-green-200 h-20 rounded"></div>
    <div class="bg-blue-200 h-20 rounded"></div>
  </div>
  <p class="mt-2 text-xs text-slate-400">Still 3 columns on every screen.</p>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Make the grid stack on small screens.",
			caption:
				"Mobile stacking works, but you didn't say what the desktop layout should be, so the three-across look is left to chance.",
			html: `<div class="p-8 bg-white">
  <div class="grid grid-cols-1 gap-4">
    <div class="bg-red-200 h-20 rounded-xl"></div>
    <div class="bg-green-200 h-20 rounded-xl"></div>
    <div class="bg-blue-200 h-20 rounded-xl"></div>
  </div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Make this grid responsive: on phones the boxes stack in a single column; on tablets and wider they sit three across with even spacing.",
			caption:
				"Describes the behaviour at each screen size — so AI builds a layout that stacks on mobile and spreads on desktop.",
			html: `<div class="p-8 bg-white">
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="bg-red-200 h-24 rounded-xl"></div>
    <div class="bg-green-200 h-24 rounded-xl"></div>
    <div class="bg-blue-200 h-24 rounded-xl"></div>
  </div>
  <p class="mt-3 text-xs text-slate-500">Stacks to one column on phones, three across on larger screens.</p>
</div>`,
		},
	],

	// code-26-hard — "Decompose a big feature into steps" (checkout → build step 1 only).
	"code-26-hard": [
		{
			tier: "weak",
			prompt: "build the whole checkout flow",
			caption:
				"Asks for the entire multi-step flow at once — AI returns a cramped, half-built jumble that's hard to trust or test.",
			html: `<div class="p-6 bg-slate-50 text-sm">
  <p class="font-bold">Checkout</p>
  <p>Cart · Shipping · Payment · Review (all crammed together)</p>
  <input class="border w-full my-1 px-2 py-1" placeholder="card number?" />
  <button class="bg-slate-900 text-white px-3 py-1 rounded">Pay now</button>
</div>`,
		},
		{
			tier: "medium",
			prompt: "Build the checkout as four steps, starting with cart review.",
			caption:
				"Names the steps, but builds them all together — the focus on \"just step one\" is lost, so step 1 isn't isolated.",
			html: `<div class="p-6 bg-slate-50">
  <h1 class="text-2xl font-black mb-2">Checkout</h1>
  <div class="rounded-xl bg-white p-4 border border-slate-200 space-y-1 text-sm">
    <div class="flex justify-between"><span>Wireless Headphones</span><span>$99</span></div>
    <div class="flex justify-between"><span>Smart Watch</span><span>$149</span></div>
  </div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"This checkout has four steps. Build only step 1 — the cart review — for now: show a \"Step 1 of 4\" indicator, the cart items with prices, a total, and a \"Continue to shipping\" button. We'll add the later steps after.",
			caption:
				"Breaks the big feature into steps and builds just the first — so each piece ships and is testable on its own.",
			html: `<div class="p-8 bg-slate-50">
  <h1 class="text-2xl font-black text-slate-950 mb-1">Checkout</h1>
  <p class="text-xs font-semibold text-emerald-600 mb-4">Step 1 of 4 · Cart review</p>
  <div class="space-y-2 rounded-2xl bg-white p-4 border border-slate-200">
    <div class="flex justify-between"><span>Wireless Headphones</span><span class="font-bold">$99</span></div>
    <div class="flex justify-between"><span>Smart Watch</span><span class="font-bold">$149</span></div>
    <div class="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-950"><span>Total</span><span>$248</span></div>
  </div>
  <button class="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-white font-bold">Continue to shipping</button>
</div>`,
		},
	],

	// code-27-hard — "Ask for tests alongside the code" (discount calculator). Output shows tests.
	"code-27-hard": [
		{
			tier: "weak",
			prompt: "write a function to apply a discount",
			caption:
				"You get a function, but nothing proves it's right — no tests, so edge cases like 0% or invalid input go unchecked.",
			html: `<pre class="m-0 p-4 bg-slate-900 text-emerald-200 text-xs leading-5" style="white-space:pre-wrap"><code>function applyDiscount(price, pct) {
  return price - price * pct / 100;
}</code></pre>`,
		},
		{
			tier: "medium",
			prompt: "Write a discount function and a couple of tests.",
			caption:
				"Adds a test or two, but \"a couple\" skips the edge cases — 0%, 100%, and invalid input aren't covered.",
			html: `<div class="p-5 bg-white font-mono text-sm space-y-2">
  <div class="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"><span class="font-bold">PASS</span> 20% of $50 → $40</div>
  <div class="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"><span class="font-bold">PASS</span> 50% of $100 → $50</div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Write a function that applies a percentage discount to a price, and write tests alongside it covering the key cases: 0% (no change), 100% (free), a normal discount, and invalid input.",
			caption:
				"Asks for tests with the code and names the cases — so you get a function plus proof it handles the edges.",
			html: `<div class="p-5 bg-white font-mono text-sm space-y-2">
  <div class="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"><span class="font-bold">PASS</span> 0% of $100 → $100</div>
  <div class="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"><span class="font-bold">PASS</span> 100% of $100 → $0</div>
  <div class="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"><span class="font-bold">PASS</span> 20% of $50 → $40</div>
  <div class="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"><span class="font-bold">PASS</span> invalid input → handled</div>
</div>`,
		},
	],

	// code-28-hard — "Hold AI to a design system" (alert built from tokens, not magic values).
	"code-28-hard": [
		{
			tier: "weak",
			prompt: "make an alert box",
			caption:
				"AI invents its own one-off colours and spacing — it looks fine alone but won't match the rest of your product.",
			html: `<div style="background:#ffe0e0;color:#a00;border:2px solid #f00;padding:10px;border-radius:4px;font-family:Arial">
  <strong>Heads up:</strong> Your trial ends in 3 days.
</div>`,
		},
		{
			tier: "medium",
			prompt: "Make an alert box using our amber warning color.",
			caption:
				"Right colour family, but with hard-coded values — it isn't tied to your tokens, so it'll drift when the system changes.",
			html: `<div style="background:#fef3c7;color:#92400e;border:1px solid #f59e0b;padding:14px;border-radius:10px;font-family:system-ui">
  <strong>Heads up:</strong> Your trial ends in 3 days.
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Build a warning alert using our design system: use the CSS custom properties --color-bg, --color-text, --color-border for colours and --space-sm / --space-md for spacing. Don't hard-code any hex values or pixel sizes.",
			caption:
				"Holds AI to the design tokens — so the alert is built from your system and stays consistent as it evolves.",
			html: `<style>
  :root { --color-bg:#fef3c7; --color-text:#92400e; --color-border:#f59e0b; --space-sm:8px; --space-md:16px; }
  .alert { background:var(--color-bg); color:var(--color-text); border:1px solid var(--color-border); border-radius:12px; padding:var(--space-md); margin:var(--space-md); display:flex; gap:var(--space-sm); font-family:system-ui,sans-serif; }
</style>
<div class="alert"><strong>Heads up:</strong> Your trial ends in 3 days.</div>`,
		},
	],

	// code-29-hard — "Debug from the error message" (handler runs before button exists).
	"code-29-hard": [
		{
			tier: "weak",
			prompt: "the save button is broken, fix it",
			caption:
				"No error shared — AI can't see what's wrong, so it guesses and rewrites code that still doesn't run.",
			html: `<div class="p-8 bg-slate-50">
  <button class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Save</button>
  <p class="mt-3 text-xs text-red-500">Console: Cannot read properties of null (addEventListener)</p>
</div>`,
		},
		{
			tier: "medium",
			prompt:
				"I get \"Cannot read properties of null\" on the Save button. Fix it.",
			caption:
				"Sharing the error helps AI find it, but with no detail on where, the fix is plausible yet not always the real cause.",
			html: `<div class="p-8 bg-slate-50">
  <button class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Save</button>
  <div class="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700">Added a null check</div>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"The console shows \"Cannot read properties of null (reading 'addEventListener')\" on the Save button. The script runs in the <head> before the button exists in the DOM. Fix the root cause so the handler attaches after the button is on the page.",
			caption:
				"Shares the exact error and the likely cause — so AI fixes the real bug (script order), not a guess.",
			html: `<div class="p-8 bg-slate-50">
  <button class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Save</button>
  <div class="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">✓ Saved! The click handler now runs after the button exists.</div>
</div>`,
		},
	],

	// code-30-hard — "Write a reusable prompt template" (testimonial card from a template).
	"code-30-hard": [
		{
			tier: "weak",
			prompt: "make a testimonial",
			caption:
				"A one-off ask with no structure — you'd have to re-describe everything from scratch for the next testimonial.",
			html: `<div class="p-6 bg-gray-100">
  <p>"Great product." — A. Customer</p>
</div>`,
		},
		{
			tier: "medium",
			prompt:
				"Make a testimonial card with a quote, the person's name, and their role.",
			caption:
				"Lists the parts, so this card is fine — but it's written for one case, not as a reusable, fill-in template.",
			html: `<div class="p-6 bg-gray-100 flex justify-center">
  <figure class="max-w-sm rounded-2xl bg-white p-6 border border-slate-200">
    <blockquote class="text-slate-800">"PromptPal made my prompts sharper."</blockquote>
    <figcaption class="mt-3 text-sm"><span class="font-bold text-slate-950">Amara Reed</span> — Product Designer</figcaption>
  </figure>
</div>`,
		},
		{
			tier: "strong",
			prompt:
				"Write a reusable testimonial-card template I can fill in each time. Use placeholders like {{quote}}, {{name}}, {{role}}, and {{initials}}: a rounded card with the quote on top, then an avatar circle with the initials beside the name and role. Render it once with Amara Reed, Product Designer as an example.",
			caption:
				"Builds a parameterised template with placeholders — so every future testimonial is one fill-in away, not a rewrite.",
			html: `<div class="p-6 bg-gray-100 flex justify-center">
  <figure class="max-w-sm rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
    <blockquote class="text-lg font-medium text-slate-800">"PromptPal made my prompts sharper in a week. The lessons just click."</blockquote>
    <figcaption class="mt-4 flex items-center gap-3">
      <div class="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-700">AR</div>
      <div>
        <p class="font-black text-slate-950">Amara Reed</p>
        <p class="text-sm text-slate-500">Product Designer</p>
      </div>
    </figcaption>
  </figure>
</div>`,
		},
	],
};

/**
 * Returns the weak→medium→strong examples for a coding level, or an empty array when
 * the level isn't a coding level or has no authored set (caller renders nothing).
 * Always sorted into canonical tier order so authoring order can't break the UI.
 */
export function getCodingPromptExamples(
	level?: Level | null,
): CodingPromptExample[] {
	if (!level || level.type !== "code") return [];
	const examples = codingPromptExamplesById[level.id];
	if (!Array.isArray(examples) || examples.length === 0) return [];
	return [...examples].sort(
		(a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier),
	);
}
