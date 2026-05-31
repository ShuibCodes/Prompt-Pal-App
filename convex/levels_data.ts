/**
 * PromptPal Level Designs - 30 levels teaching AI prompting
 *
 * Each module has 10 levels: 3 easy, 4 medium, 3 hard
 */

const getScaffoldTypeForDifficulty = (
	difficulty: "beginner" | "intermediate" | "advanced",
): "template" | "checklist" | "none" => {
	switch (difficulty) {
		case "beginner":
			return "template";
		case "intermediate":
			return "checklist";
		case "advanced":
		default:
			return "none";
	}
};

// ===== IMAGE GENERATION LEVELS (10 levels) =====

const imageLessonScaffolds: Record<
	string,
	{
		scaffoldTemplate?: string;
		checklistItems?: string[];
	}
> = {
	"image-1-easy": {
		scaffoldTemplate:
			"Create a [main colour] image with a [shade or lighting] look and a [background detail] finish",
		checklistItems: ["Main colour", "Shade or lighting", "Background detail"],
	},
	"image-2-easy": {
		scaffoldTemplate:
			"Create a [shape] on a [background] with [edge or texture detail] in a [style] style",
		checklistItems: ["Shape", "Background", "Edge or texture detail", "Style"],
	},
	"image-3-easy": {
		scaffoldTemplate:
			"Create a [object] with [material detail] on a [surface or setting] using [lighting style]",
		checklistItems: ["Object", "Material detail", "Surface or setting", "Lighting style"],
	},
	"image-4-medium": {
		checklistItems: ["Building form", "Materials", "Perspective", "Lighting"],
	},
	"image-5-medium": {
		checklistItems: ["Time of day", "Foreground and background", "Atmosphere", "Landscape elements"],
	},
	"image-6-medium": {
		checklistItems: ["Food subject", "Presentation details", "Texture", "Lighting"],
	},
	"image-7-medium": {
		checklistItems: ["Color palette", "Style reference", "Energy or mood", "Abstract shapes"],
	},
	"image-8-hard": {
		checklistItems: ["Subject", "Drawing style", "Background", "Annotations or detail", "Symmetry"],
	},
	"image-9-hard": {
		checklistItems: ["Main subjects", "Setting", "Lighting and colour", "Mood", "Composition"],
	},
	"image-10-hard": {
		checklistItems: ["Product", "Effect or motion", "Background", "Lighting", "Composition"],
	},
};

