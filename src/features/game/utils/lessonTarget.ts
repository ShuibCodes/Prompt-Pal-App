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

const codingTargetHtmlById: Record<string, string> = {
	"code-1-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-slate-50">
    <section class="min-h-[220px] px-8 py-10 flex flex-col items-center justify-center text-center bg-white">
      <p class="text-xs font-bold tracking-[0.2em] uppercase text-emerald-600 mb-3">PromptPal Studio</p>
      <h1 class="text-4xl font-black tracking-tight text-slate-950 mb-4">Build Better Prompts</h1>
      <p class="text-base leading-7 text-slate-600 max-w-xl mb-6">Turn rough ideas into clear instructions that help AI create polished interfaces faster.</p>
      <button class="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Start Building</button>
    </section>
  </body>
</html>`,
	"code-2-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white">
    <nav class="w-full px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
      <div class="text-lg font-black text-slate-950">Northstar</div>
      <div class="flex items-center gap-5 text-sm font-semibold text-slate-600">
        <a href="#">Product</a>
        <a href="#">Pricing</a>
        <a href="#">Docs</a>
      </div>
      <button class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Get Started</button>
    </nav>
  </body>
</html>`,
	"code-3-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white p-8">
    <h1 class="text-2xl font-bold mb-6">Contact Us</h1>
    <form class="max-w-md space-y-4">
      <input class="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Name" />
      <input class="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Email" />
      <textarea class="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-24" placeholder="Message"></textarea>
      <button class="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Submit Message</button>
    </form>
  </body>
</html>`,
	"code-4-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-slate-50 p-8">
    <button class="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</button>
    <div class="mt-6 max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="text-xl font-black text-slate-950 mb-2">Create your account</h2>
      <p class="text-sm text-slate-600 mb-4">Enter your email to continue.</p>
      <input class="w-full rounded-xl border border-slate-300 px-4 py-3 mb-3" placeholder="Email address" />
      <button class="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">Continue</button>
    </div>
  </body>
</html>`,
	"code-5-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8">
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
  </body>
</html>`,
	"code-6-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white p-8">
    <form class="max-w-sm space-y-3">
      <input type="text" placeholder="Email" class="border border-red-300 p-3 w-full rounded-xl" />
      <p class="text-sm font-semibold text-red-600">Email is required.</p>
      <button class="bg-blue-600 text-white px-4 py-3 rounded-xl font-bold">Submit</button>
    </form>
  </body>
</html>`,
	"code-7-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-slate-950 text-white">
    <header class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold">My App</h1>
      <button class="rounded-full border border-white/20 px-4 py-2 text-sm font-bold">Dark Mode On</button>
    </header>
    <main>
      <p class="text-slate-300">Welcome to my app.</p>
    </main>
  </body>
</html>`,
	"code-8-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-white">
    <h1 class="text-2xl font-bold mb-4">Users</h1>
    <div class="grid gap-3">
      <div class="rounded-xl border border-slate-200 p-4">Leona Park</div>
      <div class="rounded-xl border border-slate-200 p-4">Mateo Ivers</div>
      <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">No users found yet.</div>
      <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">Could not load users. Try again.</div>
    </div>
  </body>
</html>`,
	"code-9-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-slate-100">
    <div class="border border-slate-200 rounded-2xl p-6 w-72 bg-white shadow-sm space-y-4">
      <h2 class="text-2xl font-black text-slate-950">Card Title</h2>
      <p class="text-slate-600 leading-6">This is the card description text.</p>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Action</button>
    </div>
  </body>
</html>`,
	"code-10-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <header class="bg-gray-800 text-white p-4 flex items-center justify-between">
      <h1 class="text-xl font-bold">My App</h1>
      <nav class="flex items-center gap-4">
        <a href="#" class="text-gray-300">Dashboard</a>
        <a href="#" class="text-gray-300">Settings</a>
        <button class="rounded-lg bg-white px-3 py-1 text-sm font-bold text-gray-800">Logout</button>
      </nav>
    </header>
  </body>
</html>`,
	"code-11-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-16 bg-slate-100 flex justify-center">
    <div class="w-72 rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
      <p class="text-xs font-black tracking-[0.2em] text-emerald-600 uppercase mb-3">Most Popular</p>
      <h2 class="text-2xl font-black text-slate-950">Pro Plan</h2>
      <p class="mt-3 text-4xl font-black">$29<span class="text-base text-slate-500">/mo</span></p>
      <ul class="mt-6 space-y-3 text-sm text-slate-700">
        <li>Feature one</li>
        <li>Feature two</li>
        <li>Feature three</li>
      </ul>
      <button class="mt-7 w-full rounded-2xl bg-slate-950 px-4 py-3 font-bold text-white">Get Started</button>
    </div>
  </body>
</html>`,
	"code-12-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
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
  </body>
</html>`,
	"code-13-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-white">
    <form class="space-y-4 max-w-sm rounded-2xl border border-slate-200 p-5">
      <input type="text" placeholder="Username" class="border p-2 w-full rounded" />
      <input type="password" placeholder="Password" class="border p-2 w-full rounded" />
      <button class="bg-blue-600 text-white px-4 py-2 rounded w-full font-bold">Login</button>
      <div class="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">Includes loading, error handling, and no hardcoded secrets.</div>
    </form>
  </body>
</html>`,
	"code-14-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-slate-50 p-8">
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
  </body>
</html>`,
	"code-15-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-gray-100">
    <article class="max-w-sm rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
      <div class="mb-4 h-12 w-12 rounded-full bg-emerald-100"></div>
      <h2 class="text-2xl font-black text-slate-950">Leanne Graham</h2>
      <p class="text-slate-600">Bret · Romaguera-Crona</p>
      <p class="mt-4 text-sm text-slate-500">Loading and error states are handled before this card appears.</p>
    </article>
  </body>
</html>`,
	"code-16-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100 p-6">
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div class="bg-slate-200 h-24 rounded-xl mb-3"></div>
        <h3 class="font-black text-slate-950">Wireless Headphones</h3>
        <p class="text-slate-600 mb-2">$99</p>
        <button class="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white">Buy</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div class="bg-slate-200 h-24 rounded-xl mb-3"></div>
        <h3 class="font-black text-slate-950">Smart Watch</h3>
        <p class="text-slate-600 mb-2">$149</p>
        <button class="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white">Buy</button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div class="bg-slate-200 h-24 rounded-xl mb-3"></div>
        <h3 class="font-black text-slate-950">Bluetooth Speaker</h3>
        <p class="text-slate-600 mb-2">$79</p>
        <button class="rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white">Buy</button>
      </div>
    </div>
  </body>
</html>`,
	"code-17-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 text-center bg-slate-50">
    <h1 class="text-2xl font-black text-slate-950 mb-6">Launch in:</h1>
    <div class="flex justify-center gap-3">
      <div class="rounded-2xl bg-slate-950 text-white px-5 py-4"><span class="block text-3xl font-black">02</span><span class="text-xs text-slate-300">days</span></div>
      <div class="rounded-2xl bg-slate-950 text-white px-5 py-4"><span class="block text-3xl font-black">14</span><span class="text-xs text-slate-300">hrs</span></div>
      <div class="rounded-2xl bg-slate-950 text-white px-5 py-4"><span class="block text-3xl font-black">37</span><span class="text-xs text-slate-300">min</span></div>
      <div class="rounded-2xl bg-emerald-600 text-white px-5 py-4"><span class="block text-3xl font-black">09</span><span class="text-xs text-emerald-100">sec</span></div>
    </div>
  </body>
</html>`,
	"code-18-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-white max-w-lg">
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
  </body>
</html>`,
	"code-19-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-slate-50">
    <div class="flex gap-3">
      <button class="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">Primary</button>
      <button class="bg-slate-200 text-slate-800 px-5 py-2.5 rounded-lg font-medium">Secondary</button>
    </div>
  </body>
</html>`,
	"code-20-easy": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 max-w-md bg-white">
    <h1 class="text-2xl font-black text-slate-950 mb-4">My Tasks</h1>
    <div class="flex gap-2 mb-4">
      <input class="flex-1 rounded-xl border border-slate-300 px-4 py-3" placeholder="Add a task" />
      <button class="rounded-xl bg-slate-950 px-4 py-3 text-white font-bold">Add</button>
    </div>
    <div class="space-y-2">
      <div class="rounded-xl border border-slate-200 p-3">Buy groceries</div>
      <div class="rounded-xl border border-slate-200 p-3">Call the dentist</div>
    </div>
  </body>
</html>`,
	"code-21-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-slate-50">
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
  </body>
</html>`,
	"code-22-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 max-w-md bg-white">
    <input class="w-full rounded-xl border border-slate-300 px-4 py-3 mb-2" value="a" />
    <p class="text-xs font-semibold text-slate-500 mb-3">3 results</p>
    <ul class="space-y-1 text-slate-800">
      <li class="rounded-lg bg-slate-50 px-3 py-2">Apple</li>
      <li class="rounded-lg bg-slate-50 px-3 py-2">Banana</li>
      <li class="rounded-lg bg-slate-50 px-3 py-2">Date</li>
    </ul>
  </body>
</html>`,
	"code-23-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-gray-100 flex justify-center">
    <div class="bg-white rounded-xl shadow p-6 w-72 border border-slate-200">
      <h2 class="text-lg font-black text-slate-950">Starter</h2>
      <p class="text-3xl font-black my-2 text-slate-950">$19<span class="text-base font-normal text-slate-500">/mo</span></p>
      <ul class="text-slate-600 space-y-1 my-4">
        <li>5 projects</li>
        <li>2 GB storage</li>
        <li>Email support</li>
      </ul>
      <button class="bg-blue-600 text-white w-full py-2 rounded-lg font-bold">Choose plan</button>
    </div>
  </body>
</html>`,
	"code-24-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-slate-50">
    <div class="flex gap-2">
      <button aria-label="Print" class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">🖨️ Print</button>
      <button aria-label="Favorite" class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">❤️ Favorite</button>
      <button aria-label="Delete" class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">🗑️ Delete</button>
    </div>
  </body>
</html>`,
	"code-25-medium": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-white">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-red-200 h-24 rounded-xl"></div>
      <div class="bg-green-200 h-24 rounded-xl"></div>
      <div class="bg-blue-200 h-24 rounded-xl"></div>
    </div>
    <p class="mt-3 text-xs text-slate-500">Stacks to one column on phones, three across on larger screens.</p>
  </body>
</html>`,
	"code-26-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 max-w-lg bg-slate-50">
    <h1 class="text-2xl font-black text-slate-950 mb-1">Checkout</h1>
    <p class="text-xs font-semibold text-emerald-600 mb-4">Step 1 of 4 · Cart review</p>
    <div class="space-y-2 rounded-2xl bg-white p-4 border border-slate-200">
      <div class="flex justify-between"><span>Wireless Headphones</span><span class="font-bold">$99</span></div>
      <div class="flex justify-between"><span>Smart Watch</span><span class="font-bold">$149</span></div>
      <div class="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-950"><span>Total</span><span>$248</span></div>
    </div>
    <button class="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-white font-bold">Continue to shipping</button>
  </body>
</html>`,
	"code-27-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-white">
    <h1 class="text-xl font-black text-slate-950 mb-4">Price calculator</h1>
    <div class="space-y-2 font-mono text-sm">
      <div class="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"><span class="font-bold">PASS</span> 0% of $100 → $100</div>
      <div class="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"><span class="font-bold">PASS</span> 100% of $100 → $0</div>
      <div class="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"><span class="font-bold">PASS</span> 20% of $50 → $40</div>
      <div class="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700"><span class="font-bold">PASS</span> invalid input → handled</div>
    </div>
  </body>
</html>`,
	"code-28-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        --color-bg: #fef3c7;
        --color-text: #92400e;
        --color-border: #f59e0b;
        --space-sm: 8px;
        --space-md: 16px;
      }
      .alert {
        background: var(--color-bg);
        color: var(--color-text);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        padding: var(--space-md);
        margin: var(--space-md);
        display: flex;
        gap: var(--space-sm);
        font-family: system-ui, sans-serif;
      }
    </style>
  </head>
  <body>
    <div class="alert"><strong>Heads up:</strong> Your trial ends in 3 days.</div>
  </body>
</html>`,
	"code-29-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-slate-50">
    <button class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">Save</button>
    <div class="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">✓ Saved! The click handler now runs after the button exists.</div>
  </body>
</html>`,
	"code-30-hard": `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="p-8 bg-gray-100 flex justify-center">
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
  </body>
</html>`,
};

export function getCodingLessonTargetHtml(level?: Level | null): string | null {
	if (!level || level.type !== "code") return null;
	return codingTargetHtmlById[level.id] ?? null;
}
