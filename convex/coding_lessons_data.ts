/**
 * Onboarding-style coding lessons for the Coding module.
 * Teaches prompt engineering for AI-assisted web development.
 * Used to seed dev and prod databases.
 * IDs: code-1-easy through code-5-easy, code-6-medium through code-10-medium, code-11-hard through code-15-hard
 *
 * IMPORTANT: Never change lesson IDs. User progress (userProgress table) is keyed by levelId.
 * Changing instruction, title, grading, hints, etc. is safe—only ID changes would orphan progress.
 */

const CODE_IDS = [
	"code-1-easy",
	"code-2-easy",
	"code-3-easy",
	"code-4-easy",
	"code-5-easy",
	"code-6-medium",
	"code-7-medium",
	"code-8-medium",
	"code-9-medium",
	"code-10-medium",
	"code-11-hard",
	"code-12-hard",
	"code-13-hard",
	"code-14-hard",
	"code-15-hard",
	"code-16-easy",
	"code-17-easy",
	"code-18-easy",
	"code-19-easy",
	"code-20-easy",
	"code-21-medium",
	"code-22-medium",
	"code-23-medium",
	"code-24-medium",
	"code-25-medium",
	"code-26-hard",
	"code-27-hard",
	"code-28-hard",
	"code-29-hard",
	"code-30-hard",
];

const codingLessonScaffolds: Record<
	string,
	{
		scaffoldTemplate?: string;
		checklistItems?: string[];
	}
> = {
	[CODE_IDS[0]]: {
		scaffoldTemplate:
			"Build a hero section with a [headline], [supporting text], and a [button label]",
		checklistItems: ["Headline", "Supporting text", "Button label"],
	},
	[CODE_IDS[1]]: {
		scaffoldTemplate:
			"Build a navigation bar using [tech stack] with [number] links and a [style direction] look",
		checklistItems: ["Tech stack", "Navigation links", "Visual style"],
	},
	[CODE_IDS[2]]: {
		scaffoldTemplate:
			"Add a contact form below the heading with [fields] and a [submit button], and leave the [existing element] unchanged",
		checklistItems: [
			"Requested fields",
			"Submit button",
			"Leave existing heading unchanged",
		],
	},
	[CODE_IDS[3]]: {
		scaffoldTemplate:
			"When the Sign Up button is clicked, show a [user outcome] with [key detail] and keep the experience [tone]",
		checklistItems: ["User outcome", "Key UI detail", "Experience tone"],
	},
	[CODE_IDS[4]]: {
		scaffoldTemplate:
			"Change the header [element] to [new style] and do not modify the [protected areas]",
		checklistItems: ["Target element", "New style", "Protected areas"],
	},
	[CODE_IDS[5]]: {
		checklistItems: ["Bug description", "Where it happens", "Expected behavior"],
	},
	[CODE_IDS[6]]: {
		checklistItems: ["Ask AI to plan first", "No code yet", "Outline the approach"],
	},
	[CODE_IDS[7]]: {
		checklistItems: ["Empty state", "Error state", "Desired user experience"],
	},
	[CODE_IDS[8]]: {
		checklistItems: ["Spacing change", "Typography change", "Visual direction"],
	},
	[CODE_IDS[9]]: {
		checklistItems: ["Use non-technical language", "Describe the experience", "Name the main interaction"],
	},
	[CODE_IDS[15]]: {
		scaffoldTemplate:
			"Here's an example of the pattern I want: [example]. Now build [what to build] the same way, matching [what to match]",
		checklistItems: ["The example to copy", "What to build", "What to match"],
	},
	[CODE_IDS[16]]: {
		scaffoldTemplate:
			"Build [feature], but do not [what to avoid] and keep it [the limit]",
		checklistItems: ["What to build", "What to avoid", "The limit"],
	},
	[CODE_IDS[17]]: {
		scaffoldTemplate:
			"Reformat [content] as [output format], with [specific detail]",
		checklistItems: ["The content", "Output format", "Specific detail"],
	},
	[CODE_IDS[18]]: {
		scaffoldTemplate:
			"Add [new element] and match the existing [reference element], especially its [shared traits]",
		checklistItems: ["New element", "Reference element", "Shared traits"],
	},
	[CODE_IDS[19]]: {
		scaffoldTemplate:
			"Build the simplest version of [feature] first: just [the core], with no [extras yet]",
		checklistItems: ["The feature", "The core only", "Extras to skip for now"],
	},
	[CODE_IDS[20]]: {
		checklistItems: ["The role AI should take", "The task", "The quality standard"],
	},
	[CODE_IDS[21]]: {
		checklistItems: ["The feature", "Acceptance criteria", "How to verify it"],
	},
	[CODE_IDS[22]]: {
		checklistItems: ["The single change", "Show only what changed", "Leave the rest intact"],
	},
	[CODE_IDS[23]]: {
		checklistItems: ["The controls", "Accessible labels", "Keyboard support"],
	},
	[CODE_IDS[24]]: {
		checklistItems: ["The layout", "Mobile behavior", "Desktop behavior"],
	},
};