const imageLevelsBase = [
	// EASY LEVELS (1-3): one clear subject, simple. passingScore 70, 3-4 broad keywords.
	{
		id: "image-1-easy",
		type: "image" as const,
		title: "Color Match",
		description: "Recreate a single flat, solid colour that fills the whole frame.",
		difficulty: "beginner" as const,
		passingScore: 70,
		unlocked: true,
		order: 1,
		hiddenPromptKeywords: ["solid colour", "green", "flat", "fills the frame"],
		style: "Minimalist",
		whatUserSees:
			"A single flat, solid muted forest-green colour filling the entire frame edge to edge. No subject, objects, gradient or texture — just one even green tone, like a paint swatch.",
		points: 100,
		hints: [
			"Name the exact colour and how light or dark it is",
			"Say it should fill the whole frame evenly",
			"Keep it simple — no objects or scenery",
		],
		estimatedTime: 2,
		tags: ["basics", "colour", "simple"],
		learningObjectives: [
			"Learn basic prompt structure",
			"Describe a colour precisely",
			"Practice simplicity in prompting",
		],
	},
	{
		id: "image-2-easy",
		type: "image" as const,
		title: "Basic Shape",
		description: "Generate a single simple 3D shape on a plain background.",
		difficulty: "beginner" as const,
		passingScore: 70,
		unlocked: true,
		order: 2,
		hiddenPromptKeywords: ["sphere", "grey", "plain background", "soft shadow"],
		style: "3D studio render",
		whatUserSees:
			"A single smooth matte light-grey 3D sphere, centred on a plain neutral-grey background. Soft even lighting from above with a gentle shadow beneath. Only one object in frame, nothing else.",
		points: 100,
		hints: [
			"Describe the shape and that it is three-dimensional",
			"Mention the plain background and the soft shadow",
			"Note the matte finish and soft, even lighting",
		],
		estimatedTime: 3,
		tags: ["basics", "shape", "composition"],
		learningObjectives: [
			"Practice describing form and dimension",
			"Learn to specify background and lighting",
			"Understand simple composition",
		],
	},
	{
		id: "image-3-easy",
		type: "image" as const,
		title: "Everyday Object",
		description: "Recreate a single real-world object as a clean product shot.",
		difficulty: "beginner" as const,
		passingScore: 70,
		unlocked: true,
		order: 3,
		hiddenPromptKeywords: [
			"leather hiking boot",
			"red laces",
			"on a rock",
			"blurred forest background",
		],
		style: "Product photography",
		whatUserSees:
			"A single brown leather hiking boot with red laces and a chunky black sole, sitting on a grey granite rock. Soft natural daylight and a softly blurred pine-forest and mountain background. The boot is the clear single subject, shown from the side.",
		points: 100,
		hints: [
			"Name the object and its main material and colour",
			"Describe what it rests on and the background",
			"Mention the lighting and that the background is blurred",
		],
		estimatedTime: 4,
		tags: ["objects", "materials", "product"],
		learningObjectives: [
			"Describe an object by its features",
			"Practice material and setting descriptions",
			"Understand depth of field (blurred background)",
		],
	},

	// MEDIUM LEVELS (4-7): scene + style + composition. passingScore 75, 5-7 keywords.
	{
		id: "image-4-medium",
		type: "image" as const,
		title: "Architecture in Snow",
		description: "Compose a modern building within a dramatic natural setting.",
		difficulty: "intermediate" as const,
		passingScore: 75,
		unlocked: false,
		order: 4,
		hiddenPromptKeywords: [
			"modern cabin",
			"floor-to-ceiling glass",
			"wood cladding",
			"snowy mountainside",
			"pine trees",
			"warm interior light",
		],
		style: "Architectural photography",
		whatUserSees:
			"A small modern cabin with warm wooden cladding and floor-to-ceiling glass walls, cantilevered over a steep snow-covered mountainside. Pine trees and misty peaks behind, soft overcast winter light, and warm light glowing from inside the glass. A wide exterior architectural shot.",
		points: 150,
		hints: [
			"Describe the building's form and materials",
			"Set the scene — where it sits and what surrounds it",
			"Mention the weather, light, and the glow from inside",
		],
		estimatedTime: 8,
		tags: ["architecture", "scene", "lighting"],
		learningObjectives: [
			"Describe a subject within an environment",
			"Combine materials, setting, and lighting",
			"Practice intermediate scene composition",
		],
	},
	{
		id: "image-5-medium",
		type: "image" as const,
		title: "Landscape at Dusk",
		description: "Capture a wide landscape with a specific time of day and mood.",
		difficulty: "intermediate" as const,
		passingScore: 75,
		unlocked: false,
		order: 5,
		hiddenPromptKeywords: [
			"sand dunes",
			"desert",
			"twilight",
			"crescent moon",
			"blue-to-orange sky",
			"soft shadows",
		],
		style: "Photorealistic landscape",
		whatUserSees:
			"Rolling desert sand dunes at twilight. A deep blue sky high up fading to warm orange at the horizon, a thin crescent moon, and soft shadows tracing the curved ridgelines of the dunes. Distant low hills, calm and minimal — a wide landscape shot.",
		points: 150,
		hints: [
			"Name the landscape and the time of day",
			"Describe the sky's colours and any light source",
			"Mention how light shapes the dunes (shadows, ridgelines)",
		],
		estimatedTime: 8,
		tags: ["landscape", "atmosphere", "lighting"],
		learningObjectives: [
			"Describe atmosphere and time of day",
			"Control colour and lighting in a scene",
			"Practice wide landscape composition",
		],
	},
	{
		id: "image-6-medium",
		type: "image" as const,
		title: "Food & Drink",
		description: "Style an appetizing commercial beverage shot.",
		difficulty: "intermediate" as const,
		passingScore: 75,
		unlocked: false,
		order: 6,
		hiddenPromptKeywords: [
			"iced tea",
			"tall glass",
			"ice cubes",
			"lemon slice",
			"mint",
			"wooden table",
			"condensation",
		],
		style: "Commercial food photography",
		whatUserSees:
			"A tall clear glass of iced tea on a wooden table outdoors. Ice cubes inside, a lemon slice on the rim, a sprig of mint, and a metal straw. Condensation droplets run down the glass, warm afternoon light, and a soft blurred background — an appetizing commercial beverage shot.",
		points: 150,
		hints: [
			"Name the drink and the glass it is in",
			"List the garnishes and details (ice, lemon, mint, straw)",
			"Describe the surface, lighting, and background",
		],
		estimatedTime: 7,
		tags: ["food", "commercial", "styling"],
		learningObjectives: [
			"Describe a subject with several supporting details",
			"Practice commercial styling language",
			"Understand garnish, texture, and lighting cues",
		],
	},
	{
		id: "image-7-medium",
		type: "image" as const,
		title: "Abstract Composition",
		description: "Create a non-representational image from a colour palette and shapes.",
		difficulty: "intermediate" as const,
		passingScore: 75,
		unlocked: false,
		order: 7,
		hiddenPromptKeywords: [
			"abstract",
			"overlapping circles",
			"translucent",
			"teal",
			"mustard",
			"burnt orange",
			"retro palette",
		],
		style: "Mid-century abstract",
		whatUserSees:
			"A flat abstract composition of overlapping translucent circles and ellipses in a warm retro palette — teal, mustard gold, burnt orange, and olive green — layered over a warm gradient background. No real-world subject; balanced, calm, mid-century-modern feel.",
		points: 150,
		hints: [
			"State that it is abstract, with no real-world subject",
			"Describe the shapes and how they overlap",
			"Name the colour palette and the overall mood",
		],
		estimatedTime: 8,
		tags: ["abstract", "colour", "style"],
		learningObjectives: [
			"Describe non-representational imagery",
			"Specify a colour palette and style reference",
			"Practice controlling mood through colour",
		],
	},

	// HARD LEVELS (8-10): style + lighting + composition + constraints. passingScore 80, 8-10 keywords.
	{
		id: "image-8-hard",
		type: "image" as const,
		title: "Technical Blueprint",
		description: "Produce a precise, monochrome engineering-style illustration.",
		difficulty: "advanced" as const,
		passingScore: 80,
		unlocked: false,
		order: 8,
		hiddenPromptKeywords: [
			"blueprint",
			"technical drawing",
			"radial engine",
			"white line art",
			"dark charcoal background",
			"symmetrical",
			"dimension annotations",
			"spec table",
			"monochrome",
			"head-on view",
		],
		style: "Blueprint / technical schematic",
		whatUserSees:
			"A technical blueprint-style illustration of a radial aircraft engine viewed head-on — pistons and connecting rods arranged symmetrically in a circle around a central hub. Fine white line-art on a dark charcoal background, with faint dimension lines, measurement annotations, and small spec tables in the corners. Precise, monochrome, engineering-drawing aesthetic.",
		points: 250,
		hints: [
			"Specify the drawing style (blueprint, white line art) and the dark background",
			"Describe the subject and that it is symmetrical and viewed head-on",
			"Call out the technical detail — dimension lines, annotations, spec tables",
		],
		estimatedTime: 15,
		tags: ["technical", "style", "precision"],
		learningObjectives: [
			"Control a specific illustration style end to end",
			"Combine subject, layout, and fine detail",
			"Practice precise, constraint-driven prompting",
		],
	},
	{
		id: "image-9-hard",
		type: "image" as const,
		title: "Surreal Scene",
		description: "Compose a moody, multi-element surreal scene with deliberate lighting.",
		difficulty: "advanced" as const,
		passingScore: 80,
		unlocked: false,
		order: 9,
		hiddenPromptKeywords: [
			"bioluminescent jellyfish",
			"abandoned subway tunnel",
			"railway tracks",
			"wet reflective floor",
			"blue and purple glow",
			"fog",
			"cinematic",
			"symmetrical composition",
			"moody atmosphere",
			"surreal",
		],
		style: "Surreal cinematic",
		whatUserSees:
			"A surreal, atmospheric scene: dozens of glowing bioluminescent jellyfish drift through an abandoned subway tunnel. Railway tracks recede into the distance along a wet, reflective floor that mirrors the jellyfish glow. Cool blue, teal and purple light, soft fog, derelict graffiti walls, and a centred, symmetrical, cinematic composition. Dreamlike and moody.",
		points: 250,
		hints: [
			"Describe the unexpected combination of subjects and the setting",
			"Specify the light's colour, the glow, and the atmosphere (fog, reflections)",
			"Mention the composition and camera feel (symmetrical, cinematic, depth)",
		],
		estimatedTime: 15,
		tags: ["surreal", "cinematic", "composition"],
		learningObjectives: [
			"Compose a scene with multiple interacting elements",
			"Direct lighting, colour, and mood deliberately",
			"Master cinematic, atmospheric prompting",
		],
	},
	{
		id: "image-10-hard",
		type: "image" as const,
		title: "Product Hero Shot",
		description: "Direct a dramatic, high-end commercial product image.",
		difficulty: "advanced" as const,
		passingScore: 80,
		unlocked: false,
		order: 10,
		hiddenPromptKeywords: [
			"black smartphone",
			"water splash",
			"frozen motion",
			"ring of droplets",
			"pure black background",
			"studio rim lighting",
			"high-speed photography",
			"glossy reflections",
			"centred composition",
			"monochrome",
		],
		style: "Commercial product photography",
		whatUserSees:
			"A dramatic product hero shot of a black smartphone floating upright against a pure black background, encircled by a ring of crystal-clear water droplets and splashes frozen mid-air. Sharp studio rim lighting catches the water and the phone's edges. High-speed photography, monochrome, glossy reflections, perfectly centred composition — premium and minimal.",
		points: 250,
		hints: [
			"Name the product and the dramatic effect around it (frozen water splash)",
			"Specify the background, the lighting style, and the reflections",
			"Describe the composition and the premium, high-speed-photography feel",
		],
		estimatedTime: 15,
		tags: ["product", "commercial", "lighting"],
		learningObjectives: [
			"Direct lighting, motion, and composition together",
			"Use professional commercial photography language",
			"Master high-constraint, premium prompting",
		],
	},
];

