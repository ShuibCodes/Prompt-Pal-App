/**
 * Generates static "goal" screenshots for coding challenges.
 *
 * Why: the challenge screen used to render each target in a live WebView, which
 * is laggy. We pre-render each lesson's goal to a bundled PNG instead, so the
 * screen just shows an <Image>. Run this once (and again whenever a goal design
 * changes) to regenerate the assets.
 *
 * Usage:
 *   bun add -d playwright && bunx playwright install chromium
 *   node scripts/generate-coding-goal-images.mjs
 *
 * Output: assets/images/coding/<lessonId>-goal.png
 *
 * One goal image per lesson (no "now" / no side-by-side). Each goal shows the
 * SUCCESS state the learner is trying to produce — for behavioural lessons
 * (modal, timer, validation, accordion, empty-state) that means a representative
 * snapshot of the working result.
 *
 * Shared design language (keep consistent across every target):
 *   system font, slate text, emerald/blue accents, slate-950 primary buttons,
 *   white surfaces, rounded corners, subtle borders/shadows.
 */
import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../assets/images/coding");

/** Goal HTML (card/content only) for each launch coding lesson, keyed by id. */
const GOALS = {
	// Build a hero section from a blank page.
	"code-1-easy": `
    <section class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div class="px-7 py-10 text-center">
        <h1 class="text-3xl font-black tracking-tight text-slate-950">Find your calm</h1>
        <p class="mt-3 text-base text-slate-500">Guided breathing and sleep stories to help you unwind every night.</p>
        <button class="mt-6 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white">Start free trial</button>
      </div>
    </section>`,

	// Build a navigation bar.
	"code-2-easy": `
    <nav class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
      <div class="text-lg font-black text-slate-950">&#9670; Acme</div>
      <div class="flex items-center gap-4 text-sm font-semibold text-slate-500">
        <span>Home</span><span>Features</span><span>Pricing</span>
        <button class="rounded-lg bg-slate-950 px-3 py-1.5 text-white">Sign in</button>
      </div>
    </nav>`,

	// Add a contact form below the existing heading.
	"code-3-easy": `
    <div>
      <h1 class="text-2xl font-black text-slate-950">Contact Us</h1>
      <form class="mt-5 space-y-3">
        <input class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700" placeholder="Name" />
        <input class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700" placeholder="Email" />
        <textarea class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700" rows="3" placeholder="Message"></textarea>
        <button class="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Send message</button>
      </form>
    </div>`,

	// Clicking "Sign Up" shows a sign-up modal (the working outcome).
	"code-4-easy": `
    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-black text-slate-950">Create your account</h2>
        <span class="text-slate-400">&#10005;</span>
      </div>
      <div class="mt-4 space-y-3">
        <input class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700" placeholder="Email" />
        <input type="password" class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700" placeholder="Password" />
        <button class="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Sign up</button>
      </div>
    </div>`,

	// Recolor the header (emerald) while links + content stay intact.
	"code-5-easy": `
    <div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <header class="bg-emerald-600 px-5 py-4 text-white">
        <h1 class="text-xl font-black">My App</h1>
        <nav class="mt-2 flex gap-4 text-sm text-emerald-50">
          <span>Home</span><span>About</span><span>Contact</span>
        </nav>
      </header>
      <main class="bg-white px-5 py-5">
        <p class="text-slate-600">Welcome to my app.</p>
      </main>
    </div>`,

	// Bug fixed: empty email shows a clear validation error.
	"code-6-medium": `
    <form class="space-y-2">
      <label class="text-sm font-semibold text-slate-700">Email</label>
      <input class="w-full rounded-xl border-2 border-red-400 px-4 py-3 text-sm text-slate-700" placeholder="Email" />
      <p class="text-sm font-medium text-red-500">Please enter your email before submitting.</p>
      <button class="mt-2 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Submit</button>
    </form>`,

	// Edge cases handled: a friendly empty state instead of nothing.
	"code-8-medium": `
    <div>
      <h1 class="mb-4 text-2xl font-black text-slate-950">Users</h1>
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
        <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-lg font-black text-slate-500">!</div>
        <p class="text-sm font-semibold text-slate-700">No users found</p>
        <p class="mt-1 text-xs text-slate-500">There&#39;s nothing to show right now. Please try again later.</p>
      </div>
    </div>`,

	// Refined card: larger title, more breathing room.
	"code-9-medium": `
    <div class="w-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-black text-slate-950">Card Title</h2>
      <p class="mt-3 text-sm text-slate-500">This is the card description text.</p>
      <button class="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">Action</button>
    </div>`,

	// Pricing card, visually polished.
	"code-11-hard": `
    <div class="w-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
      <p class="text-xs font-bold uppercase tracking-widest text-emerald-600">Pro Plan</p>
      <p class="mt-2 text-4xl font-black text-slate-950">$29<span class="text-base font-semibold text-slate-400">/mo</span></p>
      <ul class="mt-4 space-y-2 text-sm text-slate-600">
        <li class="flex items-center gap-2"><span class="text-emerald-500">&#10003;</span> Unlimited projects</li>
        <li class="flex items-center gap-2"><span class="text-emerald-500">&#10003;</span> Priority support</li>
        <li class="flex items-center gap-2"><span class="text-emerald-500">&#10003;</span> Advanced analytics</li>
      </ul>
      <button class="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Get Started</button>
    </div>`,

	// Show, don't tell: one card became three matching cards.
	"code-16-easy": `
    <div class="grid grid-cols-3 gap-3">
      <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div class="mb-2 h-16 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300"></div>
        <h3 class="text-xs font-bold text-slate-950">Headphones</h3>
        <p class="text-xs text-slate-500">$99</p>
        <button class="mt-1.5 w-full rounded-md bg-blue-600 px-2 py-1 text-[11px] font-bold text-white">Buy</button>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div class="mb-2 h-16 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300"></div>
        <h3 class="text-xs font-bold text-slate-950">Keyboard</h3>
        <p class="text-xs text-slate-500">$59</p>
        <button class="mt-1.5 w-full rounded-md bg-blue-600 px-2 py-1 text-[11px] font-bold text-white">Buy</button>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div class="mb-2 h-16 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300"></div>
        <h3 class="text-xs font-bold text-slate-950">Mouse</h3>
        <p class="text-xs text-slate-500">$39</p>
        <button class="mt-1.5 w-full rounded-md bg-blue-600 px-2 py-1 text-[11px] font-bold text-white">Buy</button>
      </div>
    </div>`,

	// Countdown timer below the heading.
	"code-17-easy": `
    <div class="text-center">
      <h1 class="text-2xl font-black text-slate-950">Launch in:</h1>
      <div class="mt-4 flex justify-center gap-2">
        <div class="rounded-xl bg-slate-950 px-3 py-3 text-white"><div class="text-2xl font-black">04</div><div class="text-[10px] uppercase tracking-widest text-slate-400">Days</div></div>
        <div class="rounded-xl bg-slate-950 px-3 py-3 text-white"><div class="text-2xl font-black">12</div><div class="text-[10px] uppercase tracking-widest text-slate-400">Hrs</div></div>
        <div class="rounded-xl bg-slate-950 px-3 py-3 text-white"><div class="text-2xl font-black">37</div><div class="text-[10px] uppercase tracking-widest text-slate-400">Min</div></div>
        <div class="rounded-xl bg-slate-950 px-3 py-3 text-white"><div class="text-2xl font-black">09</div><div class="text-[10px] uppercase tracking-widest text-slate-400">Sec</div></div>
      </div>
    </div>`,

	// FAQ reformatted as a collapsible accordion (first item open).
	"code-18-easy": `
    <div>
      <h1 class="mb-4 text-2xl font-black text-slate-950">FAQ</h1>
      <div class="space-y-2">
        <div class="rounded-xl border border-slate-200 bg-white">
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-sm font-semibold text-slate-900">How do I reset my password?</span>
            <span class="text-slate-400">&#9662;</span>
          </div>
          <div class="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">Visit Settings and click Reset Password.</div>
        </div>
        <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span class="text-sm font-semibold text-slate-900">Can I change my plan?</span>
          <span class="text-slate-400">&#9656;</span>
        </div>
        <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span class="text-sm font-semibold text-slate-900">How do I contact support?</span>
          <span class="text-slate-400">&#9656;</span>
        </div>
      </div>
    </div>`,

	// Match a reference: a Secondary button beside the Primary one.
	"code-19-easy": `
    <div class="flex items-center gap-3">
      <button class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white">Primary</button>
      <button class="rounded-lg bg-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700">Secondary</button>
    </div>`,

	// Simplest version first: an input that adds typed items to a list.
	"code-20-easy": `
    <div>
      <h1 class="mb-4 text-2xl font-black text-slate-950">My Tasks</h1>
      <div class="flex gap-2">
        <input class="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700" placeholder="Add a task&#8230;" />
        <button class="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">Add</button>
      </div>
      <ul class="mt-4 space-y-2">
        <li class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">Buy groceries</li>
        <li class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">Finish report</li>
      </ul>
    </div>`,
};

function wrap(inner) {
	return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      html, body { margin: 0; background: #eef2f6; }
      #shot {
        width: 420px;
        padding: 28px;
        background: #ffffff;
        box-sizing: border-box;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="shot">${inner}</div>
  </body>
</html>`;
}

async function main() {
	await rm(OUT_DIR, { recursive: true, force: true });
	await mkdir(OUT_DIR, { recursive: true });
	const browser = await chromium.launch();
	const page = await browser.newPage({ deviceScaleFactor: 2 });

	let count = 0;
	for (const [id, inner] of Object.entries(GOALS)) {
		await page.setContent(wrap(inner), { waitUntil: "networkidle" });
		// Tailwind Play CDN applies styles a tick after load; give it a moment.
		await page.waitForTimeout(1200);
		const el = await page.$("#shot");
		const file = path.join(OUT_DIR, `${id}-goal.png`);
		await el.screenshot({ path: file });
		count += 1;
		console.log(`\u2713 ${path.relative(process.cwd(), file)}`);
	}

	await browser.close();
	console.log(`\nDone — generated ${count} image(s) in ${path.relative(process.cwd(), OUT_DIR)}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