const codingLessonsBase = [
	{
		id: CODE_IDS[0],
		title: "Describe the outcome, not the code",
		instruction:
			"This page needs a hero section. Craft a prompt that describes what you want the user to see: a headline, supporting text, and a button. Use your own words; don't copy this instruction.",
		whatUserSees:
			"A blank webpage. The body is empty. Nothing at the top yet: no headline, no subtext, no call to action.",
		hint: "Describe what the user sees: the headline text, the subtext, and what the button says and does. Don't describe the HTML or code.",
		starterCode: "<html>\n  <body>\n  </body>\n</html>",
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "has_hero_section",
					description:
						"The generated code contains a visible section at the top of the page.",
					method: "static_analysis",
					weight: 1,
					required: true,
				},
				{
					id: "has_heading",
					description:
						"The hero section has a heading that describes what the page or product is.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "has_subtext_or_cta",
					description:
						"The hero section has either a subheading, a description, or a call to action button.",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
				{
					id: "visually_distinct",
					description:
						"The hero section is visually distinct from the rest of the page through color, size, or spacing.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 3 out of 6.",
			perfectScore: "All four criteria pass.",
		},
		failState: {
			condition: "has_hero_section passes but has_heading fails.",
			nudge:
				"There's a section there, but what is this page about? Give it a headline.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Good. You described what the user sees and AI filled it in. That's how every feature starts.",
		},
		lessonTakeaway:
			"Describe what appears on screen (headline, text, button), not the HTML or code structure.",
	},
	{
		id: CODE_IDS[1],
		title: "Name your tech stack",
		instruction:
			"This page needs a navigation bar. Craft a prompt that tells AI what to build and that you're using Tailwind for styling. Use your own words.",
		whatUserSees:
			"A page with Tailwind CSS loaded. The body is empty: no navbar, no links, nothing to navigate yet.",
		hint: "Explicitly tell AI you're using Tailwind CSS. AI doesn't know your stack unless you say so.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "has_navbar",
					description: "The generated code contains a navigation bar element.",
					method: "static_analysis",
					weight: 1,
					required: true,
				},
				{
					id: "has_nav_links",
					description: "The navbar contains at least two navigation links.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "uses_tailwind",
					description:
						"The navbar is styled using Tailwind CSS classes, not inline styles or a separate stylesheet.",
					method: "static_analysis",
					weight: 2,
					required: false,
				},
				{
					id: "visually_complete",
					description:
						"The navbar looks like a real navbar: horizontal layout, readable links, and some background color or border.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 3 out of 6.",
			perfectScore: "All four criteria pass.",
		},
		failState: {
			condition: "has_navbar passes but uses_tailwind fails.",
			nudge:
				"The navbar is there but AI didn't use Tailwind. Did you tell it what styling system to use?",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"When you tell AI your stack, it stops guessing and starts fitting.",
		},
		lessonTakeaway:
			"Always name your tech stack in the prompt. AI defaults to its own assumptions otherwise.",
	},
	{
		id: CODE_IDS[2],
		title: "Scope to one change at a time",
		instruction:
			"This page needs a contact form below the heading. Craft a prompt that asks for name, email, and message fields plus a submit button, and explicitly tells AI to leave the existing heading untouched. Use your own words.",
		whatUserSees:
			"A contact page with a bold 'Contact Us' heading at the top. Nothing below it: no form fields, no submit button yet.",
		hint: "Ask only for the form. Tell AI to leave the heading exactly as it is.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body>\n    <h1 class="text-2xl font-bold p-8">Contact Us</h1>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "has_form",
					description: "The generated code contains a form element.",
					method: "static_analysis",
					weight: 1,
					required: true,
				},
				{
					id: "has_required_fields",
					description:
						"The form has at least a name field, an email field, and a message field.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "has_submit_button",
					description: "The form has a submit button.",
					method: "static_analysis",
					weight: 1,
					required: true,
				},
				{
					id: "nothing_else_changed",
					description:
						"The existing h1 heading is still present and nothing outside the form was modified.",
					method: "static_analysis",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 6.",
			perfectScore: "All four criteria pass.",
		},
		failState: {
			condition: "has_form passes but nothing_else_changed fails.",
			nudge:
				"AI changed more than just the form. Try telling it exactly what to add and what to leave alone.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"One prompt, one task. That's how you stay in control of what AI builds.",
		},
		lessonTakeaway:
			"Scoping your prompt to one feature at a time keeps AI from making changes you didn't ask for.",
	},
	{
		id: CODE_IDS[3],
		title: "Describe what happens, not how",
		instruction:
			"The Sign Up button does nothing when clicked. Craft a prompt that describes what the user should see or experience when they click it (e.g. a modal, a form, a message). Describe the outcome, not the code. Use your own words.",
		whatUserSees:
			"A page with a blue Sign Up button. When you click it, nothing happens: no modal, no redirect, no feedback.",
		hint: "Describe what the user sees and experiences (e.g. 'show a modal with email and password fields'). Don't mention event listeners or JavaScript.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <button class="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</button>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "has_click_behavior",
					description:
						"The button has a meaningful action when clicked (e.g. shows an alert or modal).",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "behavior_is_meaningful",
					description:
						"The behavior is something a real user would expect: a signup form, a redirect, or a confirmation.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "prompt_used_user_language",
					description:
						"The prompt describes the experience ('show a modal') instead of technical terms ('add an event listener').",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 6.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "has_click_behavior passes but behavior_is_meaningful fails.",
			nudge:
				"The button does something, but it's not meaningful to a user. What should they actually see or experience?",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"AI figures out the how when you give it the what. You don't need to write the code in your prompt.",
		},
		lessonTakeaway:
			"Describe what the user experiences, not what the code should do. AI handles the implementation.",
	},
	{
		id: CODE_IDS[4],
		title: "Protect what must stay the same",
		instruction:
			"The header is dark gray. Craft a prompt that asks for a different header color and explicitly tells AI not to touch the nav links or main content. Use your own words.",
		whatUserSees:
			"A page with a dark gray header bar showing 'My App' and links (Home, About, Contact). Below that, main content: 'Welcome to my app.'",
		hint: "Tell AI exactly what to change (the header color) and what to leave alone (the links and main content).",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <header class="bg-gray-800 text-white p-4">\n      <h1 class="text-2xl font-bold">My App</h1>\n      <nav class="mt-2">\n        <a href="#" class="text-gray-300 mr-4">Home</a>\n        <a href="#" class="text-gray-300 mr-4">About</a>\n        <a href="#" class="text-gray-300">Contact</a>\n      </nav>\n    </header>\n    <main class="mt-8">\n      <p class="text-gray-600">Welcome to my app.</p>\n    </main>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "header_color_changed",
					description:
						"The header background color is different from the original hex value (#1f2937 / gray-800).",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "nav_links_intact",
					description:
						"All navigation links (Home, About, Contact) are still present and visible.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "main_content_intact",
					description:
						"The 'Welcome to my app' message and main section are completely untouched.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition:
				"header_color_changed passes but main_content_intact or nav_links_intact fails.",
			nudge:
				"AI changed more than the header. Try explicitly telling it what not to touch.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Telling AI what to leave alone is just as important as telling it what to change.",
		},
		lessonTakeaway:
			"Always tell AI what not to modify. Without guardrails, it will helpfully break things that were already working.",
	},
	{
		id: CODE_IDS[5],
		title: "Report bugs: what's wrong, where, and expected",
		instruction:
			"This form has a bug: it submits when the email field is empty. Craft a prompt that describes what's wrong, where it happens, and what should happen instead. Use your own words.",
		whatUserSees:
			"A form with an email field and a Submit button. If you leave the email empty and click Submit, it still shows 'Form submitted!': no validation, no error message.",
		hint: "Include three things: what's wrong (submits when empty), where (the email field), and what should happen instead (show error, block submit).",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <form id="contactForm" class="space-y-4">\n      <input type="text" placeholder="Email" class="border p-2 w-full rounded" />\n      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>\n    </form>\n    <script>\n      document.getElementById(\'contactForm\').addEventListener(\'submit\', function(e) {\n        e.preventDefault();\n        alert(\'Form submitted!\');\n      });\n    </script>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "has_validation",
					description:
						"The form shows a clear error message if the email field is left empty.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "shows_error_message",
					description:
						"The error message is visible to the user and explains what they need to do.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "valid_submission_still_works",
					description:
						"The form still successfully submits when a valid email is provided.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "has_validation fails.",
			nudge:
				"The form still submits when the email is empty. Did you tell AI specifically what behavior is wrong and what it should be instead?",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"A precise bug report gets a precise fix. The more specific you are about what's wrong, the less AI has to guess.",
		},
		lessonTakeaway:
			"When reporting a bug, always include what is happening, where it is, and what should happen instead.",
	},
	{
		id: CODE_IDS[6],
		title: "Ask for a plan before code",
		instruction:
			"You want to add a dark mode toggle. Craft a prompt that asks AI to plan the approach first (steps, components, edge cases) without writing any code. Use your own words.",
		whatUserSees:
			"A simple app with a header ('My App') and main content ('Welcome to my app.'). White background, black text. No dark mode toggle yet.",
		hint: "Say something like 'Plan how to add dark mode before writing code. List the steps and any edge cases (e.g. saving the user's preference).'",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8 bg-white text-black">\n    <header class="mb-8">\n      <h1 class="text-2xl font-bold">My App</h1>\n    </header>\n    <main>\n      <p>Welcome to my app.</p>\n    </main>\n  </body>\n</html>',
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "prompt_asked_for_plan",
					description:
						"The user's prompt explicitly asked AI to plan or outline the approach before writing code.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "ai_output_is_a_plan",
					description:
						"The AI response contains a structured plan, steps, or outline rather than jumping straight into code.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "plan_covers_edge_cases",
					description:
						"The plan mentions at least one edge case or consideration, such as persisting the user's preference or handling system defaults.",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 6.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "ai_output_is_a_plan fails.",
			nudge:
				"AI went straight to writing code. Try explicitly telling it to plan first and not write any code yet.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"AI makes better decisions when it plans first. A plan prompt is always worth it on anything bigger than a single element.",
		},
		lessonTakeaway:
			"Ask AI to outline its approach before writing code. It catches problems early that would cost you three more prompts to fix.",
	},
	{
		id: CODE_IDS[7],
		title: "Name edge cases in your prompt",
		instruction:
			"This page fetches users but has no error or empty-state handling. Craft a prompt that names both edge cases and what the user should see in each. Use your own words.",
		whatUserSees:
			"A 'Users' page that fetches names from an API and shows them in a list. When the request succeeds, you see names. When it fails or returns nothing, you see nothing: no error message, no empty state.",
		hint: "List both edge cases explicitly: 'When the request fails, show X. When the list is empty, show Y.' AI won't add them unless you name them.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <h1 class="text-2xl font-bold mb-4">Users</h1>\n    <ul id="userList" class="space-y-2"></ul>\n    <script>\n      fetch(\'https://jsonplaceholder.typicode.com/users\')\n        .then(res => res.json())\n        .then(users => {\n          const list = document.getElementById(\'userList\');\n          users.forEach(user => {\n            const li = document.createElement(\'li\');\n            li.textContent = user.name;\n            list.appendChild(li);\n          });\n        });\n    </script>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "handles_fetch_failure",
					description:
						"The code contains error handling (like a .catch or try/catch) for the network request.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "handles_empty_list",
					description:
						"Shows a clear 'No users found' message if the API returns an empty list.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "error_messages_are_user_friendly",
					description:
						"All messages are written for a real person (no raw code errors or console logs).",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 6.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "handles_fetch_failure or handles_empty_list fails.",
			nudge:
				"AI didn't cover all the edge cases. Try listing them explicitly in your prompt: what happens when the request fails, and what happens when there's nothing to show.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"AI builds for the happy path by default. Edge cases only show up in the code when they show up in the prompt.",
		},
		lessonTakeaway:
			"List every edge case you can think of in the prompt. AI won't add defensive behavior unless you name it.",
	},
	{
		id: CODE_IDS[8],
		title: "Refine with a focused follow-up",
		instruction:
			"This card feels cramped. Craft a prompt that asks for two changes only: more spacing between elements and a larger title. Tell AI to leave everything else untouched. Use your own words.",
		whatUserSees:
			"A small card with a tight title ('Card Title'), description text, and a blue Action button. The spacing feels cramped and the title is a bit small.",
		hint: "Write a short prompt like 'Increase spacing between the elements and make the title bigger.' Don't describe the whole card again.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <div class="border rounded p-2 w-64">\n      <h2 class="text-sm font-bold">Card Title</h2>\n      <p class="text-gray-600">This is the card description text.</p>\n      <button class="bg-blue-500 text-white px-2 py-1 rounded">Action</button>\n    </div>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "title_is_larger",
					description:
						"The card title uses a larger font size class (e.g., text-lg or text-xl) than the original text-sm.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "spacing_improved",
					description:
						"The card has more padding or breathing room between its elements.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "nothing_else_changed",
					description:
						"The button, text content, and overall structure remain exactly the same.",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 6.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "title_is_larger or spacing_improved fails.",
			nudge:
				"Be explicit: 'Add more padding inside the card' and 'Make the title text-lg or text-xl'. Vague requests get vague results.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"A targeted follow-up prompt is faster than rewriting everything. You only need to describe what changed.",
		},
		lessonTakeaway:
			"Treat AI as a conversation loop. When something is 70% right, write a focused follow-up instead of starting over.",
	},
	{
		id: CODE_IDS[9],
		title: "Share the context AI needs",
		instruction:
			"This app has an authStore with a logout() method but no logout button. Craft a prompt that tells AI about the existing authStore and asks for a navbar button that calls it. Use your own words.",
		whatUserSees:
			"A dark header bar with 'My App' on the left and links (Dashboard, Settings) on the right. No logout button. The app has an authStore with a logout function, but the UI doesn't use it yet.",
		hint: "Tell AI that authStore exists and has a logout() method. Without that, it will write generic code that doesn't connect to your app.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body>\n    <header class="bg-gray-800 text-white p-4 flex items-center justify-between">\n      <h1 class="text-xl font-bold">My App</h1>\n      <nav class="flex gap-4">\n        <a href="#" class="text-gray-300">Dashboard</a>\n        <a href="#" class="text-gray-300">Settings</a>\n      </nav>\n    </header>\n    <script>\n      const authStore = {\n        user: { name: \'Mikhail\' },\n        logout: function() {\n          this.user = null;\n          alert(\'Logged out\');\n        }\n      };\n    </script>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "has_logout_button",
					description:
						"A new logout button is visible inside the navigation bar.",
					method: "static_analysis",
					weight: 1,
					required: true,
				},
				{
					id: "calls_auth_store_logout",
					description:
						"Clicking the logout button correctly triggers the existing authStore logout function.",
					method: "static_analysis",
					weight: 3,
					required: true,
				},
				{
					id: "button_is_in_navbar",
					description:
						"The logout button is placed correctly alongside Dashboard and Settings.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "calls_auth_store_logout fails.",
			nudge:
				"The button is there but it doesn't connect to authStore. Did you tell AI about the existing auth variable in your prompt?",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"When you include your app's context, AI writes code that fits. Without it, you get generic code you have to rewrite by hand.",
		},
		lessonTakeaway:
			"Always tell AI about the relevant parts of your existing codebase before asking it to add something new.",
	},
	{
		id: CODE_IDS[10],
		title: "Describe the design in plain language",
		instruction:
			"This pricing card looks plain. Craft a prompt that describes how you want it to look (colors, spacing, hover effects), using only plain language, no class names or CSS. Describe it as you would to a designer. Use your own words.",
		whatUserSees:
			"A gray page with a centered white card: 'Pro Plan', '$29/mo', a feature list, and a blue Get Started button. It works but looks plain: no hover effects, no visual polish.",
		hint: "Say things like 'make the button darken on hover' or 'add more space between the price and the list', not 'add hover:bg-blue-600' or 'mb-4'.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-16 bg-gray-100 flex justify-center">\n    <div class="border p-4 w-64 bg-white">\n      <h2 class="text-lg font-bold">Pro Plan</h2>\n      <p class="text-2xl">$29/mo</p>\n      <ul>\n        <li>Feature one</li>\n        <li>Feature two</li>\n        <li>Feature three</li>\n      </ul>\n      <button class="bg-blue-500 text-white px-4 py-2 mt-4">Get Started</button>\n    </div>\n  </body>\n</html>',
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "prompt_uses_no_technical_terms",
					description:
						"The user's prompt contains no CSS class names, no framework-specific terms, and no code-level instructions. It describes the design in plain visual language.",
					method: "llm_judge",
					weight: 3,
					required: true,
				},
				{
					id: "card_looks_visually_improved",
					description:
						"The redesigned card is visually more polished than the original, with better spacing, typography, or color.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "card_has_hover_or_interactive_state",
					description:
						"The card or its button has some kind of hover or interactive visual state.",
					method: "static_analysis",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 5 out of 6.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "prompt_uses_no_technical_terms fails.",
			nudge:
				"Your prompt included technical terms. Try describing it the way you'd explain it to someone who doesn't code. What does it look like? What happens when you interact with it?",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Describing the experience is often more reliable than describing the implementation. AI translates visual language into code well.",
		},
		lessonTakeaway:
			"You don't need to know the technical term for something to prompt it effectively. Visual and behavioral descriptions work.",
	},
	{
		id: CODE_IDS[11],
		title: "Brief AI when it loses track",
		instruction:
			"AI has lost context. Craft a prompt that (1) briefly summarizes what this app is and what's already built, then (2) asks for an 'Add task' button. Don't copy this instruction; put it in your own words.",
		whatUserSees:
			"A TaskFlow app: blue header with title and Logout button, main area with 'Your Tasks' and a list (Buy groceries, Finish project report). You want to add a new feature but AI has lost context.",
		hint: "Structure your prompt: 'This is a task app. It has [X, Y, Z]. Add [specific feature].' A clear briefing gets better output than jumping straight to the request.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body>\n    <header class="bg-blue-600 text-white p-4 flex justify-between items-center">\n      <h1 class="text-xl font-bold">TaskFlow</h1>\n      <button class="text-sm bg-white text-blue-600 px-3 py-1 rounded">Logout</button>\n    </header>\n    <main class="p-8">\n      <h2 class="text-lg font-bold mb-4">Your Tasks</h2>\n      <ul id="taskList" class="space-y-2">\n        <li class="border p-3 rounded bg-white">Buy groceries</li>\n        <li class="border p-3 rounded bg-white">Finish project report</li>\n      </ul>\n    </main>\n  </body>\n</html>',
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "prompt_summarizes_current_state",
					description:
						"The user's prompt describes what has already been built in the app.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "prompt_states_next_task_clearly",
					description:
						"The user's prompt clearly states what the next feature or change is.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "new_feature_is_added_correctly",
					description:
						"The AI output adds the requested feature correctly without breaking existing elements.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "new_feature_is_added_correctly fails.",
			nudge:
				"Start with a clear summary: 'This app has [X]. Add [Y].' Keep the briefing short and the request specific.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"A deliberate context reset keeps output quality from degrading in long sessions. It's one of the highest-leverage prompting habits.",
		},
		lessonTakeaway:
			"In long sessions, AI loses coherence. A summary prompt that recaps the current state and the next step gets you back on track fast.",
	},
	{
		id: CODE_IDS[12],
		title: "Ask AI to audit its code",
		instruction:
			"This login form may have security and UX issues. Craft a prompt that asks AI to audit it for specific things: hardcoded secrets, missing error handling, missing loading state. Give it a checklist. Use your own words.",
		whatUserSees:
			"A login form with username, password, and Login button. The code submits to an API, but there's a hardcoded API key, no error handling if the request fails, and no loading state.",
		hint: "Give AI a checklist: 'Check for hardcoded values, missing error handling, and missing loading state.' Specific requests get specific findings.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <form id="loginForm" class="space-y-4 max-w-sm">\n      <input type="text" id="username" placeholder="Username" class="border p-2 w-full rounded" />\n      <input type="password" id="password" placeholder="Password" class="border p-2 w-full rounded" />\n      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded w-full">Login</button>\n    </form>\n    <script>\n      document.getElementById(\'loginForm\').addEventListener(\'submit\', function(e) {\n        e.preventDefault();\n        const username = document.getElementById(\'username\').value;\n        const password = document.getElementById(\'password\').value;\n        fetch(\'http://api.myapp.com/login\', {\n          method: \'POST\',\n          body: JSON.stringify({ username, password, apiKey: \'12345-hardcoded-key\' })\n        }).then(res => res.json()).then(data => {\n          window.location.href = \'/dashboard\';\n        });\n      });\n    </script>\n  </body>\n</html>',
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "prompt_requests_specific_audit",
					description:
						"The user's prompt asks AI to check for specific issues like security vulnerabilities, hardcoded values, or missing error handling, not just 'review this'.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "ai_identifies_hardcoded_key",
					description:
						"The AI response identifies the hardcoded API key as a problem.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "ai_identifies_missing_error_handling",
					description:
						"The AI response identifies that the fetch call has no error handling.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition:
				"ai_identifies_hardcoded_key or ai_identifies_missing_error_handling fails.",
			nudge:
				"AI gave a surface-level review. Try asking it to specifically look for hardcoded values and missing error states.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"AI is a sharper reviewer when you give it a checklist. A vague 'review this' gets vague feedback.",
		},
		lessonTakeaway:
			"When asking AI to review its own output, give it specific things to look for. Specific audits catch real problems.",
	},
	{
		id: CODE_IDS[13],
		title: "Spec first, then prompt",
		instruction:
			"Write a short spec for a task manager (purpose, who uses it, at least two features, Tailwind). Then use that spec as your prompt, but rephrase it in your own words; don't paste the spec verbatim.",
		whatUserSees:
			"A blank page. Tailwind is loaded. Nothing built yet; you're starting from scratch with a spec and a prompt.",
		hint: "Example: 'A task manager for individuals. Users can add tasks and mark them complete. Use Tailwind. Build the full structure.' Then paste it as your prompt.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body>\n  </body>\n</html>',
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "spec_covers_core_elements",
					description:
						"The user's spec mentions the app's purpose, at least two core features, and the tech stack.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "output_matches_spec",
					description:
						"The generated code reflects what was described in the spec, including the stated features and stack.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "output_is_a_complete_scaffold",
					description:
						"The generated code is a working skeleton of the app with the main sections present, not just a single component.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "output_matches_spec fails.",
			nudge:
				"The output doesn't match what you described. Check if your spec was specific enough about the features and stack you want.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"A spec written before you open the AI is the difference between a session that ships and one that spins. You just built the habit.",
		},
		lessonTakeaway:
			"Writing a spec first forces clarity before you prompt. AI builds better when it gets a complete picture up front.",
	},
	{
		id: CODE_IDS[14],
		title: "Pack everything into one prompt",
		instruction:
			"Build a user profile card in one prompt. Your prompt must cover: Tailwind, fetching from jsonplaceholder.typicode.com/users/1, loading state, error state, and what the card displays. Craft it in your own words; don't copy this list verbatim.",
		whatUserSees:
			"A gray page with Tailwind loaded. Nothing on it: no profile card, no data. You're building the whole feature in one prompt.",
		hint: "Include every requirement in one prompt: stack, API URL, loading state, error state, and what the card should display. Leave nothing for AI to guess.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8 bg-gray-100">\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "fetches_real_data",
					description:
						"The code contains a fetch call to jsonplaceholder.typicode.com/users (or similar user API) and displays the fetched data (name, email, or similar fields) in the DOM.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "has_loading_state",
					description:
						"A loading spinner or message is visible while the data is being fetched.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "has_error_state",
					description:
						"A clear error message appears if the data fails to load.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "is_fully_styled",
					description:
						"The profile card has a complete, polished layout with good typography.",
					method: "llm_judge",
					weight: 1,
					required: true,
				},
				{
					id: "prompt_left_nothing_to_guess",
					description:
						"The prompt specifies the stack, data source, edge cases, and visual look.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 7 out of 8.",
			perfectScore: "All five criteria pass.",
		},
		failState: {
			condition: "Any required criterion fails.",
			nudge:
				"Something is missing from the output. Go back through your prompt and check: did you specify the stack, the data source, every edge case, and the visual style? Each missing detail is something AI had to guess.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"That's a production-level prompt. You gave AI everything it needed and it built everything you asked for. That's what vibe coding looks like when it works.",
		},
		lessonTakeaway:
			"A complete prompt covers the stack, the data, the edge cases, and the visual requirements. When AI has everything, it builds everything.",
	},
	{
		id: CODE_IDS[15],
		title: "Show, don't just tell",
		instruction:
			"This page has one product card. Craft a prompt that points AI at the existing card as an example, then asks it to create two more just like it for different products. Use your own words; don't copy this instruction.",
		whatUserSees:
			"A product grid with a single card: an image box, a name ('Wireless Headphones'), a price ('$99'), and a Buy button. There's empty space for more cards, but only one exists.",
		hint: "Reference the card that's already there: 'Here's the card I have — build two more like it for these products.' A concrete example beats a long description.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8 bg-gray-100">\n    <div class="grid grid-cols-3 gap-4">\n      <div class="bg-white rounded-lg shadow p-4">\n        <div class="bg-gray-200 h-32 rounded mb-3"></div>\n        <h3 class="font-bold">Wireless Headphones</h3>\n        <p class="text-gray-600">$99</p>\n        <button class="mt-2 bg-blue-500 text-white px-3 py-1 rounded">Buy</button>\n      </div>\n    </div>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "has_three_cards",
					description:
						"The grid now contains three product cards total (the original plus two new ones).",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "cards_match_example",
					description:
						"The new cards reuse the same structure as the example card: image box, name, price, and Buy button.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "prompt_used_the_example",
					description:
						"The user's prompt referenced the existing card as the pattern to copy, instead of describing a card from scratch.",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 6.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "has_three_cards passes but cards_match_example fails.",
			nudge:
				"The new cards don't match the original. Tell AI to follow the existing card exactly as the template.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Showing AI an example is one of the most reliable prompting moves. It copies a pattern far more accurately than it invents one.",
		},
		lessonTakeaway:
			"When a pattern already exists, point AI at it as an example. Showing beats telling.",
	},
	{
		id: CODE_IDS[16],
		title: "Set the boundaries",
		instruction:
			"This page needs a countdown timer. Craft a prompt that asks for it but sets clear limits: no external libraries, vanilla JavaScript only, and don't change anything above the heading. Use your own words.",
		whatUserSees:
			"A page with a single heading, 'Launch in:'. Below it, nothing — no timer, no numbers, no script yet.",
		hint: "State your limits up front: 'Use plain JavaScript, no libraries, and leave the heading alone.' Constraints keep AI from over-building.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8 text-center">\n    <h1 class="text-2xl font-bold">Launch in:</h1>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "has_working_timer",
					description:
						"A countdown timer is present and updates over time below the heading.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "no_external_libraries",
					description:
						"The solution uses only vanilla JavaScript — no new CDN scripts or third-party libraries were added.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "prompt_stated_constraints",
					description:
						"The user's prompt explicitly named at least one constraint (no libraries, vanilla JS, or what to leave untouched).",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 6.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "has_working_timer passes but no_external_libraries fails.",
			nudge:
				"AI reached for a library. Tell it explicitly: vanilla JavaScript only, no external dependencies.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Constraints are guardrails. The limits you set are the difference between code that fits your project and code you have to untangle.",
		},
		lessonTakeaway:
			"Name your constraints in the prompt. What you forbid shapes the output as much as what you ask for.",
	},
	{
		id: CODE_IDS[17],
		title: "Ask for the output format you want",
		instruction:
			"This page has three FAQ items shown as plain text. Craft a prompt that asks AI to reformat them as a collapsible accordion — each answer hidden until its question is clicked. Be specific about the format. Use your own words.",
		whatUserSees:
			"A 'FAQ' heading followed by three questions and answers, all shown at once as plain paragraphs. Nothing is collapsible — every answer is always visible.",
		hint: "Describe the exact format you want: 'Make each question a clickable header that expands to show its answer, collapsed by default.' Vague format requests get vague layouts.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8 max-w-lg">\n    <h1 class="text-2xl font-bold mb-4">FAQ</h1>\n    <div>\n      <p class="font-semibold">How do I reset my password?</p>\n      <p class="text-gray-600 mb-3">Visit Settings and click Reset Password.</p>\n      <p class="font-semibold">Can I change my plan?</p>\n      <p class="text-gray-600 mb-3">Yes, from the Billing page at any time.</p>\n      <p class="font-semibold">How do I contact support?</p>\n      <p class="text-gray-600">Email support@example.com.</p>\n    </div>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "is_accordion",
					description:
						"Each question acts as a clickable header that shows or hides its answer.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "collapsed_by_default",
					description:
						"Answers are hidden by default and only appear after the question is clicked.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "content_preserved",
					description:
						"All three original questions and answers are kept, with the same text.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 5.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "is_accordion passes but collapsed_by_default fails.",
			nudge:
				"The answers still show by default. Specify the starting state: 'collapsed until clicked.'",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"When you name the exact format, AI builds the structure you pictured instead of guessing at one.",
		},
		lessonTakeaway:
			"Specify the shape of the output — a table, a list, an accordion. The format is part of the requirement.",
	},
	{
		id: CODE_IDS[18],
		title: "Match an existing reference",
		instruction:
			"This page has a styled 'Primary' button. Craft a prompt that adds a 'Secondary' button next to it, matching the primary button's size and shape but in a muted gray style. Anchor your request to the existing button. Use your own words.",
		whatUserSees:
			"A page with one button labeled 'Primary' — blue, rounded, with comfortable padding. There's space beside it, but no second button.",
		hint: "Tell AI to match what's already there: 'Add a Secondary button with the same size and rounding as the Primary one, but gray.' A reference removes guesswork.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <div class="flex gap-3">\n      <button class="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium">Primary</button>\n    </div>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "has_secondary_button",
					description:
						"A second button labeled 'Secondary' is present next to the primary button.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "matches_reference_shape",
					description:
						"The secondary button shares the primary button's size, padding, and rounding.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "visually_distinct_style",
					description:
						"The secondary button is clearly a muted or gray variant, not another blue button.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 5.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition:
				"has_secondary_button passes but matches_reference_shape fails.",
			nudge:
				"The new button doesn't match the original's shape. Point AI at the Primary button as the reference to copy.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Anchoring to something on the page keeps your UI consistent. AI matches an existing reference more reliably than an abstract description.",
		},
		lessonTakeaway:
			"When you want consistency, tell AI to match an element that already exists rather than describing the style again.",
	},
	{
		id: CODE_IDS[19],
		title: "Start with the simplest version",
		instruction:
			"You want a to-do feature. Craft a prompt that asks AI for the simplest working version first — just an input that adds typed items to a list — with no editing, deleting, or saving yet. Use your own words.",
		whatUserSees:
			"A page with a 'My Tasks' heading and an empty area below. There's no input box and no list — nothing to add tasks with yet.",
		hint: "Ask for the core only: 'Just an input and a list that adds items. No delete, edit, or storage for now.' Scope it down on purpose.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8 max-w-md">\n    <h1 class="text-2xl font-bold mb-4">My Tasks</h1>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "can_add_items",
					description:
						"There is an input and a way to add typed items to a visible list.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "stayed_minimal",
					description:
						"The output is limited to adding items — it did not add delete, edit, or persistence.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "prompt_scoped_to_mvp",
					description:
						"The user's prompt explicitly asked for the simplest version or excluded extra features for now.",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 6.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "can_add_items passes but stayed_minimal fails.",
			nudge:
				"AI added more than you asked for. Tell it to build only the core and hold the extras for later.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Starting minimal gives you something working fast — then you layer features on with focused follow-ups. It beats asking for everything at once.",
		},
		lessonTakeaway:
			"Ask for the simplest working version first. You can always add to something that runs; you can't debug everything at once.",
	},
	{
		id: CODE_IDS[20],
		title: "Give AI a role",
		instruction:
			"This signup form works but looks unfinished. Craft a prompt that tells AI to act as a senior frontend engineer and bring the form up to a production-quality standard. Set the role, the task, and the bar. Use your own words.",
		whatUserSees:
			"A bare signup form: an unstyled email input, an unstyled password input, and a plain 'Sign Up' button stacked on a white page. It functions, but looks like a prototype.",
		hint: "Open with a role and a standard: 'Act as a senior frontend engineer. Polish this signup form to production quality — spacing, labels, focus states, and a clear hierarchy.'",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <form class="max-w-sm">\n      <input type="email" placeholder="Email" class="border" />\n      <input type="password" placeholder="Password" class="border" />\n      <button>Sign Up</button>\n    </form>\n  </body>\n</html>',
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "prompt_assigns_role",
					description:
						"The user's prompt gives AI a specific role or persona (e.g., senior frontend engineer or product designer).",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "prompt_sets_a_standard",
					description:
						"The prompt states the quality bar to hit (e.g., production-quality, accessible, polished).",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "output_is_clearly_elevated",
					description:
						"The resulting form is meaningfully more polished: proper spacing, labels or focus states, and a clear visual hierarchy.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "output_is_clearly_elevated fails.",
			nudge:
				"The result still looks rough. Give AI a role and a clear standard — 'act as a senior engineer and make it production-quality' — so it raises its own bar.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Assigning a role primes AI to apply the judgment that role would. 'Act as a senior engineer' pulls higher-quality defaults out of the same model.",
		},
		lessonTakeaway:
			"Give AI a role and a standard. The persona you assign shifts the quality and assumptions of everything it produces.",
	},
	{
		id: CODE_IDS[21],
		title: "Define 'done' with acceptance criteria",
		instruction:
			"This list needs a search box. Craft a prompt that defines 'done' with clear acceptance criteria: filtering is case-insensitive, a result count is shown, and a 'no matches' message appears when nothing matches. Use your own words.",
		whatUserSees:
			"A list of five fruit names (Apple, Banana, Cherry, Date, Elderberry). There's no search box, so the full list always shows with no way to filter it.",
		hint: "Spell out what 'finished' means as a checklist: case-insensitive matching, a visible count, and an empty-state message. Acceptance criteria leave nothing ambiguous.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8 max-w-md">\n    <ul id="fruits" class="space-y-1">\n      <li>Apple</li>\n      <li>Banana</li>\n      <li>Cherry</li>\n      <li>Date</li>\n      <li>Elderberry</li>\n    </ul>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "filters_list",
					description: "A search box filters the list as the user types.",
					method: "static_analysis",
					weight: 1,
					required: true,
				},
				{
					id: "case_insensitive",
					description: "Filtering matches regardless of letter case.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "shows_count_and_empty_state",
					description:
						"A result count is shown, and a clear 'no matches' message appears when nothing matches.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "prompt_listed_criteria",
					description:
						"The user's prompt stated explicit acceptance criteria rather than a vague 'add search'.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 5 out of 6.",
			perfectScore: "All four criteria pass.",
		},
		failState: {
			condition: "shows_count_and_empty_state fails.",
			nudge:
				"Some of your criteria weren't met. List each requirement explicitly — count, empty state, case-insensitive — so AI can check itself against them.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Acceptance criteria turn 'add search' into a testable spec. When 'done' is defined, AI builds to it and you can verify it in seconds.",
		},
		lessonTakeaway:
			"Define 'done' as a list of acceptance criteria. A clear finish line gives you something concrete to check the output against.",
	},
	{
		id: CODE_IDS[22],
		title: "Ask for just the diff",
		instruction:
			"You only want to change the button color in this component. Craft a prompt that asks AI to make that one change and show only what changed — not the entire file. Use your own words.",
		whatUserSees:
			"A pricing card with a title, a price, three feature lines, and a green 'Choose plan' button. Everything is fine except you want the button to be blue.",
		hint: "Ask for a focused change and a focused answer: 'Change only the button to blue and show me just the lines that changed.' You stay in control of large files this way.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8 bg-gray-100 flex justify-center">\n    <div class="bg-white rounded-xl shadow p-6 w-72">\n      <h2 class="text-lg font-bold">Starter</h2>\n      <p class="text-3xl font-bold my-2">$19<span class="text-base font-normal">/mo</span></p>\n      <ul class="text-gray-600 space-y-1 my-4">\n        <li>5 projects</li>\n        <li>2 GB storage</li>\n        <li>Email support</li>\n      </ul>\n      <button class="bg-green-600 text-white w-full py-2 rounded-lg">Choose plan</button>\n    </div>\n  </body>\n</html>',
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "prompt_requests_diff_only",
					description:
						"The user's prompt asks AI to show only what changed, not the whole file.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "change_is_correct_and_scoped",
					description:
						"Only the button color is changed; the rest of the card is left exactly as it was.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "response_is_minimal",
					description:
						"The AI response focuses on the changed lines rather than re-printing the entire component.",
					method: "llm_judge",
					weight: 2,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 6.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "change_is_correct_and_scoped fails.",
			nudge:
				"AI changed or re-emitted more than the button. Ask for the single change and only the lines that differ.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Asking for the diff keeps small edits small. On a big file, reviewing three changed lines is far safer than re-reading the whole thing.",
		},
		lessonTakeaway:
			"For small edits, ask AI to change one thing and show only the diff. It's faster to review and harder to break unrelated code.",
	},
	{
		id: CODE_IDS[23],
		title: "Prompt for accessibility",
		instruction:
			"This toolbar uses icon-only buttons with no labels. Craft a prompt that asks AI to make it accessible: every control needs an accessible label, and it must be usable with a keyboard. Name the accessibility needs. Use your own words.",
		whatUserSees:
			"A small toolbar with three icon-only buttons (a printer, a heart, and a trash can). A sighted mouse user can guess them, but there are no labels and nothing announces what each does.",
		hint: "Name the requirements: 'Add accessible labels to each icon button and make sure they're reachable and operable with the keyboard.' Accessibility shows up only when you ask for it.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <div class="flex gap-2">\n      <button class="p-2 border rounded">🖨️</button>\n      <button class="p-2 border rounded">❤️</button>\n      <button class="p-2 border rounded">🗑️</button>\n    </div>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "buttons_have_labels",
					description:
						"Each icon button has an accessible label (e.g., aria-label or visually-hidden text).",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "keyboard_operable",
					description:
						"The controls are focusable and operable with the keyboard, with a visible focus state.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "prompt_named_a11y_needs",
					description:
						"The user's prompt explicitly named accessibility requirements rather than asking generally to 'improve' the toolbar.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 5.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "buttons_have_labels fails.",
			nudge:
				"The icons still have no accessible names. Ask specifically for aria-labels and keyboard support — AI won't add them unless you name them.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Accessibility is a requirement, not a bonus. When you name it in the prompt, AI builds it in from the start instead of leaving people out.",
		},
		lessonTakeaway:
			"Spell out accessibility needs — labels, keyboard support, focus states. AI defaults to the happy path unless you ask for everyone.",
	},
	{
		id: CODE_IDS[24],
		title: "Prompt for responsive behavior",
		instruction:
			"This three-column layout breaks on phones. Craft a prompt that describes how it should behave on mobile versus desktop — for example, one column stacked on small screens and three across on large ones. Use your own words.",
		whatUserSees:
			"Three colored boxes sitting side by side in a fixed three-column grid. On a narrow phone screen they squash together instead of stacking.",
		hint: "Describe the behavior at each size: 'On phones, stack the boxes in one column; on wider screens, show three across.' Name the behavior, not the classes.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <div class="grid grid-cols-3 gap-4">\n      <div class="bg-red-200 h-24 rounded"></div>\n      <div class="bg-green-200 h-24 rounded"></div>\n      <div class="bg-blue-200 h-24 rounded"></div>\n    </div>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "uses_responsive_layout",
					description:
						"The grid uses responsive breakpoints so the column count changes by screen size.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "stacks_on_mobile",
					description:
						"On small screens the boxes stack into a single column instead of staying squashed side by side.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "prompt_described_each_size",
					description:
						"The user's prompt described the intended behavior for both small and large screens.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 4 out of 5.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "stacks_on_mobile fails.",
			nudge:
				"It still doesn't adapt on small screens. Describe what should happen on mobile and on desktop separately.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Responsive behavior is a description of intent at each screen size. Tell AI what to do on mobile and on desktop, and it handles the breakpoints.",
		},
		lessonTakeaway:
			"Describe how the layout should behave at different screen sizes. Responsiveness is intent you state, not something AI assumes.",
	},
	{
		id: CODE_IDS[25],
		title: "Decompose a big feature into steps",
		instruction:
			"You want a multi-step checkout flow (cart review, shipping, payment, confirmation). Craft a prompt that asks AI to break this into an ordered build plan and then implement only the first step. Drive the decomposition yourself. Use your own words.",
		whatUserSees:
			"A blank page with Tailwind loaded and a single heading, 'Checkout'. The full flow doesn't exist yet — there are no steps, no forms, nothing built.",
		hint: "Don't ask for the whole flow at once. Ask AI to lay out the steps in order, then build just step one. Sequencing a big feature is its own prompting skill.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8 max-w-lg">\n    <h1 class="text-2xl font-bold">Checkout</h1>\n  </body>\n</html>',
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "prompt_requests_decomposition",
					description:
						"The user's prompt asks AI to break the feature into an ordered sequence of steps before building.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "scopes_to_first_step",
					description:
						"The prompt limits the actual build to the first step only, rather than the whole flow.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "output_follows_the_plan",
					description:
						"The AI output presents a sequenced plan and implements a coherent first step (e.g., cart review) consistent with it.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "scopes_to_first_step fails.",
			nudge:
				"AI tried to build the whole flow at once. Ask it to sequence the steps first, then build only step one.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Big features fail when you prompt them whole. Decomposing into ordered steps — then building one at a time — keeps each prompt small enough to get right.",
		},
		lessonTakeaway:
			"Break large features into an ordered plan and build one step per prompt. Sequencing is how you keep complex work under control.",
	},
	{
		id: CODE_IDS[26],
		title: "Ask for tests alongside the code",
		instruction:
			"This page has a getDiscountedPrice function with no checks on it. Craft a prompt that asks AI to add inline tests (assertions) that verify it — including edge cases like a 0% and a 100% discount and an invalid input — and to show the results on the page. Use your own words.",
		whatUserSees:
			"A page showing 'Price calculator'. Behind it is a getDiscountedPrice(price, percent) function, but nothing tests it — there's no proof it actually works.",
		hint: "Ask for verification, not just code: 'Add assertions that test this function, including 0% and 100% discounts and an invalid input, and show pass/fail on the page.'",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8">\n    <h1 class="text-xl font-bold">Price calculator</h1>\n    <div id="results" class="mt-4 font-mono text-sm"></div>\n    <script>\n      function getDiscountedPrice(price, percent) {\n        return price - (price * percent) / 100;\n      }\n    </script>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "has_tests",
					description:
						"The code adds assertions or test cases that call getDiscountedPrice and check its output.",
					method: "static_analysis",
					weight: 2,
					required: true,
				},
				{
					id: "covers_edge_cases",
					description:
						"The tests include edge cases such as a 0% discount, a 100% discount, and an invalid input.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "results_visible",
					description:
						"Test results (pass/fail) are shown on the page, not only in the console.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "covers_edge_cases fails.",
			nudge:
				"The tests only cover the obvious case. Name the edge cases you want checked — 0%, 100%, and bad input — in your prompt.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Asking for tests with the code is how you trust AI's output. Tests turn 'looks right' into 'proven right', and they catch the edge cases you'd otherwise ship.",
		},
		lessonTakeaway:
			"Ask AI for tests alongside the implementation, and name the edge cases. Verification you can see beats code you take on faith.",
	},
	{
		id: CODE_IDS[27],
		title: "Hold AI to a design system",
		instruction:
			"This page defines a small set of design tokens (colors and spacing). Craft a prompt that asks AI to build an alert banner using only those tokens — no hard-coded colors or one-off spacing. Hold it to the system. Use your own words.",
		whatUserSees:
			"A page with CSS variables defined in :root — brand colors and a spacing scale — but nothing uses them yet. The body is empty below the style block.",
		hint: "Point AI at the tokens and forbid anything outside them: 'Use only the CSS variables defined in :root — no new hex colors or arbitrary pixel values.' Constrain it to the system.",
		starterCode:
			'<html>\n  <head>\n    <style>\n      :root {\n        --color-bg: #fef3c7;\n        --color-text: #92400e;\n        --color-border: #f59e0b;\n        --space-sm: 8px;\n        --space-md: 16px;\n      }\n    </style>\n  </head>\n  <body>\n  </body>\n</html>',
		grading: {
			method: "static_analysis + llm_judge",
			criteria: [
				{
					id: "uses_only_tokens",
					description:
						"The alert banner styles itself with the defined CSS variables and introduces no new hard-coded colors or arbitrary spacing values.",
					method: "static_analysis",
					weight: 3,
					required: true,
				},
				{
					id: "banner_is_complete",
					description:
						"A recognizable alert banner is rendered using the token colors and spacing.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "prompt_enforced_the_system",
					description:
						"The user's prompt explicitly restricted AI to the existing tokens and forbade off-system values.",
					method: "llm_judge",
					weight: 1,
					required: false,
				},
			],
			passingCondition:
				"All required criteria pass and total weight score is at least 5 out of 6.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "uses_only_tokens fails.",
			nudge:
				"AI introduced colors or spacing outside the system. Tell it explicitly to use only the defined variables and nothing else.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"Real codebases have design systems. When you constrain AI to existing tokens, its output drops straight in instead of drifting off-brand.",
		},
		lessonTakeaway:
			"Constrain AI to your design system — use the defined tokens, forbid one-offs. Consistency comes from the limits you enforce.",
	},
	{
		id: CODE_IDS[28],
		title: "Debug from the error message",
		instruction:
			"Clicking the button throws: 'Uncaught TypeError: Cannot read properties of null (reading addEventListener)'. Craft a prompt that includes the exact error, asks AI for the root cause, and requests the smallest fix — not a rewrite. Use your own words.",
		whatUserSees:
			"A page with a 'Save' button. Clicking it does nothing, and the console shows a TypeError about reading addEventListener on null. The script runs before the button exists.",
		hint: "Paste the exact error and ask for diagnosis first: 'Here's the error — what's the root cause, and what's the smallest change that fixes it?' Don't ask for a rewrite.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n    <script>\n      document.getElementById(\'saveBtn\').addEventListener(\'click\', function() {\n        alert(\'Saved!\');\n      });\n    </script>\n  </head>\n  <body class="p-8">\n    <button id="saveBtn" class="bg-blue-600 text-white px-4 py-2 rounded">Save</button>\n  </body>\n</html>',
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "prompt_includes_error_and_asks_cause",
					description:
						"The user's prompt includes the exact error message and asks AI to identify the root cause.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "identifies_real_cause",
					description:
						"The AI response correctly explains that the script runs before the button exists in the DOM.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "fix_is_minimal",
					description:
						"The fix is a small, targeted change (e.g., moving the script or waiting for DOMContentLoaded) rather than a full rewrite.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "fix_is_minimal fails.",
			nudge:
				"AI rewrote more than it needed to. Give it the exact error, ask for the root cause, and request the smallest possible fix.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"The error message is the most useful thing you can hand AI. Paste it verbatim, ask for the cause, and you get a precise fix instead of a guess.",
		},
		lessonTakeaway:
			"Debug by pasting the exact error and asking for the root cause and the smallest fix. Specific symptoms get specific cures.",
	},
	{
		id: CODE_IDS[29],
		title: "Write a reusable prompt template",
		instruction:
			"You keep building similar components. Craft a reusable prompt template — with clearly marked placeholders for the parts that change (the component, its fields, its style, and the stack) — then use it once to build a 'testimonial' card. Use your own words.",
		whatUserSees:
			"A blank page with Tailwind loaded. Nothing is built. This is the capstone: you're writing a prompt you could reuse for any component, then proving it on a testimonial card.",
		hint: "Build a template, not a one-off: 'Build a [component] using [stack] with [fields], styled [style direction], handling [edge cases].' Then fill the brackets for a testimonial card.",
		starterCode:
			'<html>\n  <head>\n    <script src="https://cdn.tailwindcss.com"></script>\n  </head>\n  <body class="p-8 bg-gray-100">\n  </body>\n</html>',
		grading: {
			method: "llm_judge",
			criteria: [
				{
					id: "prompt_is_a_template",
					description:
						"The user's prompt is written as a reusable template with clearly marked placeholders for the parts that change.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "template_covers_key_variables",
					description:
						"The template includes placeholders for the component, its content or fields, its style, and the tech stack.",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
				{
					id: "produces_testimonial_card",
					description:
						"Filling the template once produces a complete, styled testimonial card (quote, name, role, and avatar or initials).",
					method: "llm_judge",
					weight: 2,
					required: true,
				},
			],
			passingCondition: "All required criteria pass.",
			perfectScore: "All three criteria pass.",
		},
		failState: {
			condition: "prompt_is_a_template fails.",
			nudge:
				"That's a one-off prompt, not a template. Mark the parts that change as placeholders so you could reuse it for any component.",
		},
		successState: {
			condition: "Passing condition is met.",
			feedback:
				"A reusable prompt template is the payoff of everything in this track: stack, scope, examples, constraints, and edge cases captured once and reused for every component you build next.",
		},
		lessonTakeaway:
			"Turn prompts you reuse into templates with placeholders. The best prompters build a library, not a pile of one-offs.",
	},
];

export const codingLessons = codingLessonsBase.map((lesson) => ({
	...lesson,
	...codingLessonScaffolds[lesson.id],
}));