export const imageLevels = imageLevelsBase.map((level) => ({
	...level,
	scaffoldType: getScaffoldTypeForDifficulty(level.difficulty),
	scaffoldTemplate: imageLessonScaffolds[level.id]?.scaffoldTemplate,
	checklistItems: imageLessonScaffolds[level.id]?.checklistItems,
	promptChecklist: imageLessonScaffolds[level.id]?.checklistItems,
}));

// ===== CODING & LOGIC LEVELS (onboarding-style prompt-for-UI lessons) =====

import { codingLessons } from "./coding_lessons_data";
import { copywritingLessons } from "./copywriting_lessons_data";
import { agentLessons } from "./agent_lessons_data";
import { questLevelsData } from "./quest_levels_data";

/** Map onboarding-style coding lessons to level format for seeding */
function mapCodingLessonToLevel(
	lesson: (typeof codingLessons)[0],
	index: number,
) {
	const order = 11 + index;
	// Difficulty is derived from the lesson id suffix (-easy / -medium / -hard)
	// so appended lessons keep the correct tier regardless of array position.
	const tier = lesson.id.split("-").pop();
	const difficulty: "beginner" | "intermediate" | "advanced" =
		tier === "easy"
			? "beginner"
			: tier === "medium"
				? "intermediate"
				: "advanced";
	// Tiered passing scores: the bar rises with difficulty (progression, not flat).
	// Tier-scaled bar: easy is generous (momentum-first — a genuine attempt passes),
	// the bar rises with difficulty. Pairs with the holistic judge + the
	// all-required gate that only applies on the advanced tier.
	const passingScore =
		difficulty === "beginner" ? 35 : difficulty === "intermediate" ? 55 : 70;
	// Coding scaffold fade: easy = fill-in-the-blank template; medium/hard/boss =
	// empty box (no checklist tier). The visual target carries the brief.
	const scaffoldType: "template" | "none" =
		difficulty === "beginner" ? "template" : "none";
	const scaffoldTemplate =
		scaffoldType === "template" ? lesson.scaffoldTemplate : undefined;
	const checklistItems =
		scaffoldType === "template" ? lesson.checklistItems : undefined;
	// The final hard challenge is the coding-track capstone — give it the boss
	// moment (boss node icon on the path).
	const lessonMode = lesson.id === "code-5-hard" ? ("boss" as const) : undefined;
	return {
		id: lesson.id,
		type: "code" as const,
		title: lesson.title,
		description: lesson.instruction,
		difficulty,
		passingScore,
		unlocked: index < 3,
		order,
		instruction: lesson.instruction,
		whatUserSees: lesson.whatUserSees,
		hints: [lesson.hint],
		grading: lesson.grading,
		failState: lesson.failState,
		successState: lesson.successState,
		lessonTakeaway: lesson.lessonTakeaway,
		learningObjectives: [lesson.lessonTakeaway],
		points: 100,
		estimatedTime: 6,
		tags: ["prompting", "web", "ui"],
		language: "html",
		scaffoldType,
		scaffoldTemplate,
		checklistItems,
		promptChecklist: checklistItems,
		lessonMode,
	};
}

export const codeLevels = codingLessons.map(mapCodingLessonToLevel);

/** Map copywriting lessons to level format for seeding */
function mapCopyLessonToLevel(
	lesson: (typeof copywritingLessons)[0],
	index: number,
) {
	const order = 21 + index;
	const difficulty =
		index < 5 ? "beginner" : index < 10 ? "intermediate" : "advanced";
	const checklistItems = lesson.checklistItems;
	return {
		id: lesson.id,
		type: "copywriting" as const,
		title: lesson.title,
		description: lesson.instruction,
		difficulty: difficulty as "beginner" | "intermediate" | "advanced",
		passingScore: 70,
		unlocked: index < 3,
		order,
		instruction: lesson.instruction,
		hints: [lesson.hint],
		starterContext: lesson.starterContext,
		grading: lesson.grading,
		failState: lesson.failState,
		successState: lesson.successState,
		lessonTakeaway: lesson.lessonTakeaway,
		learningObjectives: [lesson.lessonTakeaway],
		points: 100,
		estimatedTime: 8,
		tags: ["copywriting", "prompting", "voice"],
		wordLimit: { max: 800 },
		scaffoldType: getScaffoldTypeForDifficulty(difficulty),
		scaffoldTemplate:
			getScaffoldTypeForDifficulty(difficulty) === "template"
				? lesson.scaffoldTemplate
				: undefined,
		checklistItems,
		promptChecklist: checklistItems,
	};
}

export const copywritingLevels = copywritingLessons.map(mapCopyLessonToLevel);

/**
 * Map agent lessons to level format for seeding.
 *
 * Mirrors mapCodingLessonToLevel: difficulty is derived from the id suffix so the
 * tier is stable regardless of array position, and passing scores rise with it
 * (60/70/78). Agents NEVER use a scaffoldTemplate — beginner/intermediate get a
 * guiding checklist (scaffoldType "checklist"); advanced is pure free text
 * (scaffoldType "none"). Agent grading is pure llm_judge against the hidden
 * `whatUserSees` rubric + `grading.criteria`.
 */
function mapAgentLessonToLevel(
	lesson: (typeof agentLessons)[0],
	index: number,
) {
	// Free order block after image (1-10), code (11-40) and copy (21+).
	const order = 51 + index;
	const tier = lesson.id.split("-").pop();
	const difficulty: "beginner" | "intermediate" | "advanced" =
		tier === "easy"
			? "beginner"
			: tier === "medium"
				? "intermediate"
				: "advanced";
	// Tiered passing scores: the bar rises with difficulty (progression, not flat).
	// Tier-scaled bar: easy is generous (momentum-first — a genuine attempt passes),
	// the bar rises with difficulty. Pairs with the holistic judge + the
	// all-required gate that only applies on the advanced tier.
	const passingScore =
		difficulty === "beginner" ? 35 : difficulty === "intermediate" ? 55 : 70;
	// Scaffolding fade: easy + medium use a template (easy locks it into
	// fill-in-the-blank slots; medium shows it as a guidance card above a free
	// box), advanced is an empty box (pure free text).
	const scaffoldType: "template" | "none" =
		difficulty === "advanced" ? "none" : "template";
	const scaffoldTemplate =
		scaffoldType === "template" ? lesson.scaffoldTemplate : undefined;
	// Only easy carries checklistItems (its template slot labels + heuristic);
	// medium intentionally shows just the starter template, no checklist.
	const checklistItems = lesson.checklistItems;
	// The final hard challenge is the agent-track capstone — give it the boss
	// moment (boss node icon on the path).
	const lessonMode = lesson.id === "agent-6-hard" ? ("boss" as const) : undefined;
	return {
		id: lesson.id,
		type: "agent" as const,
		title: lesson.title,
		description: lesson.instruction,
		difficulty,
		passingScore,
		unlocked: index < 3,
		order,
		instruction: lesson.instruction,
		agentBrief: lesson.agentBrief,
		whatUserSees: lesson.whatUserSees,
		hints: [lesson.hint],
		grading: lesson.grading,
		failState: lesson.failState,
		successState: lesson.successState,
		lessonTakeaway: lesson.lessonTakeaway,
		learningObjectives: [lesson.lessonTakeaway],
		points: 100,
		estimatedTime: 6,
		tags: ["agent", "prompting", "automation"],
		scaffoldType,
		scaffoldTemplate,
		checklistItems,
		promptChecklist: checklistItems,
		lessonMode,
	};
}

export const agentLevels = agentLessons.map(mapAgentLessonToLevel);

// Staged rollout: only the agent batch is live right now. The seeder removes any
// level not in this list, so coding/image/copywriting/daily levels are
// intentionally dark until we rebuild those batches. Their data + mappings stay
// in this file (imageLevels, codeLevels, copywritingLevels, questLevelsData) so
// re-enabling a batch is just adding it back to this array.
export const allLevels = [...agentLevels];
